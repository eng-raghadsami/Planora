<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SimulationController;

Route::post('/simulate', [SimulationController::class, 'simulate']);
// Simple connectivity check for frontend
Route::get('/ping', function () {
	return response()->json(['pong' => true, 'time' => now()]);
});
// مثال