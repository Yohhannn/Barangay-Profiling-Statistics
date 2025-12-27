<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('philhealth_category', function (Blueprint $table) {
            $table->id('PC_ID'); // SERIAL PRIMARY KEY
            $table->string('PC_CATEGORY_NAME', 100);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('philhealth_category');
    }
};
