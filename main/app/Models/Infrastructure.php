<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Infrastructure extends Model
{
    /** @use HasFactory<\Database\Factories\InfrastructureFactory> */
    use HasFactory;

    protected $table = 'infrastructures';
    protected $primaryKey = 'inf_id';
    public $incrementing = true;

    protected $fillable = [
        'name',
        'type',
        'owner_fname',
        'owner_lname',
        'owner_mname',
        'owner_suffix',
        'description',
        'address_description',
        'date_encoded',
        'date_updated',
        'is_deleted',
        'delete_reason',
        'ctz_id',
        'sitio_id',
        'encoded_by',
        'updated_by',
    ];

    protected $casts = [
        'date_encoded' => 'date',
        'date_updated' => 'date',
        'is_deleted' => 'boolean',
    ];

    public $timestamps = false;

    // Relationships
    public function citizen()
    {
        return $this->belongsTo(Citizen::class, 'ctz_id', 'ctz_id');
    }

    public function sitio()
    {
        return $this->belongsTo(Sitio::class, 'sitio_id', 'sitio_id');
    }

    public function encodedByAccount()
    {
        return $this->belongsTo(SystemAccount::class, 'encoded_by', 'sys_id');
    }

    public function updatedByAccount()
    {
        return $this->belongsTo(SystemAccount::class, 'updated_by', 'sys_id');
    }
}
