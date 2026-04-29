<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AIController;
use App\Http\Controllers\SimulationController;

Route::post('/simulate', [SimulationController::class, 'simulate']);
Route::post('/scenarios', [SimulationController::class, 'scenarios']);
Route::post('/ai-analysis', [AIController::class, 'analyze']);

Route::get('/simulate', function () {
    return response()->json([
        'message' => 'Use POST /api/simulate with JSON body.',
        'example_body' => [
            'capital' => 50000,
            'size' => 'medium',
            'project_type' => 'Cafe',
            'monthly_sales' => 21000,
            'monthly_costs' => 2500,
            'employees' => 8,
            'seasonality_profile' => 'summer_down_winter_up',
            'seasonality_strength_percent' => 18,
            'monthly_growth_percent' => 1.2,
            'cost_growth_percent' => 0.6,
            'volatility_percent' => 12,
            'shock_month' => 7,
            'shock_amount' => 4000,
            'campaign_month' => 11,
            'campaign_boost_percent' => 20,
        ],
    ], 200);
});

Route::get('/scenarios', function () {
    return response()->json([
        'message' => 'Use POST /api/scenarios with JSON body.',
        'example_body' => [
            'capital' => 50000,
            'size' => 'small',
            'monthly_sales' => 7000,
            'monthly_costs' => 12000,
            'employees' => 8,
        ],
    ], 200);
});

Route::get('/ai-analysis', function () {
    return response()->json([
        'message' => 'Use POST /api/ai-analysis with JSON body.',
        'example_body' => [
            'monthly_profit' => 2500,
            'break_even_months' => 9,
        ],
    ], 200);
});
