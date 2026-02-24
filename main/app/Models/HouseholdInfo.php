<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HouseholdInfo extends Model
{
    /** @use HasFactory<\Database\Factories\HouseholdInfoFactory> */
    use HasFactory;

    protected $table = 'household_infos';
    protected $primaryKey = 'hh_id';
    public $incrementing = true;

    protected $fillable = [
        'hh_uuid', // Added: Allow filling this (though we auto-generate it)
        'house_number',
        'address',
        'ownership_status',
        'home_photo',
        'home_map',
        'home_link',
        'interviewer_name',
        'reviewer_name',
        'date_visited',
        'is_deleted',
        'delete_reason',
        'water_type',
        'toilet_type',
        'date_encoded',
        'date_updated',
        'sitio_id',
        'encoded_by',
        'updated_by',
    ];

    protected $casts = [
        'date_visited' => 'date',
        'is_deleted' => 'boolean',
        'date_encoded' => 'datetime',
        'date_updated' => 'datetime',
    ];

    public $timestamps = false;

    /**
     * The "booted" method of the model.
     * Automatically generates the HH-UUID (e.g., HH-0042) before creating a record.
     */
    protected static function booted()
    {
        static::creating(function ($household) {
            // Only generate if not already set manually
            if (empty($household->hh_uuid)) {
                $unique = false;
                $code = '';

                // Loop to ensure the random number is unique in the database
                while (!$unique) {
                    // Generate random 4 digit number (0000-9999)
                    $number = str_pad(mt_rand(0, 9999), 4, '0', STR_PAD_LEFT);
                    $code = 'HH-' . $number;

                    // Check database if this specific code exists
                    if (!static::where('hh_uuid', $code)->exists()) {
                        $unique = true;
                    }
                }

                $household->hh_uuid = $code;
            }
        });
    }

    // Relationships
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

    public function citizens()
    {
        // Adjusted to use 'hh_id' as that is your primary key
        return $this->hasMany(Citizen::class, 'hh_id', 'hh_id');
    }
}
