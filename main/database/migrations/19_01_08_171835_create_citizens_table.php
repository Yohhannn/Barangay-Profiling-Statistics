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
        Schema::create('citizens', function (Blueprint $table) {
            $table->id('ctz_id');
            $table->integer('ctz_number');
            $table->boolean('is_deleted')->default(false);
            $table->text('deleted_reason')->nullable();
            $table->date('date_encoded')->default(now());
            $table->date('date_updated')->nullable();
            $table->foreignId('hh_id')->constrained('household_infos','hh_id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('updated_by')->constrained('system_accounts','sys_id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('encoded_by')->constrained('system_accounts','sys_id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('ctz_info_id')->constrained('citizen_informations','ctz_info_id')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('citizens');
    }
};
