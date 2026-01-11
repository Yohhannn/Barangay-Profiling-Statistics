<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sitio extends Model
{
    /** @use HasFactory<\Database\Factories\SitioFactory> */
    use HasFactory;

    protected $table = 'sitios';
    protected $primaryKey = 'sitio_id';
    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = [
        'sitio_name',
    ];

    // Relationships
    public function citizenInformations()
    {
        return $this->hasMany(CitizenInformation::class, 'sitio_id', 'sitio_id');
    }

    public function householdInfos()
    {
        return $this->hasMany(HouseholdInfo::class, 'sitio_id', 'sitio_id');
    }

    public function infrastructures()
    {
        return $this->hasMany(Infrastructure::class, 'sitio_id', 'sitio_id');
    }

    public function businessInfos()
    {
        return $this->hasMany(BusinessInfo::class, 'sitio_id', 'sitio_id');
    }
}
