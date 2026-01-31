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
        Schema::create('family_plannings', function (Blueprint $table) {
            $table->id('fp_id');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->enum('status', ['Changing Clinic', 'Changing Method', 'Current User', 'Dropout', 'New Acceptor', 'Restarter']);
            $table->enum('method', ['None', 'Others', 'BTL', 'COC', 'Condom', 'DPT', 'Implant', 'Injectables', 'IUD', 'LAM', 'POP']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('family_plannings');
    }
};
