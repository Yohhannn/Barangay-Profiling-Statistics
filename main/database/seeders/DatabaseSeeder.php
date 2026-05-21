<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            // 1. Permissions first (no FK dependencies)
            PermissionSeeder::class,

            // 2. Accounts + Roles + Role-Permissions in one self-contained seeder
            //    StaffAccountSeeder handles the correct creation order internally.
            StaffAccountSeeder::class,

            // 3. Reference / lookup data
            SitioSeeder::class,

            // 4. Sample citizen/household data
            HouseholdAndCitizenSeeder::class,
        ]);
    }
}
