<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicalHistory extends Model
{
    /** @use HasFactory<\Database\Factories\MedicalHistoryFactory> */
    use HasFactory;

    protected $table = 'medical_histories';
    protected $primaryKey = 'mh_id';
    public $incrementing = true;

    protected $fillable = [
        'mh_uuid',
        'first_name',
        'last_name',
        'middle_name',
        'suffix',
        'type',
        'description',
        'date_diagnosed',
        'date_encoded',
        'date_updated',
        'is_deleted',
        'delete_reason',
        'encoded_by',
        'updated_by',
        'ctz_id',
    ];

    protected $casts = [
        'date_diagnosed' => 'date',
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

    public function citizen()
    {
        return $this->belongsTo(Citizen::class, 'ctz_id', 'ctz_id');
    }
}
