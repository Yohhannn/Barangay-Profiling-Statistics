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
        Schema::create('business_infos', function (Blueprint $table) {
            $table->id('bs_id');
            $table->string('name');
            $table->enum('type',['Cooperative','Sole Proprietorship','Partnership','Corporation','Cooperative','Franchise','Others']);
            $table->text('description')->nullable();    
            $table->enum('status',[ 'Active','Inactive','Closed','Suspended']);
            $table->boolean('is_dti')->default(false);
            $table->string('dti_photo',255)->nullable();
            $table->string('address',100);
            $table->string('owner_fname',60);
            $table->string('owner_lname',60);
            $table->string('owner_mname',60)->nullable();
            $table->enum('owner_suffix', ['Jr.', 'Sr.', 'I', 'II', 'III', 'IV', 'V'])->nullable();
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
        Schema::dropIfExists('business_infos');
    }
};
