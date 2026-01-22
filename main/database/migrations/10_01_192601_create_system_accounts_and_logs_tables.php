<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
      

        // 3. System Accounts
        Schema::create('system_accounts', function (Blueprint $table) {
            $table->id('sys_id');
            $table->integer('sys_account_id');
            $table->text('sys_password');
            $table->string('sys_fname', 50);
            $table->string('sys_mname', 50)->nullable();
            $table->string('sys_lname', 50);
            // REMOVED: $table->addColumn(...)
            $table->boolean('is_deleted')->default(false);
            $table->text('delete_reason')->nullable();
            $table->date('date_created')->useCurrent();
        });

      

       

        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->text('value');
            $table->integer('expiration');
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
        Schema::dropIfExists('system_accounts');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('cache');
   
    }
};
