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
        Schema::table('citizens', function (Blueprint $table) {
            $table->dateTime('date_encoded')->default(now())->change();
            $table->dateTime('date_updated')->nullable()->change();
        });

        Schema::table('household_infos', function (Blueprint $table) {
            $table->dateTime('date_encoded')->useCurrent()->change();
            $table->dateTime('date_updated')->useCurrent()->useCurrentOnUpdate()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('citizens', function (Blueprint $table) {
            $table->date('date_encoded')->default(now())->change();
            $table->date('date_updated')->nullable()->change();
        });

        Schema::table('household_infos', function (Blueprint $table) {
            $table->date('date_encoded')->useCurrent()->change();
            $table->date('date_updated')->useCurrent()->useCurrentOnUpdate()->change();
        });
    }
};
