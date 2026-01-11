<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassificationHealthRisk extends Model
{
    /** @use HasFactory<\Database\Factories\ClassificationHealthRiskFactory> */
    use HasFactory;

    protected $table = 'classification_health_risks';
    protected $primaryKey = 'clah_id';
    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = [
        'clah_classification_name',
    ];

    // Relationships
    public function demographics()
    {
        return $this->hasMany(Demographic::class, 'clah_id', 'clah_id');
    }
}
