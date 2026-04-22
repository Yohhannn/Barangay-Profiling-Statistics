<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessOwner extends Model
{
    use HasFactory;

    protected $table = 'business_owners';
    protected $primaryKey = 'bo_id';
    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = [
        'bo_fname',
        'bo_lname',
        'bo_mname',
        'bs_id',
        'ctz_id',
    ];

    // Relationships

    public function business()
    {
        return $this->belongsTo(businessInfo::class, 'bs_id', 'bs_id');
    }

    public function citizen()
    {
        return $this->belongsTo(Citizen::class, 'ctz_id', 'ctz_id');
    }
}
