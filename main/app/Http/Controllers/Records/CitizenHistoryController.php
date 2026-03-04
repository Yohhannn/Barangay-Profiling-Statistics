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
                'cihi_uuid' => $history->cihi_uuid,
                'citizenId' => $history->citizen ? $history->citizen->ctz_uuid : 'Manual Entry',
                'ctz_id' => $history->ctz_id,
                'firstName' => $history->first_name,
                'middleName' => $history->middle_name ?? '',
                'lastName' => $history->last_name,
                'type' => $history->type,
                'title' => $history->title,
                'description' => $history->description,
                'status' => $history->status,
                'involvementType' => $history->involvement_type,
                'caseClassification' => $history->case_classification,
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'citizens' => 'required|array|min:1',
            'citizens.*.citizen_id'  => 'nullable|integer|exists:citizens,ctz_id',
            'citizens.*.first_name'  => 'required|string|max:255',
            'citizens.*.middle_name' => 'nullable|string|max:255',
            'citizens.*.last_name'   => 'required|string|max:255',
            'histories' => 'required|array|min:1',
            'histories.*.type'        => 'required|string',
            'histories.*.title'       => 'required|string|max:255',
            'histories.*.description' => 'required|string|max:5000',
            'histories.*.status'      => 'required|string',
        ]);

        try {
            \Illuminate\Support\Facades\DB::beginTransaction();

            $encodedBy = \Illuminate\Support\Facades\Auth::id() ?? 1;

            foreach ($validated['citizens'] as $citizen) {
                foreach ($validated['histories'] as $history) {
                    CitizenHistory::create([
                        'first_name'  => $citizen['first_name'],
                        'middle_name' => $citizen['middle_name'] ?? null,
                        'last_name'   => $citizen['last_name'],
                        'ctz_id'      => $citizen['citizen_id'] ?? null,
                        'title'       => $history['title'],
                        'type'        => $history['type'],
                        'description' => $history['description'],
                        'status'      => $history['status'],
                        'involvement_type' => $history['involvement_type'] ?? null,
                        'case_classification' => $history['case_classification'] ?? null,
                        'encoded_by'  => $encodedBy,
                    ]);
                }
            }

            \Illuminate\Support\Facades\DB::commit();

            return redirect()->back()->with('success', 'Citizen history added successfully.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to create history record: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'citizens' => 'required|array|min:1',
            'citizens.*.citizen_id'  => 'nullable|integer|exists:citizens,ctz_id',
            'citizens.*.first_name'  => 'required|string|max:255',
            'citizens.*.middle_name' => 'nullable|string|max:255',
            'citizens.*.last_name'   => 'required|string|max:255',
            'histories' => 'required|array|min:1',
            'histories.*.type'        => 'required|string',
            'histories.*.title'       => 'required|string|max:255',
            'histories.*.description' => 'required|string|max:5000',
            'histories.*.status'      => 'required|string',
            'histories.*.involvement_type' => 'nullable|string|max:255',
        ]);

        try {
            \Illuminate\Support\Facades\DB::beginTransaction();

            $historyRecord = CitizenHistory::where('cihi_id', $id)->firstOrFail();
            $updatedBy = \Illuminate\Support\Facades\Auth::id() ?? 1;

            $firstCitizen = $validated['citizens'][0];
            $firstHistory = $validated['histories'][0];

            $historyRecord->update([
                'first_name'  => $firstCitizen['first_name'],
                'middle_name' => $firstCitizen['middle_name'] ?? null,
                'last_name'   => $firstCitizen['last_name'],
                'ctz_id'      => $firstCitizen['citizen_id'] ?? null,
                'title'       => $firstHistory['title'],
                'type'        => $firstHistory['type'],
                'description' => $firstHistory['description'],
                'status'      => $firstHistory['status'],
                'involvement_type' => $firstHistory['involvement_type'] ?? null,
                'case_classification' => $firstHistory['case_classification'] ?? null,
                'updated_by'  => $updatedBy,
            ]);

            $isFirstCombination = true;

            foreach ($validated['citizens'] as $citizen) {
                foreach ($validated['histories'] as $history) {
                    if ($isFirstCombination) {
                        $isFirstCombination = false;
                        continue;
                    }
                    
                    CitizenHistory::create([
                        'first_name'  => $citizen['first_name'],
                        'middle_name' => $citizen['middle_name'] ?? null,
                        'last_name'   => $citizen['last_name'],
                        'ctz_id'      => $citizen['citizen_id'] ?? null,
                        'title'       => $history['title'],
                        'type'        => $history['type'],
                        'description' => $history['description'],
                        'status'      => $history['status'],
                        'involvement_type' => $history['involvement_type'] ?? null,
                        'case_classification' => $history['case_classification'] ?? null,
                        'encoded_by'  => $updatedBy,
                    ]);
                }
            }

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

    public function verifyHistoryLink(Request $request)
    {
        $query = $request->query('id');
        if (empty($query)) return response()->json(['found' => false]);

        // If it's a 4-digit number, search for matching last 4 digits of UUID
        if (is_numeric($query) && strlen($query) === 4) {
            $history = CitizenHistory::where('cihi_uuid', 'LIKE', "%-{$query}")
                ->where('is_deleted', false)
                ->first();
        } else {
            $history = CitizenHistory::where('cihi_uuid', $query)
                ->where('is_deleted', false)
                ->first();
        }

        if ($history) {
            return response()->json([
                'found' => true,
                'id' => $history->cihi_id, 
                'uuid' => $history->cihi_uuid,
                'title' => $history->title,
                'date' => $history->date_created ? \Carbon\Carbon::parse($history->date_created)->format('M d, Y') : 'N/A',
                'status' => $history->status,
                'type' => $history->type,
                'is_linked' => !empty($history->sett_id),
                'linked_to' => $history->sett_id
            ]);
        }
        return response()->json(['found' => false]);
    }

    public function getRecentHistories()
    {
        $histories = CitizenHistory::where('is_deleted', false)
            ->orderBy('date_created', 'desc')
            ->take(5)
            ->get()
            ->map(function($h) {
                return [
                    'id' => $h->cihi_id,
                    'uuid' => $h->cihi_uuid,
                    'title' => $h->title,
                    'type' => $h->type,
                    'status' => $h->status,
                    'name' => trim($h->first_name . ' ' . $h->last_name),
                    'date' => $h->date_created ? \Carbon\Carbon::parse($h->date_created)->format('M d, Y') : 'N/A',
                    'is_assigned' => !empty($h->sett_id),
                    'sett_id' => $h->sett_id
                ];
            });

        return response()->json($histories);
    }

    public function search(Request $request)
    {
        $search = strtolower($request->query('q', ''));
        if (empty($search)) return response()->json([]);

        $results = CitizenHistory::with('citizen')
            ->where('is_deleted', false)
            ->where(function($q) use ($search) {
                $q->whereRaw("LOWER(title) LIKE ?", ["%{$search}%"])
                  ->orWhereRaw("LOWER(first_name) LIKE ?", ["%{$search}%"])
                  ->orWhereRaw("LOWER(last_name) LIKE ?", ["%{$search}%"])
                  ->orWhere('cihi_uuid', 'LIKE', "%{$search}%");
            })
            ->limit(10)
            ->get()
            ->map(function($h) {
                return [
                    'id' => $h->cihi_id,
                    'uuid' => $h->cihi_uuid,
                    'name' => trim($h->first_name . ' ' . $h->last_name),
                    'first_name' => $h->first_name,
                    'middle_name' => $h->middle_name,
                    'last_name' => $h->last_name,
                    'title' => $h->title,
                    'type' => $h->type,
                    'status' => $h->status,
                    'citizen_id' => $h->citizen ? 'CTZ-' . $h->citizen->ctz_id : null,
                    'date' => $h->date_created ? \Carbon\Carbon::parse($h->date_created)->format('M d, Y') : 'N/A',
                    'is_assigned' => !empty($h->sett_id),
                    'sett_id' => $h->sett_id
                ];
            });

        return response()->json($results);
    }
}
