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
        ]);

        $capital = (float) $validated['capital'];
        $size = strtolower($validated['size']);
        $projectType = $validated['project_type'] ?? 'General';
        $monthlySalesInput = isset($validated['monthly_sales']) ? (float) $validated['monthly_sales'] : null;
        $monthlyCostsInput = isset($validated['monthly_costs']) ? (float) $validated['monthly_costs'] : 0.0;
        $employees = isset($validated['employees']) ? (int) $validated['employees'] : 0;

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
        $monthlyCost = $operatingCostFromSetup + $employeeMonthlyCost + $monthlyCostsInput;

        $monthlyProfit = $monthlyRevenue - $monthlyCost;

        $breakEven = $monthlyProfit > 0
            ? round($totalCost / $monthlyProfit, 1)
            : null;

        $cashFlow = [];
        $balance = -$totalCost;

        for ($month = 1; $month <= 24; $month++) {
            $balance += $monthlyProfit;

            $cashFlow[] = [
                'month' => $month,
                'balance' => round($balance, 2),
            ];

            if ($balance >= 0) {
                break;
            }
        }

        $risk = $this->determineRisk($monthlyProfit, $breakEven);

        return response()->json([
            'project_type' => $projectType,
            'size' => $size,
            'total_cost' => round($totalCost, 2),
            'monthly_revenue' => round($monthlyRevenue, 2),
            'monthly_cost' => round($monthlyCost, 2),
            'monthly_profit' => round($monthlyProfit, 2),
            'break_even_months' => $breakEven,
            'risk_level' => $risk,
            'is_profitable' => $monthlyProfit > 0,
            'breakdown' => [
                'rent' => round($rent, 2),
                'staff' => round($staff, 2),
                'equipment' => round($equipment, 2),
                'marketing' => round($marketing, 2),
                'monthly_fixed_costs' => round($monthlyCostsInput, 2),
                'employee_monthly_cost' => round($employeeMonthlyCost, 2),
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
}
