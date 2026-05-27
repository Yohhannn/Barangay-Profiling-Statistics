<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemNotification extends Model
{
    protected $table = 'system_notifications';
    protected $primaryKey = 'notif_id';
    public $timestamps = false;

    protected $fillable = [
        'sys_id',
        'type',
        'title',
        'message',
        'link',
        'read_at',
        'created_at',
    ];

    protected $casts = [
        'read_at'    => 'datetime',
        'created_at' => 'datetime',
    ];

    public function account()
    {
        return $this->belongsTo(SystemAccount::class, 'sys_id', 'sys_id');
    }

    public function isRead(): bool
    {
        return $this->read_at !== null;
    }
}
