<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    // Use your custom table name
    protected $table = 'system_account';

    // Use your custom primary key
    protected $primaryKey = 'sys_id';

    // Disable standard timestamps as you use sys_date_encoded
    public $timestamps = false;

    protected $fillable = [
        'sys_user_id',
        'sys_password',
        'sys_fname',
        'sys_mname',
        'sys_lname',
        'sys_role',
        'sys_is_active',
    ];

    protected $hidden = [
        'sys_password',
        'remember_token',
    ];

    // Tell Laravel that 'sys_password' is the password field
    public function getAuthPassword()
    {
        return $this->sys_password;
    }

    // Tell Laravel that 'sys_user_id' is the unique identifier for login
    public function getAuthIdentifierName()
    {
        return 'sys_user_id';
    }
}
