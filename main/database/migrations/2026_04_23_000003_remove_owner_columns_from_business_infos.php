<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Remove owner columns from business_infos now that ownership
     * is managed by the dedicated business_owners table.
     */
    public function up(): void
    {
        Schema::table('business_infos', function (Blueprint $table) {
            // Drop FK first if it exists, then drop the columns
            $table->dropForeign(['ctz_id']);
            $table->dropColumn(['owner_fname', 'owner_lname', 'owner_mname', 'owner_suffix', 'ctz_id']);
        });
    }

    public function down(): void
    {
        Schema::table('business_infos', function (Blueprint $table) {
            $table->string('owner_fname', 60)->after('address');
            $table->string('owner_lname', 60)->after('owner_fname');
            $table->string('owner_mname', 60)->nullable()->after('owner_lname');
            $table->enum('owner_suffix', ['Jr.', 'Sr.', 'I', 'II', 'III', 'IV', 'V'])->nullable()->after('owner_mname');
            $table->foreignId('ctz_id')->nullable()->constrained('citizens', 'ctz_id')->onDelete('set null')->onUpdate('cascade');
        });
    }
};
