<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'price_cents',
        'interval',
        'features',
        'popular',
    ];

    protected $casts = [
        'features' => 'array',
        'popular' => 'boolean',
    ];
}
