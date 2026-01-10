<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FamilyPlanning extends Model
{
    /** @use HasFactory<\Database\Factories\FamilyPlanningFactory> */
    use HasFactory;

    protected $table = 'family_plannings';
    protected $primaryKey = 'fp_id';
    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = [
        'start_date',
        'end_date',
        'status',
        'method',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    // Relationships
    public function demographics()
    {
        return $this->hasMany(Demographic::class, 'fp_id', 'fp_id');
    }
}
