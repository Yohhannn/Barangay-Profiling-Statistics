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
        Schema::create('philhealth', function (Blueprint $table) {
            // PHEA_ID SERIAL PRIMARY KEY
            $table->id('PHEA_ID');

            // PHEA_ID_NUMBER VARCHAR(50)
            $table->string('PHEA_ID_NUMBER', 50)->nullable();
            $table->enum('PHEA_MEMBERSHIP_TYPE', ['None', 'Member', 'Dependent'])
                ->default('None');

            $table->unsignedBigInteger('PC_ID');
            $table->foreign('PC_ID')
                ->references('PC_ID')
                ->on('philhealth_category')
                ->onDelete('cascade'); // or 'restrict' based on your needs

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('philhealth');
    }
};
