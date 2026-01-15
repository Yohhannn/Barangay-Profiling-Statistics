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
        Schema::create('citizen_informations', function (Blueprint $table) {
            $table->id('ctz_info_id');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->enum('suffix', ['Jr.', 'Sr.', 'I', 'II', 'III', 'IV', 'V'])->nullable();
            $table->date('date_of_birth');
            $table->string('place_of_birth');
            $table->enum('sex',['Male','Female']);
         #   $table->string('photo',255)->nullable(); moved to citizen
            $table->enum('civil_status',[ 'Single', 'Married', 'Widowed', 'Separated', 'Divorced']);
            $table->enum('blood_type', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-','Unknown'])->nullable();
            $table->string('religion')->nullable();
            $table->boolean('is_deceased')->default(false);
            $table->boolean('is_registered_voter')->default(true);
            $table->boolean('is_indigenous')->default(true);
            $table->enum('relationship_type',['Daughter','Son','Head','Spouse','Father','Mother','Grandfather','Grandmother','Grandson','Granddaughter','Brother','Sister','Uncle','Aunt','Nephew','Niece','Cousin','Other']);
            $table->foreignId('hh_id')->constrained('household_infos','hh_id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('sitio_id')->constrained('sitios','sitio_id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('emp_id')->constrained('employments','emp_id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('con_id')->constrained('contacts','con_id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('demo_id')->constrained('demographics','demo_id')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('citizen_information');
    }
};
