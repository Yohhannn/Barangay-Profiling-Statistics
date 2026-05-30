<?php

namespace App\Http\Middleware;

use App\Services\NotificationService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Enforce permission-based access control on routes.
 *
 * Usage in routes:
 *   Route::middleware('permission:View Citizen Profile')
 *   Route::middleware('permission:View Citizen Profile,Create Citizen Profile')  // any
 */
class CheckPermission
{
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = Auth::user();

        if (!$user) {
            return redirect('/login');
        }

        // Check if deleted
        if ($user->is_deleted) {
            Auth::logout();
            return redirect('/login')->withErrors(['account' => 'Your account has been deactivated.']);
        }

        // Check if user has any of the required permissions
        if (!empty($permissions) && !$user->hasAnyPermission($permissions)) {
            // Alert admins about repeated unauthorized access attempts
            NotificationService::trackAndAlert(
                "unauth_access_{$user->sys_id}",
                3,   // alert after 3 denied attempts
                300, // 5-minute window
                function () use ($user, $request, $permissions) {
                    $resource = implode(' / ', $permissions);
                    NotificationService::sendAlert(
                        'Repeated Unauthorized Access Attempts',
                        "Account #{$user->sys_account_id} ({$user->sys_fname} {$user->sys_lname}) attempted to access \"{$resource}\" without permission (3+ times in 5 minutes).",
                        '/activity-logs'
                    );
                }
            );

            if ($request->inertia()) {
                return back(303)->withErrors(['permission' => 'You do not have permission to access this resource.']);
            }
            abort(403, 'You do not have permission to access this resource.');
        }

        return $next($request);
    }
}
