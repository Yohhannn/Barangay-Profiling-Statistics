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
        Schema::create('philhealths', function (Blueprint $table) {
            $table->id('phea_id');
            $table->string('philhealth_id_number');
            $table->enum('phea_membership_type', ['None', 'Member', 'Dependent']);
            $table->enum('category_name',['Formal Economy Government', 'Formal Economy Private', 'Indigenous People', 'Informal Economy', 'NHTS', 'Senior Citizen', 'Unknown']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('philhealths');
    }
};
