<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExportLog extends Model
{
    use HasFactory;

    protected $table = 'export_logs';
    protected $primaryKey = 'EL_ID';
    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = [
        'tl_id',
        'exported_by',
        'date_time_exported',
    ];

    protected $casts = [
        'date_time_exported' => 'datetime',
    ];

    public function transaction()
    {
        return $this->belongsTo(TransactionLog::class, 'tl_id', 'tl_id');
    }

    public function exportedByAccount()
    {
        return $this->belongsTo(SystemAccount::class, 'exported_by', 'sys_id');
    }
}
