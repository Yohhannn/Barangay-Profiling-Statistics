<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EduHistory extends Model
{
    /** @use HasFactory<\Database\Factories\EduHistoryFactory> */
    use HasFactory;

    protected $table = 'edu_histories';

    // Primary key is 'edu_hist', not 'id'
    protected $primaryKey = 'edu_hist';
    public $incrementing = true;

    // --- FIX: DISABLE TIMESTAMPS ---
    public $timestamps = false;

    protected $fillable = [
        'elementary_name',
        'highschool_name',
        'sr_highschool_name',
    ];

    // Relationships
    public function educationStatus()
    {
        return $this->hasOne(EducationStatus::class, 'edu_hist', 'edu_hist');
    }
}
