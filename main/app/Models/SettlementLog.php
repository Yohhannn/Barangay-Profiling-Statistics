<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SettlementLog extends Model
{
    /** @use HasFactory<\Database\Factories\SettlementLogFactory> */
    use HasFactory;

    protected $table = 'settlement_logs';
    protected $primaryKey = 'sett_id';
    public $incrementing = true;

    protected $fillable = [
        'sett_uuid',
        'complaint_description',
        'settlement_description',
        'mediator',
        'case_classification',
        'date_of_settlement',
        'date_encoded',
        'date_updated',
        'is_deleted',
        'delete_reason',
        'encoded_by',
        'updated_by',
    ];

    protected $casts = [
        'date_of_settlement' => 'date',
        'date_encoded' => 'date',
        'date_updated' => 'date',
        'is_deleted' => 'boolean',
    ];

    public $timestamps = false;

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->sett_uuid)) {
                do {
                    $uuid = 'SETT-' . str_pad(mt_rand(0, 9999), 4, '0', STR_PAD_LEFT);
                } while (static::where('sett_uuid', $uuid)->exists());
                $model->sett_uuid = $uuid;
            }
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

    public function complainants()
    {
        return $this->hasMany(Complainant::class, 'sett_id', 'sett_id');
    }

    public function citizenHistories()
    {
        return $this->hasMany(CitizenHistory::class, 'sett_id', 'sett_id');
    }

    public function complainees()
    {
        return $this->hasMany(Complainee::class, 'sett_id', 'sett_id');
    }
}
