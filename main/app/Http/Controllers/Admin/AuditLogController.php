<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AuditLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = AuditLog::with('account');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->whereHas('account', function ($q) use ($search) {
                    $q->where('sys_account_id', 'like', "%{$search}%")
                      ->orWhere('sys_fname', 'like', "%{$search}%")
                      ->orWhere('sys_lname', 'like', "%{$search}%");
                })->orWhere('action_name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('staff')) {
            $query->where('sys_id', $request->input('staff'));
        }

        if ($request->filled('action')) {
            $query->where('action_name', 'like', '%' . $request->input('action') . '%');
        }

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->input('start_date'));
        }

        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->input('end_date'));
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(15);

        // Format for frontend
        $logs->getCollection()->transform(function ($log) {
            return [
                'id' => $log->id,
                'user_id' => $log->account ? $log->account->sys_account_id : 'System',
                'staff_name' => $log->account ? trim($log->account->sys_fname . ' ' . $log->account->sys_lname) : 'System',
                'action_made' => 'Action ' . $log->action_name . ' on ' . $log->description,
                'timestamp' => $log->created_at ? Carbon::parse($log->created_at)->format('Y-m-d H:i:s.u') : null,
            ];
        });

        // Filter options
        $staffOptions = \App\Models\SystemAccount::select('sys_id', 'sys_fname', 'sys_lname')
            ->whereIn('sys_id', AuditLog::select('sys_id')->distinct())
            ->get()
            ->map(function ($account) {
                return [
                    'id' => $account->sys_id,
                    'name' => trim($account->sys_fname . ' ' . $account->sys_lname),
                ];
            });

        $actionOptions = ['INSERT', 'UPDATE', 'DELETE', 'EXPORT', 'LOGIN', 'LOGOUT'];

        return Inertia::render('admin/ActivityLogs/activity-logs', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'staff', 'action', 'start_date', 'end_date']),
            'staffOptions' => $staffOptions,
            'actionOptions' => $actionOptions,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(AuditLog $auditLog)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AuditLog $auditLog)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AuditLog $auditLog)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AuditLog $auditLog)
    {
        //
    }
}
