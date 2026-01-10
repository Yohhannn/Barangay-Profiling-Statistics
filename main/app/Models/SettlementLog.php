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
        'settlement_description',
        'date_of_settlement',
        'date_encoded',
        'date_updated',
        'is_deleted',
        'delete_reason',
        'encoded_by',
        'updated_by',
        'comp_id',
        'cihi_id',
    ];

    protected $casts = [
        'date_of_settlement' => 'date',
        'date_encoded' => 'date',
        'date_updated' => 'date',
        'is_deleted' => 'boolean',
    ];

    public $timestamps = false;

    // Relationships
    public function encodedByAccount()
    {
        return $this->belongsTo(SystemAccount::class, 'encoded_by', 'sys_id');
    }

    public function updatedByAccount()
    {
        return $this->belongsTo(SystemAccount::class, 'updated_by', 'sys_id');
    }

    public function complainant()
    {
        return $this->belongsTo(Complainant::class, 'comp_id', 'comp_id');
    }

    public function citizenHistory()
    {
        return $this->belongsTo(CitizenHistory::class, 'cihi_id', 'cihi_id');
    }
}
