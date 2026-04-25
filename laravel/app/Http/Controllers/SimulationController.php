<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SimulationController extends Controller
{
    // 🟢 MAIN SIMULATION
    public function simulate(Request $request)
    {
        // ✅ Validation
        $request->validate([
            'capital' => 'required|numeric|min:1',
            'size' => 'required|in:small,medium,large',
            'project_type' => 'nullable|string'
        ]);

        $capital = $request->capital;
        $size = $request->size;
        $projectType = $request->project_type ?? "General";

        // 🧠 نسب حسب الحجم
        if ($size == 'small') {
            $rentRate = 0.2;
            $staffRate = 0.2;
            $equipmentRate = 0.3;
            $marketingRate = 0.1;
            $revenueRate = 0.35;
        } elseif ($size == 'medium') {
            $rentRate = 0.25;
            $staffRate = 0.25;
            $equipmentRate = 0.3;
            $marketingRate = 0.15;
            $revenueRate = 0.4;
        } else {
            $rentRate = 0.3;
            $staffRate = 0.3;
            $equipmentRate = 0.3;
            $marketingRate = 0.2;
            $revenueRate = 0.45;
        }

        // 💰 التكاليف
        $rent = $capital * $rentRate;
        $staff = $capital * $staffRate;
        $equipment = $capital * $equipmentRate;
        $marketing = $capital * $marketingRate;

        $totalCost = $rent + $staff + $equipment + $marketing;

        // 📈 الإيرادات والمصاريف
        $monthlyCost = $totalCost * 0.2;
        $expectedRevenue = $capital * $revenueRate;
        $monthlyProfit = $expectedRevenue - $monthlyCost;

        // ⏱ Break-even
        $breakEven = $monthlyProfit > 0 
            ? round($totalCost / $monthlyProfit, 1)
            : null;

        // 📊 Cash Flow Simulation (dynamic)
        $cashFlow = [];
        $balance = -$totalCost;
        $month = 1;
        $maxMonths = 24;

        while ($month <= $maxMonths) {

            $balance += $monthlyProfit;

            $cashFlow[] = [
                'month' => $month,
                'balance' => round($balance, 2)
            ];

            if ($balance >= 0) {
                break;
            }

            $month++;
        }

        // 🔥 Risk Level
        if ($monthlyProfit <= 0) {
            $risk = "high";
        } elseif ($breakEven !== null && $breakEven > 12) {
            $risk = "medium";
        } else {
            $risk = "low";
        }

        // 🟢 هل المشروع مربح
        $isProfitable = $balance >= 0;

        return response()->json([
            'project_type' => $projectType,
            'size' => $size,

            'total_cost' => round($totalCost, 2),
            'monthly_profit' => round($monthlyProfit, 2),
            'break_even_months' => $breakEven,
            'risk_level' => $risk,
            'is_profitable' => $isProfitable,

            'breakdown' => [
                'rent' => round($rent, 2),
                'staff' => round($staff, 2),
                'equipment' => round($equipment, 2),
                'marketing' => round($marketing, 2),
            ],

            'cash_flow' => $cashFlow
        ]);
    }

    // 🟣 SCENARIOS COMPARISON
    public function scenarios(Request $request)
    {
        $request->validate([
            'capital' => 'required|numeric|min:1'
        ]);

        $capital = $request->capital;

        $sizes = ['small', 'medium', 'large'];
        $results = [];

        foreach ($sizes as $size) {

            if ($size == 'small') {
                $revenueRate = 0.35;
                $costRate = 0.7;
            } elseif ($size == 'medium') {
                $revenueRate = 0.4;
                $costRate = 0.75;
            } else {
                $revenueRate = 0.45;
                $costRate = 0.8;
            }

            $totalCost = $capital * $costRate;
            $monthlyCost = $totalCost * 0.2;
            $revenue = $capital * $revenueRate;

            $profit = $revenue - $monthlyCost;

            $breakEven = $profit > 0 
                ? round($totalCost / $profit, 1) 
                : null;

            $risk = $profit <= 0 
                ? "high" 
                : ($breakEven !== null && $breakEven > 12 ? "medium" : "low");

            $results[$size] = [
                'monthly_profit' => round($profit, 2),
                'break_even_months' => $breakEven,
                'risk_level' => $risk
            ];
        }

        return response()->json($results);
    }
}