<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->unsignedInteger('employees')->default(0);
            $table->decimal('monthly_costs', 12, 2)->default(0);
            $table->string('seasonality_profile')->default('flat');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('business_types');
    }
};
