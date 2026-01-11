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
        Schema::create('system_accounts', function (Blueprint $table) {
            $table->increments('sys_id');
            $table->integer('sys_account_id')->unique()->default(DB::raw("nextval('SYS_USER_ID_SEQ')"));
            $table->text('sys_password');
            $table->string('sys_fname', 50);
            $table->string('sys_mname', 50)->nullable();
            $table->string('sys_lname', 50);
            // REMOVED: $table->addColumn(...)
            $table->boolean('is_deleted')->default(false);
            $table->text('delete_reason')->nullable();
            $table->date('date_created')->useCurrent();
        });

        // ADD COLUMN MANUALLY
        DB::statement("ALTER TABLE system_accounts ADD COLUMN sys_role role_type_enum");

       

        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->text('value');
            $table->timestamp('expiration')->nullable();
        });
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->text('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_activity_log');
        Schema::dropIfExists('system_account');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('cache');
        DB::statement("DROP SEQUENCE IF EXISTS SYS_USER_ID_SEQ");
        DB::statement("DROP SEQUENCE IF EXISTS SYS_CTZ_ID_SEQ");
        DB::statement("DROP TYPE IF EXISTS role_type_enum");
        DB::statement("DROP TYPE IF EXISTS action_type_enum");
    }
};
