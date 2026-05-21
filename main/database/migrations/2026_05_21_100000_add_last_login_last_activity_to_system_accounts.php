<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('system_accounts', function (Blueprint $table) {
            $table->timestamp('last_login')->nullable()->after('email');
            $table->timestamp('last_activity')->nullable()->after('last_login');
        });
    }

    public function down(): void
    {
        Schema::table('system_accounts', function (Blueprint $table) {
            $table->dropColumn(['last_login', 'last_activity']);
        });
    }
};
