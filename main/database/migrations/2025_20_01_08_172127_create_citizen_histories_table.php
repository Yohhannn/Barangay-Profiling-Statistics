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
        Schema::create('citizen_histories', function (Blueprint $table) {
            $table->id('cihi_id');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->text('description')->nullable();
            $table->enum('type',['Complaint','Violation','Warrant']);
            $table->boolean('is_deleted')->default(false);
            $table->text('delete_reason')->nullable();
            $table->timestamp('date_created')->useCurrent();
            $table->timestamp('date_updated')->useCurrent()->useCurrentOnUpdate();
            $table->foreignId('encoded_by')->constrained('system_accounts', 'sys_id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('updated_by')->nullable()->constrained('system_accounts', 'sys_id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('ctz_id')->constrained('citizens', 'ctz_id')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('citizen_histories');
    }
};
