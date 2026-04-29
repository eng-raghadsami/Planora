<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SimulationController extends Controller
{
    public function simulate(Request $request)
    {
        $validated = $request->validate([
            'capital' => 'required|numeric|min:1',
            'size' => 'required|in:small,medium,large',
            'project_type' => 'nullable|string',
            'monthly_sales' => 'nullable|numeric|min:0',
            'monthly_costs' => 'nullable|numeric|min:0',
            'employees' => 'nullable|integer|min:0',
            'seasonality_profile' => 'nullable|in:flat,summer_down_winter_up,summer_up_winter_down',
            'seasonality_strength_percent' => 'nullable|numeric|min:0|max:40',
            'monthly_growth_percent' => 'nullable|numeric|min:-10|max:20',
            'cost_growth_percent' => 'nullable|numeric|min:0|max:20',
            'volatility_percent' => 'nullable|numeric|min:0|max:30',
            'shock_month' => 'nullable|integer|min:1|max:24',
            'shock_amount' => 'nullable|numeric|min:0',
            'campaign_month' => 'nullable|integer|min:1|max:24',
            'campaign_boost_percent' => 'nullable|numeric|min:0|max:100',
        ]);

        $capital = (float) $validated['capital'];
        $size = strtolower($validated['size']);
        $projectType = $validated['project_type'] ?? 'General';
        $monthlySalesInput = isset($validated['monthly_sales']) ? (float) $validated['monthly_sales'] : null;
        $monthlyCostsInput = isset($validated['monthly_costs']) ? (float) $validated['monthly_costs'] : 0.0;
        $employees = isset($validated['employees']) ? (int) $validated['employees'] : 0;
        $seasonalityProfile = $validated['seasonality_profile'] ?? 'flat';
        $seasonalityStrength = isset($validated['seasonality_strength_percent']) ? ((float) $validated['seasonality_strength_percent'] / 100) : 0.15;
        $monthlyGrowthRate = isset($validated['monthly_growth_percent']) ? ((float) $validated['monthly_growth_percent'] / 100) : 0.008;
        $costGrowthRate = isset($validated['cost_growth_percent']) ? ((float) $validated['cost_growth_percent'] / 100) : 0.004;
        $volatilityRate = isset($validated['volatility_percent']) ? ((float) $validated['volatility_percent'] / 100) : 0.08;
        $shockMonth = isset($validated['shock_month']) ? (int) $validated['shock_month'] : null;
        $shockAmount = isset($validated['shock_amount']) ? (float) $validated['shock_amount'] : 0.0;
        $campaignMonth = isset($validated['campaign_month']) ? (int) $validated['campaign_month'] : null;
        $campaignBoostRate = isset($validated['campaign_boost_percent']) ? ((float) $validated['campaign_boost_percent'] / 100) : 0.0;

        $sizeConfig = [
            'small' => [
                'rent_rate' => 0.20,
                'staff_rate' => 0.20,
                'equipment_rate' => 0.30,
                'marketing_rate' => 0.10,
                'revenue_rate' => 0.35,
                'employee_cost' => 500,
            ],
            'medium' => [
                'rent_rate' => 0.25,
                'staff_rate' => 0.25,
                'equipment_rate' => 0.30,
                'marketing_rate' => 0.15,
                'revenue_rate' => 0.40,
                'employee_cost' => 700,
            ],
            'large' => [
                'rent_rate' => 0.30,
                'staff_rate' => 0.30,
                'equipment_rate' => 0.30,
                'marketing_rate' => 0.20,
                'revenue_rate' => 0.45,
                'employee_cost' => 900,
            ],
        ];

        $config = $sizeConfig[$size];

        $rent = $capital * $config['rent_rate'];
        $staff = $capital * $config['staff_rate'];
        $equipment = $capital * $config['equipment_rate'];
        $marketing = $capital * $config['marketing_rate'];

        $totalCost = $rent + $staff + $equipment + $marketing;

        $monthlyRevenue = $monthlySalesInput ?? ($capital * $config['revenue_rate']);
        $operatingCostFromSetup = $totalCost * 0.20;
        $employeeMonthlyCost = $employees * $config['employee_cost'];
        $baseMonthlyCost = $operatingCostFromSetup + $employeeMonthlyCost + $monthlyCostsInput;

        $cashFlow = [];
        $balance = -$totalCost;
        $totalRevenue = 0.0;
        $totalMonthlyCost = 0.0;
        $totalProfit = 0.0;
        $breakEven = null;

        for ($month = 1; $month <= 24; $month++) {
            $revenueTrend = $monthlyRevenue * pow(1 + $monthlyGrowthRate, $month - 1);
            $seasonFactor = $this->seasonalityFactor($month, $seasonalityProfile, $seasonalityStrength);
            $volatilityFactor = $this->volatilityFactor($month, $volatilityRate);
            $campaignFactor = ($campaignMonth !== null && $campaignMonth === $month)
                ? (1 + $campaignBoostRate)
                : 1.0;

            $monthlyRevenueValue = $revenueTrend * $seasonFactor * $volatilityFactor * $campaignFactor;
            $monthlyCostValue = $baseMonthlyCost * pow(1 + $costGrowthRate, $month - 1);

            if ($shockMonth !== null && $shockMonth === $month) {
                $monthlyCostValue += $shockAmount;
            }

            $monthlyProfitValue = $monthlyRevenueValue - $monthlyCostValue;
            $balance += $monthlyProfitValue;

            $totalRevenue += $monthlyRevenueValue;
            $totalMonthlyCost += $monthlyCostValue;
            $totalProfit += $monthlyProfitValue;

            $cashFlow[] = [
                'month' => $month,
                'revenue' => round($monthlyRevenueValue, 2),
                'cost' => round($monthlyCostValue, 2),
                'profit' => round($monthlyProfitValue, 2),
                'balance' => round($balance, 2),
            ];

            if ($breakEven === null && $balance >= 0) {
                $breakEven = $month;
            }
        }

        $averageMonthlyRevenue = $totalRevenue / 24;
        $averageMonthlyCost = $totalMonthlyCost / 24;
        $averageMonthlyProfit = $totalProfit / 24;
        $risk = $this->determineRisk($averageMonthlyProfit, $breakEven);

        return response()->json([
            'project_type' => $projectType,
            'size' => $size,
            'total_cost' => round($totalCost, 2),
            'monthly_revenue' => round($averageMonthlyRevenue, 2),
            'monthly_cost' => round($averageMonthlyCost, 2),
            'monthly_profit' => round($averageMonthlyProfit, 2),
            'break_even_months' => $breakEven,
            'risk_level' => $risk,
            'is_profitable' => $averageMonthlyProfit > 0,
            'breakdown' => [
                'rent' => round($rent, 2),
                'staff' => round($staff, 2),
                'equipment' => round($equipment, 2),
                'marketing' => round($marketing, 2),
                'monthly_fixed_costs' => round($monthlyCostsInput, 2),
                'employee_monthly_cost' => round($employeeMonthlyCost, 2),
                'seasonality_profile' => $seasonalityProfile,
                'seasonality_strength_percent' => round($seasonalityStrength * 100, 2),
                'monthly_growth_percent' => round($monthlyGrowthRate * 100, 2),
                'cost_growth_percent' => round($costGrowthRate * 100, 2),
                'volatility_percent' => round($volatilityRate * 100, 2),
                'shock_month' => $shockMonth,
                'shock_amount' => round($shockAmount, 2),
                'campaign_month' => $campaignMonth,
                'campaign_boost_percent' => round($campaignBoostRate * 100, 2),
            ],
            'cash_flow' => $cashFlow,
        ]);
    }

    public function scenarios(Request $request)
    {
        $validated = $request->validate([
            'capital' => 'required|numeric|min:1',
            'monthly_sales' => 'required|numeric|min:0',
            'monthly_costs' => 'required|numeric|min:0',
            'employees' => 'nullable|integer|min:0',
            'size' => 'nullable|in:small,medium,large',
        ]);

        $capital = (float) $validated['capital'];
        $monthlySales = (float) $validated['monthly_sales'];
        $monthlyCosts = (float) $validated['monthly_costs'];
        $employees = isset($validated['employees']) ? (int) $validated['employees'] : 0;
        $size = strtolower($validated['size'] ?? 'medium');

        $employeeCostBySize = [
            'small' => 500,
            'medium' => 700,
            'large' => 900,
        ];

        $employeeCostRate = $employeeCostBySize[$size] ?? $employeeCostBySize['medium'];

        $scenarioMultipliers = [
            'low_case' => [
                'capital' => 0.85,
                'sales' => 0.80,
                'costs' => 1.10,
                'employees' => 1.00,
            ],
            'average_case' => [
                'capital' => 1.00,
                'sales' => 1.00,
                'costs' => 1.00,
                'employees' => 1.00,
            ],
            'high_case' => [
                'capital' => 1.20,
                'sales' => 1.25,
                'costs' => 0.92,
                'employees' => 1.10,
            ],
        ];

        $results = [];

        foreach ($scenarioMultipliers as $key => $multiplier) {
            $scenarioCapital = $capital * $multiplier['capital'];
            $scenarioSales = $monthlySales * $multiplier['sales'];
            $scenarioFixedCosts = $monthlyCosts * $multiplier['costs'];
            $scenarioEmployees = max(0, (int) round($employees * $multiplier['employees']));
            $employeeMonthlyCost = $scenarioEmployees * $employeeCostRate;

            $totalMonthlyCosts = $scenarioFixedCosts + $employeeMonthlyCost;
            $profit = $scenarioSales - $totalMonthlyCosts;
            $breakEven = $profit > 0 ? round($scenarioCapital / $profit, 1) : null;
            $risk = $this->determineRisk($profit, $breakEven);

            $results[$key] = [
                'initial_capital' => round($scenarioCapital, 2),
                'monthly_sales' => round($scenarioSales, 2),
                'monthly_costs' => round($totalMonthlyCosts, 2),
                'monthly_profit' => round($profit, 2),
                'break_even_months' => $breakEven,
                'risk_level' => $risk,
                'employees' => $scenarioEmployees,
            ];
        }

        return response()->json($results);
    }

    private function determineRisk(float $monthlyProfit, ?float $breakEven): string
    {
        if ($monthlyProfit <= 0) {
            return 'high';
        }

        if ($breakEven !== null && $breakEven > 12) {
            return 'medium';
        }

        return 'low';
    }

    private function seasonalityFactor(int $month, string $profile, float $strength): float
    {
        $monthOfYear = (($month - 1) % 12) + 1;
        $isSummer = in_array($monthOfYear, [6, 7, 8], true);
        $isWinter = in_array($monthOfYear, [12, 1, 2], true);

        if ($profile === 'summer_down_winter_up') {
            if ($isSummer) {
                return max(0.6, 1 - $strength);
            }
            if ($isWinter) {
                return 1 + $strength;
            }
        }

        if ($profile === 'summer_up_winter_down') {
            if ($isSummer) {
                return 1 + $strength;
            }
            if ($isWinter) {
                return max(0.6, 1 - $strength);
            }
        }

        return 1.0;
    }

    private function volatilityFactor(int $month, float $volatility): float
    {
        if ($volatility <= 0) {
            return 1.0;
        }

        $pattern = [0.10, -0.04, 0.06, -0.09, 0.08, -0.03, 0.04, -0.08, 0.09, -0.02, 0.05, -0.06];
        $index = ($month - 1) % count($pattern);

        return 1 + ($pattern[$index] * ($volatility / 0.10));
    }
}
