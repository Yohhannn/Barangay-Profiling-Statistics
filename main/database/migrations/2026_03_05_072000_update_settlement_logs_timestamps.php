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
        Schema::table('settlement_logs', function (Blueprint $table) {
            $table->timestamp('date_encoded')->nullable()->change();
            $table->timestamp('date_updated')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('settlement_logs', function (Blueprint $table) {
            $table->date('date_encoded')->nullable()->change();
            $table->date('date_updated')->nullable()->change();
        });
    }
};
