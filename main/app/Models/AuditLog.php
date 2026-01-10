<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    /** @use HasFactory<\Database\Factories\AuditLogFactory> */
    use HasFactory;

    protected $table = 'audit_logs';
    protected $primaryKey = 'id';
    public $incrementing = true;

    protected $fillable = [
        'action_name',
        'description',
        'created_at',
        'sys_id',
    ];

    protected $casts = [
        'created_at' => 'date',
    ];

    const UPDATED_AT = null;
    const CREATED_AT = 'created_at';

    // Relationships
    public function account()
    {
        return $this->belongsTo(SystemAccount::class, 'sys_id', 'sys_id');
    }
}
