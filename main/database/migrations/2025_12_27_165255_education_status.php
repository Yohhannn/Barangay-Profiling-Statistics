<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('education_status', function (Blueprint $table) {
            $table->id('EDU_ID'); // SERIAL PRIMARY KEY
            $table->boolean('EDU_IS_CURRENTLY_STUDENT')->nullable();
            $table->string('EDU_INSTITUTION_NAME', 255)->nullable();

            // Foreign Key
            $table->unsignedBigInteger('EDAT_ID')->nullable();
            $table->foreign('EDAT_ID')
                ->references('EDAT_ID')
                ->on('educational_attainment')
                ->onDelete('set null'); // Adjust delete behavior as needed

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('education_status');
    }
};
