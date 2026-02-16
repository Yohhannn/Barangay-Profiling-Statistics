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
        Schema::table('citizen_informations', function (Blueprint $table) {
            $table->date('date_of_death')->nullable()->after('is_deceased');
            $table->string('cause_of_death')->nullable()->after('date_of_death');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('citizen_informations', function (Blueprint $table) {
            $table->dropColumn(['date_of_death', 'cause_of_death']);
        });
    }
};
