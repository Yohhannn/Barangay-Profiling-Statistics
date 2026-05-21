<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Permission ID reference (auto-incremented from PermissionSeeder insertion order):
 *
 *  1  = View Dashboard
 *  --- Citizen Panel ---
 *  2  = View Citizen Profile       3  = Create Citizen Profile
 *  4  = Update Citizen Profile     5  = Delete Citizen Profile
 *  6  = View Household Profile     7  = Create Household Profile
 *  8  = Update Household Profile   9  = Delete Household Profile
 *  --- Statistics Panel ---
 *  10 = View Demographic           11 = View Neighborhood
 *  12 = View Household             13 = View Education
 *  14 = View Employment            15 = View Health
 *  16 = View Business (stat)       17 = View Infrastructures
 *  --- Institutions Panel ---
 *  18 = View Business              19 = Create Business
 *  20 = Update Business            21 = Delete Business
 *  22 = View Infrastructure        23 = Create Infrastructure
 *  24 = Update Infrastructure      25 = Delete Infrastructure
 *  --- Transaction Panel ---
 *  26 = View Services              27 = Create Services
 *  28 = Update Services            29 = Delete Services
 *  30 = Export Services
 *  --- History Records Panel ---
 *  31 = View Citizen History       32 = Create Citizen History
 *  33 = Update Citizen History     34 = Delete Citizen History
 *  35 = View Medical History       36 = Create Medical History
 *  37 = Update Medical History     38 = Delete Medical History
 *  39 = View Settlement History    40 = Create Settlement History
 *  41 = Update Settlement History  42 = Delete Settlement History
 *  --- Admin Panel ---
 *  43 = View Archive               44 = Restore Archive
 *  45 = View Account               46 = Create Account
 *  47 = Update Account             48 = Delete Account
 *  49-52 reserved (removed Control permissions)
 *  53 = View Audit Logs
 */
class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // ─────────────────────────────────────────────────────────────────────
        // Role 7: BHW  (base — no delete)
        // Citizen: View/Create/Update Citizen Profile & Household
        // History: View Citizen History, View/Create/Update Medical History
        // Stats:   Demographic, Neighborhood, Household, Education, Employment, Health
        // ─────────────────────────────────────────────────────────────────────
        $bhw = [
            1,              // View Dashboard
            2, 3, 4,        // View/Create/Update Citizen Profile
            6, 7, 8,        // View/Create/Update Household Profile
            10, 11, 12, 13, 14, 15, // Stats: Demo, Neighborhood, Household, Edu, Employ, Health
            31,             // View Citizen History
            35, 36, 37,     // View/Create/Update Medical History
        ];

        // ─────────────────────────────────────────────────────────────────────
        // Role 6: SR_BHW  (inherits BHW + adds deletes for citizen, household, medical)
        // ─────────────────────────────────────────────────────────────────────
        $srBhw = array_unique(array_merge($bhw, [
            5,              // Delete Citizen Profile
            9,              // Delete Household Profile
            38,             // Delete Medical History
        ]));

        // ─────────────────────────────────────────────────────────────────────
        // Role 5: BPSO  (base — no delete)
        // Citizen: View Citizen Profile, View Household Profile
        // History: View/Create/Update Citizen History, View/Create/Update Settlement History
        // Stats:   Demographic, Neighborhood, Household, Education, Employment
        // ─────────────────────────────────────────────────────────────────────
        $bpso = [
            1,              // View Dashboard
            2,              // View Citizen Profile
            6,              // View Household Profile
            10, 11, 12, 13, 14, // Stats: Demo, Neighborhood, Household, Edu, Employ
            31, 32, 33,     // View/Create/Update Citizen History
            39, 40, 41,     // View/Create/Update Settlement History
        ];

        // ─────────────────────────────────────────────────────────────────────
        // Role 4: SR_BPSO  (inherits BPSO + adds deletes for citizen & settlement history)
        // ─────────────────────────────────────────────────────────────────────
        $srBpso = array_unique(array_merge($bpso, [
            34,             // Delete Citizen History
            42,             // Delete Settlement History
        ]));

        // ─────────────────────────────────────────────────────────────────────
        // Role 3: OFFICE_ENCODER  (narrow scope — no delete)
        // Citizen: View/Create/Update Citizen Profile & Household
        // Transactions: View/Create/Update Services
        // ─────────────────────────────────────────────────────────────────────
        $officeEncoder = [
            1,              // View Dashboard
            2, 3, 4,        // View/Create/Update Citizen Profile
            6, 7, 8,        // View/Create/Update Household Profile
            26, 27, 28,     // View/Create/Update Services
        ];

        // ─────────────────────────────────────────────────────────────────────
        // Role 2: OFFICE  (everything except delete — NO admin panel access)
        // ─────────────────────────────────────────────────────────────────────
        $office = [
            1,              // View Dashboard
            2, 3, 4,        // View/Create/Update Citizen Profile      (no 5 Delete)
            6, 7, 8,        // View/Create/Update Household Profile    (no 9 Delete)
            10, 11, 12, 13, 14, 15, 16, 17, // All Statistics views
            18, 19, 20,     // View/Create/Update Business             (no 21 Delete)
            22, 23, 24,     // View/Create/Update Infrastructure       (no 25 Delete)
            26, 27, 28, 30, // View/Create/Update/Export Services      (no 29 Delete)
            31, 32, 33,     // View/Create/Update Citizen History      (no 34 Delete)
            35, 36, 37,     // View/Create/Update Medical History      (no 38 Delete)
            39, 40, 41,     // View/Create/Update Settlement History   (no 42 Delete)
            // NO admin panel permissions (43-53)
        ];

        // ─────────────────────────────────────────────────────────────────────
        // Role 1: SR_OFFICE  (inherits OFFICE + all deletes + full admin panel)
        // ─────────────────────────────────────────────────────────────────────
        $srOffice = array_unique(array_merge($office, [
            5,              // Delete Citizen Profile
            9,              // Delete Household Profile
            21,             // Delete Business
            25,             // Delete Infrastructure
            29,             // Delete Services
            34,             // Delete Citizen History
            38,             // Delete Medical History
            42,             // Delete Settlement History
            // Admin Panel
            43, 44,         // View/Restore Archive
            45, 46, 47, 48, // View/Create/Update/Delete Account
            53,             // View Audit Logs
        ]));

        // ─────────────────────────────────────────────────────────────────────
        // Build insert rows
        // ─────────────────────────────────────────────────────────────────────
        $rows = [];

        $roleMap = [
            1 => ['name' => 'SR_OFFICE',      'perms' => $srOffice],
            2 => ['name' => 'OFFICE',          'perms' => $office],
            3 => ['name' => 'OFFICE_ENCODER',  'perms' => $officeEncoder],
            4 => ['name' => 'SR_BPSO',         'perms' => $srBpso],
            5 => ['name' => 'BPSO',            'perms' => $bpso],
            6 => ['name' => 'SR_BHW',          'perms' => $srBhw],
            7 => ['name' => 'BHW',             'perms' => $bhw],
        ];

        foreach ($roleMap as $roleId => $data) {
            sort($data['perms']);
            foreach ($data['perms'] as $permId) {
                $rows[] = ['role_id' => $roleId, 'perm_id' => $permId];
            }
        }

        DB::table('role_permissions')->insert($rows);
    }
}
