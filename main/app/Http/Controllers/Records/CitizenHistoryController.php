<?php

namespace App\Http\Controllers\Records;

use App\Http\Controllers\Controller;
use App\Models\CitizenHistory;
use Illuminate\Http\Request;

class CitizenHistoryController extends Controller
{
    public function index(Request $request)
    {
        $query = CitizenHistory::with(['citizen', 'encodedByAccount', 'updatedByAccount'])
            ->where('is_deleted', false);

        // Optional filtering by search and type
        if ($request->filled('search')) {
            $search = strtolower($request->search);
            $query->where(function ($q) use ($search) {
                $q->whereRaw("LOWER(title) LIKE ?", ["%{$search}%"])
                  ->orWhereRaw("LOWER(first_name) LIKE ?", ["%{$search}%"])
                  ->orWhereRaw("LOWER(last_name) LIKE ?", ["%{$search}%"]);
            });
        }

        if ($request->filled('type') && $request->type !== 'All') {
            $query->where('type', $request->type);
        }

        $records = $query->orderBy('date_created', 'desc')->get()->map(function($history) {
            $encodedByName = $history->encodedByAccount ? trim($history->encodedByAccount->sys_fname . ' ' . $history->encodedByAccount->sys_lname) : 'Unknown User';
            $updatedByName = $history->updatedByAccount ? trim($history->updatedByAccount->sys_fname . ' ' . $history->updatedByAccount->sys_lname) : $encodedByName;

            return [
                'id' => $history->cihi_id,
                'citizenId' => $history->citizen ? $history->citizen->ctz_uuid : 'Manual Entry',
                'ctz_id' => $history->ctz_id,
                'firstName' => $history->first_name,
                'middleName' => $history->middle_name ?? '',
                'lastName' => $history->last_name,
                'type' => $history->type,
                'title' => $history->title,
                'description' => $history->description,
                'status' => $history->status,
                'dateRecorded' => $history->date_created ? \Carbon\Carbon::parse($history->date_created)->format('Y-m-d') : 'N/A',
                // Audit
                'dateEncoded' => $history->date_created ? \Carbon\Carbon::parse($history->date_created)->format('Y-m-d | h:i A') : 'N/A',
                'encodedBy' => $encodedByName,
                'dateUpdated' => $history->date_updated ? \Carbon\Carbon::parse($history->date_updated)->format('Y-m-d | h:i A') : 'N/A',
                'updatedBy' => $history->date_updated ? $updatedByName : 'N/A',
            ];
        });

        return \Inertia\Inertia::render('main/CitizenRecords/citizen-history', [
            'histories' => $records,
            'filters' => [
                'search' => $request->search ?? '',
                'type' => $request->type ?? 'All'
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'citizen_id'  => 'nullable|integer|exists:citizens,ctz_id',
            'first_name'  => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name'   => 'required|string|max:255',
            'type'        => 'required|string',
            'title'       => 'required|string|max:255',
            'description' => 'required|string|max:5000',
            'status'      => 'required|string',
        ]);

        try {
            \Illuminate\Support\Facades\DB::beginTransaction();

            CitizenHistory::create([
                'first_name'  => $validated['first_name'],
                'middle_name' => $validated['middle_name'] ?? null,
                'last_name'   => $validated['last_name'],
                'ctz_id'      => $validated['citizen_id'] ?? null,
                'title'       => $validated['title'],
                'type'        => $validated['type'],
                'description' => $validated['description'],
                'status'      => $validated['status'],
                'encoded_by'  => \Illuminate\Support\Facades\Auth::id() ?? 1,
            ]);

            \Illuminate\Support\Facades\DB::commit();

            return redirect()->back()->with('success', 'Citizen history added successfully.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to create history record: ' . $e->getMessage()]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'citizen_id'  => 'nullable|integer|exists:citizens,ctz_id',
            'first_name'  => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name'   => 'required|string|max:255',
            'type'        => 'required|string',
            'title'       => 'required|string|max:255',
            'description' => 'required|string|max:5000',
            'status'      => 'required|string',
        ]);

        try {
            \Illuminate\Support\Facades\DB::beginTransaction();

            $history = CitizenHistory::where('cihi_id', $id)->firstOrFail();

            $history->update([
                'first_name'  => $validated['first_name'],
                'middle_name' => $validated['middle_name'] ?? null,
                'last_name'   => $validated['last_name'],
                'ctz_id'      => $validated['citizen_id'] ?? null,
                'title'       => $validated['title'],
                'type'        => $validated['type'],
                'description' => $validated['description'],
                'status'      => $validated['status'],
                'updated_by'  => \Illuminate\Support\Facades\Auth::id() ?? 1,
            ]);

            \Illuminate\Support\Facades\DB::commit();

            return redirect()->back()->with('success', 'Citizen history updated successfully.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to update history record: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, $id)
    {
        $validated = $request->validate([
            'delete_reason' => 'required|string|max:1000'
        ]);

        try {
            \Illuminate\Support\Facades\DB::beginTransaction();
            
            $history = CitizenHistory::where('cihi_id', $id)->firstOrFail();
            $history->is_deleted = true;
            $history->delete_reason = $validated['delete_reason'];
            $history->save();

            \Illuminate\Support\Facades\DB::commit();

            return redirect()->back()->with('success', 'History record successfully moved to archive.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to archive history record: ' . $e->getMessage()]);
        }
    }
}
