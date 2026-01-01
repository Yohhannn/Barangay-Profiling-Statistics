<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Infrastructure (Standard)
        Schema::create('infrastructure_type', function (Blueprint $table) { $table->increments('inft_id'); $table->string('inft_type_name', 100); $table->boolean('inft_is_deleted')->default(false); });
        Schema::create('infrastructure_owner', function (Blueprint $table) { $table->increments('info_id'); $table->string('info_lname', 100); $table->string('info_fname', 100); $table->string('info_mname', 100)->nullable(); });
        Schema::create('infrastructure', function (Blueprint $table) {
            $table->increments('inf_id');
            $table->string('inf_name', 100);
            $table->string('inf_access_type', 10);
            $table->text('inf_description')->nullable();
            $table->text('inf_address_description')->nullable();
            $table->timestamp('inf_date_encoded')->useCurrent();
            $table->timestamp('inf_last_updated')->useCurrent();
            $table->boolean('inf_is_deleted')->default(false);
            $table->boolean('inf_is_pending_delete')->default(false);
            $table->text('inf_delete_req_reason')->nullable();
            $table->integer('inft_id'); $table->integer('info_id')->nullable(); $table->integer('sitio_id'); $table->integer('encoded_by_sys_id'); $table->integer('last_updated_by_sys_id');
            $table->foreign('inft_id')->references('inft_id')->on('infrastructure_type');
            $table->foreign('info_id')->references('info_id')->on('infrastructure_owner')->onDelete('cascade');
            $table->foreign('sitio_id')->references('sitio_id')->on('sitio');
            $table->foreign('encoded_by_sys_id')->references('sys_user_id')->on('system_account');
            $table->foreign('last_updated_by_sys_id')->references('sys_user_id')->on('system_account');
        });

        // 2. Business
        DB::statement("DO $$ BEGIN CREATE TYPE business_status_enum AS ENUM('Active', 'Inactive', 'Closed', 'Suspended'); EXCEPTION WHEN duplicate_object THEN null; END $$;");
        Schema::create('business_type', function (Blueprint $table) { $table->integer('bst_id')->primary(); $table->string('bst_type_name', 100); });
        Schema::create('business_info', function (Blueprint $table) {
            $table->increments('bs_id');
            $table->string('bs_name', 100);
            $table->text('bs_description')->nullable();
            // REMOVED ENUM
            $table->boolean('bs_is_dti');
            $table->text('bs_address');
            $table->timestamp('bs_date_encoded')->useCurrent();
            $table->timestamp('bs_last_updated')->useCurrent();
            $table->boolean('bs_is_deleted')->default(false);
            $table->boolean('bs_is_pending_delete')->default(false);
            $table->text('bs_delete_req_reason')->nullable();
            $table->string('bs_fname', 50);
            $table->string('bs_lname', 50);
            $table->integer('bst_id'); $table->integer('sitio_id'); $table->integer('encoded_by_sys_id'); $table->integer('last_updated_by_sys_id');
            $table->foreign('bst_id')->references('bst_id')->on('business_type');
            $table->foreign('sitio_id')->references('sitio_id')->on('sitio')->onDelete('cascade');
            $table->foreign('encoded_by_sys_id')->references('sys_user_id')->on('system_account');
            $table->foreign('last_updated_by_sys_id')->references('sys_user_id')->on('system_account');
        });
        // ADD COLUMN MANUALLY
        DB::statement("ALTER TABLE business_info ADD COLUMN bs_status business_status_enum");


        // 3. Transactions
        DB::statement("DO $$ BEGIN CREATE TYPE transaction_status_enum AS ENUM('Pending', 'Approved', 'Declined'); EXCEPTION WHEN duplicate_object THEN null; END $$;");
        Schema::create('transaction_type', function (Blueprint $table) { $table->increments('tt_id'); $table->string('tt_type_name', 100); $table->boolean('tt_is_deleted')->default(false); });
        Schema::create('transaction_log', function (Blueprint $table) {
            $table->increments('tl_id');
            $table->date('tl_date_requested')->default(DB::raw('CURRENT_DATE'));
            $table->string('tl_purpose', 150);
            // REMOVED ENUM
            $table->string('tl_fname', 50);
            $table->string('tl_lname', 50);
            $table->timestamp('tl_date_encoded')->useCurrent();
            $table->timestamp('tl_last_updated')->useCurrent();
            $table->boolean('tl_is_deleted')->default(false);
            $table->boolean('tl_is_pending_delete')->default(false);
            $table->text('tl_delete_req_reason')->nullable();
            $table->integer('tt_id'); $table->integer('encoded_by_sys_id'); $table->integer('last_updated_by_sys_id');
            $table->foreign('tt_id')->references('tt_id')->on('transaction_type');
            $table->foreign('encoded_by_sys_id')->references('sys_user_id')->on('system_account');
            $table->foreign('last_updated_by_sys_id')->references('sys_user_id')->on('system_account');
        });
        // ADD COLUMN MANUALLY
        DB::statement("ALTER TABLE transaction_log ADD COLUMN tl_status transaction_status_enum");

        // 4. Employment & Health (Standard)
        Schema::create('employment_status', function(Blueprint $table){ $table->increments('es_id'); $table->string('es_status_name', 100); });
        Schema::create('employment', function(Blueprint $table){
            $table->increments('emp_id'); $table->string('emp_occupation', 100)->nullable(); $table->boolean('emp_is_gov_worker')->default(false);
            $table->integer('es_id')->nullable(); $table->integer('ctz_id');
            $table->foreign('es_id')->references('es_id')->on('employment_status');
            $table->foreign('ctz_id')->references('ctz_id')->on('citizen');
        });
        Schema::create('medical_history_type', function(Blueprint $table){ $table->increments('mht_id'); $table->string('mht_type_name', 100); $table->boolean('mht_is_deleted')->default(false); });
        Schema::create('medical_history', function(Blueprint $table){
            $table->increments('mh_id'); $table->string('mh_description', 100); $table->date('mh_date_diagnosed')->nullable(); $table->timestamp('mh_date_encoded')->useCurrent(); $table->timestamp('mh_last_updated')->useCurrent();
            $table->boolean('mh_is_deleted')->default(false); $table->boolean('mh_is_pending_delete')->default(false); $table->text('mh_delete_req_reason')->nullable();
            $table->integer('mht_id'); $table->integer('ctz_id'); $table->integer('encoded_by_sys_id'); $table->integer('last_updated_by_sys_id');
            $table->foreign('mht_id')->references('mht_id')->on('medical_history_type');
            $table->foreign('ctz_id')->references('ctz_id')->on('citizen');
            $table->foreign('encoded_by_sys_id')->references('sys_user_id')->on('system_account');
            $table->foreign('last_updated_by_sys_id')->references('sys_user_id')->on('system_account');
        });
        Schema::create('family_planning_method', function(Blueprint $table){ $table->increments('fpm_id'); $table->string('fpm_method', 100); });
        Schema::create('fpm_status', function(Blueprint $table){ $table->increments('fpms_id'); $table->string('fpms_status_name', 100); });
        Schema::create('family_planning', function(Blueprint $table){
            $table->increments('fp_id'); $table->date('fp_start_date')->nullable(); $table->date('fp_end_date')->nullable();
            $table->integer('ctz_id'); $table->integer('fpms_status'); $table->integer('fpm_method');
            $table->foreign('ctz_id')->references('ctz_id')->on('citizen');
            $table->foreign('fpms_status')->references('fpms_id')->on('fpm_status');
            $table->foreign('fpm_method')->references('fpm_id')->on('family_planning_method');
        });

        // 5. Legal (Standard)
        Schema::create('complainant', function(Blueprint $table){ $table->increments('comp_id'); $table->string('comp_fname', 50); $table->string('comp_lname', 50); $table->string('comp_mname', 50)->nullable(); });
        Schema::create('history_type', function(Blueprint $table){ $table->increments('hist_id'); $table->string('hist_type_name', 100); $table->boolean('hist_is_deleted')->default(false); });
        Schema::create('citizen_history', function(Blueprint $table){
            $table->increments('cihi_id'); $table->string('cihi_description', 100); $table->timestamp('cihi_date_encoded')->useCurrent(); $table->timestamp('cihi_last_updated')->useCurrent();
            $table->boolean('cihi_is_deleted')->default(false); $table->boolean('cihi_is_pending_delete')->default(false); $table->text('cihi_delete_req_reason')->nullable();
            $table->integer('hist_id'); $table->integer('ctz_id'); $table->integer('encoded_by_sys_id'); $table->integer('last_updated_by_sys_id');
            $table->foreign('hist_id')->references('hist_id')->on('history_type');
            $table->foreign('ctz_id')->references('ctz_id')->on('citizen');
            $table->foreign('encoded_by_sys_id')->references('sys_user_id')->on('system_account');
            $table->foreign('last_updated_by_sys_id')->references('sys_user_id')->on('system_account');
        });
        Schema::create('settlement_log', function(Blueprint $table){
            $table->increments('sett_id'); $table->text('sett_complaint_description'); $table->text('sett_settlement_description'); $table->date('sett_date_of_settlement');
            $table->timestamp('sett_date_encoded')->useCurrent(); $table->timestamp('sett_last_updated')->useCurrent();
            $table->boolean('sett_is_deleted')->default(false); $table->boolean('sett_is_pending_delete')->default(false); $table->text('sett_delete_req_reason')->nullable();
            $table->integer('comp_id'); $table->integer('cihi_id'); $table->integer('encoded_by_sys_id'); $table->integer('last_updated_by_sys_id');
            $table->foreign('comp_id')->references('comp_id')->on('complainant');
            $table->foreign('cihi_id')->references('cihi_id')->on('citizen_history');
            $table->foreign('encoded_by_sys_id')->references('sys_user_id')->on('system_account');
            $table->foreign('last_updated_by_sys_id')->references('sys_user_id')->on('system_account');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settlement_log');
        Schema::dropIfExists('citizen_history');
        Schema::dropIfExists('history_type');
        Schema::dropIfExists('complainant');
        Schema::dropIfExists('family_planning');
        Schema::dropIfExists('fpm_status');
        Schema::dropIfExists('family_planning_method');
        Schema::dropIfExists('medical_history');
        Schema::dropIfExists('medical_history_type');
        Schema::dropIfExists('employment');
        Schema::dropIfExists('employment_status');
        Schema::dropIfExists('transaction_log');
        Schema::dropIfExists('transaction_type');
        DB::statement("DROP TYPE IF EXISTS transaction_status_enum");
        Schema::dropIfExists('business_info');
        Schema::dropIfExists('business_type');
        DB::statement("DROP TYPE IF EXISTS business_status_enum");
        Schema::dropIfExists('infrastructure');
        Schema::dropIfExists('infrastructure_owner');
        Schema::dropIfExists('infrastructure_type');
    }
};
