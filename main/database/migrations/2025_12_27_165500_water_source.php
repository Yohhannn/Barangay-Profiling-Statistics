<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('water_source', function (Blueprint $table) {
            $table->id('WATER_ID'); // SERIAL PRIMARY KEY
            $table->string('WATER_SOURCE_NAME', 50);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('water_source');
    }
};
