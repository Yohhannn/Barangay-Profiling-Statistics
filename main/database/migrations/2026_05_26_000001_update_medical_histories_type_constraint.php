<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE medical_histories DROP CONSTRAINT IF EXISTS medical_histories_type_check');

        DB::statement("ALTER TABLE medical_histories ADD CONSTRAINT medical_histories_type_check CHECK (type::text = ANY (ARRAY[
            'Diabetes'::character varying::text,
            'Hypertension'::character varying::text,
            'Tuberculosis'::character varying::text,
            'Surgery'::character varying::text,
            'Others'::character varying::text,
            'Checkup'::character varying::text,
            'Prenatal'::character varying::text,
            'Vaccination'::character varying::text,
            'Other'::character varying::text
        ]))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE medical_histories DROP CONSTRAINT IF EXISTS medical_histories_type_check');

        DB::statement("ALTER TABLE medical_histories ADD CONSTRAINT medical_histories_type_check CHECK (type::text = ANY (ARRAY[
            'Diabetes'::character varying::text,
            'Hypertension'::character varying::text,
            'Tuberculosis'::character varying::text,
            'Surgery'::character varying::text,
            'Others'::character varying::text
        ]))");
    }
};
