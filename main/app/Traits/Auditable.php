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
        static::registerModelEvent('created', function ($model) {
            self::logAction($model, 'INSERT');
        });

        static::registerModelEvent('updated', function ($model) {
            $actionType = 'UPDATE';

            // Check for Archive or Restore actions
            if (array_key_exists('is_deleted', $model->getAttributes())) {
                if ($model->wasChanged('is_deleted')) {
                    if ($model->is_deleted) {
                        $actionType = 'DELETE'; // Archived
                    } else {
                        $actionType = 'RESTORE'; // Restored
                    }
                }
            }

            self::logAction($model, $actionType);
        });

        static::registerModelEvent('deleted', function ($model) {
            self::logAction($model, 'DELETE');
        });
    }

    /**
     * Explicitly log a VIEW action.
     * Can be called from controllers when a record is viewed.
     */
    public function logView()
    {
        self::logAction($this, 'VIEW');
    }

    /**
     * Format and save the action to AuditLog.
     */
    public static function logAction($model, $actionType)
    {
        $sysId = Auth::id() ?? 1;

        $tableName  = $model->getTable();
        $primaryKey = $model->getKeyName();
        $id         = $model->getAttribute($primaryKey);

        $uuidCol    = property_exists($model, 'auditUuidColumn') ? $model->auditUuidColumn : null;
        $identifier = ($uuidCol && !empty($model->getAttribute($uuidCol)))
            ? $model->getAttribute($uuidCol)
            : "ID={$id}";

        AuditLog::create([
            'action_name' => $actionType,
            'description' => "{$tableName} {$identifier}",
            'sys_id'      => $sysId,
            'created_at'  => now(),
        ]);
    }
}
