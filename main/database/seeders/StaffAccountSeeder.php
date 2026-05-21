<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\SystemAccount;
use App\Models\SystemPermission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Clears ALL system account data and seeds fresh accounts.
 * SR_OFFICE is the top-level role with all 53 permissions.
 * No hidden admin account — the first SR_OFFICE staff account is used
 * as the created_by reference for role records.
 *
 * Seeded accounts:
 *   - 1  SR_OFFICE      (100001 / 100001) — all 53 permissions
 *   - 2  OFFICE         (role 2)
 *   - 1  OFFICE_ENCODER (role 3)
 *   - 1  SR_BPSO        (role 4)
 *   - 1  BPSO           (role 5)
 *   - 1  SR_BHW         (role 6)
 *   - 2  BHW            (role 7)
 */
class StaffAccountSeeder extends Seeder
{
    public function run(): void
    {
        // ── Step 1: Wipe dependent tables in safe order ──────────────────────
        DB::statement('TRUNCATE TABLE system_permissions RESTART IDENTITY CASCADE;');
        DB::statement('TRUNCATE TABLE role_permissions RESTART IDENTITY CASCADE;');
        DB::statement('TRUNCATE TABLE system_accounts RESTART IDENTITY CASCADE;');
        DB::statement('TRUNCATE TABLE roles RESTART IDENTITY CASCADE;');
        $this->command->info('🗑  Cleared system_accounts, system_permissions, roles, role_permissions.');

        // ── Step 2: Ensure permissions exist ────────────────────────────────
        if (DB::table('permissions')->count() === 0) {
            $this->call(PermissionSeeder::class);
        }

        // ── Step 3: Create first SR_OFFICE account for created_by FK ─────────
        // Roles require a valid created_by → seed one account before roles.
        $srOfficeAccount = SystemAccount::create([
            'sys_account_id' => 100001,
            'sys_fname'      => 'Ana',
            'sys_mname'      => 'R.',
            'sys_lname'      => 'Reyes',
            'email'          => 'ana.reyes@barangay.gov.ph',
            'sys_password'   => Hash::make('100001'),
            'is_deleted'     => false,
            'date_created'   => now(),
        ]);

        // ── Step 4: Seed roles using that account as created_by ──────────────
        DB::table('roles')->insert([
            ['name' => 'SR_OFFICE',      'description' => 'SR_OFFICE — Full access including Admin Panel', 'date_created' => now(), 'created_by' => $srOfficeAccount->sys_id],
            ['name' => 'OFFICE',         'description' => 'OFFICE ACCOUNT',         'date_created' => now(), 'created_by' => $srOfficeAccount->sys_id],
            ['name' => 'OFFICE_ENCODER', 'description' => 'OFFICE ENCODER ACCOUNT', 'date_created' => now(), 'created_by' => $srOfficeAccount->sys_id],
            ['name' => 'SR_BPSO',        'description' => 'SR BPSO ACCOUNT',        'date_created' => now(), 'created_by' => $srOfficeAccount->sys_id],
            ['name' => 'BPSO',           'description' => 'BPSO ACCOUNT',           'date_created' => now(), 'created_by' => $srOfficeAccount->sys_id],
            ['name' => 'SR_BHW',         'description' => 'SR BHW ACCOUNT',         'date_created' => now(), 'created_by' => $srOfficeAccount->sys_id],
            ['name' => 'BHW',            'description' => 'BHW ACCOUNT',            'date_created' => now(), 'created_by' => $srOfficeAccount->sys_id],
        ]);
        $this->command->info('  📋 Seeded 7 roles.');

        // ── Step 5: Seed role_permissions ────────────────────────────────────
        $this->call(RolePermissionSeeder::class);
        $this->command->info('  🔗 Seeded role permissions.');

        // ── Step 6: Assign SR_OFFICE (role 1) permissions to first account ───
        $srOfficePerms = DB::table('role_permissions')->where('role_id', 1)->pluck('perm_id')->toArray();
        foreach ($srOfficePerms as $pid) {
            SystemPermission::create(['sys_id' => $srOfficeAccount->sys_id, 'perm_id' => $pid]);
        }
        $this->command->info("  ✅ [100001] Ana Reyes (SR_OFFICE) — " . count($srOfficePerms) . ' permissions');

        // ── Step 7: Helper to get perm_ids for a role ────────────────────────
        $rolePerms = fn(int $roleId): array => DB::table('role_permissions')
            ->where('role_id', $roleId)
            ->pluck('perm_id')
            ->toArray();

        // ── Step 8: Remaining staff accounts ─────────────────────────────────
        $staffAccounts = [
            // [sys_account_id, password, fname, mname, lname, email, roleLabel, roleId]
            [100002, '100002', 'Ben',   'C.', 'Cruz',       'ben.cruz@barangay.gov.ph',     'OFFICE',         2],
            [100003, '100003', 'Carla', 'M.', 'Mendoza',    'carla.mendoza@barangay.gov.ph','OFFICE',         2],
            [100004, '100004', 'Dante', 'P.', 'Paglinawan', 'dante.p@barangay.gov.ph',      'OFFICE_ENCODER', 3],
            [100005, '100005', 'Elena', 'S.', 'Santos',     'elena.s@barangay.gov.ph',      'SR_BPSO',        4],
            [100006, '100006', 'Felix', 'A.', 'Aquino',     'felix.a@barangay.gov.ph',      'BPSO',           5],
            [100007, '100007', 'Grace', 'L.', 'Lopez',      'grace.l@barangay.gov.ph',      'SR_BHW',         6],
            [100008, '100008', 'Henry', 'D.', 'Dela Cruz',  'henry.d@barangay.gov.ph',      'BHW',            7],
            [100009, '100009', 'Iris',  'B.', 'Bautista',   'iris.b@barangay.gov.ph',       'BHW',            7],
        ];

        foreach ($staffAccounts as [$id, $pwd, $fname, $mname, $lname, $email, $role, $roleId]) {
            $account = SystemAccount::create([
                'sys_account_id' => $id,
                'sys_fname'      => $fname,
                'sys_mname'      => $mname,
                'sys_lname'      => $lname,
                'email'          => $email,
                'sys_password'   => Hash::make((string) $pwd),
                'is_deleted'     => false,
                'date_created'   => now(),
            ]);

            $perms = $rolePerms($roleId);
            foreach ($perms as $pid) {
                SystemPermission::create(['sys_id' => $account->sys_id, 'perm_id' => $pid]);
            }

            $this->command->info("  ✅ [{$id}] {$fname} {$lname} ({$role}) — " . count($perms) . ' permissions');
        }

        $this->command->info('');
        $this->command->info('🔑 SR_OFFICE login: ID = 100001 | Password = 100001');
        $this->command->info('📊 Total accounts seeded: 9');
    }
}
