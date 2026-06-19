<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('location_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('country');
            $table->string('city');
            $table->decimal('cost_factor', 8, 4)->default(1);
            $table->decimal('sales_factor', 8, 4)->default(1);
            $table->integer('volatility_adjust')->default(0);
            $table->decimal('rent_min', 12, 2)->default(0);
            $table->decimal('rent_max', 12, 2)->default(0);
            $table->decimal('avg_salary', 12, 2)->default(0);
            $table->timestamps();

            $table->unique(['country', 'city']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('location_profiles');
    }
};
