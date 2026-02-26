<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CitizenHistory extends Model
{
    /** @use HasFactory<\Database\Factories\CitizenHistoryFactory> */
    use HasFactory;

    protected $table = 'citizen_histories';
    protected $primaryKey = 'cihi_id';
    public $incrementing = true;

    protected $fillable = [
        'first_name',
        'last_name',
        'middle_name',
        'title',
        'description',
        'type',
        'status',
        'is_deleted',
        'delete_reason',
        'date_created',
        'date_updated',
        'encoded_by',
        'updated_by',
        'ctz_id',
    ];

    protected $casts = [
        'is_deleted' => 'boolean',
        'date_created' => 'timestamp',
        'date_updated' => 'timestamp',
    ];

    const UPDATED_AT = 'date_updated';
    const CREATED_AT = 'date_created';

    // Relationships
    public function encodedByAccount()
    {
        return $this->belongsTo(SystemAccount::class, 'encoded_by', 'sys_id');
    }

    public function updatedByAccount()
    {
        return $this->belongsTo(SystemAccount::class, 'updated_by', 'sys_id');
    }

    public function citizen()
    {
        return $this->belongsTo(Citizen::class, 'ctz_id', 'ctz_id');
    }

    public function settlementLogs()
    {
        return $this->hasMany(SettlementLog::class, 'cihi_id', 'cihi_id');
    }
}
