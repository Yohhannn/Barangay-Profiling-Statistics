<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Use the first system account's sys_id to satisfy the FK on created_by.
        // If no accounts exist yet, fall back to 0 (or skip constraint check via seeder order).
        $createdBy = DB::table('system_accounts')->value('sys_id') ?? 1;

        DB::table('roles')->insert([
            ['name' => 'SR_OFFICE',      'description' => 'SR_OFFICE ACCOUNT', 'date_created' => now(), 'created_by' => $createdBy],
            ['name' => 'OFFICE',         'description' => 'OFFICE ACCOUNT',         'date_created' => now(), 'created_by' => $createdBy],
            ['name' => 'OFFICE_ENCODER', 'description' => 'OFFICE ENCODER ACCOUNT', 'date_created' => now(), 'created_by' => $createdBy],
            ['name' => 'SR_BPSO',        'description' => 'SR BPSO ACCOUNT',        'date_created' => now(), 'created_by' => $createdBy],
            ['name' => 'BPSO',           'description' => 'BPSO ACCOUNT',           'date_created' => now(), 'created_by' => $createdBy],
            ['name' => 'SR_BHW',         'description' => 'SR BHW ACCOUNT',         'date_created' => now(), 'created_by' => $createdBy],
            ['name' => 'BHW',            'description' => 'BHW ACCOUNT',            'date_created' => now(), 'created_by' => $createdBy],
        ]);
    }

}
