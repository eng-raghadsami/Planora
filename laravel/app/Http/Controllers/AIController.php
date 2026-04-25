<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AIController extends Controller
{
    public function analyze(Request $request)
    {
        $profit = $request->monthly_profit;
        $breakEven = $request->break_even_months;

        // 🧠 تحليل بسيط (Smart Logic)
        if ($profit <= 0) {
            $analysis = "This project is not profitable.";
            $risk = "high";
        } elseif ($breakEven > 12) {
            $analysis = "This project has slow return on investment.";
            $risk = "medium";
        } else {
            $analysis = "This project looks financially healthy.";
            $risk = "low";
        }

        // 💡 Recommendations
        $recommendations = [];

        if ($risk == "high") {
            $recommendations[] = "Reduce initial costs";
            $recommendations[] = "Start with smaller scale";
        }

        if ($risk == "medium") {
            $recommendations[] = "Optimize expenses";
            $recommendations[] = "Improve marketing strategy";
        }

        if ($risk == "low") {
            $recommendations[] = "Scale your business gradually";
            $recommendations[] = "Invest more in growth";
        }

        return response()->json([
            'analysis' => $analysis,
            'risk_level' => $risk,
            'recommendations' => $recommendations
        ]);
    }
}