<?php

namespace App\Services;

use App\Models\BusinessType;
use App\Models\LocationProfile;
use Throwable;

class SimulationInputService
{
    public function __construct(private MarketDataService $marketData)
    {
    }

    public function options(): array
    {
        $businessTypes = $this->businessTypes();
        $locations = [];

        $this->locationProfiles()
            ->each(function (LocationProfile $profile) use (&$locations): void {
                $locations[$profile->country][$profile->city] = $this->locationPayload($profile);
            });

        $defaultBusiness = $businessTypes->first();
        $defaultCountry = array_key_first($locations) ?? '';
        $defaultCity = $defaultCountry ? (array_key_first($locations[$defaultCountry]) ?? '') : '';

        return [
            'default_form' => [
                'businessType' => $defaultBusiness?->name ?? '',
                'country' => $defaultCountry,
                'city' => $defaultCity,
                'initialInvestment' => '',
                'monthlySales' => '',
                'monthlyCosts' => '',
                'advancedMode' => false,
                'growthExpectation' => 'slow',
                'seasonalityDependence' => 'low',
                'marketingPlan' => 'regular',
                'unexpectedCosts' => 'low',
                'marketStability' => 'moderate',
                'salesConfidence' => 'medium',
            ],
            'business_types' => $businessTypes->pluck('name')->values(),
            'business_defaults' => $businessTypes
                ->mapWithKeys(fn (BusinessType $type) => [
                    $type->name => [
                        'employees' => $type->employees,
                        'monthly_costs' => (float) $type->monthly_costs,
                        'seasonality_profile' => $type->seasonality_profile,
                    ],
                ]),
            'locations' => $locations,
            'field_options' => $this->fieldOptions(),
            'data_sources' => $this->marketData->sourceSummary(),
            'scenario_cards' => [
                ['key' => 'low_case', 'label' => 'Low Case', 'icon' => 'LOW', 'description' => 'Conservative estimate'],
                ['key' => 'average_case', 'label' => 'Average Case', 'icon' => 'AVG', 'description' => 'Expected scenario'],
                ['key' => 'high_case', 'label' => 'High Case', 'icon' => 'HIGH', 'description' => 'Optimistic scenario'],
            ],
        ];
    }

    public function locationComparison(array $input): ?array
    {
        $country = $input['country'] ?? '';
        $baseCity = $input['baseCity'] ?? null;
        $compareCity = $input['compareCity'] ?? null;

        if (! $country || ! $baseCity || ! $compareCity) {
            return null;
        }

        $baseProfile = $this->locationProfile($country, $baseCity);
        $compareProfile = $this->locationProfile($country, $compareCity);
        $sales = max(0, (float) ($input['monthlySales'] ?? 0));
        $costs = max(0, (float) ($input['monthlyCosts'] ?? 0));
        $baseRiskLevel = $input['baseRiskLevel'] ?? 'medium';

        $baseRow = [
            'city' => $baseCity,
            'monthlySales' => round($sales, 2),
            'monthlyCosts' => round($costs, 2),
            'monthlyProfit' => round($sales - $costs, 2),
            'riskLevel' => $this->formatRisk($baseRiskLevel),
        ];

        $baseSalesFactor = max((float) ($baseProfile?->sales_factor ?? 1), 0.01);
        $baseCostFactor = max((float) ($baseProfile?->cost_factor ?? 1), 0.01);
        $compareSalesFactor = (float) ($compareProfile?->sales_factor ?? 1);
        $compareCostFactor = (float) ($compareProfile?->cost_factor ?? 1);
        $compareSales = $sales * ($compareSalesFactor / $baseSalesFactor);
        $compareCosts = $costs * ($compareCostFactor / $baseCostFactor);
        $riskScore = max(1, min(3, $this->riskScore($baseRiskLevel) + (((int) ($compareProfile?->volatility_adjust ?? 0) - (int) ($baseProfile?->volatility_adjust ?? 0)) / 3)));

        $compareRow = [
            'city' => $compareCity,
            'monthlySales' => round($compareSales, 2),
            'monthlyCosts' => round($compareCosts, 2),
            'monthlyProfit' => round($compareSales - $compareCosts, 2),
            'riskLevel' => $this->scoreRisk($riskScore),
        ];

        return [
            'baseRow' => $baseRow,
            'compareRow' => $compareRow,
            'betterLocation' => $compareRow['monthlyProfit'] > $baseRow['monthlyProfit'] ? $compareCity : $baseCity,
        ];
    }

