<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("DO $$ BEGIN CREATE TYPE blood_type_enum AS ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-','Unknown'); EXCEPTION WHEN duplicate_object THEN null; END $$;");
        DB::statement("DO $$ BEGIN CREATE TYPE civil_status_type AS ENUM('Single', 'Married', 'Widowed', 'Separated', 'Divorced'); EXCEPTION WHEN duplicate_object THEN null; END $$;");

        Schema::create('educational_attainment', function (Blueprint $table) { $table->increments('edat_id'); $table->string('edat_level', 100); });
        Schema::create('education_status', function (Blueprint $table) {
            $table->increments('edu_id');
            $table->boolean('edu_is_currently_student')->nullable();
            $table->string('edu_institution_name', 255)->nullable();
            $table->integer('edat_id')->nullable();
            $table->foreign('edat_id')->references('edat_id')->on('educational_attainment');
        });
        Schema::create('contact', function (Blueprint $table) { $table->increments('con_id'); $table->string('con_phone', 20)->nullable(); $table->string('con_email', 100)->nullable(); });
        Schema::create('socio_economic_status', function (Blueprint $table) { $table->increments('soec_id'); $table->string('soec_status', 100); $table->string('soec_number', 50)->nullable(); });
        Schema::create('religion', function (Blueprint $table) { $table->increments('rel_id'); $table->string('rel_name', 100); });
        Schema::create('relationship_type', function (Blueprint $table) { $table->increments('rth_id'); $table->string('rth_relationship_name', 100); });
        Schema::create('classification_health_risk', function (Blueprint $table) { $table->increments('clah_id'); $table->string('clah_classification_name', 50); });
        Schema::create('philhealth_category', function (Blueprint $table) { $table->increments('pc_id'); $table->string('pc_category_name', 100); });
        Schema::create('philhealth', function (Blueprint $table) {
            $table->increments('phea_id');
            $table->string('phea_id_number', 50)->nullable();
            $table->string('phea_membership_type', 50)->nullable();
            $table->integer('pc_id');
            $table->foreign('pc_id')->references('pc_id')->on('philhealth_category');
        });

        Schema::create('citizen', function (Blueprint $table) {
            $table->increments('ctz_id');
            $table->integer('ctz_uuid')->unique()->default(DB::raw("nextval('SYS_CTZ_ID_SEQ')"));
            $table->string('ctz_first_name', 100);
            $table->string('ctz_middle_name', 100)->nullable();
            $table->string('ctz_last_name', 100);
            $table->string('ctz_suffix', 10)->nullable();
            $table->date('ctz_date_of_birth');
            $table->char('ctz_sex', 1);

            // REMOVED ENUMS HERE

            $table->boolean('ctz_is_alive')->default(true);
            $table->date('ctz_date_of_death')->nullable();
            $table->text('ctz_reason_of_death')->nullable();
            $table->boolean('ctz_is_registered_voter')->default(false);
            $table->boolean('ctz_is_ip')->default(false);
            $table->text('ctz_place_of_birth')->nullable();
            $table->timestamp('ctz_date_encoded')->useCurrent();
            $table->timestamp('ctz_last_updated')->useCurrent();
            $table->boolean('ctz_is_deleted')->default(false);
            $table->boolean('ctz_is_pending_delete')->default(false);
            $table->text('ctz_delete_req_reason')->nullable();

            $table->integer('edu_id')->nullable();
            $table->integer('soec_id');
            $table->integer('phea_id')->nullable();
            $table->integer('rel_id')->nullable();
            $table->integer('clah_id')->nullable();
            $table->integer('rth_id');
            $table->integer('hh_id');
            $table->integer('sitio_id');
            $table->integer('con_id')->nullable();
            $table->integer('encoded_by_sys_id');
            $table->integer('last_updated_by_sys_id');

            $table->foreign('edu_id')->references('edu_id')->on('education_status')->onDelete('cascade');
            $table->foreign('soec_id')->references('soec_id')->on('socio_economic_status')->onDelete('cascade');
            $table->foreign('phea_id')->references('phea_id')->on('philhealth')->onDelete('cascade');
            $table->foreign('rel_id')->references('rel_id')->on('religion')->onDelete('cascade');
            $table->foreign('clah_id')->references('clah_id')->on('classification_health_risk')->onDelete('set null');
            $table->foreign('rth_id')->references('rth_id')->on('relationship_type')->onDelete('cascade');
            $table->foreign('hh_id')->references('hh_id')->on('household_info')->onDelete('cascade');
            $table->foreign('sitio_id')->references('sitio_id')->on('sitio')->onDelete('cascade');
            $table->foreign('con_id')->references('con_id')->on('contact')->onDelete('set null');
            $table->foreign('encoded_by_sys_id')->references('sys_user_id')->on('system_account');
            $table->foreign('last_updated_by_sys_id')->references('sys_user_id')->on('system_account');
        });

        // ADD COLUMNS MANUALLY
        DB::statement("ALTER TABLE citizen ADD COLUMN ctz_civil_status civil_status_type");
        DB::statement("ALTER TABLE citizen ADD COLUMN ctz_blood_type blood_type_enum");
    }

    public function down(): void
    {
        Schema::dropIfExists('citizen');
        Schema::dropIfExists('philhealth');
        Schema::dropIfExists('philhealth_category');
        Schema::dropIfExists('classification_health_risk');
        Schema::dropIfExists('relationship_type');
        Schema::dropIfExists('religion');
        Schema::dropIfExists('socio_economic_status');
        Schema::dropIfExists('contact');
        Schema::dropIfExists('education_status');
        Schema::dropIfExists('educational_attainment');
        DB::statement("DROP TYPE IF EXISTS blood_type_enum");
        DB::statement("DROP TYPE IF EXISTS civil_status_type");
    }
};
