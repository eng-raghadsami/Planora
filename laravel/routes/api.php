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
            'size' => 'small',
            'project_type' => 'Retail Store',
            'monthly_sales' => 7000,
            'monthly_costs' => 12000,
            'employees' => 8,
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
