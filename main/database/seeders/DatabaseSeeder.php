<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['sys_user_id' => 123456], // Match migration column
            [
                'sys_fname' => 'Test',
                'sys_lname' => 'Admin',
                'sys_password' => Hash::make('111111'), // Hashed 6-digit PIN
                'sys_role' => 'Admin',
                'sys_is_active' => true,
            ]
        );
    }
}