    public function prepare(array $form): array
    {
        $errors = $this->validateForm($form);

        if (! empty($errors)) {
            return ['errors' => $errors];
        }

        $businessType = $this->businessType($form['businessType'] ?? '');

        if (! $businessType) {
            return ['errors' => ['businessType' => 'Business type is not available.']];
        }

        $country = $form['country'] ?? '';
        $city = $form['city'] ?? '';
        $location = $this->locationProfile($country, $city);
        $marketSignals = $this->marketData->countrySignals($country);
        $seasonality = $this->seasonalitySettings($form['seasonalityDependence'] ?? 'low', $businessType->seasonality_profile);
        $marketing = $this->marketingPlan($form['marketingPlan'] ?? 'regular');
        $unexpected = $this->unexpectedCosts($form['unexpectedCosts'] ?? 'low');
        $volatility = $this->marketStability($form['marketStability'] ?? 'moderate')
            + $this->salesConfidenceAdjust($form['salesConfidence'] ?? 'medium')
            + (int) ($location?->volatility_adjust ?? 0)
            + $this->marketVolatilityAdjust($marketSignals);

        return [
            'errors' => [],
            'suggestions' => $this->suggestions($businessType->name, $country, $city),
            'payload' => [
                'capital' => (float) $form['initialInvestment'],
                'size' => $this->projectSize((float) $form['initialInvestment']),
                'project_type' => sprintf('%s (%s, %s)', $businessType->name, $city, $country),
                'monthly_sales' => (float) $form['monthlySales'],
                'monthly_costs' => (float) $form['monthlyCosts'],
                'employees' => $businessType->employees,
                'seasonality_profile' => $seasonality['profile'],
                'seasonality_strength_percent' => $seasonality['strength'],
                'monthly_growth_percent' => $this->growthExpectation($form['growthExpectation'] ?? 'slow', $marketSignals),
                'cost_growth_percent' => $this->costGrowthPercent($marketSignals),
                'volatility_percent' => max(0, min(30, $volatility)),
                'shock_month' => $unexpected['month'],
                'shock_amount' => $unexpected['amount'],
                'campaign_month' => $marketing['month'],
                'campaign_boost_percent' => $marketing['boost'],
            ],
            'market_context' => $marketSignals,
        ];
    }

    public function suggestions(string $businessTypeName, string $country, string $city): array
    {
        $businessType = $this->businessType($businessTypeName);
        $location = $this->locationProfile($country, $city);
        $monthlyCosts = (float) ($businessType?->monthly_costs ?? 0);
        $costFactor = (float) ($location?->cost_factor ?? 1);

        return [
            'monthly_costs' => round($monthlyCosts * $costFactor),
            'employees' => $businessType?->employees ?? 0,
            'rent_range' => [(float) ($location?->rent_min ?? 0), (float) ($location?->rent_max ?? 0)],
            'avg_salary' => (float) ($location?->avg_salary ?? 0),
        ];
    }

    private function businessType(string $name): ?BusinessType
    {
        try {
            $businessType = BusinessType::query()->where('name', $name)->first();

            if ($businessType) {
                return $businessType;
            }
        } catch (Throwable) {
            // Fall through to static defaults when the production database is not ready.
        }

        $fallback = collect($this->fallbackBusinessTypes())->firstWhere('name', $name);

        return $fallback ? new BusinessType($fallback) : null;
    }

    private function locationProfile(string $country, string $city): ?LocationProfile
    {
        try {
            $locationProfile = LocationProfile::query()
                ->where('country', $country)
                ->where('city', $city)
                ->first();

            if ($locationProfile) {
                return $locationProfile;
            }
        } catch (Throwable) {
            // Fall through to static defaults when the production database is not ready.
        }

        $fallback = collect($this->fallbackLocationProfiles())
            ->first(fn (array $profile) => $profile['country'] === $country && $profile['city'] === $city);

        return $fallback ? new LocationProfile($fallback) : null;
    }

