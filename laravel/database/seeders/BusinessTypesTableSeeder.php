<?php

namespace Database\Seeders;

use App\Models\BusinessType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BusinessTypesTableSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $types = [
            ['name' => 'Retail Store', 'employees' => 6, 'monthly_costs' => 3000, 'seasonality_profile' => 'summer_up_winter_down'],
            ['name' => 'Cafe', 'employees' => 8, 'monthly_costs' => 2500, 'seasonality_profile' => 'summer_down_winter_up'],
            ['name' => 'Online Business', 'employees' => 4, 'monthly_costs' => 1400, 'seasonality_profile' => 'flat'],
            ['name' => 'Freelance Service', 'employees' => 2, 'monthly_costs' => 900, 'seasonality_profile' => 'flat'],
        ];

        foreach ($types as $type) {
            BusinessType::updateOrCreate(['name' => $type['name']], $type);
        }
    }
}
