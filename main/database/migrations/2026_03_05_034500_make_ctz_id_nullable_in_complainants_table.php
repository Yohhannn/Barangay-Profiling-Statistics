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
        Schema::table('complainants', function (Blueprint $table) {
            $table->unsignedBigInteger('ctz_id')->nullable()->change();
        });

        Schema::table('settlement_logs', function (Blueprint $table) {
            $table->text('complaint_description')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('complainants', function (Blueprint $table) {
            $table->unsignedBigInteger('ctz_id')->nullable(false)->change();
        });

        Schema::table('settlement_logs', function (Blueprint $table) {
            $table->dropColumn('complaint_description');
        });
    }
};