    private function businessTypes()
    {
        try {
            $businessTypes = BusinessType::query()->orderBy('name')->get();

            if ($businessTypes->isNotEmpty()) {
                return $businessTypes;
            }
        } catch (Throwable) {
            // Fall through to static defaults when the production database is not ready.
        }

        return collect($this->fallbackBusinessTypes())
            ->sortBy('name')
            ->values()
            ->map(fn (array $type) => new BusinessType($type));
    }

    private function locationProfiles()
    {
        try {
            $profiles = LocationProfile::query()
                ->orderBy('country')
                ->orderBy('city')
                ->get();

            if ($profiles->isNotEmpty()) {
                return $profiles;
            }
        } catch (Throwable) {
            // Fall through to static defaults when the production database is not ready.
        }

        return collect($this->fallbackLocationProfiles())
            ->sortBy(fn (array $profile) => $profile['country'] . $profile['city'])
            ->values()
            ->map(fn (array $profile) => new LocationProfile($profile));
    }

    private function locationPayload(LocationProfile $profile): array
    {
        return [
            'cost_factor' => (float) $profile->cost_factor,
            'sales_factor' => (float) $profile->sales_factor,
            'volatility_adjust' => $profile->volatility_adjust,
            'rent_range' => [(float) $profile->rent_min, (float) $profile->rent_max],
            'avg_salary' => (float) $profile->avg_salary,
            'market_context' => $this->marketData->countrySignals($profile->country),
        ];
    }

    private function fieldOptions(): array
    {
        return [
            'growth_expectations' => [
                ['value' => 'none', 'label' => 'No'],
                ['value' => 'slow', 'label' => 'Slow growth'],
                ['value' => 'fast', 'label' => 'Fast growth'],
            ],
            'seasonality_dependence' => [
                ['value' => 'none', 'label' => 'No'],
                ['value' => 'low', 'label' => 'A little'],
                ['value' => 'high', 'label' => 'A lot'],
            ],
            'market_stability' => [
                ['value' => 'stable', 'label' => 'Stable'],
                ['value' => 'moderate', 'label' => 'Moderate'],
                ['value' => 'unstable', 'label' => 'Unstable'],
            ],
            'sales_confidence' => [
                ['value' => 'high', 'label' => 'High confidence'],
                ['value' => 'medium', 'label' => 'Medium confidence'],
                ['value' => 'low', 'label' => 'Low confidence'],
            ],
            'marketing_plan' => [
                ['value' => 'none', 'label' => 'No marketing campaign'],
                ['value' => 'regular', 'label' => 'Regular campaign'],
                ['value' => 'strong', 'label' => 'Strong campaign'],
            ],
            'unexpected_costs' => [
                ['value' => 'none', 'label' => 'No major surprises'],
                ['value' => 'low', 'label' => 'Some surprises'],
                ['value' => 'high', 'label' => 'High chance of surprises'],
            ],
        ];
    }

    private function validateForm(array $form): array
    {
        $errors = [];
        $investment = isset($form['initialInvestment']) ? (float) $form['initialInvestment'] : null;
        $sales = isset($form['monthlySales']) ? (float) $form['monthlySales'] : null;
        $costs = isset($form['monthlyCosts']) ? (float) $form['monthlyCosts'] : null;

        if ($investment === null || $investment < 1000 || $investment > 5000000) {
            $errors['initialInvestment'] = 'Initial investment should be between 1,000 and 5,000,000.';
        }

        if ($sales === null || $sales < 500 || $sales > 2000000) {
            $errors['monthlySales'] = 'Expected monthly sales should be between 500 and 2,000,000.';
        }

        if ($costs === null || $costs < 100 || $costs > 1500000) {
            $errors['monthlyCosts'] = 'Monthly costs should be between 100 and 1,500,000.';
        }

        if ($sales !== null && $costs !== null && $costs > $sales * 2.5) {
            $errors['monthlyCosts'] = 'Monthly costs look too high compared to monthly sales.';
        }

        return $errors;
    }

    private function projectSize(float $capital): string
    {
        if ($capital >= 120000) {
            return 'large';
        }

        if ($capital >= 55000) {
            return 'medium';
        }

        return 'small';
    }

