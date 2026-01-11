<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EduHistory extends Model
{
    /** @use HasFactory<\Database\Factories\EduHistoryFactory> */
    use HasFactory;

    protected $table = 'edu_histories';
    protected $primaryKey = 'edu_hist';
    public $incrementing = true;

    protected $fillable = [
        'elementary_name',
        'highschool_name',
        'sr_highschool_name',
    ];

    protected $casts = [
        'created_at' => 'timestamp',
        'updated_at' => 'timestamp',
    ];

    // Relationships
    public function educationStatus()
    {
        return $this->hasOne(EducationStatus::class, 'edu_hist', 'edu_hist');
    }
}
