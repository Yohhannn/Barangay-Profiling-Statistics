<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransactionLog extends Model
{
    /** @use HasFactory<\Database\Factories\TransactionLogFactory> */
    use HasFactory;

    protected static function booted()
    {
        static::creating(function ($trx) {
            if (empty($trx->tl_uuid)) {
                $year = substr(date('Y'), 2); // e.g. "26" for 2026
                do {
                    $random = str_pad(rand(100, 999), 3, '0', STR_PAD_LEFT);
                    $uuid = "trx-{$year}{$random}";
                } while (self::where('tl_uuid', $uuid)->exists());

                $trx->tl_uuid = $uuid;
            }
        });
    }

    protected $table = 'transaction_logs';
    protected $primaryKey = 'tl_id';
    public $incrementing = true;

    protected $fillable = [
        'tl_uuid',
        'date_requested',
        'type',
        'purpose',
        'status',
        'first_name',
        'last_name',
        'middle_name',
        'suffix',
        'date_encoded',
        'date_updated',
        'is_deleted',
        'delete_reason',
        'ctz_id',
        'encoded_by',
        'updated_by',
    ];

    protected $casts = [
        'date_requested' => 'date',
        'date_encoded' => 'datetime',
        'date_updated' => 'datetime',
        'is_deleted' => 'boolean',
    ];

    public $timestamps = false;

    // Relationships
    public function citizen()
    {
        return $this->belongsTo(Citizen::class, 'ctz_id', 'ctz_id');
    }

    public function encodedByAccount()
    {
        return $this->belongsTo(SystemAccount::class, 'encoded_by', 'sys_id');
    }

    public function updatedByAccount()
    {
        return $this->belongsTo(SystemAccount::class, 'updated_by', 'sys_id');
    }
}
