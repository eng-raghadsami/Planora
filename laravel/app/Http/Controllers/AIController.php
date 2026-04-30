<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AIController extends Controller
{
    public function analyze(Request $request)
    {
        $validated = $request->validate([
            'monthly_profit'     => 'required|numeric',
            'break_even_months'  => 'nullable|numeric|min:0',
            'monthly_sales'      => 'nullable|numeric|min:0',
            'monthly_costs'      => 'nullable|numeric|min:0',
            'initial_investment' => 'nullable|numeric|min:0',
            'profit_margin'      => 'nullable|numeric',
            'total_months'       => 'nullable|integer|min:1',
        ]);

        $profit          = (float) $validated['monthly_profit'];
        $breakEven       = isset($validated['break_even_months'])  ? (float) $validated['break_even_months']  : null;
        $monthlySales    = isset($validated['monthly_sales'])      ? (float) $validated['monthly_sales']      : 0.0;
        $monthlyCosts    = isset($validated['monthly_costs'])      ? (float) $validated['monthly_costs']      : 0.0;
        $investment      = isset($validated['initial_investment']) ? (float) $validated['initial_investment'] : 0.0;
        $profitMargin    = isset($validated['profit_margin'])      ? (float) $validated['profit_margin']      : 0.0;

        // ── Risk level ──────────────────────────────────────────────────────
        if ($profit <= 0) {
            $risk = 'high';
        } elseif ($breakEven !== null && $breakEven > 12) {
            $risk = 'medium';
        } else {
            $risk = 'low';
        }

        // ── Health Score (0–100) ────────────────────────────────────────────
        $healthScore = 50; // baseline

        // Profit contribution (+/- 30 pts)
        if ($profit > 0) {
            $profitRatio = $monthlySales > 0 ? ($profit / $monthlySales) : 0;
            $healthScore += min(30, (int) ($profitRatio * 100));
        } else {
            $healthScore -= 30;
        }

        // Break-even contribution (+/- 15 pts)
        if ($breakEven !== null) {
            if ($breakEven <= 6)        $healthScore += 15;
            elseif ($breakEven <= 12)   $healthScore += 8;
            elseif ($breakEven <= 18)   $healthScore -= 5;
            else                        $healthScore -= 15;
        }

        // Profit margin contribution (+/- 10 pts)
        if ($profitMargin >= 20)      $healthScore += 10;
        elseif ($profitMargin >= 10)  $healthScore += 5;
        elseif ($profitMargin < 0)    $healthScore -= 10;

        // Cost ratio contribution (+/- 5 pts)
        if ($monthlySales > 0) {
            $costRatio = $monthlyCosts / $monthlySales;
            if ($costRatio < 0.5)      $healthScore += 5;
            elseif ($costRatio > 0.9)  $healthScore -= 5;
        }

        $healthScore = max(0, min(100, $healthScore));

        // ── Main analysis ───────────────────────────────────────────────────
        if ($profit <= 0) {
            $analysis = 'This project is currently unprofitable based on your inputs. Immediate cost reduction or revenue increase is needed before launch.';
        } elseif ($breakEven !== null && $breakEven > 18) {
            $analysis = 'The project generates profit but the payback period is long (over 18 months). Consider reducing upfront costs or accelerating revenue growth.';
        } elseif ($breakEven !== null && $breakEven > 12) {
            $analysis = 'The project can be profitable, but ROI is relatively slow. Focus on optimizing operations to bring break-even under 12 months.';
        } elseif ($profitMargin >= 20) {
            $analysis = 'Excellent margins detected. The project shows strong financial health. Prioritize sustainable scaling and build a cash reserve.';
        } else {
            $analysis = 'The project looks financially healthy with the current assumptions. Maintain cost discipline as you grow.';
        }

        // ── Key insights (short bullets) ────────────────────────────────────
        $keyInsights = [];

        if ($monthlySales > 0) {
            $keyInsights[] = 'Monthly sales of ' . $this->fmt($monthlySales) . ' cover ' . round(($profit / $monthlySales) * 100, 1) . '% net profit.';
        }
        if ($breakEven !== null) {
            $keyInsights[] = 'You recover your investment in approximately ' . $breakEven . ' months.';
        } else {
            $keyInsights[] = 'At current margins you do not recover the investment within the 24-month window.';
        }
        if ($profitMargin > 0) {
            $keyInsights[] = 'Profit margin of ' . round($profitMargin, 1) . '% — ' . ($profitMargin >= 15 ? 'above healthy threshold.' : 'below the 15% healthy threshold; look to raise prices or cut costs.');
        }

        // ── Strengths ───────────────────────────────────────────────────────
        $strengths = [];
        if ($profit > 0)             $strengths[] = 'Positive monthly cash flow';
        if ($breakEven !== null && $breakEven <= 12) $strengths[] = 'Break-even within 12 months';
        if ($profitMargin >= 15)     $strengths[] = 'Healthy profit margin (≥15%)';
        if ($monthlyCosts > 0 && $monthlySales > 0 && ($monthlyCosts / $monthlySales) < 0.6) {
            $strengths[] = 'Lean cost structure (<60% of revenue)';
        }
        if (empty($strengths))       $strengths[] = 'Business model is defined and testable';

        // ── Weaknesses ──────────────────────────────────────────────────────
        $weaknesses = [];
        if ($profit <= 0)            $weaknesses[] = 'Currently operating at a loss';
        if ($breakEven !== null && $breakEven > 12) $weaknesses[] = 'Long payback period (>' . $breakEven . ' months)';
        if ($profitMargin > 0 && $profitMargin < 10) $weaknesses[] = 'Thin profit margin (<10%)';
        if ($monthlySales > 0 && ($monthlyCosts / $monthlySales) > 0.8) {
            $weaknesses[] = 'High cost-to-revenue ratio (>80%)';
        }
        if (empty($weaknesses))      $weaknesses[] = 'No critical financial red flags detected';

        // ── Structured recommendations ──────────────────────────────────────
        $recommendations = [];

        if ($risk === 'high') {
            $recommendations[] = [
                'title'    => 'Cut Non-Essential Costs',
                'text'     => 'Audit all recurring expenses and eliminate anything not directly tied to revenue generation.',
                'priority' => 'High',
                'category' => 'Cost Control',
                'impact'   => 'High',
            ];
            $recommendations[] = [
                'title'    => 'Increase Revenue Immediately',
                'text'     => 'Raise prices by 10–15% or introduce a higher-margin product/service line.',
                'priority' => 'High',
                'category' => 'Revenue',
                'impact'   => 'High',
            ];
            $recommendations[] = [
                'title'    => 'Delay Non-Critical Spending',
                'text'     => 'Pause expansion or upgrades until monthly cash flow turns positive.',
                'priority' => 'Medium',
                'category' => 'Cash Flow',
                'impact'   => 'Medium',
            ];
        } elseif ($risk === 'medium') {
            $recommendations[] = [
                'title'    => 'Optimize Operating Expenses',
                'text'     => 'Shorten break-even by reducing monthly overhead by 10–20%.',
                'priority' => 'High',
                'category' => 'Cost Control',
                'impact'   => 'High',
            ];
            $recommendations[] = [
                'title'    => 'Focus on High-ROI Marketing',
                'text'     => 'Concentrate marketing spend on channels with proven conversion; pause experimental ones.',
                'priority' => 'Medium',
                'category' => 'Marketing',
                'impact'   => 'Medium',
            ];
            $recommendations[] = [
                'title'    => 'Track Variance Monthly',
                'text'     => 'Compare projected vs actual cash flow every month and adjust spending accordingly.',
                'priority' => 'Medium',
                'category' => 'Monitoring',
                'impact'   => 'Medium',
            ];
        } else {
            $recommendations[] = [
                'title'    => 'Scale Gradually',
                'text'     => 'Expand capacity by 20–30% while keeping a 3-month cash reserve.',
                'priority' => 'Medium',
                'category' => 'Growth',
                'impact'   => 'High',
            ];
            $recommendations[] = [
                'title'    => 'Reinvest Profits Strategically',
                'text'     => 'Allocate 20–30% of monthly profit to growth channels with measurable ROI.',
                'priority' => 'Medium',
                'category' => 'Investment',
                'impact'   => 'Medium',
            ];
            $recommendations[] = [
                'title'    => 'Protect Your Margins',
                'text'     => 'Review costs quarterly and renegotiate supplier or rental contracts annually.',
                'priority' => 'Low',
                'category' => 'Cost Control',
                'impact'   => 'Medium',
            ];
        }

        // ── Action items (quick wins) ────────────────────────────────────────
        $actionItems = [
            'Review your top 3 cost lines this week.',
            'Set a monthly cash-flow review reminder.',
            'Identify one upsell or cross-sell opportunity.',
        ];

        return response()->json([
            'analysis'        => $analysis,
            'risk_level'      => $risk,
            'health_score'    => $healthScore,
            'key_insights'    => $keyInsights,
            'strengths'       => $strengths,
            'weaknesses'      => $weaknesses,
            'recommendations' => $recommendations,
            'action_items'    => $actionItems,
        ]);
    }

    private function fmt(float $value): string
    {
        return '$' . number_format($value, 0);
    }
}
