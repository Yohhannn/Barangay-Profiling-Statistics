<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_owners', function (Blueprint $table) {
            $table->id('bo_id');
            $table->string('bo_fname', 60);
            $table->string('bo_lname', 60);
            $table->string('bo_mname', 60)->nullable();
            $table->enum('bo_suffix', ['Jr.', 'Sr.', 'I', 'II', 'III', 'IV', 'V'])->nullable();
            $table->foreignId('bs_id')->constrained('business_infos', 'bs_id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('ctz_id')->nullable()->constrained('citizens', 'ctz_id')->onDelete('set null')->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('business_owners');
    }
};
