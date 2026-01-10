<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SocioEconomicStatus extends Model
{
    /** @use HasFactory<\Database\Factories\SocioEconomicStatusFactory> */
    use HasFactory;

    protected $table = 'socio_economic_statuses';
    protected $primaryKey = 'soec_id';
    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = [
        'soec_status',
        'soec_number',
    ];

    // Relationships
    public function demographics()
    {
        return $this->hasMany(Demographic::class, 'soec_id', 'soec_id');
    }
}
