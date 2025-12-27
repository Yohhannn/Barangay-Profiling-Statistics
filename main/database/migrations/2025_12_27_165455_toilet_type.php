<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('toilet_type', function (Blueprint $table) {
            $table->id('TOIL_ID'); // SERIAL PRIMARY KEY
            $table->string('TOIL_TYPE_NAME', 50);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('toilet_type');
    }
};