    private function growthExpectation(string $value, array $marketSignals = []): float
    {
        $base = match ($value) {
            'fast' => 2.0,
            'none' => 0.0,
            default => 1.0,
        };

        $gdpGrowth = $marketSignals['gdp_growth_percent'] ?? null;

        if (! is_numeric($gdpGrowth)) {
            return $base;
        }

        return round(max(-10, min(20, $base + (((float) $gdpGrowth / 12) * 0.35))), 2);
    }

    private function costGrowthPercent(array $marketSignals): float
    {
        $inflation = $marketSignals['inflation_percent'] ?? null;

        if (! is_numeric($inflation)) {
            return 0.6;
        }

        return round(max(0.1, min(20, (float) $inflation / 12)), 2);
    }

    private function marketVolatilityAdjust(array $marketSignals): int
    {
        $inflation = $marketSignals['inflation_percent'] ?? null;
        $gdpGrowth = $marketSignals['gdp_growth_percent'] ?? null;
        $adjust = 0;

        if (is_numeric($inflation) && (float) $inflation > 8) {
            $adjust += 3;
        }

        if (is_numeric($gdpGrowth) && (float) $gdpGrowth < 0) {
            $adjust += 2;
        }

        return $adjust;
    }

    private function seasonalitySettings(string $dependence, string $profile): array
    {
        if ($dependence === 'none') {
            return ['profile' => 'flat', 'strength' => 0];
        }

        return ['profile' => $profile, 'strength' => $dependence === 'high' ? 22 : 12];
    }

    private function marketStability(string $value): int
    {
        return match ($value) {
            'stable' => 6,
            'unstable' => 20,
            default => 12,
        };
    }

    private function salesConfidenceAdjust(string $value): int
    {
        return match ($value) {
            'low' => 4,
            'high' => -3,
            default => 0,
        };
    }

    private function marketingPlan(string $value): array
    {
        return match ($value) {
            'none' => ['month' => null, 'boost' => 0],
            'strong' => ['month' => 11, 'boost' => 24],
            default => ['month' => 11, 'boost' => 14],
        };
    }

    private function unexpectedCosts(string $value): array
    {
        return match ($value) {
            'none' => ['month' => null, 'amount' => 0],
            'high' => ['month' => 7, 'amount' => 5500],
            default => ['month' => 7, 'amount' => 2500],
        };
    }

    private function riskScore(string $riskLevel): int
    {
        return match (strtolower($riskLevel)) {
            'high' => 3,
            'medium' => 2,
            default => 1,
        };
    }

    private function scoreRisk(float $score): string
    {
        if ($score >= 2.5) {
            return 'High';
        }

        if ($score >= 1.5) {
            return 'Medium';
        }

        return 'Low';
    }

    private function formatRisk(string $riskLevel): string
    {
        return ucfirst(strtolower($riskLevel));
    }

    private function fallbackBusinessTypes(): array
    {
        return [
            ['name' => 'Retail Store', 'employees' => 6, 'monthly_costs' => 3000, 'seasonality_profile' => 'summer_up_winter_down'],
            ['name' => 'Cafe', 'employees' => 8, 'monthly_costs' => 2500, 'seasonality_profile' => 'summer_down_winter_up'],
            ['name' => 'Online Business', 'employees' => 4, 'monthly_costs' => 1400, 'seasonality_profile' => 'flat'],
            ['name' => 'Freelance Service', 'employees' => 2, 'monthly_costs' => 900, 'seasonality_profile' => 'flat'],
        ];
    }

