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
        Schema::create('demographics', function (Blueprint $table) {
            $table->id('demo_id');
            $table->foreignId('soec_id')->constrained('socio_economic_statuses','soec_id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('clah_id')->constrained('classification_health_risks','clah_id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('fp_id')->constrained('family_plannings','fp_id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('edu_id')->constrained('education_statuses','edu_id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('phea_id')->constrained('philhealths','phea_id')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('demographics');
    }
};
