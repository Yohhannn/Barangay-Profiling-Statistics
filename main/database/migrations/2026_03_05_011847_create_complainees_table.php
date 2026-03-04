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
        Schema::create('complainees', function (Blueprint $table) {
            $table->id('complainee_id');
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('middle_name')->nullable();
            $table->unsignedBigInteger('ctz_id')->nullable();
            $table->foreign('ctz_id')->references('ctz_id')->on('citizens')->onDelete('cascade');
            $table->foreignId('sett_id')->constrained('settlement_logs', 'sett_id')->onDelete('cascade');
            $table->string('involvement_status')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('complainees');
    }
};
