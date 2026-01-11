<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemAccountLog extends Model
{
    /** @use HasFactory<\Database\Factories\SystemAccountLogFactory> */
    use HasFactory;

    protected $table = 'system_account_logs';
    protected $primaryKey = 'id';
    public $incrementing = true;

    protected $fillable = [
        'action',
        'description',
        'created_at',
        'sys_id',
    ];

    protected $casts = [
        'created_at' => 'timestamp',
    ];

    const UPDATED_AT = null;

    // Relationships
    public function account()
    {
        return $this->belongsTo(SystemAccount::class, 'sys_id', 'sys_id');
    }
}
