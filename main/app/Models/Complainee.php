<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Complainee extends Model
{
    protected $primaryKey = 'complainee_id';
    
    protected $fillable = [
        'first_name',
        'last_name',
        'middle_name',
        'ctz_id',
        'sett_id',
        'involvement_status',
    ];

    public function settlementLog()
    {
        return $this->belongsTo(SettlementLog::class, 'sett_id', 'sett_id');
    }

    public function citizen()
    {
        return $this->belongsTo(Citizen::class, 'ctz_id', 'ctz_id');
    }
}
