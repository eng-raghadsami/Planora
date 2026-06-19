<?php

namespace Database\Seeders;

use App\Models\LocationProfile;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LocationProfilesTableSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $profiles = [
            ['Palestine', 'Gaza', 0.88, 0.87, 4, 500, 850, 420],
            ['Palestine', 'Ramallah', 1.06, 1.11, -1, 950, 1600, 850],
            ['Palestine', 'Nablus', 0.95, 0.98, 1, 700, 1200, 620],
            ['Palestine', 'Bethlehem', 0.98, 1.02, 0, 650, 1100, 580],
            ['Palestine', 'Jenin', 0.92, 0.95, 2, 600, 1000, 500],
            ['Palestine', 'Tulkarm', 0.93, 0.96, 1, 620, 1050, 510],
            ['Palestine', 'Qalqiliya', 0.90, 0.93, 2, 550, 900, 480],
            ['Palestine', 'Hebron', 0.89, 0.91, 2, 580, 950, 490],
            ['Jordan', 'Amman', 1.10, 1.12, -1, 1100, 1900, 920],
            ['Jordan', 'Irbid', 0.93, 0.94, 1, 650, 1050, 560],
            ['Jordan', 'Zarqa', 0.91, 0.92, 2, 600, 950, 520],
            ['Jordan', 'Salt', 0.88, 0.89, 2, 550, 850, 480],
            ['Jordan', 'Aqaba', 1.05, 1.08, 0, 950, 1500, 780],
            ['Jordan', 'Madaba', 0.87, 0.88, 2, 520, 800, 450],
            ['Egypt', 'Cairo', 1.02, 1.03, 0, 900, 1700, 760],
            ['Egypt', 'Alexandria', 0.97, 0.99, 1, 780, 1350, 660],
            ['Egypt', 'Giza', 1.00, 1.01, 0, 850, 1600, 720],
            ['Egypt', 'Aswan', 0.85, 0.87, 2, 550, 950, 500],
            ['Egypt', 'Luxor', 0.88, 0.90, 1, 600, 1050, 540],
            ['Egypt', 'Mansoura', 0.92, 0.94, 1, 700, 1200, 600],
            ['Egypt', 'Tanta', 0.90, 0.92, 1, 680, 1150, 570],
            ['Lebanon', 'Beirut', 1.15, 1.18, -1, 1300, 2200, 1100],
            ['Lebanon', 'Tripoli', 0.95, 0.97, 2, 700, 1200, 620],
            ['Lebanon', 'Sidon', 0.93, 0.95, 1, 680, 1100, 580],
            ['Syria', 'Damascus', 0.85, 0.83, 3, 500, 900, 450],
            ['Syria', 'Aleppo', 0.82, 0.80, 4, 450, 800, 400],
            ['United Arab Emirates', 'Dubai', 1.35, 1.40, -1, 1800, 3000, 1500],
            ['United Arab Emirates', 'Abu Dhabi', 1.32, 1.38, 0, 1700, 2800, 1450],
            ['United Arab Emirates', 'Sharjah', 1.15, 1.18, 0, 1200, 1900, 1000],
            ['Saudi Arabia', 'Riyadh', 1.20, 1.22, 0, 1400, 2300, 1200],
            ['Saudi Arabia', 'Jeddah', 1.18, 1.20, 0, 1300, 2100, 1100],
            ['Saudi Arabia', 'Dammam', 1.16, 1.18, 0, 1200, 1950, 1050],
            ['United Kingdom', 'London', 1.50, 1.55, -1, 1800, 3500, 1800],
            ['United Kingdom', 'Manchester', 1.20, 1.22, 0, 1100, 1900, 1200],
            ['United Kingdom', 'Birmingham', 1.15, 1.17, 0, 1000, 1700, 1100],
            ['United States', 'New York', 1.60, 1.65, -1, 2000, 3800, 2000],
            ['United States', 'Los Angeles', 1.55, 1.60, 0, 1800, 3500, 1900],
            ['United States', 'Chicago', 1.25, 1.28, 0, 1200, 2000, 1300],
            ['United States', 'Texas', 1.10, 1.12, 0, 1000, 1700, 1150],
            ['Canada', 'Toronto', 1.35, 1.38, 0, 1400, 2400, 1400],
            ['Canada', 'Vancouver', 1.40, 1.42, 0, 1500, 2600, 1500],
            ['Canada', 'Montreal', 1.20, 1.22, 0, 1100, 1900, 1200],
            ['Germany', 'Berlin', 1.25, 1.28, 0, 1200, 2000, 1300],
            ['Germany', 'Munich', 1.35, 1.38, 0, 1400, 2300, 1450],
            ['Germany', 'Hamburg', 1.28, 1.30, 0, 1250, 2050, 1350],
        ];

        foreach ($profiles as [$country, $city, $costFactor, $salesFactor, $volatilityAdjust, $rentMin, $rentMax, $avgSalary]) {
            LocationProfile::updateOrCreate(
                ['country' => $country, 'city' => $city],
                [
                    'cost_factor' => $costFactor,
                    'sales_factor' => $salesFactor,
                    'volatility_adjust' => $volatilityAdjust,
                    'rent_min' => $rentMin,
                    'rent_max' => $rentMax,
                    'avg_salary' => $avgSalary,
                ]
            );
        }
    }
}
