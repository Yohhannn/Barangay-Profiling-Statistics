<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        if ($user) {
            $cacheKey = 'last_activity_' . $user->sys_id;
            if (!Cache::has($cacheKey)) {
                $user->update(['last_activity' => now()]);
                Cache::put($cacheKey, true, 300);
            }
        }

        // Compute role name for sidebar/dashboard display
        $roleName = null;
        if ($user) {
            $roleKey = 'user_role_' . $user->sys_id;
            $roleName = Cache::remember($roleKey, 600, function () use ($user) {
                $userPermIds = \App\Models\SystemPermission::where('sys_id', $user->sys_id)
                    ->pluck('perm_id')->sort()->values()->toArray();
                $roles = \App\Models\Role::with('rolePermissions')->get();
                foreach ($roles as $role) {
                    $rolePermIds = $role->rolePermissions->pluck('perm_id')->sort()->values()->toArray();
                    if ($rolePermIds === $userPermIds) {
                        return $role->name;
                    }
                }
                return 'Custom';
            });
        }

        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $unreadCount = 0;
        if ($user) {
            $unreadKey = 'notif_unread_' . $user->sys_id;
            $unreadCount = Cache::remember($unreadKey, 30, function () use ($user) {
                return \App\Models\SystemNotification::where('sys_id', $user->sys_id)
                    ->whereNull('read_at')
                    ->count();
            });
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user() ? [
                    'sys_id'         => $request->user()->sys_id,
                    'sys_account_id' => $request->user()->sys_account_id,
                    'sys_fname'      => $request->user()->sys_fname,
                    'sys_lname'      => $request->user()->sys_lname,
                    'email'          => $request->user()->email,
                    'role'           => $roleName,
                    'permissions'    => $request->user()->permissionNames(),
                ] : null,
            ],
            'sidebarOpen'          => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'unreadNotifications'  => $unreadCount,
        ];
    }
}
