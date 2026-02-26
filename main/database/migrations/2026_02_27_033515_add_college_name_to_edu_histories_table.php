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
        Schema::table('edu_histories', function (Blueprint $table) {
            $table->string('college_name')->nullable()->after('sr_highschool_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('edu_histories', function (Blueprint $table) {
            $table->dropColumn('college_name');
        });
    }
};
