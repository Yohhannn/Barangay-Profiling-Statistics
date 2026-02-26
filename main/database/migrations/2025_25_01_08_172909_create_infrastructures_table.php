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
        Schema::create('infrastructures', function (Blueprint $table) {
            $table->id('inf_id');
            $table->string('name');
            $table->string('type');
            $table->string('owner_fname');
            $table->string('owner_lname');
            $table->string('owner_mname')->nullable();
            $table->enum('owner_suffix', ['Jr.', 'Sr.', 'I', 'II', 'III', 'IV', 'V'])->nullable();
            $table->text('description')->nullable();
            $table->text('address_description')->nullable();
            $table->date('date_encoded')->useCurrent();
            $table->date('date_updated')->useCurrent()->useCurrentOnUpdate();
            $table->boolean('is_deleted')->default(false);
            $table->text('delete_reason')->nullable();
            $table->foreignId('ctz_id')->constrained('citizens','ctz_id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('sitio_id')->constrained('sitios','sitio_id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('encoded_by')->constrained('system_accounts','sys_id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('updated_by')->nullable()->constrained('system_accounts','sys_id')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('infrastructures');
    }
};
