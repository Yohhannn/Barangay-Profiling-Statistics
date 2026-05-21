<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Permission ID reference:
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
class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('permissions')->insert([
            // Dashboard
            ['perm_id' => 1,  'name' => 'View Dashboard',            'category' => 'Dashboard Panel'],

            // Citizen Panel
            ['perm_id' => 2,  'name' => 'View Citizen Profile',      'category' => 'Citizen Panel'],
            ['perm_id' => 3,  'name' => 'Create Citizen Profile',     'category' => 'Citizen Panel'],
            ['perm_id' => 4,  'name' => 'Update Citizen Profile',     'category' => 'Citizen Panel'],
            ['perm_id' => 5,  'name' => 'Delete Citizen Profile',     'category' => 'Citizen Panel'],
            ['perm_id' => 6,  'name' => 'View Household Profile',     'category' => 'Citizen Panel'],
            ['perm_id' => 7,  'name' => 'Create Household Profile',   'category' => 'Citizen Panel'],
            ['perm_id' => 8,  'name' => 'Update Household Profile',   'category' => 'Citizen Panel'],
            ['perm_id' => 9,  'name' => 'Delete Household Profile',   'category' => 'Citizen Panel'],

            // Statistics Panel
            ['perm_id' => 10, 'name' => 'View Demographic',          'category' => 'Statistics Panel'],
            ['perm_id' => 11, 'name' => 'View Neighborhood',         'category' => 'Statistics Panel'],
            ['perm_id' => 12, 'name' => 'View Household',            'category' => 'Statistics Panel'],
            ['perm_id' => 13, 'name' => 'View Education',            'category' => 'Statistics Panel'],
            ['perm_id' => 14, 'name' => 'View Employment',           'category' => 'Statistics Panel'],
            ['perm_id' => 15, 'name' => 'View Health',               'category' => 'Statistics Panel'],
            ['perm_id' => 16, 'name' => 'View Business',             'category' => 'Statistics Panel'],
            ['perm_id' => 17, 'name' => 'View Infrastructures',      'category' => 'Statistics Panel'],

            // Institutions Panel
            ['perm_id' => 18, 'name' => 'View Business',             'category' => 'Institutions Panel'],
            ['perm_id' => 19, 'name' => 'Create Business',           'category' => 'Institutions Panel'],
            ['perm_id' => 20, 'name' => 'Update Business',           'category' => 'Institutions Panel'],
            ['perm_id' => 21, 'name' => 'Delete Business',           'category' => 'Institutions Panel'],
            ['perm_id' => 22, 'name' => 'View Infrastructure',       'category' => 'Institutions Panel'],
            ['perm_id' => 23, 'name' => 'Create Infrastructure',     'category' => 'Institutions Panel'],
            ['perm_id' => 24, 'name' => 'Update Infrastructure',     'category' => 'Institutions Panel'],
            ['perm_id' => 25, 'name' => 'Delete Infrastructure',     'category' => 'Institutions Panel'],

            // Transaction Panel
            ['perm_id' => 26, 'name' => 'View Services',             'category' => 'Transaction Panel'],
            ['perm_id' => 27, 'name' => 'Create Services',           'category' => 'Transaction Panel'],
            ['perm_id' => 28, 'name' => 'Update Services',           'category' => 'Transaction Panel'],
            ['perm_id' => 29, 'name' => 'Delete Services',           'category' => 'Transaction Panel'],
            ['perm_id' => 30, 'name' => 'Export Services',           'category' => 'Transaction Panel'],

            // History Records Panel
            ['perm_id' => 31, 'name' => 'View Citizen History',      'category' => 'History Records Panel'],
            ['perm_id' => 32, 'name' => 'Create Citizen History',    'category' => 'History Records Panel'],
            ['perm_id' => 33, 'name' => 'Update Citizen History',    'category' => 'History Records Panel'],
            ['perm_id' => 34, 'name' => 'Delete Citizen History',    'category' => 'History Records Panel'],
            ['perm_id' => 35, 'name' => 'View Medical History',      'category' => 'History Records Panel'],
            ['perm_id' => 36, 'name' => 'Create Medical History',    'category' => 'History Records Panel'],
            ['perm_id' => 37, 'name' => 'Update Medical History',    'category' => 'History Records Panel'],
            ['perm_id' => 38, 'name' => 'Delete Medical History',    'category' => 'History Records Panel'],
            ['perm_id' => 39, 'name' => 'View Settlement History',   'category' => 'History Records Panel'],
            ['perm_id' => 40, 'name' => 'Create Settlement History', 'category' => 'History Records Panel'],
            ['perm_id' => 41, 'name' => 'Update Settlement History', 'category' => 'History Records Panel'],
            ['perm_id' => 42, 'name' => 'Delete Settlement History', 'category' => 'History Records Panel'],

            // Admin Panel  (49-52 intentionally skipped — Control permissions removed)
            ['perm_id' => 43, 'name' => 'View Archive',              'category' => 'Admin Panel'],
            ['perm_id' => 44, 'name' => 'Restore Archive',           'category' => 'Admin Panel'],
            ['perm_id' => 45, 'name' => 'View Account',              'category' => 'Admin Panel'],
            ['perm_id' => 46, 'name' => 'Create Account',            'category' => 'Admin Panel'],
            ['perm_id' => 47, 'name' => 'Update Account',            'category' => 'Admin Panel'],
            ['perm_id' => 48, 'name' => 'Delete Account',            'category' => 'Admin Panel'],
            ['perm_id' => 53, 'name' => 'View Audit Logs',           'category' => 'Admin Panel'],
        ]);

        // Advance the PostgreSQL sequence past the highest perm_id so future
        // inserts without an explicit ID start at 54.
        DB::statement("SELECT setval(pg_get_serial_sequence('permissions', 'perm_id'), 53)");
    }
}
