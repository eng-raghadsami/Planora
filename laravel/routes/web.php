<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SimulationController;

Route::get('/', function () {
    return response()->json(['message' => 'Home page working']);
});
Route::get('/simulate', function () {
    return response()->json(['message' => 'working']);
});