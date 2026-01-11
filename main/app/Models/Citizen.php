<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Citizen extends Model
{
    /** @use HasFactory<\Database\Factories\CitizenFactory> */
    use HasFactory;

    protected $table = 'citizens';
    protected $primaryKey = 'ctz_id';
    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = [
        'ctz_number',
        'is_deleted',
        'deleted_reason',
        'date_encoded',
        'date_updated',
        'hh_id',
        'updated_by',
        'encoded_by',
        'ctz_info_id',
    ];

    protected $casts = [
        'is_deleted' => 'boolean',
        'date_encoded' => 'date',
        'date_updated' => 'date',
    ];

    // Relationships
    public function householdInfo()
    {
        return $this->belongsTo(HouseholdInfo::class, 'hh_id', 'hh_id');
    }

    public function updatedByAccount()
    {
        return $this->belongsTo(SystemAccount::class, 'updated_by', 'sys_id');
    }

    public function encodedByAccount()
    {
        return $this->belongsTo(SystemAccount::class, 'encoded_by', 'sys_id');
    }

    public function citizenInformation()
    {
        return $this->belongsTo(CitizenInformation::class, 'ctz_info_id', 'ctz_info_id');
    }

    public function histories()
    {
        return $this->hasMany(CitizenHistory::class, 'ctz_id', 'ctz_id');
    }

    public function medicalHistories()
    {
        return $this->hasMany(MedicalHistory::class, 'ctz_id', 'ctz_id');
    }

    public function complainants()
    {
        return $this->hasMany(Complainant::class, 'ctz_id', 'ctz_id');
    }

    public function transactionLogs()
    {
        return $this->hasMany(TransactionLog::class, 'ctz_id', 'ctz_id');
    }

    public function infrastructures()
    {
        return $this->hasMany(Infrastructure::class, 'ctz_id', 'ctz_id');
    }

    public function businessInfos()
    {
        return $this->hasMany(BusinessInfo::class, 'ctz_id', 'ctz_id');
    }
}
