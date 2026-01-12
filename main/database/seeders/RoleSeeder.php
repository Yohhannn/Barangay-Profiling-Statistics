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
        DB::table('roles')->insert([
            ['name' => 'SR_OFFICE','description' => 'SR_OFFICE ACCOUNT (VIEW DASHBOARD AND DELETE ABILITY)','date_created' => now(),'created_by' => 1],
            ['name' => 'OFFICE','description' => 'OFFICE ACCOUNT','date_created' => now(),'created_by' => 1],
            ['name' => 'OFFICE_ENCODER','description' => 'OFFICE ENCODER ACCOUNT','date_created' => now(),'created_by' => 1],
            ['name' => 'SR_BPSO','description' => 'SR BPSO ACCOUNT','date_created' => now(),'created_by' => 1],
            ['name' => 'BPSO','description' => 'BPSO ACCOUNT','date_created' => now(),'created_by' => 1],
            ['name' => 'SR_BHW','description' => 'SR BHW ACCOUNT','date_created' => now(),'created_by' => 1],
            ['name' => 'BHW','description' => 'BHW ACCOUNT','date_created' => now(),'created_by' => 1],
        ]);
    }
}
