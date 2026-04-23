<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Drop the check constraint created by Laravel's enum
        DB::statement('ALTER TABLE citizen_histories DROP CONSTRAINT IF EXISTS citizen_histories_type_check');
        
        // Add a new check constraint that includes all values used by the frontend
        DB::statement("ALTER TABLE citizen_histories ADD CONSTRAINT citizen_histories_type_check CHECK (type::text = ANY (ARRAY['Complaint'::character varying::text, 'Violation'::character varying::text, 'Warrant'::character varying::text, 'Commendation'::character varying::text, 'Other'::character varying::text]))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE citizen_histories DROP CONSTRAINT IF EXISTS citizen_histories_type_check');
        DB::statement("ALTER TABLE citizen_histories ADD CONSTRAINT citizen_histories_type_check CHECK (type::text = ANY (ARRAY['Complaint'::character varying::text, 'Violation'::character varying::text, 'Warrant'::character varying::text]))");
    }
};
