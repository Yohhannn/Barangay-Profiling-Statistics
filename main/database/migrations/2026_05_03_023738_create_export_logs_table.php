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
        Schema::create('export_logs', function (Blueprint $table) {
            $table->id('EL_ID');
            $table->unsignedBigInteger('tl_id');
            $table->unsignedBigInteger('exported_by');
            $table->dateTime('date_time_exported');

            // Foreign keys
            $table->foreign('tl_id')->references('tl_id')->on('transaction_logs')->onDelete('cascade');
            $table->foreign('exported_by')->references('sys_id')->on('system_accounts')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('export_logs');
    }
};
