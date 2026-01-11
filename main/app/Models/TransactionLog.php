<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransactionLog extends Model
{
    /** @use HasFactory<\Database\Factories\TransactionLogFactory> */
    use HasFactory;

    protected $table = 'transaction_logs';
    protected $primaryKey = 'tl_id';
    public $incrementing = true;

    protected $fillable = [
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
        'date_encoded' => 'date',
        'date_updated' => 'date',
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
