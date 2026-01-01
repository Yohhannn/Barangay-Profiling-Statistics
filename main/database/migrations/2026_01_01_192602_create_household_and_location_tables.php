<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sitio', function (Blueprint $table) {
            $table->increments('sitio_id');
            $table->string('sitio_name', 100);
            $table->boolean('sitio_is_deleted')->default(false);
        });

        Schema::create('water_source', function (Blueprint $table) {
            $table->increments('water_id');
            $table->string('water_source_name', 50);
        });

        Schema::create('toilet_type', function (Blueprint $table) {
            $table->increments('toil_id');
            $table->string('toil_type_name', 50);
        });

        DB::statement("DO $$ BEGIN CREATE TYPE house_ownership_status AS ENUM('Owned', 'Rented', 'Leased', 'Informal Settler'); EXCEPTION WHEN duplicate_object THEN null; END $$;");

        Schema::create('household_info', function (Blueprint $table) {
            $table->increments('hh_id');
            $table->string('hh_house_number', 50)->unique();
            $table->text('hh_address')->nullable();
            // REMOVED: $table->addColumn(...)
            $table->text('hh_home_google_link')->nullable();
            $table->string('hh_interviewer_name', 100)->nullable();
            $table->string('hh_reviewer_name', 100)->nullable();
            $table->date('hh_date_visit');
            $table->timestamp('hh_date_encoded')->useCurrent();
            $table->timestamp('hh_last_updated')->useCurrent();
            $table->boolean('hh_is_deleted')->default(false);
            $table->boolean('hh_is_pending_delete')->default(false);
            $table->text('hh_delete_req_reason')->nullable();

            $table->integer('water_id');
            $table->integer('toilet_id');
            $table->integer('sitio_id');
            $table->integer('encoded_by_sys_id');
            $table->integer('last_updated_by_sys_id');

            $table->foreign('water_id')->references('water_id')->on('water_source');
            $table->foreign('toilet_id')->references('toil_id')->on('toilet_type');
            $table->foreign('sitio_id')->references('sitio_id')->on('sitio');
            $table->foreign('encoded_by_sys_id')->references('sys_user_id')->on('system_account');
            $table->foreign('last_updated_by_sys_id')->references('sys_user_id')->on('system_account');
        });

        // ADD COLUMN MANUALLY
        DB::statement("ALTER TABLE household_info ADD COLUMN hh_ownership_status house_ownership_status");
    }

    public function down(): void
    {
        Schema::dropIfExists('household_info');
        DB::statement("DROP TYPE IF EXISTS house_ownership_status");
        Schema::dropIfExists('toilet_type');
        Schema::dropIfExists('water_source');
        Schema::dropIfExists('sitio');
    }
};
