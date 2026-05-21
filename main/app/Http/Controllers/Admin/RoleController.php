<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\RolePermission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
     */
    public function destroy($id)
    {
        $role = Role::findOrFail($id);
        $roleName = $role->name;

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
