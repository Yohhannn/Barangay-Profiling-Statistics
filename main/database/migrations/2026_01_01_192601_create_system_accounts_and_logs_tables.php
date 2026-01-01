<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create Sequences
        DB::statement("CREATE SEQUENCE IF NOT EXISTS SYS_USER_ID_SEQ START 1001");
        DB::statement("CREATE SEQUENCE IF NOT EXISTS SYS_CTZ_ID_SEQ START 1001");

        // 2. Create Enums
        DB::statement("DO $$ BEGIN CREATE TYPE role_type_enum AS ENUM('Staff', 'Admin', 'Super Admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;");
        DB::statement("DO $$ BEGIN CREATE TYPE action_type_enum AS ENUM('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'); EXCEPTION WHEN duplicate_object THEN null; END $$;");

        // 3. System Accounts
        Schema::create('system_account', function (Blueprint $table) {
            $table->increments('sys_id');
            $table->integer('sys_user_id')->unique()->default(DB::raw("nextval('SYS_USER_ID_SEQ')"));
            $table->text('sys_password');
            $table->string('sys_fname', 50);
            $table->string('sys_mname', 50)->nullable();
            $table->string('sys_lname', 50);
            // REMOVED: $table->addColumn(...)
            $table->boolean('sys_is_active')->default(true);
            $table->boolean('sys_is_deleted')->default(false);
            $table->timestamp('sys_date_encoded')->useCurrent();
        });

        // ADD COLUMN MANUALLY
        DB::statement("ALTER TABLE system_account ADD COLUMN sys_role role_type_enum");

        // 4. Activity Logs
        Schema::create('system_activity_log', function (Blueprint $table) {
            $table->increments('act_id');
            $table->timestamp('act_timestamp')->useCurrent();
            // REMOVED: $table->addColumn(...)
            $table->string('act_table_name', 50);
            $table->integer('act_entity_id')->nullable();
            $table->text('act_description')->nullable();
            $table->integer('sys_user_id')->nullable();

            $table->foreign('sys_user_id')->references('sys_user_id')->on('system_account')->onDelete('restrict')->onUpdate('cascade');
        });

        // ADD COLUMN MANUALLY
        DB::statement("ALTER TABLE system_activity_log ADD COLUMN act_action_type action_type_enum");
    }

    public function down(): void
    {
        Schema::dropIfExists('system_activity_log');
        Schema::dropIfExists('system_account');
        DB::statement("DROP SEQUENCE IF EXISTS SYS_USER_ID_SEQ");
        DB::statement("DROP SEQUENCE IF EXISTS SYS_CTZ_ID_SEQ");
        DB::statement("DROP TYPE IF EXISTS role_type_enum");
        DB::statement("DROP TYPE IF EXISTS action_type_enum");
    }
};
