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
        Schema::table('medical_histories', function (Blueprint $table) {
            $table->dropColumn('mh_uuid');
        });
        Schema::table('medical_histories', function (Blueprint $table) {
            $table->string('mh_uuid')->unique()->after('mh_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('medical_histories', function (Blueprint $table) {
            $table->dropColumn('mh_uuid');
        });
        Schema::table('medical_histories', function (Blueprint $table) {
            $table->uuid('mh_uuid')->unique()->after('mh_id');
        });
    }
};
