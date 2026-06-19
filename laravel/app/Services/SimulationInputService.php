<?php

namespace App\Services;

use App\Models\BusinessType;
use App\Models\LocationProfile;

class SimulationInputService
{
    public function options(): array
    {
        $businessTypes = BusinessType::query()->orderBy('name')->get();
        $locations = [];

        LocationProfile::query()
            ->orderBy('country')
            ->orderBy('city')
            ->get()
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
        $seasonality = $this->seasonalitySettings($form['seasonalityDependence'] ?? 'low', $businessType->seasonality_profile);
        $marketing = $this->marketingPlan($form['marketingPlan'] ?? 'regular');
        $unexpected = $this->unexpectedCosts($form['unexpectedCosts'] ?? 'low');
        $volatility = $this->marketStability($form['marketStability'] ?? 'moderate')
            + $this->salesConfidenceAdjust($form['salesConfidence'] ?? 'medium')
            + (int) ($location?->volatility_adjust ?? 0);

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
                'monthly_growth_percent' => $this->growthExpectation($form['growthExpectation'] ?? 'slow'),
                'cost_growth_percent' => 0.6,
                'volatility_percent' => max(0, min(30, $volatility)),
                'shock_month' => $unexpected['month'],
                'shock_amount' => $unexpected['amount'],
                'campaign_month' => $marketing['month'],
                'campaign_boost_percent' => $marketing['boost'],
            ],
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
        return BusinessType::query()->where('name', $name)->first();
    }

    private function locationProfile(string $country, string $city): ?LocationProfile
    {
        return LocationProfile::query()
            ->where('country', $country)
            ->where('city', $city)
            ->first();
    }

    private function locationPayload(LocationProfile $profile): array
    {
        return [
            'cost_factor' => (float) $profile->cost_factor,
            'sales_factor' => (float) $profile->sales_factor,
            'volatility_adjust' => $profile->volatility_adjust,
            'rent_range' => [(float) $profile->rent_min, (float) $profile->rent_max],
            'avg_salary' => (float) $profile->avg_salary,
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

    private function growthExpectation(string $value): float
    {
        return match ($value) {
            'fast' => 2.0,
            'none' => 0.0,
            default => 1.0,
        };
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
}
