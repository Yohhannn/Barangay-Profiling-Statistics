<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RolePermission extends Model
{
    /** @use HasFactory<\Database\Factories\RolePermissionFactory> */
    use HasFactory;

    protected $table = 'role_permissions';
    protected $primaryKey = 'role_perm_id';
    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = [
        'role_id',
        'perm_id',
    ];

    // Relationships
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id', 'role_id');
    }

    public function permission()
    {
        return $this->belongsTo(Permission::class, 'perm_id', 'perm_id');
    }
}
