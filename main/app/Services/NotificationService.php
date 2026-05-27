<?php

namespace App\Services;

use App\Models\Permission;
use App\Models\SystemAccount;
use App\Models\SystemNotification;
use App\Models\SystemPermission;
use Illuminate\Support\Facades\Auth;

class NotificationService
{
    /**
     * Send a notification to all active users who have a specific permission.
     * Excludes the current authenticated user (the actor) by default.
     */
    public static function notifyByPermission(
        string $permissionName,
        string $type,
        string $title,
        string $message,
        ?string $link = null,
        bool $excludeActor = true
    ): void {
        try {
            $permId = Permission::where('name', $permissionName)->value('perm_id');
            if (!$permId) return;

            $userIds = SystemPermission::where('perm_id', $permId)->pluck('sys_id');
            $users = SystemAccount::whereIn('sys_id', $userIds)
                ->where('is_deleted', false)
                ->get();

            $actorId = $excludeActor ? Auth::id() : null;

            foreach ($users as $user) {
                if ($actorId && $user->sys_id === $actorId) continue;
                self::createForUser($user->sys_id, $type, $title, $message, $link);
            }
        } catch (\Exception $e) {
            // Never let notification failures break the main action
        }
    }

    /**
     * Send a notification to specific users by their permission.
     * Includes the actor (useful for confirming own actions).
     */
    public static function notifyAllByPermission(
        string $permissionName,
        string $type,
        string $title,
        string $message,
        ?string $link = null
    ): void {
        self::notifyByPermission($permissionName, $type, $title, $message, $link, false);
    }

    /**
     * Send a notification to a specific user.
     */
    public static function notifyUser(
        int $userId,
        string $type,
        string $title,
        string $message,
        ?string $link = null
    ): void {
        try {
            self::createForUser($userId, $type, $title, $message, $link);
        } catch (\Exception $e) {
            // Never let notification failures break the main action
        }
    }

    private static function createForUser(
        int $userId,
        string $type,
        string $title,
        string $message,
        ?string $link
    ): void {
        SystemNotification::create([
            'sys_id'     => $userId,
            'type'       => $type,
            'title'      => $title,
            'message'    => $message,
            'link'       => $link,
            'created_at' => now(),
        ]);
    }
}
