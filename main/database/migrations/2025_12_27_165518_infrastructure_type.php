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
        Schema::create('infrastructure_type', function (Blueprint $table) {
            // INFT_ID SERIAL PRIMARY KEY
            $table->id('INFT_ID');

            // INFT_TYPE_NAME VARCHAR(100) NOT NULL
            $table->string('INFT_TYPE_NAME', 100);

            // INFT_IS_DELETED BOOLEAN DEFAULT FALSE
            $table->boolean('INFT_IS_DELETED')->default(false);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('infrastructure_type');
    }
};
