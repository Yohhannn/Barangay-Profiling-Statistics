<?php

namespace Database\Seeders;
use App\Models\SystemAccount;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // User::factory(10)->create();

        SystemAccount::factory()->count(5)->create();
        // $this->call(UserSeeder::class);
    }
}
