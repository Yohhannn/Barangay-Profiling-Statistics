<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class demographic extends Model
{
    /** @use HasFactory<\Database\Factories\DemographicFactory> */
    use HasFactory;

    protected $table = 'demographics';
    protected $primaryKey = 'demo_id';
    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = [
        'soec_id',
        'clah_id',
        'fp_id',
        'edu_id',
        'phea_id',
    ];

    // Relationships
    public function socioEconomicStatus()
    {
        return $this->belongsTo(SocioEconomicStatus::class, 'soec_id', 'soec_id');
    }

    public function classificationHealthRisk()
    {
        return $this->belongsTo(ClassificationHealthRisk::class, 'clah_id', 'clah_id');
    }

    // Alias
    public function socioEconomic() { return $this->socioEconomicStatus(); }
    public function healthRisk() { return $this->classificationHealthRisk(); }

    public function familyPlanning()
    {
        return $this->belongsTo(FamilyPlanning::class, 'fp_id', 'fp_id');
    }

    public function educationStatus()
    {
        return $this->belongsTo(EducationStatus::class, 'edu_id', 'edu_id');
    }

    public function philhealth()
    {
        return $this->belongsTo(Philhealth::class, 'phea_id', 'phea_id');
    }

    public function citizenInformations()
    {
        return $this->hasMany(CitizenInformation::class, 'demo_id', 'demo_id');
    }
}
