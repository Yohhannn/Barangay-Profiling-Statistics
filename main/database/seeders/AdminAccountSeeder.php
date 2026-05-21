<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class AdminAccountSeeder extends Seeder
{
    /**
     * @deprecated The hardcoded admin account (100000) has been removed.
     *             SR_OFFICE accounts (seeded via StaffAccountSeeder) now have full admin access.
     *             This seeder is kept as a no-op to avoid breaking any references.
     */
    public function run(): void
    {
        $this->command->warn('AdminAccountSeeder is deprecated and does nothing.');
        $this->command->warn('Use StaffAccountSeeder instead — SR_OFFICE accounts have full admin access.');
    }
}
