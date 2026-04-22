<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add bs_uuid to business_infos (unique identifier shown in the UI)
        Schema::table('business_infos', function (Blueprint $table) {
            $table->string('bs_uuid', 20)->unique()->nullable()->after('bs_id');
        });

        // Drop bo_suffix from business_owners
        Schema::table('business_owners', function (Blueprint $table) {
            $table->dropColumn('bo_suffix');
        });
    }

    public function down(): void
    {
        Schema::table('business_infos', function (Blueprint $table) {
            $table->dropColumn('bs_uuid');
        });

        Schema::table('business_owners', function (Blueprint $table) {
            $table->enum('bo_suffix', ['Jr.', 'Sr.', 'I', 'II', 'III', 'IV', 'V'])->nullable()->after('bo_mname');
        });
    }
};
