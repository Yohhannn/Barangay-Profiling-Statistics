<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Infrastructure extends Model
{
    /** @use HasFactory<\Database\Factories\InfrastructureFactory> */
    use HasFactory;

    protected static function booted()
    {
        static::creating(function ($infra) {
            if (empty($infra->inf_uuid)) {
                $year = substr(date('Y'), 2); // e.g. "26" for 2026
                do {
                    $random = str_pad(rand(100, 999), 3, '0', STR_PAD_LEFT);
                    $uuid = "inf-{$year}{$random}";
                } while (self::where('inf_uuid', $uuid)->exists());

                $infra->inf_uuid = $uuid;
            }
        });
    }

    protected $table = 'infrastructures';
    protected $primaryKey = 'inf_id';
    public $incrementing = true;

    protected $fillable = [
        'inf_uuid',
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
        'date_encoded' => 'datetime',
        'date_updated' => 'datetime',
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
