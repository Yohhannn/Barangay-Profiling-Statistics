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
            // Drop enum constraint to replace with string for flexible types
            $table->string('type')->change();
            
            // Add the new status column expected by the frontend
            $table->string('status')->default('Pending')->after('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('citizen_histories', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
