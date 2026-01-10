<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    /** @use HasFactory<\Database\Factories\RoleFactory> */
    use HasFactory;

    protected $table = 'roles';
    protected $primaryKey = 'role_id';
    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = [
        'name',
        'description',
        'date_created',
        'created_by',
    ];

    protected $casts = [
        'date_created' => 'date',
    ];

    // Relationships
    public function createdByAccount()
    {
        return $this->belongsTo(SystemAccount::class, 'created_by', 'sys_id');
    }

    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'role_permissions', 'role_id', 'perm_id', 'role_id', 'perm_id');
    }

    public function rolePermissions()
    {
        return $this->hasMany(RolePermission::class, 'role_id', 'role_id');
    }
}
