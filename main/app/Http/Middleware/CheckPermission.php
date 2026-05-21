<?php

namespace App\Http\Middleware;

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
            if ($request->inertia()) {
                return back(303)->withErrors(['permission' => 'You do not have permission to access this resource.']);
            }
            abort(403, 'You do not have permission to access this resource.');
        }

        return $next($request);
    }
}
