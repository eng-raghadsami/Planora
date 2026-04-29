<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PlansTableSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Free',
                'slug' => 'free',
                'price_cents' => 0,
                'interval' => 'month',
                'features' => [
                    'Basic Simulations',
                    'Limited Reports',
                    'Email Support'
                ],
                'popular' => false,
            ],
            [
                'name' => 'Pro',
                'slug' => 'pro',
                'price_cents' => 999,
                'interval' => 'month',
                'features' => [
                    'All Features',
                    'Advanced Reports',
                    'Scenario Comparisons',
                    'Priority Support'
                ],
                'popular' => true,
            ],
            [
                'name' => 'Premium',
                'slug' => 'premium',
                'price_cents' => 1999,
                'interval' => 'month',
                'features' => [
                    'All Pro Features',
                    'Custom Analysis',
                    'Dedicated Consultant',
                    'VIP Support'
                ],
                'popular' => false,
            ],
        ];

        foreach ($plans as $p) {
            Plan::updateOrCreate(['slug' => $p['slug']], $p);
        }
    }
}
