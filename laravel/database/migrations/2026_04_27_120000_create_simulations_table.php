<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('simulations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('project_type')->nullable();
            $table->string('size')->nullable();
            $table->integer('capital')->nullable();
            $table->integer('monthly_revenue')->nullable();
            $table->integer('monthly_costs')->nullable();
            $table->integer('monthly_profit')->nullable();
            $table->integer('break_even_months')->nullable();
            $table->string('risk_level')->nullable();
            $table->json('results')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('simulations');
    }
};
