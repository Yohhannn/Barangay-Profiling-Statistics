<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EducationStatus extends Model
{
    /** @use HasFactory<\Database\Factories\EducationStatusFactory> */
    use HasFactory;

    protected $table = 'education_statuses';
    protected $primaryKey = 'edu_id';
    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = [
        'is_current_student',
        'institution_name',
        'education_level',
        'edu_hist',
    ];

    protected $casts = [
        'is_current_student' => 'boolean',
    ];

    // Relationships
    public function eduHistory()
    {
        return $this->belongsTo(EduHistory::class, 'edu_hist', 'edu_hist');
    }

    // Alias
    public function educationHistory() { return $this->eduHistory(); }

    public function demographics()
    {
        return $this->hasMany(Demographic::class, 'edu_id', 'edu_id');
    }
}
