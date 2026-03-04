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
        Schema::table('citizen_histories', function (Blueprint $table) {
            $table->string('involvement_type')->nullable()->after('status');
            $table->string('case_classification')->nullable()->after('involvement_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('citizen_histories', function (Blueprint $table) {
            $table->dropColumn(['involvement_type', 'case_classification']);
        });
    }
};
