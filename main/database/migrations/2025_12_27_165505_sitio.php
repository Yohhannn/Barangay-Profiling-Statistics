<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sitio', function (Blueprint $table) {
            $table->id('SITIO_ID'); // SERIAL PRIMARY KEY
            $table->string('SITIO_NAME', 100);
            $table->boolean('SITIO_IS_DELETED')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sitio');
    }
};
