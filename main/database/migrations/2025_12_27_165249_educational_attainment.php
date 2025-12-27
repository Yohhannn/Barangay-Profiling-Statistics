<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('educational_attainment', function (Blueprint $table) {
            $table->id('EDAT_ID'); // SERIAL PRIMARY KEY
            $table->string('EDAT_LEVEL', 100)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('educational_attainment');
    }
};
