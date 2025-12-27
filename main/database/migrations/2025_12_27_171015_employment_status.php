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
        Schema::create('employment_status', function (Blueprint $table) {
            // ES_ID SERIAL PRIMARY KEY
            $table->id('ES_ID');

            // ES_STATUS_NAME VARCHAR(100)
            $table->string('ES_STATUS_NAME', 100)->nullable();

            // Optional but recommended for Laravel tracking
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employment_status');
    }
};
