<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemAccount;
use App\Models\SystemPermission;
use App\Models\RolePermission;
use App\Models\Permission;
use App\Models\Role;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SystemAccountController extends Controller
{
    /**
     * Display active accounts listing.
     */
    public function index()
    {
        if (Auth::check()) {
            \App\Models\AuditLog::create([
                'action_name' => 'VIEW',
                'description' => 'system_accounts LIST',
                'sys_id'      => Auth::id(),
                'created_at'  => now(),
            ]);
        }

        $roles = Role::with('rolePermissions')->get()->map(fn($role) => [
            'role_id'        => $role->role_id,
            'name'           => $role->name,
            'description'    => $role->description,
            'permission_ids' => $role->rolePermissions->pluck('perm_id')->values()->toArray(),
        ]);

        $allPermissions = Permission::all()
            ->groupBy('category')
            ->map(fn($perms, $cat) => [
                'category'    => $cat,
                'permissions' => $perms->map(fn($p) => [
                    'perm_id' => $p->perm_id,
                    'name'    => $p->name,
                ])->values(),
            ])->values();

        $accounts = $this->mapAccounts(
            SystemAccount::where('is_deleted', false)->where('sys_account_id', '!=', 100000)->with('permissions')->get(),
            $roles
        );

        $deletedAccounts = $this->mapAccounts(
            SystemAccount::where('is_deleted', true)->where('sys_account_id', '!=', 100000)->with('permissions')->get(),
            $roles
        );

        return Inertia::render('admin/AdminPanel/manage-accounts', [
            'accounts'        => $accounts,
            'deletedAccounts' => $deletedAccounts,
            'roles'           => $roles,
            'allPermissions'  => $allPermissions,
        ]);
    }

    /**
     * Store a newly created staff account.
     */
    public function store(Request $request)
    {
        $request->validate([
            'sys_fname'    => 'required|string|max:255',
            'sys_mname'    => 'nullable|string|max:255',
            'sys_lname'    => 'required|string|max:255',
            'email'        => 'nullable|email|max:255|unique:system_accounts,email',
            'sys_password' => 'required|string|min:6',
            'role_id'      => 'nullable|integer|exists:roles,role_id',
            'permissions'  => 'required|array|min:1',
            'permissions.*'=> 'integer|exists:permissions,perm_id',
        ], [
            'sys_fname.required'   => 'First name is required.',
            'sys_lname.required'   => 'Last name is required.',
            'email.email'          => 'The email must be a valid email address.',
            'email.unique'         => 'This email is already in use.',
            'sys_password.required'=> 'Password is required.',
            'sys_password.min'     => 'Password must be at least 6 characters.',
            'permissions.required' => 'Please select at least one permission.',
            'permissions.min'      => 'Please select at least one permission.',
        ]);

        // Auto-generate unique 6-digit account ID
        $maxId = SystemAccount::max('sys_account_id') ?? 100000;
        $newId = max($maxId + 1, 100001);

        $account = SystemAccount::create([
            'sys_account_id' => $newId,
            'role_id'        => $request->role_id ?: null,
            'sys_fname'      => $request->sys_fname,
            'sys_mname'      => $request->sys_mname,
            'sys_lname'      => $request->sys_lname,
            'email'          => $request->email ?: null,
            'sys_password'   => bcrypt($request->sys_password),
            'is_deleted'     => false,
            'date_created'   => now(),
        ]);

        // Assign selected permissions
        foreach ($request->permissions as $permId) {
            SystemPermission::create([
                'sys_id'  => $account->sys_id,
                'perm_id' => $permId,
            ]);
        }

        $fullName = trim($account->sys_fname . ' ' . $account->sys_lname);
        NotificationService::notifyByPermission(
            'View Account',
            'account',
            'New Staff Account Created',
            "{$fullName} has been added as a staff member.",
            '/admin-panel/manage-accounts'
        );

        return redirect()->back()->with('success', "Account created. ID: {$account->sys_account_id}");
    }

    /**
     * Update a staff account.
     */
    public function update(Request $request, $id)
    {
        $account = SystemAccount::findOrFail($id);

        $request->validate([
            'sys_fname'    => 'required|string|max:255',
            'sys_mname'    => 'nullable|string|max:255',
            'sys_lname'    => 'required|string|max:255',
            'email'        => 'nullable|email|max:255|unique:system_accounts,email,' . $account->sys_id . ',sys_id',
            'sys_password' => 'nullable|string|min:6',
            'role_id'      => 'nullable|integer|exists:roles,role_id',
            'permissions'  => 'required|array|min:1',
            'permissions.*'=> 'integer|exists:permissions,perm_id',
        ], [
            'sys_fname.required'  => 'First name is required.',
            'sys_lname.required'  => 'Last name is required.',
            'email.email'         => 'The email must be a valid email address.',
            'email.unique'        => 'This email is already in use.',
            'sys_password.min'    => 'Password must be at least 6 characters.',
            'permissions.required'=> 'Please select at least one permission.',
            'permissions.min'     => 'Please select at least one permission.',
        ]);

        $updateData = [
            'sys_fname' => $request->sys_fname,
            'sys_mname' => $request->sys_mname,
            'sys_lname' => $request->sys_lname,
            'email'     => $request->email ?: null,
            'role_id'   => $request->role_id ?: null,
        ];

        if ($request->filled('sys_password')) {
            $updateData['sys_password'] = bcrypt($request->sys_password);
        }

        $account->update($updateData);

        // Capture old permission IDs before wiping
        $oldPermIds = SystemPermission::where('sys_id', $account->sys_id)
            ->pluck('perm_id')->toArray();
        $newPermIds = array_map('intval', $request->permissions);

        // Sync permissions: wipe old, insert new
        SystemPermission::where('sys_id', $account->sys_id)->delete();
        foreach ($request->permissions as $permId) {
            SystemPermission::create([
                'sys_id'  => $account->sys_id,
                'perm_id' => $permId,
            ]);
        }

        // Alert if permissions were escalated (newly added high-privilege perms)
        $addedPermIds = array_diff($newPermIds, $oldPermIds);
        if (!empty($addedPermIds)) {
            $addedNames = Permission::whereIn('perm_id', $addedPermIds)->pluck('name')->toArray();
            $highPriv   = array_filter($addedNames, fn($n) =>
                stripos($n, 'Delete') !== false ||
                stripos($n, 'Account') !== false ||
                stripos($n, 'Archive') !== false ||
                stripos($n, 'Export') !== false
            );
            if (!empty($highPriv)) {
                $fullName  = trim($account->sys_fname . ' ' . $account->sys_lname);
                $permList  = implode(', ', array_values($highPriv));
                NotificationService::sendAlert(
                    'Permission Escalation Detected',
                    "High-privilege permissions were granted to {$fullName} (Account #{$account->sys_account_id}): {$permList}.",
                    '/admin-panel/manage-accounts'
                );
            }
        }

        return redirect()->back()->with('success', 'Account updated successfully.');
    }

    /**
     * Soft-delete (deactivate) a staff account.
     */
    public function destroy(Request $request, $id)
    {
        $request->validate([
            'delete_reason' => 'required|string|max:500',
        ], [
            'delete_reason.required' => 'A reason for deactivation is required.',
        ]);

        $account = SystemAccount::findOrFail($id);
        $account->update([
            'is_deleted'    => true,
            'delete_reason' => $request->delete_reason,
        ]);

        $fullName = trim($account->sys_fname . ' ' . $account->sys_lname);
        NotificationService::notifyByPermission(
            'View Account',
            'account',
            'Staff Account Deactivated',
            "{$fullName}'s account has been deactivated.",
            '/admin-panel/manage-accounts'
        );

        return redirect()->back()->with('success', 'Account deactivated successfully.');
    }

    /**
     * Restore a soft-deleted staff account.
     */
    public function restore($id)
    {
        $account = SystemAccount::findOrFail($id);
        $account->update([
            'is_deleted'    => false,
            'delete_reason' => null,
        ]);

        if (Auth::check()) {
            \App\Models\AuditLog::create([
                'action_name' => 'RESTORE',
                'description' => "system_accounts ID = {$account->sys_id} restored",
                'sys_id'      => Auth::id(),
                'created_at'  => now(),
            ]);
        }

        $fullName = trim($account->sys_fname . ' ' . $account->sys_lname);
        NotificationService::notifyByPermission(
            'View Account',
            'account',
            'Staff Account Reactivated',
            "{$fullName}'s account has been reactivated.",
            '/admin-panel/manage-accounts'
        );

        return redirect()->back()->with('success', 'Account restored successfully.');
    }

    /**
     * Log a view action when account details are opened.
     */
    public function logView($id)
    {
        $account = SystemAccount::findOrFail($id);

        \App\Models\AuditLog::create([
            'action_name' => 'VIEW',
            'description' => "system_accounts {$account->sys_account_id}",
            'sys_id'      => Auth::id() ?? 1,
            'created_at'  => now(),
        ]);

        return response()->json(['status' => 'success']);
    }

    /* ------------------------------------------------------------------ */
    /* Internal helper                                                     */
    /* ------------------------------------------------------------------ */

    private function mapAccounts($collection, $roles)
    {
        return $collection->map(function ($account) use ($roles) {
            $userPermIds = $account->permissions->pluck('perm_id')->map(fn($id) => (int) $id)->toArray();
            sort($userPermIds);

            $matchedRoleName = 'Custom';
            $matchedRoleId   = null;

            // Prefer the explicitly stored role_id
            if ($account->role_id) {
                $found = $roles->firstWhere('role_id', $account->role_id);
                if ($found) {
                    $matchedRoleName = $found['name'];
                    $matchedRoleId   = $found['role_id'];
                }
            }

            // Fallback: infer from exact permission match (for legacy accounts without role_id)
            if ($matchedRoleId === null) {
                foreach ($roles as $role) {
                    $rolePermIds = array_map('intval', $role['permission_ids']);
                    sort($rolePermIds);
                    if ($rolePermIds === $userPermIds) {
                        $matchedRoleName = $role['name'];
                        $matchedRoleId   = $role['role_id'];
                        break;
                    }
                }
            }

            return [
                'id'           => $account->sys_id,
                'userId'       => (string) $account->sys_account_id,
                'firstName'    => $account->sys_fname,
                'middleName'   => $account->sys_mname ?? '',
                'lastName'     => $account->sys_lname,
                'email'        => $account->email ?? null,
                'role'         => $matchedRoleName,
                'roleId'       => $matchedRoleId,
                'permissions'  => $userPermIds,
                'isActive'     => ! $account->is_deleted,
                'deleteReason' => $account->delete_reason ?? null,
                'lastLogin'    => $account->last_login ? $account->last_login->format('Y-m-d H:i') : 'Never',
                'lastActivity' => $account->last_activity ? $account->last_activity->format('Y-m-d H:i') : 'Never',
                'dateEncoded'  => $account->date_created ? $account->date_created->format('Y-m-d') : 'N/A',
                'encodedBy'    => 'SYSTEM',
                'dateUpdated'  => 'N/A',
                'updatedBy'    => 'N/A',
            ];
        });
    }
}
