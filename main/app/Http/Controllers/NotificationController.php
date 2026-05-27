<?php

namespace App\Http\Controllers;

use App\Models\SystemNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Return paginated notifications for the current user.
     */
    public function index()
    {
        $notifications = SystemNotification::where('sys_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(fn($n) => [
                'id'        => $n->notif_id,
                'type'      => $n->type,
                'title'     => $n->title,
                'message'   => $n->message,
                'link'      => $n->link,
                'read'      => $n->read_at !== null,
                'createdAt' => $n->created_at?->toISOString(),
            ]);

        return response()->json([
            'notifications' => $notifications,
            'unreadCount'   => SystemNotification::where('sys_id', Auth::id())
                ->whereNull('read_at')
                ->count(),
        ]);
    }

    /**
     * Return only the unread count (lightweight poll endpoint).
     */
    public function unreadCount()
    {
        return response()->json([
            'unreadCount' => SystemNotification::where('sys_id', Auth::id())
                ->whereNull('read_at')
                ->count(),
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markRead($id)
    {
        SystemNotification::where('notif_id', $id)
            ->where('sys_id', Auth::id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read for the current user.
     */
    public function markAllRead()
    {
        SystemNotification::where('sys_id', Auth::id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    /**
     * Delete a notification.
     */
    public function destroy($id)
    {
        SystemNotification::where('notif_id', $id)
            ->where('sys_id', Auth::id())
            ->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Clear all read notifications for the current user.
     */
    public function clearRead()
    {
        SystemNotification::where('sys_id', Auth::id())
            ->whereNotNull('read_at')
            ->delete();

        return response()->json(['success' => true]);
    }
}
