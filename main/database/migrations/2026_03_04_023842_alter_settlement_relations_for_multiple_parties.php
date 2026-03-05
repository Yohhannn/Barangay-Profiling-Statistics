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
            $table->dropForeign(['comp_id']);
            $table->dropColumn('comp_id');
            $table->dropForeign(['cihi_id']);
            $table->dropColumn('cihi_id');
        });

        Schema::table('complainants', function (Blueprint $table) {
            $table->foreignId('sett_id')->nullable()->constrained('settlement_logs', 'sett_id')->onDelete('cascade')->onUpdate('cascade');
        });

        Schema::table('citizen_histories', function (Blueprint $table) {
            $table->foreignId('sett_id')->nullable()->constrained('settlement_logs', 'sett_id')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('complainants', function (Blueprint $table) {
            $table->dropForeign(['sett_id']);
            $table->dropColumn('sett_id');
        });

        Schema::table('citizen_histories', function (Blueprint $table) {
            $table->dropForeign(['sett_id']);
            $table->dropColumn('sett_id');
        });

        Schema::table('settlement_logs', function (Blueprint $table) {
            $table->foreignId('comp_id')->nullable()->constrained('complainants', 'comp_id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('cihi_id')->nullable()->constrained('citizen_histories', 'cihi_id')->onDelete('cascade')->onUpdate('cascade');
        });
    }
};
