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
                'sys_fname' => 'SR_OFFICE',
                'sys_account_id' => 111111,
                'sys_password' => Hash::make('111111'),
            ];

        }else if($userAccount == 2){
            $info = [
                'sys_fname' => 'OFFICE',
                'sys_account_id' => 222222,
                'sys_password' => Hash::make('111111'),
            ];
        }else if($userAccount == 3){
            $info = [
                'sys_fname' => 'OFFICE ENCODER',
                'sys_account_id' => 333333,
                'sys_password' => Hash::make('111111'),
            ];
        }else if($userAccount == 4){
            $info = [
                'sys_fname' => 'SR_BPSO',
                'sys_account_id' => 444444,
                'sys_password' => Hash::make('111111'),
            ];
        }else if($userAccount == 5){
            $info = [
                'sys_fname' => 'BPSO',
                'sys_account_id' => 555555,
                'sys_password' => Hash::make('111111'),
            ];
        }else if($userAccount == 6){
            $info = [
                'sys_fname' => 'SR_BHW',
                'sys_account_id' => 666666,
                'sys_password' => Hash::make('111111'),
            ];
        }else if($userAccount == 7){
            $info = [
                'sys_fname' => 'BHW',
                'sys_account_id' => 777777,
                'sys_password' => Hash::make('111111'),
            ];
        }else{
            $info = [
                'sys_fname' => $this->faker->firstName(),
                'sys_account_id' => rand(100000,999999),
                'sys_password' => Hash::make('111111'),
            ];
        }
        return [
            ...$info,
            'sys_mname' => $this->faker->lastName(),
            'sys_lname' => $this->faker->lastName(),
            'is_deleted' => false,
            'delete_reason' => null,
            'date_created' => now(),
        ];
    }
}
