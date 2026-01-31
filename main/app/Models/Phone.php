<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Phone extends Model
{
    /** @use HasFactory<\Database\Factories\PhoneFactory> */
    use HasFactory;

    protected $table = 'phones';
    protected $primaryKey = 'phone_id';
    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = [
    #    'phone_type',
        'phone_number',
  #      'network_name',
    ];

    // Relationships
    public function contact()
    {
        return $this->hasOne(Contact::class, 'phone_id', 'phone_id');
    }
}
