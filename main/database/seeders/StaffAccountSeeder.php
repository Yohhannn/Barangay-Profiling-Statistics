<?php

namespace Database\Seeders;

use App\Models\SystemAccount;
use App\Models\SystemPermission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Clears ALL system account data and seeds 9 fresh accounts:
 *   - 1  SR_OFFICE  (role 1) — first account seeded, used as created_by for roles
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

        // ── Step 3: Create first staff account (SR_OFFICE) so roles can reference her sys_id ──
        $firstAccount = SystemAccount::create([
            'sys_account_id' => 100001,
            'sys_fname'      => 'Ana',
            'sys_mname'      => 'R.',
            'sys_lname'      => 'Reyes',
            'email'          => 'ana.reyes@barangay.gov.ph',
            'sys_password'   => Hash::make('100001'),
            'is_deleted'     => false,
            'date_created'   => now(),
        ]);
        $firstSysId = $firstAccount->sys_id;

        // ── Step 4: Seed roles (using first account's sys_id as created_by) ─
        DB::table('roles')->insert([
            ['name' => 'SR_OFFICE',      'description' => 'SR_OFFICE ACCOUNT',      'date_created' => now(), 'created_by' => $firstSysId],
            ['name' => 'OFFICE',         'description' => 'OFFICE ACCOUNT',          'date_created' => now(), 'created_by' => $firstSysId],
            ['name' => 'OFFICE_ENCODER', 'description' => 'OFFICE ENCODER ACCOUNT',  'date_created' => now(), 'created_by' => $firstSysId],
            ['name' => 'SR_BPSO',        'description' => 'SR BPSO ACCOUNT',         'date_created' => now(), 'created_by' => $firstSysId],
            ['name' => 'BPSO',           'description' => 'BPSO ACCOUNT',            'date_created' => now(), 'created_by' => $firstSysId],
            ['name' => 'SR_BHW',         'description' => 'SR BHW ACCOUNT',          'date_created' => now(), 'created_by' => $firstSysId],
            ['name' => 'BHW',            'description' => 'BHW ACCOUNT',             'date_created' => now(), 'created_by' => $firstSysId],
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

        // ── Step 7: Assign permissions to first account (SR_OFFICE = role 1) ─
        $perms = $rolePerms(1);
        foreach ($perms as $pid) {
            SystemPermission::create(['sys_id' => $firstSysId, 'perm_id' => $pid]);
        }
        $this->command->info("  ✅ [100001] Ana Reyes (SR_OFFICE) — " . count($perms) . ' permissions');

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
        $this->command->info('📊 Total accounts seeded: 9');
        $this->command->info('🔑 SR_OFFICE login: ID = 100001 | Password = 100001');
    }
}
