<?php

namespace App\Services;

use App\Models\Permission;
use App\Models\SystemAccount;
use App\Models\SystemNotification;
use App\Models\SystemPermission;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

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

    /**
     * Send a security alert to all admins (users with "View Account" permission).
     * Optionally also notifies a specific user (the subject of the alert).
     */
    public static function sendAlert(
        string $title,
        string $message,
        ?string $link = null,
        ?int $alsoNotifyUserId = null
    ): void {
        try {
            $permId = Permission::where('name', 'View Account')->value('perm_id');
            $adminIds = $permId
                ? SystemPermission::where('perm_id', $permId)->pluck('sys_id')->toArray()
                : [];

            $targetIds = array_unique(
                $alsoNotifyUserId
                    ? array_merge($adminIds, [$alsoNotifyUserId])
                    : $adminIds
            );

            $activeIds = SystemAccount::whereIn('sys_id', $targetIds)
                ->where('is_deleted', false)
                ->pluck('sys_id')
                ->toArray();

            foreach ($activeIds as $uid) {
                self::createForUser($uid, 'alert', $title, $message, $link);
                // Bust the unread-count cache so the badge updates on next page load
                Cache::forget('notif_unread_' . $uid);
            }
        } catch (\Exception $e) {
            // Never let alert failures break the main action
        }
    }

    /**
     * Track a repeatable action and fire an alert when the threshold is exceeded
     * within the given time window.
     *
     * @param string   $cacheKey   Unique key for this action + actor
     * @param int      $threshold  How many times before alerting
     * @param int      $windowSecs Time window in seconds
     * @param callable $onAlert    Called once when threshold is first crossed
     */
    public static function trackAndAlert(
        string $cacheKey,
        int $threshold,
        int $windowSecs,
        callable $onAlert
    ): void {
        try {
            $count = Cache::get($cacheKey, 0) + 1;
            Cache::put($cacheKey, $count, $windowSecs);
            if ($count === $threshold) {
                $onAlert($count);
            }
        } catch (\Exception $e) {
            // Silent
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
