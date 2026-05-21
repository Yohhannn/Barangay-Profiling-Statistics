<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /** Admin permission IDs to add to SR_OFFICE (role_id = 1). */
    private array $adminPerms = [43, 44, 45, 46, 47, 48, 53];

    public function up(): void
    {
        // On a fresh install the seeders haven't run yet, so roles/permissions
        // tables are empty. Skip — the seeders already include the correct perms.
        if (!DB::table('roles')->where('role_id', 1)->exists()) {
            return;
        }

        // 1. Add missing admin perms to the SR_OFFICE role template.
        foreach ($this->adminPerms as $permId) {
            DB::table('role_permissions')->updateOrInsert(
                ['role_id' => 1, 'perm_id' => $permId]
            );
        }

        // 2. Find accounts whose permission set exactly matches current SR_OFFICE
        //    (all perm_ids 1–42, no admin perms yet) and add the admin perms.
        //    Explicitly exclude the built-in admin account (sys_account_id = 100000).
        $adminSysId = DB::table('system_accounts')
            ->where('sys_account_id', 100000)
            ->value('sys_id');

        $srOfficeUserIds = DB::table('system_permissions')
            ->select('sys_id')
            ->when($adminSysId, fn ($q) => $q->where('sys_id', '!=', $adminSysId))
            ->groupBy('sys_id')
            ->havingRaw('COUNT(DISTINCT perm_id) = 42')
            ->havingRaw('SUM(CASE WHEN perm_id > 42 THEN 1 ELSE 0 END) = 0')
            ->pluck('sys_id');

        foreach ($srOfficeUserIds as $sysId) {
            foreach ($this->adminPerms as $permId) {
                DB::table('system_permissions')->updateOrInsert(
                    ['sys_id' => $sysId, 'perm_id' => $permId]
                );
            }
        }
    }

    public function down(): void
    {
        // Remove admin perms from the role template.
        DB::table('role_permissions')
            ->where('role_id', 1)
            ->whereIn('perm_id', $this->adminPerms)
            ->delete();

        // Remove admin perms from accounts that were patched (those that now
        // have exactly the full SR_OFFICE set including admin perms).
        $srOfficeUserIds = DB::table('system_permissions')
            ->select('sys_id')
            ->groupBy('sys_id')
            ->havingRaw('COUNT(DISTINCT perm_id) = 53')
            ->pluck('sys_id');

        DB::table('system_permissions')
            ->whereIn('sys_id', $srOfficeUserIds)
            ->whereIn('perm_id', $this->adminPerms)
            ->delete();
    }
};
