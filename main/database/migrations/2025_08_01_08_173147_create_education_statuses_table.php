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
        Schema::create('education_statuses', function (Blueprint $table) {
            $table->id('edu_id');
            $table->boolean('is_current_student')->default(false);
            $table->string('institution_name')->nullable();
            $table->enum('education_level', ['College Graduate', 'College Undergraduate', 'Elementary Graduate', 'Elementary undergraduate', 'Junior High School Graduate', 'Junior High School Undergraduate', 'Senior High School Graduate', 'Senior High School Undergraduate','Kindergarten','No Formal Education', 'Postgraduate'])->nullable();
            $table->foreignId('edu_hist')->constrained('edu_histories','edu_hist')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('education_statuses');
    }
};
