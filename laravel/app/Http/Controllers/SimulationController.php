<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SimulationController extends Controller
{
    public function simulate(Request $request)
    {
        // 🟢 استقبال البيانات
        $capital = $request->input('capital');
        $projectType = $request->input('project_type');
        $size = $request->input('size');

        // 🧠 تحديد نسب حسب حجم المشروع
        if ($size == 'small') {
            $rentRate = 0.2;
            $staffRate = 0.2;
            $equipmentRate = 0.3;
            $marketingRate = 0.1;
        } elseif ($size == 'medium') {
            $rentRate = 0.25;
            $staffRate = 0.25;
            $equipmentRate = 0.3;
            $marketingRate = 0.15;
        } else {
            $rentRate = 0.3;
            $staffRate = 0.3;
            $equipmentRate = 0.3;
            $marketingRate = 0.2;
        }

        // 💰 حساب التكاليف
        $rent = $capital * $rentRate;
        $staff = $capital * $staffRate;
        $equipment = $capital * $equipmentRate;
        $marketing = $capital * $marketingRate;

        $totalCost = $rent + $staff + $equipment + $marketing;

        // 📈 تقدير الأرباح (بسيط)
        $expectedRevenue = $capital * 0.4;
        $monthlyCost = $totalCost * 0.2;
        $monthlyProfit = $expectedRevenue - $monthlyCost;

        // ⏱ Break-even
        $breakEven = $monthlyProfit > 0 ? $totalCost / $monthlyProfit : 0;

        // 📊 Cash Flow Simulation (6 شهور)
        $cashFlow = [];
        $balance = -$totalCost;

        for ($i = 1; $i <= 6; $i++) {
            $balance += $monthlyProfit;
            $cashFlow[] = [
                'month' => $i,
                'balance' => round($balance, 2)
            ];
        }

        // 🔁 Response
        return response()->json([
            'project_type' => $projectType,
            'size' => $size,
            'total_cost' => round($totalCost, 2),
            'monthly_profit' => round($monthlyProfit, 2),
            'break_even_months' => round($breakEven, 1),

            'breakdown' => [
                'rent' => round($rent, 2),
                'staff' => round($staff, 2),
                'equipment' => round($equipment, 2),
                'marketing' => round($marketing, 2),
            ],

            'cash_flow' => $cashFlow
        ]);
    }
}