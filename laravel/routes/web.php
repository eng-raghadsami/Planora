<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SimulationController;
use App\Http\Controllers\AIController;

Route::get('/', function () {
    return response()->json(['message' => 'Home page working']);
});
Route::post('/simulate', [SimulationController::class, 'simulate']);
Route::post('/scenarios', [SimulationController::class, 'scenarios']);
Route::post('/ai-analysis', [AIController::class, 'analyze']);