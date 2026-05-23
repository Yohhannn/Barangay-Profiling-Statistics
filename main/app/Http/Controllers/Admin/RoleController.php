<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\RolePermission;
use App\Models\SystemAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class RoleController extends Controller
{
    /**
     * Store a newly created role.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'          => 'required|string|max:100|unique:roles,name',
            'description'   => 'nullable|string|max:500',
            'permissions'   => 'required|array|min:1',
            'permissions.*' => 'integer|exists:permissions,perm_id',
        ], [
            'name.required'       => 'Role name is required.',
            'name.unique'         => 'This role name already exists.',
            'permissions.required'=> 'Please assign at least one permission.',
            'permissions.min'     => 'Please assign at least one permission.',
        ]);

        $role = Role::create([
            'name'         => strtoupper(trim($request->name)),
            'description'  => $request->description,
            'date_created' => now(),
            'created_by'   => Auth::id(),
        ]);

        foreach ($request->permissions as $permId) {
            RolePermission::create([
                'role_id' => $role->role_id,
                'perm_id' => $permId,
            ]);
        }

        if (Auth::check()) {
            \App\Models\AuditLog::create([
                'action_name' => 'CREATE',
                'description' => "roles: created \"{$role->name}\"",
                'sys_id'      => Auth::id(),
                'created_at'  => now(),
            ]);
        }

        return redirect()->back()->with('success', "Role \"{$role->name}\" created successfully.");
    }

    /**
     * Update an existing role and sync its permissions.
     */
    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        $request->validate([
            'name'          => 'required|string|max:100|unique:roles,name,' . $role->role_id . ',role_id',
            'description'   => 'nullable|string|max:500',
            'permissions'   => 'required|array|min:1',
            'permissions.*' => 'integer|exists:permissions,perm_id',
        ], [
            'name.required'       => 'Role name is required.',
            'name.unique'         => 'This role name already exists.',
            'permissions.required'=> 'Please assign at least one permission.',
            'permissions.min'     => 'Please assign at least one permission.',
        ]);

        $role->update([
            'name'        => strtoupper(trim($request->name)),
            'description' => $request->description,
        ]);

        // Sync permissions
        RolePermission::where('role_id', $role->role_id)->delete();
        foreach ($request->permissions as $permId) {
            RolePermission::create([
                'role_id' => $role->role_id,
                'perm_id' => $permId,
            ]);
        }

        if (Auth::check()) {
            \App\Models\AuditLog::create([
                'action_name' => 'UPDATE',
                'description' => "roles: updated \"{$role->name}\"",
                'sys_id'      => Auth::id(),
                'created_at'  => now(),
            ]);
        }

        return redirect()->back()->with('success', "Role \"{$role->name}\" updated successfully.");
    }

    /**
     * Delete a role (and its role_permissions entries).
     * Blocks deletion if any active staff accounts are currently assigned to this role.
     */
    public function destroy($id)
    {
        $role = Role::findOrFail($id);
        $roleName = $role->name;

        // Determine which accounts are "assigned" to this role by matching permission sets
        $rolePermIds = RolePermission::where('role_id', $role->role_id)
            ->pluck('perm_id')
            ->sort()
            ->values()
            ->toArray();

        $assignedCount = SystemAccount::where('is_deleted', false)
            ->where('sys_account_id', '!=', 100000)
            ->with('permissions')
            ->get()
            ->filter(function ($account) use ($rolePermIds) {
                $userPermIds = $account->permissions->pluck('perm_id')->sort()->values()->toArray();
                return $userPermIds === $rolePermIds;
            })
            ->count();

        if ($assignedCount > 0) {
            throw ValidationException::withMessages([
                'role' => ["{$assignedCount} active account(s) are currently assigned to \"{$roleName}\". Reassign them before deleting this role."],
            ]);
        }

        RolePermission::where('role_id', $role->role_id)->delete();
        $role->delete();

        if (Auth::check()) {
            \App\Models\AuditLog::create([
                'action_name' => 'DELETE',
                'description' => "roles: deleted \"{$roleName}\"",
                'sys_id'      => Auth::id(),
                'created_at'  => now(),
            ]);
        }

        return redirect()->back()->with('success', "Role \"{$roleName}\" deleted successfully.");
    }
}
