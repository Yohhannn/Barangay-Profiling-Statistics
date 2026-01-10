<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemPermission extends Model
{
    /** @use HasFactory<\Database\Factories\SystemPermissionFactory> */
    use HasFactory;

    protected $table = 'system_permissions';
    protected $primaryKey = 'sys_perm_id';
    public $incrementing = true;

    protected $fillable = [
        'sys_id',
        'perm_id',
    ];

    // Relationships
    public function account()
    {
        return $this->belongsTo(SystemAccount::class, 'sys_id', 'sys_id');
    }

    public function permission()
    {
        return $this->belongsTo(Permission::class, 'perm_id', 'perm_id');
    }
}
