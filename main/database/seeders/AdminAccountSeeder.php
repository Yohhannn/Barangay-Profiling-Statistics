<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\SystemAccount;
use App\Models\SystemPermission;
use App\Models\Permission;

class AdminAccountSeeder extends Seeder
{
    /**
     * Create the initial System Administrator account with ALL permissions.
     * Run: php artisan db:seed --class=AdminAccountSeeder
     */
    public function run(): void
    {
        // Check if admin already exists
        if (SystemAccount::where('sys_account_id', 100000)->exists()) {
            $this->command->warn('Admin account (ID: 100000) already exists. Skipping.');
            return;
        }

        // Create the admin account
        $account = SystemAccount::create([
            'sys_account_id' => 100000,
            'sys_fname'      => 'System',
            'sys_mname'      => null,
            'sys_lname'      => 'Administrator',
            'email'          => 'admin@barangay.gov.ph',
            'sys_password'   => bcrypt('Admin@123'),
            'is_deleted'     => false,
            'date_created'   => now(),
        ]);

        // Assign ALL permissions
        $permIds = Permission::pluck('perm_id')->toArray();
        foreach ($permIds as $permId) {
            SystemPermission::create([
                'sys_id'  => $account->sys_id,
                'perm_id' => $permId,
            ]);
        }

        $this->command->info("✅ Admin account created successfully!");
        $this->command->info("   Account ID : 100000");
        $this->command->info("   Password   : Admin@123");
        $this->command->info("   Email      : admin@barangay.gov.ph");
        $this->command->warn("   ⚠  Please change the password after first login.");
    }
}
