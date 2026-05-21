<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\SystemAccount;
use App\Models\SystemPermission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Clears ALL system account data and seeds 10 fresh accounts:
 *   - 1  Admin      (111111 / 111111) — all 53 permissions
 *   - 1  SR_OFFICE  (role 1)
 *   - 2  OFFICE     (role 2)
 *   - 1  OFFICE_ENCODER (role 3)
 *   - 1  SR_BPSO    (role 4)
 *   - 1  BPSO       (role 5)
 *   - 1  SR_BHW     (role 6)
 *   - 2  BHW        (role 7)
 *
 * All account IDs and passwords are 6 digits.
 */
class StaffAccountSeeder extends Seeder
{
    public function run(): void
    {
        // ── Step 1: Wipe dependent tables in safe order (PostgreSQL cascade) ──
        DB::statement('TRUNCATE TABLE system_permissions RESTART IDENTITY CASCADE;');
        DB::statement('TRUNCATE TABLE role_permissions RESTART IDENTITY CASCADE;');
        DB::statement('TRUNCATE TABLE system_accounts RESTART IDENTITY CASCADE;');
        DB::statement('TRUNCATE TABLE roles RESTART IDENTITY CASCADE;');
        $this->command->info('🗑  Cleared system_accounts, system_permissions, roles, role_permissions.');

        // ── Step 2: Ensure permissions exist ────────────────────────────────
        $permCount = DB::table('permissions')->count();
        if ($permCount === 0) {
            $this->call(PermissionSeeder::class);
        }

        // ── Step 3: Seed admin first (so roles can use sys_id=1 as created_by) ─
        $admin = SystemAccount::create([
            'sys_account_id' => 111111,
            'sys_fname'      => 'System',
            'sys_mname'      => null,
            'sys_lname'      => 'Administrator',
            'email'          => 'admin@barangay.gov.ph',
            'sys_password'   => Hash::make('111111'),
            'is_deleted'     => false,
            'date_created'   => now(),
        ]);
        $allPermIds = Permission::pluck('perm_id')->toArray();
        foreach ($allPermIds as $pid) {
            SystemPermission::create(['sys_id' => $admin->sys_id, 'perm_id' => $pid]);
        }
        $this->command->info("  ✅ [111111] System Administrator (ADMIN) — " . count($allPermIds) . " permissions");

        // ── Step 4: Seed roles (using admin's sys_id as created_by) ─────────
        $adminSysId = $admin->sys_id;
        DB::table('roles')->insert([
            ['name' => 'SR_OFFICE',      'description' => 'SR_OFFICE ACCOUNT (VIEW DASHBOARD AND DELETE ABILITY)', 'date_created' => now(), 'created_by' => $adminSysId],
            ['name' => 'OFFICE',         'description' => 'OFFICE ACCOUNT',         'date_created' => now(), 'created_by' => $adminSysId],
            ['name' => 'OFFICE_ENCODER', 'description' => 'OFFICE ENCODER ACCOUNT', 'date_created' => now(), 'created_by' => $adminSysId],
            ['name' => 'SR_BPSO',        'description' => 'SR BPSO ACCOUNT',        'date_created' => now(), 'created_by' => $adminSysId],
            ['name' => 'BPSO',           'description' => 'BPSO ACCOUNT',           'date_created' => now(), 'created_by' => $adminSysId],
            ['name' => 'SR_BHW',         'description' => 'SR BHW ACCOUNT',         'date_created' => now(), 'created_by' => $adminSysId],
            ['name' => 'BHW',            'description' => 'BHW ACCOUNT',            'date_created' => now(), 'created_by' => $adminSysId],
        ]);
        $this->command->info('  📋 Seeded 7 roles.');

        // ── Step 5: Seed role_permissions ────────────────────────────────────
        $this->call(RolePermissionSeeder::class);
        $this->command->info('  🔗 Seeded role permissions.');

        // ── Step 6: Helper to get perm_ids for a role ────────────────────────
        $rolePerms = function (int $roleId): array {
            return DB::table('role_permissions')
                ->where('role_id', $roleId)
                ->pluck('perm_id')
                ->toArray();
        };

        // ── Step 7: Staff accounts ────────────────────────────────────────────
        $staffAccounts = [
            // [sys_account_id, password, fname, mname, lname, email, roleLabel, roleId]
            [100001, '100001', 'Ana',   'R.', 'Reyes',      'ana.reyes@barangay.gov.ph',    'SR_OFFICE',      1],
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
        $this->command->info('🔑 Admin login:  ID = 111111 | Password = 111111');
        $this->command->info('📊 Total accounts seeded: 10');
    }
}
