<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Simulation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'project_type',
        'size',
        'capital',
        'monthly_revenue',
        'monthly_costs',
        'monthly_profit',
        'break_even_months',
        'risk_level',
        'results',
    ];

    protected $casts = [
        'results' => 'array',
    ];
}
