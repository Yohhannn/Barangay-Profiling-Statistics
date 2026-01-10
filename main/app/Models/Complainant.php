<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Complainant extends Model
{
    /** @use HasFactory<\Database\Factories\ComplainantFactory> */
    use HasFactory;

    protected $table = 'complainants';
    protected $primaryKey = 'comp_id';
    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = [
        'first_name',
        'last_name',
        'middle_name',
        'suffix',
        'comp_description',
        'ctz_id',
    ];

    // Relationships
    public function citizen()
    {
        return $this->belongsTo(Citizen::class, 'ctz_id', 'ctz_id');
    }

    public function settlementLogs()
    {
        return $this->hasMany(SettlementLog::class, 'comp_id', 'comp_id');
    }
}
