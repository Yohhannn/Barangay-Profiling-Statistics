<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\SystemAccount;
use Illuminate\Support\Facades\Hash;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SystemAccount>
 */
class SystemAccountFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = SystemAccount::class;
    public function definition(): array
    {
        static $userAccount = 0;
        $info = [];
        $userAccount++;
        if($userAccount == 1){
            $info = [
                'sys_account_id' => 123456,
                'sys_password' => Hash::make('adminpass'),
            ];
        }else if($userAccount == 2){
            $info = [
                'sys_account_id' => 111111,
                'sys_password' => Hash::make('adminpass'),
            ];

        }else if($userAccount == 3){
            $info = [
                'sys_account_id' => 222222,
                'sys_password' => Hash::make('adminpass'),
            ];
        }else{
            $info = [
                'sys_account_id' => rand(100000,999999),
                'sys_password' => Hash::make('adminpass'),
            ];
        }
        return [
            ...$info,
            'sys_fname' => $this->faker->firstName(),
            'sys_mname' => $this->faker->lastName(),
            'sys_lname' => $this->faker->lastName(),
            'is_deleted' => false,
            'delete_reason' => null,
            'date_created' => now(),
        ];
    }
}
