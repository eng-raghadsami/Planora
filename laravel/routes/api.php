<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SimulationController;

Route::post('/simulate', [SimulationController::class, 'simulate']);
// مثال