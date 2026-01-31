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
        Schema::create('household_infos', function (Blueprint $table) {
            $table->id('hh_id');
            // Added the new column here, unique to prevent duplicates
            $table->string('hh_uuid')->unique();

            $table->string('house_number');
            $table->string('address');
            $table->enum('ownership_status', ['Owned', 'Rented', 'Leased', 'Informal Settler']);
            $table->string('home_photo', 255)->nullable();
            $table->string('home_map', 255)->nullable();
            $table->string('interviewer_name')->nullable();
            $table->string('reviewer_name')->nullable();
            $table->date('date_visited')->nullable();
            $table->boolean('is_deleted')->default(false);
            $table->text('delete_reason')->nullable();
            $table->enum('water_type', ['Level 1 - Point Source', 'Level 2 - Communal Faucet', 'Level 3 - Individual Connection']);
            $table->enum('toilet_type', ['A - Pour/flush type connected to septic tank', 'A - Pour/flush toilet connected to Sewerage System', 'C - Ventilated Pit (VIP) latrine', 'D - Water-sealed toilet', 'E - G - Without toilet', 'E - Overhung latrine' , 'F - Open pit latrine']);
            $table->date('date_encoded')->useCurrent();
            $table->date('date_updated')->useCurrent()->useCurrentOnUpdate();
            $table->foreignId('sitio_id')->constrained('sitios', 'sitio_id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('encoded_by')->constrained('system_accounts', 'sys_id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('updated_by')->nullable()->constrained('system_accounts', 'sys_id')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('household_infos');
    }
};
