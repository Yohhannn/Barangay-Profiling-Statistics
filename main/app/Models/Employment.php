<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employment extends Model
{
    /** @use HasFactory<\Database\Factories\EmploymentFactory> */
    use HasFactory;

    protected $table = 'employments';
    protected $primaryKey = 'emp_id';
    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = [
        'occupation',
        'status',
        'is_gov_worker',
    ];

    protected $casts = [
        'is_gov_worker' => 'boolean',
    ];

    // Relationships
    public function citizenInformation()
    {
        return $this->hasOne(CitizenInformation::class, 'emp_id', 'emp_id');
    }
}
