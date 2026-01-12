<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('permissions')->insert([
            // Dashboard
            ['name' => 'View Dashboard', 'category' => 'Dashboard Panel'],
            
            // Citizen Panel
            ['name' => 'View Citizen Profile', 'category' => 'Citizen Panel'],
            ['name' => 'Create Citizen Profile', 'category' => 'Citizen Panel'],
            ['name' => 'Update Citizen Profile', 'category' => 'Citizen Panel'],
            ['name' => 'Delete Citizen Profile', 'category' => 'Citizen Panel'],
            ['name' => 'View Household Profile', 'category' => 'Citizen Panel'],
            ['name' => 'Create Household Profile', 'category' => 'Citizen Panel'],
            ['name' => 'Update Household Profile', 'category' => 'Citizen Panel'],
            ['name' => 'Delete Household Profile', 'category' => 'Citizen Panel'],
            
            // Statistics Panel
            ['name' => 'View Demographic', 'category' => 'Statistics Panel'],
            ['name' => 'View Neighborhood', 'category' => 'Statistics Panel'],
            ['name' => 'View Household', 'category' => 'Statistics Panel'],
            ['name' => 'View Education', 'category' => 'Statistics Panel'],
            ['name' => 'View Employment', 'category' => 'Statistics Panel'],
            ['name' => 'View Health', 'category' => 'Statistics Panel'],
            ['name' => 'View Business', 'category' => 'Statistics Panel'],
            ['name' => 'View Infrastructures', 'category' => 'Statistics Panel'],
            
            // Institutions Panel
            ['name' => 'View Business', 'category' => 'Institutions Panel'],
            ['name' => 'Create Business', 'category' => 'Institutions Panel'],
            ['name' => 'Update Business', 'category' => 'Institutions Panel'],
            ['name' => 'Delete Business', 'category' => 'Institutions Panel'],
            ['name' => 'View Infrastructure', 'category' => 'Institutions Panel'],
            ['name' => 'Create Infrastructure', 'category' => 'Institutions Panel'],
            ['name' => 'Update Infrastructure', 'category' => 'Institutions Panel'],
            ['name' => 'Delete Infrastructure', 'category' => 'Institutions Panel'],
            
            // Transaction Panel
            ['name' => 'View Services', 'category' => 'Transaction Panel'],
            ['name' => 'Create Services', 'category' => 'Transaction Panel'],
            ['name' => 'Update Services', 'category' => 'Transaction Panel'],
            ['name' => 'Delete Services', 'category' => 'Transaction Panel'],
            ['name' => 'Export Services', 'category' => 'Transaction Panel'],
            
            // History Records Panel
            ['name' => 'View Citizen History', 'category' => 'History Records Panel'],
            ['name' => 'Create Citizen History', 'category' => 'History Records Panel'],
            ['name' => 'Update Citizen History', 'category' => 'History Records Panel'],
            ['name' => 'Delete Citizen History', 'category' => 'History Records Panel'],
            ['name' => 'View Medical History', 'category' => 'History Records Panel'],
            ['name' => 'Create Medical History', 'category' => 'History Records Panel'],
            ['name' => 'Update Medical History', 'category' => 'History Records Panel'],
            ['name' => 'Delete Medical History', 'category' => 'History Records Panel'],
            ['name' => 'View Settlement History', 'category' => 'History Records Panel'],
            ['name' => 'Create Settlement History', 'category' => 'History Records Panel'],
            ['name' => 'Update Settlement History', 'category' => 'History Records Panel'],
            ['name' => 'Delete Settlement History', 'category' => 'History Records Panel'],
            
            // Admin Panel
            ['name' => 'View Archive', 'category' => 'Admin Panel'],
            ['name' => 'Restore Archive', 'category' => 'Admin Panel'],
            ['name' => 'View Account', 'category' => 'Admin Panel'],
            ['name' => 'Create Account', 'category' => 'Admin Panel'],
            ['name' => 'Update Account', 'category' => 'Admin Panel'],
            ['name' => 'Delete Account', 'category' => 'Admin Panel'],
            ['name' => 'View Control', 'category' => 'Admin Panel'],
            ['name' => 'Create Control', 'category' => 'Admin Panel'],
            ['name' => 'Update Control', 'category' => 'Admin Panel'],
            ['name' => 'Delete Control', 'category' => 'Admin Panel'],
            ['name' => 'View Audit Logs', 'category' => 'Admin Panel'],
        ]);
    }
}
