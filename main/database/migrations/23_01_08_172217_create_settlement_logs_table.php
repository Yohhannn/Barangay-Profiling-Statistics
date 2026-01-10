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
        Schema::create('settlement_logs', function (Blueprint $table) {
            $table->id('sett_id');
            $table->text('settlement_description');
            $table->date('date_of_settlement');
            $table->date('date_encoded')->useCurrent();
            $table->date('date_updated')->useCurrent()->useCurrentOnUpdate();
            $table->boolean('is_deleted')->default(false);
            $table->text('delete_reason')->nullable();
            $table->foreignId('encoded_by')->constrained('system_accounts','sys_id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('updated_by')->nullable()->constrained('system_accounts','sys_id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('comp_id')->constrained('complainants','comp_id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('cihi_id')->constrained('citizen_histories','cihi_id')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settlement_logs');
    }
};
