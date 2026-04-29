<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AIController extends Controller
{
    public function analyze(Request $request)
    {
        $validated = $request->validate([
            'monthly_profit' => 'required|numeric',
            'break_even_months' => 'nullable|numeric|min:0',
        ]);

        $profit = (float) $validated['monthly_profit'];
        $breakEven = isset($validated['break_even_months']) ? (float) $validated['break_even_months'] : null;

        if ($profit <= 0) {
            $analysis = 'This project is currently unprofitable based on your inputs.';
            $risk = 'high';
        } elseif ($breakEven !== null && $breakEven > 12) {
            $analysis = 'The project can be profitable, but ROI is relatively slow.';
            $risk = 'medium';
        } else {
            $analysis = 'The project looks financially healthy with the current assumptions.';
            $risk = 'low';
        }

        $recommendations = [];

        if ($risk === 'high') {
            $recommendations[] = 'Lower recurring costs before scaling.';
            $recommendations[] = 'Increase pricing or sales volume to improve margins.';
            $recommendations[] = 'Delay non-critical spending until cash flow stabilizes.';
        }

        if ($risk === 'medium') {
            $recommendations[] = 'Optimize operating expenses to shorten break-even time.';
            $recommendations[] = 'Focus marketing spend on high-conversion channels.';
            $recommendations[] = 'Track monthly variance between projected and actual cash flow.';
        }

        if ($risk === 'low') {
            $recommendations[] = 'Scale gradually while preserving a cash reserve.';
            $recommendations[] = 'Reinvest a share of profits into growth channels.';
            $recommendations[] = 'Review costs monthly to keep margins strong as revenue grows.';
        }

        return response()->json([
            'analysis' => $analysis,
            'risk_level' => $risk,
            'recommendations' => $recommendations,
        ]);
    }
}
