<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $controlPerms = [49, 50, 51, 52];

    public function up(): void
    {
        // Fix audit_logs.created_at to store full timestamp (was date-only, causing 12:00 AM always)
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->timestamp('created_at')->useCurrent()->change();
        });

        // Remove Control permissions from all tables
        DB::table('system_permissions')->whereIn('perm_id', $this->controlPerms)->delete();
        DB::table('role_permissions')->whereIn('perm_id', $this->controlPerms)->delete();
        DB::table('permissions')->whereIn('perm_id', $this->controlPerms)->delete();
    }

    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->date('created_at')->useCurrent()->change();
        });

        DB::table('permissions')->insert([
            ['perm_id' => 49, 'name' => 'View Control',   'category' => 'Admin Panel'],
            ['perm_id' => 50, 'name' => 'Create Control', 'category' => 'Admin Panel'],
            ['perm_id' => 51, 'name' => 'Update Control', 'category' => 'Admin Panel'],
            ['perm_id' => 52, 'name' => 'Delete Control', 'category' => 'Admin Panel'],
        ]);
    }
};
