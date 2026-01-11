<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    /** @use HasFactory<\Database\Factories\PermissionFactory> */
    use HasFactory;

    protected $table = 'permissions';
    protected $primaryKey = 'perm_id';
    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = [
        'name',
        'category',
    ];

    // Relationships
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_permissions', 'perm_id', 'role_id', 'perm_id', 'role_id');
    }

    public function rolePermissions()
    {
        return $this->hasMany(RolePermission::class, 'perm_id', 'perm_id');
    }

    public function systemPermissions()
    {
        return $this->hasMany(SystemPermission::class, 'perm_id', 'perm_id');
    }
}
