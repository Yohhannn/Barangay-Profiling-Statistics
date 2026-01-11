<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HouseholdInfo extends Model
{
    /** @use HasFactory<\Database\Factories\HouseholdInfoFactory> */
    use HasFactory;

    protected $table = 'household_infos';
    protected $primaryKey = 'hh_id';
    public $incrementing = true;

    protected $fillable = [
        'house_number',
        'address',
        'ownership_status',
        'home_photo',
        'home_map',
        'interviewer_name',
        'reviewer_name',
        'date_visited',
        'is_deleted',
        'delete_reason',
        'water_type',
        'toilet_type',
        'date_encoded',
        'date_updated',
        'sitio_id',
        'encoded_by',
        'updated_by',
    ];

    protected $casts = [
        'date_visited' => 'date',
        'is_deleted' => 'boolean',
        'date_encoded' => 'date',
        'date_updated' => 'date',
    ];

    public $timestamps = false;

    // Relationships
    public function sitio()
    {
        return $this->belongsTo(Sitio::class, 'sitio_id', 'sitio_id');
    }

    public function encodedByAccount()
    {
        return $this->belongsTo(SystemAccount::class, 'encoded_by', 'sys_id');
    }

    public function updatedByAccount()
    {
        return $this->belongsTo(SystemAccount::class, 'updated_by', 'sys_id');
    }

    public function citizens()
    {
        return $this->hasMany(Citizen::class, 'hh_id', 'hh_id');
    }
}
