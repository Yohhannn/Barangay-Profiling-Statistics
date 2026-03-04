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
        // Drop the type check constraint from citizen_histories if it exists
        \Illuminate\Support\Facades\DB::statement('ALTER TABLE citizen_histories DROP CONSTRAINT IF EXISTS citizen_histories_type_check');

        Schema::table('citizen_histories', function (Blueprint $table) {
            $table->string('first_name')->nullable()->change();
            $table->string('last_name')->nullable()->change();
        });

        Schema::table('settlement_logs', function (Blueprint $table) {
            $table->string('sett_uuid')->nullable()->unique();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('settlement_logs', function (Blueprint $table) {
            $table->dropColumn('sett_uuid');
        });

        Schema::table('citizen_histories', function (Blueprint $table) {
            $table->string('first_name')->nullable(false)->change();
            $table->string('last_name')->nullable(false)->change();
        });
    }
};
