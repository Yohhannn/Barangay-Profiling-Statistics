<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('role_permissions')->insert([
            // Role 1: SR_OFFICE ACCOUNT (VIEW DASHBOARD AND DELETE ABILITY)
            ['role_id' => 1, 'perm_id' => 1],  // View Dashboard
            ['role_id' => 1, 'perm_id' => 5],  // Delete Citizen Profile
            ['role_id' => 1, 'perm_id' => 9],  // Delete Household Profile
            ['role_id' => 1, 'perm_id' => 21], // Delete Business
            ['role_id' => 1, 'perm_id' => 25], // Delete Infrastructure
            ['role_id' => 1, 'perm_id' => 29], // Delete Services
            ['role_id' => 1, 'perm_id' => 34], // Delete Citizen History
            ['role_id' => 1, 'perm_id' => 38], // Delete Medical History
            ['role_id' => 1, 'perm_id' => 42], // Delete Settlement History
            ['role_id' => 1, 'perm_id' => 48], // Delete Account
            ['role_id' => 1, 'perm_id' => 52], // Delete Control

            // Role 2: OFFICE ACCOUNT (All permissions except deletes)
            ['role_id' => 2, 'perm_id' => 1],  // View Dashboard
            ['role_id' => 2, 'perm_id' => 2],  // View Citizen Profile
            ['role_id' => 2, 'perm_id' => 3],  // Create Citizen Profile
            ['role_id' => 2, 'perm_id' => 4],  // Update Citizen Profile
            ['role_id' => 2, 'perm_id' => 6],  // View Household Profile
            ['role_id' => 2, 'perm_id' => 7],  // Create Household Profile
            ['role_id' => 2, 'perm_id' => 8],  // Update Household Profile
            ['role_id' => 2, 'perm_id' => 10], // View Demographic
            ['role_id' => 2, 'perm_id' => 11], // View Neighborhood
            ['role_id' => 2, 'perm_id' => 12], // View Household
            ['role_id' => 2, 'perm_id' => 13], // View Education
            ['role_id' => 2, 'perm_id' => 14], // View Employment
            ['role_id' => 2, 'perm_id' => 15], // View Health
            ['role_id' => 2, 'perm_id' => 16], // View Business (Statistics)
            ['role_id' => 2, 'perm_id' => 17], // View Infrastructures
            ['role_id' => 2, 'perm_id' => 18], // View Business (Institutions)
            ['role_id' => 2, 'perm_id' => 19], // Create Business
            ['role_id' => 2, 'perm_id' => 20], // Update Business
            ['role_id' => 2, 'perm_id' => 22], // View Infrastructure
            ['role_id' => 2, 'perm_id' => 23], // Create Infrastructure
            ['role_id' => 2, 'perm_id' => 24], // Update Infrastructure
            ['role_id' => 2, 'perm_id' => 26], // View Services
            ['role_id' => 2, 'perm_id' => 27], // Create Services
            ['role_id' => 2, 'perm_id' => 28], // Update Services
            ['role_id' => 2, 'perm_id' => 30], // Export Services
            ['role_id' => 2, 'perm_id' => 31], // View Citizen History
            ['role_id' => 2, 'perm_id' => 32], // Create Citizen History
            ['role_id' => 2, 'perm_id' => 33], // Update Citizen History
            ['role_id' => 2, 'perm_id' => 35], // View Medical History
            ['role_id' => 2, 'perm_id' => 36], // Create Medical History
            ['role_id' => 2, 'perm_id' => 37], // Update Medical History
            ['role_id' => 2, 'perm_id' => 39], // View Settlement History
            ['role_id' => 2, 'perm_id' => 40], // Create Settlement History
            ['role_id' => 2, 'perm_id' => 41], // Update Settlement History
            ['role_id' => 2, 'perm_id' => 43], // View Archive
            ['role_id' => 2, 'perm_id' => 44], // Restore Archive
            ['role_id' => 2, 'perm_id' => 45], // View Account
            ['role_id' => 2, 'perm_id' => 46], // Create Account
            ['role_id' => 2, 'perm_id' => 47], // Update Account
            ['role_id' => 2, 'perm_id' => 49], // View Control
            ['role_id' => 2, 'perm_id' => 50], // Create Control
            ['role_id' => 2, 'perm_id' => 51], // Update Control
            ['role_id' => 2, 'perm_id' => 53], // View Audit Logs

            // Role 3: OFFICE_ENCODER ACCOUNT (View Dashboard, No Delete, Limited Permissions)
            ['role_id' => 3, 'perm_id' => 1],  // View Dashboard
            ['role_id' => 3, 'perm_id' => 2],  // View Citizen Profile
            ['role_id' => 3, 'perm_id' => 3],  // Create Citizen Profile
            ['role_id' => 3, 'perm_id' => 4],  // Update Citizen Profile
            ['role_id' => 3, 'perm_id' => 6],  // View Household Profile
            ['role_id' => 3, 'perm_id' => 7],  // Create Household Profile
            ['role_id' => 3, 'perm_id' => 8],  // Update Household Profile
            ['role_id' => 3, 'perm_id' => 26], // View Services
            ['role_id' => 3, 'perm_id' => 27], // Create Services
            ['role_id' => 3, 'perm_id' => 28], // Update Services
            ['role_id' => 3, 'perm_id' => 30], // Export Services

            // Role 4: SR_BPSO ACCOUNT (View Dashboard, Delete Ability, Limited Permissions)
            ['role_id' => 4, 'perm_id' => 1],  // View Dashboard
            ['role_id' => 4, 'perm_id' => 2],  // View Citizen Profile
            ['role_id' => 4, 'perm_id' => 5],  // Delete Citizen Profile
            ['role_id' => 4, 'perm_id' => 6],  // View Household Profile
            ['role_id' => 4, 'perm_id' => 9],  // Delete Household Profile
            ['role_id' => 4, 'perm_id' => 10], // View Demographic
            ['role_id' => 4, 'perm_id' => 11], // View Neighborhood
            ['role_id' => 4, 'perm_id' => 12], // View Household
            ['role_id' => 4, 'perm_id' => 13], // View Education
            ['role_id' => 4, 'perm_id' => 14], // View Employment
            ['role_id' => 4, 'perm_id' => 31], // View Citizen History
            ['role_id' => 4, 'perm_id' => 32], // Create Citizen History
            ['role_id' => 4, 'perm_id' => 33], // Update Citizen History
            ['role_id' => 4, 'perm_id' => 34], // Delete Citizen History
            ['role_id' => 4, 'perm_id' => 39], // View Settlement History
            ['role_id' => 4, 'perm_id' => 40], // Create Settlement History
            ['role_id' => 4, 'perm_id' => 41], // Update Settlement History
            ['role_id' => 4, 'perm_id' => 42], // Delete Settlement History

            // Role 5: BPSO ACCOUNT (View Dashboard, No Delete)
            ['role_id' => 5, 'perm_id' => 1],  // View Dashboard
            ['role_id' => 5, 'perm_id' => 2],  // View Citizen Profile
            ['role_id' => 5, 'perm_id' => 6],  // View Household Profile
            ['role_id' => 5, 'perm_id' => 10], // View Demographic
            ['role_id' => 5, 'perm_id' => 11], // View Neighborhood
            ['role_id' => 5, 'perm_id' => 12], // View Household
            ['role_id' => 5, 'perm_id' => 13], // View Education
            ['role_id' => 5, 'perm_id' => 14], // View Employment
            ['role_id' => 5, 'perm_id' => 31], // View Citizen History
            ['role_id' => 5, 'perm_id' => 32], // Create Citizen History
            ['role_id' => 5, 'perm_id' => 33], // Update Citizen History
            ['role_id' => 5, 'perm_id' => 39], // View Settlement History
            ['role_id' => 5, 'perm_id' => 40], // Create Settlement History
            ['role_id' => 5, 'perm_id' => 41], // Update Settlement History

            // Role 6: SR_BHW ACCOUNT (View Dashboard, Delete Ability)
            ['role_id' => 6, 'perm_id' => 1],  // View Dashboard
            ['role_id' => 6, 'perm_id' => 2],  // View Citizen Profile
            ['role_id' => 6, 'perm_id' => 3],  // Create Citizen Profile
            ['role_id' => 6, 'perm_id' => 4],  // Update Citizen Profile
            ['role_id' => 6, 'perm_id' => 5],  // Delete Citizen Profile
            ['role_id' => 6, 'perm_id' => 6],  // View Household Profile
            ['role_id' => 6, 'perm_id' => 7],  // Create Household Profile
            ['role_id' => 6, 'perm_id' => 8],  // Update Household Profile
            ['role_id' => 6, 'perm_id' => 9],  // Delete Household Profile
            ['role_id' => 6, 'perm_id' => 10], // View Demographic
            ['role_id' => 6, 'perm_id' => 11], // View Neighborhood
            ['role_id' => 6, 'perm_id' => 12], // View Household
            ['role_id' => 6, 'perm_id' => 13], // View Education
            ['role_id' => 6, 'perm_id' => 14], // View Employment
            ['role_id' => 6, 'perm_id' => 15], // View Health
            ['role_id' => 6, 'perm_id' => 35], // View Medical History
            ['role_id' => 6, 'perm_id' => 36], // Create Medical History
            ['role_id' => 6, 'perm_id' => 37], // Update Medical History
            ['role_id' => 6, 'perm_id' => 38], // Delete Medical History

            // Role 7: BHW ACCOUNT (View Dashboard, No Delete)
            ['role_id' => 7, 'perm_id' => 1],  // View Dashboard
            ['role_id' => 7, 'perm_id' => 2],  // View Citizen Profile
            ['role_id' => 7, 'perm_id' => 3],  // Create Citizen Profile
            ['role_id' => 7, 'perm_id' => 4],  // Update Citizen Profile
            ['role_id' => 7, 'perm_id' => 6],  // View Household Profile
            ['role_id' => 7, 'perm_id' => 7],  // Create Household Profile
            ['role_id' => 7, 'perm_id' => 8],  // Update Household Profile
            ['role_id' => 7, 'perm_id' => 10], // View Demographic
            ['role_id' => 7, 'perm_id' => 11], // View Neighborhood
            ['role_id' => 7, 'perm_id' => 12], // View Household
            ['role_id' => 7, 'perm_id' => 13], // View Education
            ['role_id' => 7, 'perm_id' => 14], // View Employment
            ['role_id' => 7, 'perm_id' => 15], // View Health
            ['role_id' => 7, 'perm_id' => 35], // View Medical History
            ['role_id' => 7, 'perm_id' => 36], // Create Medical History
            ['role_id' => 7, 'perm_id' => 37], // Update Medical History
        ]);
    }
}