    private function fallbackLocationProfiles(): array
    {
        $profiles = [
            ['Palestine', 'Gaza', 0.88, 0.87, 4, 500, 850, 420],
            ['Palestine', 'Ramallah', 1.06, 1.11, -1, 950, 1600, 850],
            ['Palestine', 'Nablus', 0.95, 0.98, 1, 700, 1200, 620],
            ['Palestine', 'Bethlehem', 0.98, 1.02, 0, 650, 1100, 580],
            ['Palestine', 'Jenin', 0.92, 0.95, 2, 600, 1000, 500],
            ['Palestine', 'Tulkarm', 0.93, 0.96, 1, 620, 1050, 510],
            ['Palestine', 'Qalqiliya', 0.90, 0.93, 2, 550, 900, 480],
            ['Palestine', 'Hebron', 0.89, 0.91, 2, 580, 950, 490],
            ['Jordan', 'Amman', 1.10, 1.12, -1, 1100, 1900, 920],
            ['Jordan', 'Irbid', 0.93, 0.94, 1, 650, 1050, 560],
            ['Jordan', 'Zarqa', 0.91, 0.92, 2, 600, 950, 520],
            ['Jordan', 'Salt', 0.88, 0.89, 2, 550, 850, 480],
            ['Jordan', 'Aqaba', 1.05, 1.08, 0, 950, 1500, 780],
            ['Jordan', 'Madaba', 0.87, 0.88, 2, 520, 800, 450],
            ['Egypt', 'Cairo', 1.02, 1.03, 0, 900, 1700, 760],
            ['Egypt', 'Alexandria', 0.97, 0.99, 1, 780, 1350, 660],
            ['Egypt', 'Giza', 1.00, 1.01, 0, 850, 1600, 720],
            ['Egypt', 'Aswan', 0.85, 0.87, 2, 550, 950, 500],
            ['Egypt', 'Luxor', 0.88, 0.90, 1, 600, 1050, 540],
            ['Egypt', 'Mansoura', 0.92, 0.94, 1, 700, 1200, 600],
            ['Egypt', 'Tanta', 0.90, 0.92, 1, 680, 1150, 570],
            ['Lebanon', 'Beirut', 1.15, 1.18, -1, 1300, 2200, 1100],
            ['Lebanon', 'Tripoli', 0.95, 0.97, 2, 700, 1200, 620],
            ['Lebanon', 'Sidon', 0.93, 0.95, 1, 680, 1100, 580],
            ['Syria', 'Damascus', 0.85, 0.83, 3, 500, 900, 450],
            ['Syria', 'Aleppo', 0.82, 0.80, 4, 450, 800, 400],
            ['United Arab Emirates', 'Dubai', 1.35, 1.40, -1, 1800, 3000, 1500],
            ['United Arab Emirates', 'Abu Dhabi', 1.32, 1.38, 0, 1700, 2800, 1450],
            ['United Arab Emirates', 'Sharjah', 1.15, 1.18, 0, 1200, 1900, 1000],
            ['Saudi Arabia', 'Riyadh', 1.20, 1.22, 0, 1400, 2300, 1200],
            ['Saudi Arabia', 'Jeddah', 1.18, 1.20, 0, 1300, 2100, 1100],
            ['Saudi Arabia', 'Dammam', 1.16, 1.18, 0, 1200, 1950, 1050],
            ['United Kingdom', 'London', 1.50, 1.55, -1, 1800, 3500, 1800],
            ['United Kingdom', 'Manchester', 1.20, 1.22, 0, 1100, 1900, 1200],
            ['United Kingdom', 'Birmingham', 1.15, 1.17, 0, 1000, 1700, 1100],
            ['United States', 'New York', 1.60, 1.65, -1, 2000, 3800, 2000],
            ['United States', 'Los Angeles', 1.55, 1.60, 0, 1800, 3500, 1900],
            ['United States', 'Chicago', 1.25, 1.28, 0, 1200, 2000, 1300],
            ['United States', 'Texas', 1.10, 1.12, 0, 1000, 1700, 1150],
            ['Canada', 'Toronto', 1.35, 1.38, 0, 1400, 2400, 1400],
            ['Canada', 'Vancouver', 1.40, 1.42, 0, 1500, 2600, 1500],
            ['Canada', 'Montreal', 1.20, 1.22, 0, 1100, 1900, 1200],
            ['Germany', 'Berlin', 1.25, 1.28, 0, 1200, 2000, 1300],
            ['Germany', 'Munich', 1.35, 1.38, 0, 1400, 2300, 1450],
            ['Germany', 'Hamburg', 1.28, 1.30, 0, 1250, 2050, 1350],
        ];

        return array_map(fn (array $profile) => [
            'country' => $profile[0],
            'city' => $profile[1],
            'cost_factor' => $profile[2],
            'sales_factor' => $profile[3],
            'volatility_adjust' => $profile[4],
            'rent_min' => $profile[5],
            'rent_max' => $profile[6],
            'avg_salary' => $profile[7],
        ], $profiles);
    }
}
