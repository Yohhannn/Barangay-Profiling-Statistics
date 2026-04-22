<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class businessInfo extends Model
{
    /** @use HasFactory<\Database\Factories\BusinessInfoFactory> */
    use HasFactory;

    protected $table = 'business_infos';
    protected $primaryKey = 'bs_id';
    public $incrementing = true;

    protected $fillable = [
        'bs_uuid',
        'name',
        'type',
        'description',
        'status',
        'is_dti',
        'dti_photo',
        'address',
        'date_encoded',
        'date_updated',
        'is_deleted',
        'delete_reason',
        'sitio_id',
        'encoded_by',
        'updated_by',
    ];

    protected $casts = [
        'is_dti'       => 'boolean',
        'date_encoded' => 'date',
        'date_updated' => 'date',
        'is_deleted'   => 'boolean',
    ];

    public $timestamps = false;

    // Relationships

    /** One business can have many owners */
    public function owners()
    {
        return $this->hasMany(BusinessOwner::class, 'bs_id', 'bs_id');
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
