<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LocationProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'country',
        'city',
        'cost_factor',
        'sales_factor',
        'volatility_adjust',
        'rent_min',
        'rent_max',
        'avg_salary',
    ];

    protected $casts = [
        'cost_factor' => 'float',
        'sales_factor' => 'float',
        'volatility_adjust' => 'integer',
        'rent_min' => 'float',
        'rent_max' => 'float',
        'avg_salary' => 'float',
    ];
}
