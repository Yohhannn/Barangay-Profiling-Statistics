<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SystemPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
            DB::table('system_permissions')->insert(
                [
                    // Role 1: SR_OFFICE ACCOUNT (VIEW DASHBOARD AND DELETE ABILITY)
                    ['sys_id' => 1, 'perm_id' => 1],  // View Dashboard
                    ['sys_id' => 1, 'perm_id' => 5],  // Delete Citizen Profile
                    ['sys_id' => 1, 'perm_id' => 9],  // Delete Household Profile
                    ['sys_id' => 1, 'perm_id' => 21], // Delete Business
                    ['sys_id' => 1, 'perm_id' => 25], // Delete Infrastructure
                    ['sys_id' => 1, 'perm_id' => 29], // Delete Services
                    ['sys_id' => 1, 'perm_id' => 34], // Delete Citizen History
                    ['sys_id' => 1, 'perm_id' => 38], // Delete Medical History
                    ['sys_id' => 1, 'perm_id' => 42], // Delete Settlement History
                    ['sys_id' => 1, 'perm_id' => 48], // Delete Account
                    ['sys_id' => 1, 'perm_id' => 52], // Delete Control

                    // Role 2: OFFICE ACCOUNT (All permissions except deletes)
                    ['sys_id' => 2, 'perm_id' => 1],  // View Dashboard
                    ['sys_id' => 2, 'perm_id' => 2],  // View Citizen Profile
                    ['sys_id' => 2, 'perm_id' => 3],  // Create Citizen Profile
                    ['sys_id' => 2, 'perm_id' => 4],  // Update Citizen Profile
                    ['sys_id' => 2, 'perm_id' => 6],  // View Household Profile
                    ['sys_id' => 2, 'perm_id' => 7],  // Create Household Profile
                    ['sys_id' => 2, 'perm_id' => 8],  // Update Household Profile
                    ['sys_id' => 2, 'perm_id' => 10], // View Demographic
                    ['sys_id' => 2, 'perm_id' => 11], // View Neighborhood
                    ['sys_id' => 2, 'perm_id' => 12], // View Household
                    ['sys_id' => 2, 'perm_id' => 13], // View Education
                    ['sys_id' => 2, 'perm_id' => 14], // View Employment
                    ['sys_id' => 2, 'perm_id' => 15], // View Health
                    ['sys_id' => 2, 'perm_id' => 16], // View Business (Statistics)
                    ['sys_id' => 2, 'perm_id' => 17], // View Infrastructures
                    ['sys_id' => 2, 'perm_id' => 18], // View Business (Institutions)
                    ['sys_id' => 2, 'perm_id' => 19], // Create Business
                    ['sys_id' => 2, 'perm_id' => 20], // Update Business
                    ['sys_id' => 2, 'perm_id' => 22], // View Infrastructure
                    ['sys_id' => 2, 'perm_id' => 23], // Create Infrastructure
                    ['sys_id' => 2, 'perm_id' => 24], // Update Infrastructure
                    ['sys_id' => 2, 'perm_id' => 26], // View Services
                    ['sys_id' => 2, 'perm_id' => 27], // Create Services
                    ['sys_id' => 2, 'perm_id' => 28], // Update Services
                    ['sys_id' => 2, 'perm_id' => 30], // Export Services
                    ['sys_id' => 2, 'perm_id' => 31], // View Citizen History
                    ['sys_id' => 2, 'perm_id' => 32], // Create Citizen History
                    ['sys_id' => 2, 'perm_id' => 33], // Update Citizen History
                    ['sys_id' => 2, 'perm_id' => 35], // View Medical History
                    ['sys_id' => 2, 'perm_id' => 36], // Create Medical History
                    ['sys_id' => 2, 'perm_id' => 37], // Update Medical History
                    ['sys_id' => 2, 'perm_id' => 39], // View Settlement History
                    ['sys_id' => 2, 'perm_id' => 40], // Create Settlement History
                    ['sys_id' => 2, 'perm_id' => 41], // Update Settlement History
                    ['sys_id' => 2, 'perm_id' => 43], // View Archive
                    ['sys_id' => 2, 'perm_id' => 44], // Restore Archive
                    ['sys_id' => 2, 'perm_id' => 45], // View Account
                    ['sys_id' => 2, 'perm_id' => 46], // Create Account
                    ['sys_id' => 2, 'perm_id' => 47], // Update Account
                    ['sys_id' => 2, 'perm_id' => 49], // View Control
                    ['sys_id' => 2, 'perm_id' => 50], // Create Control
                    ['sys_id' => 2, 'perm_id' => 51], // Update Control
                    ['sys_id' => 2, 'perm_id' => 53], // View Audit Logs

                    // Role 3: OFFICE_ENCODER ACCOUNT (View Dashboard, No Delete, Limited Permissions)
                    ['sys_id' => 3, 'perm_id' => 1],  // View Dashboard
                    ['sys_id' => 3, 'perm_id' => 2],  // View Citizen Profile
                    ['sys_id' => 3, 'perm_id' => 3],  // Create Citizen Profile
                    ['sys_id' => 3, 'perm_id' => 4],  // Update Citizen Profile
                    ['sys_id' => 3, 'perm_id' => 6],  // View Household Profile
                    ['sys_id' => 3, 'perm_id' => 7],  // Create Household Profile
                    ['sys_id' => 3, 'perm_id' => 8],  // Update Household Profile
                    ['sys_id' => 3, 'perm_id' => 26], // View Services
                    ['sys_id' => 3, 'perm_id' => 27], // Create Services
                    ['sys_id' => 3, 'perm_id' => 28], // Update Services
                    ['sys_id' => 3, 'perm_id' => 30], // Export Services

                    // Role 4: SR_BPSO ACCOUNT (View Dashboard, Delete Ability, Limited Permissions)
                    ['sys_id' => 4, 'perm_id' => 1],  // View Dashboard
                    ['sys_id' => 4, 'perm_id' => 2],  // View Citizen Profile
                    ['sys_id' => 4, 'perm_id' => 5],  // Delete Citizen Profile
                    ['sys_id' => 4, 'perm_id' => 6],  // View Household Profile
                    ['sys_id' => 4, 'perm_id' => 9],  // Delete Household Profile
                    ['sys_id' => 4, 'perm_id' => 10], // View Demographic
                    ['sys_id' => 4, 'perm_id' => 11], // View Neighborhood
                    ['sys_id' => 4, 'perm_id' => 12], // View Household
                    ['sys_id' => 4, 'perm_id' => 13], // View Education
                    ['sys_id' => 4, 'perm_id' => 14], // View Employment
                    ['sys_id' => 4, 'perm_id' => 31], // View Citizen History
                    ['sys_id' => 4, 'perm_id' => 32], // Create Citizen History
                    ['sys_id' => 4, 'perm_id' => 33], // Update Citizen History
                    ['sys_id' => 4, 'perm_id' => 34], // Delete Citizen History
                    ['sys_id' => 4, 'perm_id' => 39], // View Settlement History
                    ['sys_id' => 4, 'perm_id' => 40], // Create Settlement History
                    ['sys_id' => 4, 'perm_id' => 41], // Update Settlement History
                    ['sys_id' => 4, 'perm_id' => 42], // Delete Settlement History

                    // Role 5: BPSO ACCOUNT (View Dashboard, No Delete)
                    ['sys_id' => 5, 'perm_id' => 1],  // View Dashboard
                    ['sys_id' => 5, 'perm_id' => 2],  // View Citizen Profile
                    ['sys_id' => 5, 'perm_id' => 6],  // View Household Profile
                    ['sys_id' => 5, 'perm_id' => 10], // View Demographic
                    ['sys_id' => 5, 'perm_id' => 11], // View Neighborhood
                    ['sys_id' => 5, 'perm_id' => 12], // View Household
                    ['sys_id' => 5, 'perm_id' => 13], // View Education
                    ['sys_id' => 5, 'perm_id' => 14], // View Employment
                    ['sys_id' => 5, 'perm_id' => 31], // View Citizen History
                    ['sys_id' => 5, 'perm_id' => 32], // Create Citizen History
                    ['sys_id' => 5, 'perm_id' => 33], // Update Citizen History
                    ['sys_id' => 5, 'perm_id' => 39], // View Settlement History
                    ['sys_id' => 5, 'perm_id' => 40], // Create Settlement History
                    ['sys_id' => 5, 'perm_id' => 41], // Update Settlement History

                    // Role 6: SR_BHW ACCOUNT (View Dashboard, Delete Ability)
                    ['sys_id' => 6, 'perm_id' => 1],  // View Dashboard
                    ['sys_id' => 6, 'perm_id' => 2],  // View Citizen Profile
                    ['sys_id' => 6, 'perm_id' => 3],  // Create Citizen Profile
                    ['sys_id' => 6, 'perm_id' => 4],  // Update Citizen Profile
                    ['sys_id' => 6, 'perm_id' => 5],  // Delete Citizen Profile
                    ['sys_id' => 6, 'perm_id' => 6],  // View Household Profile
                    ['sys_id' => 6, 'perm_id' => 7],  // Create Household Profile
                    ['sys_id' => 6, 'perm_id' => 8],  // Update Household Profile
                    ['sys_id' => 6, 'perm_id' => 9],  // Delete Household Profile
                    ['sys_id' => 6, 'perm_id' => 10], // View Demographic
                    ['sys_id' => 6, 'perm_id' => 11], // View Neighborhood
                    ['sys_id' => 6, 'perm_id' => 12], // View Household
                    ['sys_id' => 6, 'perm_id' => 13], // View Education
                    ['sys_id' => 6, 'perm_id' => 14], // View Employment
                    ['sys_id' => 6, 'perm_id' => 15], // View Health
                    ['sys_id' => 6, 'perm_id' => 35], // View Medical History
                    ['sys_id' => 6, 'perm_id' => 36], // Create Medical History
                    ['sys_id' => 6, 'perm_id' => 37], // Update Medical History
                    ['sys_id' => 6, 'perm_id' => 38], // Delete Medical History

                    // Role 7: BHW ACCOUNT (View Dashboard, No Delete)
                    ['sys_id' => 7, 'perm_id' => 1],  // View Dashboard
                    ['sys_id' => 7, 'perm_id' => 2],  // View Citizen Profile
                    ['sys_id' => 7, 'perm_id' => 3],  // Create Citizen Profile
                    ['sys_id' => 7, 'perm_id' => 4],  // Update Citizen Profile
                    ['sys_id' => 7, 'perm_id' => 6],  // View Household Profile
                    ['sys_id' => 7, 'perm_id' => 7],  // Create Household Profile
                    ['sys_id' => 7, 'perm_id' => 8],  // Update Household Profile
                    ['sys_id' => 7, 'perm_id' => 10], // View Demographic
                    ['sys_id' => 7, 'perm_id' => 11], // View Neighborhood
                    ['sys_id' => 7, 'perm_id' => 12], // View Household
                    ['sys_id' => 7, 'perm_id' => 13], // View Education
                    ['sys_id' => 7, 'perm_id' => 14], // View Employment
                    ['sys_id' => 7, 'perm_id' => 15], // View Health
                    ['sys_id' => 7, 'perm_id' => 35], // View Medical History
                    ['sys_id' => 7, 'perm_id' => 36], // Create Medical History
                    ['sys_id' => 7, 'perm_id' => 37], // Update Medical History
                ]
            );
    }
}
