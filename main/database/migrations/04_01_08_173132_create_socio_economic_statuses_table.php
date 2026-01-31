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
        Schema::create('socio_economic_statuses', function (Blueprint $table) {
            $table->id('soec_id');
            $table->enum('soec_status', ['NHTS 4Ps', 'NHTS Non-4ps', 'Non-NHTS', null]);
            $table->string('soec_number')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('socio_economic_statuses');
    }
};
