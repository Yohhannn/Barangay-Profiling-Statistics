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
        'cihi_uuid',
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

    protected static function booted()
    {
        static::creating(function ($history) {
            do {
                $uuid = 'CIHI-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
            } while (self::where('cihi_uuid', $uuid)->exists());

            $history->cihi_uuid = $uuid;
        });
    }

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
