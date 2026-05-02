<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

trait Auditable
{
    /**
     * Boot the trait to listen for Eloquent events.
     */
    public static function bootAuditable()
    {
        static::created(function ($model) {
            self::logAction($model, 'INSERT');
        });

        static::updated(function ($model) {
            $isArchived = false;

            // Check if this was an archive action (is_deleted column changed to true)
            if (array_key_exists('is_deleted', $model->getAttributes())) {
                if ($model->wasChanged('is_deleted') && $model->is_deleted) {
                    $isArchived = true;
                }
            }

            if ($isArchived) {
                self::logAction($model, 'DELETE');
            } else {
                self::logAction($model, 'UPDATE');
            }
        });

        static::deleted(function ($model) {
            self::logAction($model, 'DELETE');
        });
    }

    /**
     * Format and save the action to AuditLog.
     */
    protected static function logAction($model, $actionType)
    {
        // Get currently authenticated system account, default to 1 (System) if none
        $sysId = Auth::id() ?? 1;

        $tableName = $model->getTable();
        $primaryKey = $model->getKeyName();
        $id = $model->getAttribute($primaryKey);

        AuditLog::create([
            'action_name' => $actionType,
            'description' => "{$tableName} ID = {$id}",
            'sys_id'      => $sysId,
            'created_at'  => now(),
        ]);
    }
}
