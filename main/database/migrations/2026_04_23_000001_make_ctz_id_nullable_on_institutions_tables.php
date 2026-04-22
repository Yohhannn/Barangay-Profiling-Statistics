<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Make ctz_id nullable on business_infos and infrastructures tables
     * so that records can be saved without a linked citizen owner.
     */
    public function up(): void
    {
        Schema::table('business_infos', function (Blueprint $table) {
            $table->unsignedBigInteger('ctz_id')->nullable()->change();
        });

        Schema::table('infrastructures', function (Blueprint $table) {
            $table->unsignedBigInteger('ctz_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('business_infos', function (Blueprint $table) {
            $table->unsignedBigInteger('ctz_id')->nullable(false)->change();
        });

        Schema::table('infrastructures', function (Blueprint $table) {
            $table->unsignedBigInteger('ctz_id')->nullable(false)->change();
        });
    }
};
