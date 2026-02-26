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
        Schema::create('transaction_logs', function (Blueprint $table) {
            $table->id('tl_id');
            $table->date('date_requested')->nullable();
            $table->enum('type', ['Business Clearance', 'Business Permit', 'Complaint']);
            $table->text('purpose')->nullable();
            $table->enum('status', ['Pending','Approved','Declined']);
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->enum('suffix', ['Jr.', 'Sr.', 'I', 'II', 'IV', 'V'])->nullable();
            $table->date('date_encoded')->useCurrent();
            $table->date('date_updated')->useCurrent()->useCurrentOnUpdate();
            $table->boolean('is_deleted')->default(false);
            $table->text('delete_reason')->nullable();
            $table->foreignId('ctz_id')->constrained('citizens','ctz_id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('encoded_by')->constrained('system_accounts','sys_id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('updated_by')->nullable()->constrained('system_accounts','sys_id')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaction_logs');
    }
};
