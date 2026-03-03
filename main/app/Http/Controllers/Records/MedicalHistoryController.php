<?php

namespace App\Http\Controllers\Records;

use App\Http\Controllers\Controller;
use App\Models\MedicalHistory;
use Illuminate\Http\Request;

class MedicalHistoryController extends Controller
{
    public function index(Request $request)
    {
        $query = MedicalHistory::with(['citizen', 'encodedByAccount', 'updatedByAccount'])
            ->where('is_deleted', false);

        if ($request->filled('search')) {
            $search = strtolower($request->search);
            $query->where(function ($q) use ($search) {
                $q->whereRaw("LOWER(first_name) LIKE ?", ["%{$search}%"])
                  ->orWhereRaw("LOWER(last_name) LIKE ?", ["%{$search}%"])
                  ->orWhereRaw("LOWER(type) LIKE ?", ["%{$search}%"]);
            });
        }

        if ($request->filled('type') && $request->type !== 'All') {
            $query->where('type', $request->type);
        }

        $records = $query->orderBy('date_encoded', 'desc')->get()->map(function($history) {
            $encodedByName = $history->encodedByAccount ? trim($history->encodedByAccount->sys_fname . ' ' . $history->encodedByAccount->sys_lname) : 'Unknown User';
            $updatedByName = $history->updatedByAccount ? trim($history->updatedByAccount->sys_fname . ' ' . $history->updatedByAccount->sys_lname) : $encodedByName;

            return [
                'id' => $history->mh_id,
                'uuid' => $history->mh_uuid,
                'citizenId' => $history->citizen ? $history->citizen->ctz_uuid : 'Manual Entry',
                'ctz_id' => $history->ctz_id,
                'firstName' => $history->first_name,
                'middleName' => $history->middle_name ?? '',
                'lastName' => $history->last_name,
                'type' => $history->type,
                'description' => $history->description,
                'dateDiagnosed' => $history->date_diagnosed ? \Carbon\Carbon::parse($history->date_diagnosed)->format('Y-m-d') : 'N/A',
                // Audit
                'dateEncoded' => $history->date_encoded ? \Carbon\Carbon::parse($history->date_encoded)->format('Y-m-d | h:i A') : 'N/A',
                'encodedBy' => $encodedByName,
                'dateUpdated' => $history->date_updated ? \Carbon\Carbon::parse($history->date_updated)->format('Y-m-d | h:i A') : 'N/A',
                'updatedBy' => $history->date_updated ? $updatedByName : 'N/A',
            ];
        });

        return \Inertia\Inertia::render('main/CitizenRecords/medical-history', [
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
            'histories.*.description' => 'required|string|max:5000',
            'histories.*.date_diagnosed' => 'nullable|date',
        ]);

        try {
            \Illuminate\Support\Facades\DB::beginTransaction();

            $encodedBy = \Illuminate\Support\Facades\Auth::id() ?? 1;
            $now = now();

            foreach ($validated['citizens'] as $citizen) {
                foreach ($validated['histories'] as $history) {
                    MedicalHistory::create([
                        'mh_uuid'     => 'MH-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT),
                        'first_name'  => $citizen['first_name'],
                        'middle_name' => $citizen['middle_name'] ?? null,
                        'last_name'   => $citizen['last_name'],
                        'ctz_id'      => $citizen['citizen_id'] ?? null,
                        'type'        => $history['type'],
                        'description' => $history['description'],
                        'date_diagnosed' => $history['date_diagnosed'] ?? null,
                        'date_encoded' => $now,
                        'encoded_by'  => $encodedBy,
                    ]);
                }
            }

            \Illuminate\Support\Facades\DB::commit();

            return redirect()->back()->with('success', 'Medical history added successfully.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to create medical record: ' . $e->getMessage()]);
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
            'histories.*.description' => 'required|string|max:5000',
            'histories.*.date_diagnosed' => 'nullable|date',
        ]);

        try {
            \Illuminate\Support\Facades\DB::beginTransaction();

            $record = MedicalHistory::where('mh_id', $id)->firstOrFail();
            $updatedBy = \Illuminate\Support\Facades\Auth::id() ?? 1;
            $now = now();

            $firstCitizen = $validated['citizens'][0];
            $firstHistory = $validated['histories'][0];

            $record->update([
                'first_name'  => $firstCitizen['first_name'],
                'middle_name' => $firstCitizen['middle_name'] ?? null,
                'last_name'   => $firstCitizen['last_name'],
                'ctz_id'      => $firstCitizen['citizen_id'] ?? null,
                'type'        => $firstHistory['type'],
                'description' => $firstHistory['description'],
                'date_diagnosed' => $firstHistory['date_diagnosed'] ?? null,
                'date_updated' => $now,
                'updated_by'  => $updatedBy,
            ]);

            $isFirstCombination = true;

            foreach ($validated['citizens'] as $citizen) {
                foreach ($validated['histories'] as $history) {
                    if ($isFirstCombination) {
                        $isFirstCombination = false;
                        continue;
                    }
                    
                    MedicalHistory::create([
                        'mh_uuid'     => 'MH-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT),
                        'first_name'  => $citizen['first_name'],
                        'middle_name' => $citizen['middle_name'] ?? null,
                        'last_name'   => $citizen['last_name'],
                        'ctz_id'      => $citizen['citizen_id'] ?? null,
                        'type'        => $history['type'],
                        'description' => $history['description'],
                        'date_diagnosed' => $history['date_diagnosed'] ?? null,
                        'date_encoded' => $now,
                        'encoded_by'  => $updatedBy,
                    ]);
                }
            }

            \Illuminate\Support\Facades\DB::commit();

            return redirect()->back()->with('success', 'Medical history updated successfully.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to update medical record: ' . $e->getMessage()]);
        }
    }

    public function destroy(Request $request, $id)
    {
        $validated = $request->validate([
            'delete_reason' => 'required|string|max:1000'
        ]);

        try {
            \Illuminate\Support\Facades\DB::beginTransaction();
            
            $record = MedicalHistory::where('mh_id', $id)->firstOrFail();
            $record->is_deleted = true;
            $record->delete_reason = $validated['delete_reason'];
            $record->save();

            \Illuminate\Support\Facades\DB::commit();

            return redirect()->back()->with('success', 'Medical record successfully moved to archive.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to archive medical record: ' . $e->getMessage()]);
        }
    }
}
