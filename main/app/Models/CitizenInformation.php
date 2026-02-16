<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CitizenInformation extends Model
{
    /** @use HasFactory<\Database\Factories\CitizenInformationFactory> */
    use HasFactory;

    protected $table = 'citizen_informations';
    protected $primaryKey = 'ctz_info_id';
    public $timestamps = false;

    protected $fillable = [
        'first_name',
        'last_name',
        'middle_name',
        'suffix',
        'date_of_birth',
        'place_of_birth',
        'sex',
        'photo',
        'civil_status',
        'blood_type',
        'religion',
        'is_deceased',
        'date_of_death',
        'cause_of_death',
        'is_registered_voter',
        'is_indigenous',
        'relationship_type',
        'hh_id',
        'sitio_id',
        'emp_id',
        'con_id',
        'demo_id',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'date_of_death' => 'date',
        'is_deceased' => 'boolean',
        'is_registered_voter' => 'boolean',
        'is_indigenous' => 'boolean',
    ];

    // Relationships
    public function householdInfo()
    {
        return $this->belongsTo(HouseholdInfo::class, 'hh_id', 'hh_id');
    }

    public function sitio()
    {
        return $this->belongsTo(Sitio::class, 'sitio_id', 'sitio_id');
    }

    public function employment()
    {
        return $this->belongsTo(Employment::class, 'emp_id', 'emp_id');
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class, 'con_id', 'con_id');
    }

    public function demographic()
    {
        return $this->belongsTo(demographic::class, 'demo_id', 'demo_id');
    }

    public function citizens()
    {
        return $this->hasMany(Citizen::class, 'ctz_info_id', 'ctz_info_id');
    }
}
