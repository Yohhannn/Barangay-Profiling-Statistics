<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    /** @use HasFactory<\Database\Factories\ContactFactory> */
    use HasFactory;

    protected $table = 'contacts';
    protected $primaryKey = 'con_id';
    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = [
        'email',
        'others',
        'phone_id',
    ];

    // Relationships
    public function phone()
    {
        return $this->belongsTo(Phone::class, 'phone_id', 'phone_id');
    }

    public function citizenInformation()
    {
        return $this->hasOne(CitizenInformation::class, 'con_id', 'con_id');
    }
}
