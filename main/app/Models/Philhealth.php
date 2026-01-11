<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Philhealth extends Model
{
    /** @use HasFactory<\Database\Factories\PhilhealthFactory> */
    use HasFactory;

    protected $table = 'philhealths';
    protected $primaryKey = 'phea_id';
    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = [
        'philhealth_id_number',
        'phea_membership_type',
        'category_name',
    ];

    // Relationships
    public function demographics()
    {
        return $this->hasMany(Demographic::class, 'phea_id', 'phea_id');
    }
}
