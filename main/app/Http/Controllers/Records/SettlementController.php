<?php

namespace App\Http\Controllers\Records;

use App\Http\Controllers\Controller;
use App\Models\SettlementLog;
use App\Models\Complainant;
use App\Models\CitizenHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class SettlementController extends Controller
{
    public function index(Request $request)
    {
        $query = SettlementLog::with(['complainants', 'citizenHistories', 'encodedByAccount', 'updatedByAccount'])
            ->where('is_deleted', false);

        if ($request->filled('search')) {
            $search = strtolower($request->search);
            $query->whereHas('complainants', function ($q) use ($search) {
                $q->whereRaw("LOWER(first_name) LIKE ?", ["%{$search}%"])
                  ->orWhereRaw("LOWER(last_name) LIKE ?", ["%{$search}%"]);
            })->orWhereHas('citizenHistories', function ($q) use ($search) {
                $q->whereRaw("LOWER(first_name) LIKE ?", ["%{$search}%"])
                  ->orWhereRaw("LOWER(last_name) LIKE ?", ["%{$search}%"]);
            });
        }

        $records = $query->orderBy('date_encoded', 'desc')->get()->map(function($settlement) {
            $encodedByName = $settlement->encodedByAccount ? trim($settlement->encodedByAccount->sys_fname . ' ' . $settlement->encodedByAccount->sys_lname) : 'Unknown User';
            $updatedByName = $settlement->updatedByAccount ? trim($settlement->updatedByAccount->sys_fname . ' ' . $settlement->updatedByAccount->sys_lname) : $encodedByName;

            $firstComp = $settlement->complainants->first();
            $firstSub = $settlement->citizenHistories->first();

            return [
                'id' => $settlement->sett_id,
                // Primary displays
                'complainantFirstName' => $firstComp->first_name ?? 'Unknown',
                'complainantLastName' => $firstComp->last_name ?? 'Complainant',
                'subjectFirstName' => $firstSub->first_name ?? 'Unknown',
                'subjectLastName' => $firstSub->last_name ?? 'Subject',
                'ctz_id' => $firstSub->ctz_id ?? null,
                'citizenId' => ($firstSub && $firstSub->citizen) ? $firstSub->citizen->ctz_uuid : 'Manual Entry',

                // Full Arrays
                'complainants' => $settlement->complainants->map(function($c) {
                    return [
                        'id' => $c->comp_id,
                        'first_name' => $c->first_name,
                        'middle_name' => $c->middle_name,
                        'last_name' => $c->last_name,
                        'ctz_id' => $c->ctz_id,
                        'citizenId' => $c->citizen ? $c->citizen->ctz_uuid : null
                    ];
                }),
                'subjects' => $settlement->citizenHistories->map(function($s) {
                    return [
                        'id' => $s->cihi_id,
                        'first_name' => $s->first_name,
                        'middle_name' => $s->middle_name,
                        'last_name' => $s->last_name,
                        'ctz_id' => $s->ctz_id,
                        'citizenId' => $s->citizen ? $s->citizen->ctz_uuid : null,
                        'status' => $s->status
                    ];
                }),

                'description' => $settlement->settlement_description,
                'dateOfSettlement' => $settlement->date_of_settlement ? Carbon::parse($settlement->date_of_settlement)->format('Y-m-d') : 'N/A',
                
                // Audit
                'dateEncoded' => $settlement->date_encoded ? Carbon::parse($settlement->date_encoded)->format('Y-m-d | h:i A') : 'N/A',
                'encodedBy' => $encodedByName,
                'dateUpdated' => $settlement->date_updated ? Carbon::parse($settlement->date_updated)->format('Y-m-d | h:i A') : 'N/A',
                'updatedBy' => $settlement->date_updated ? $updatedByName : 'N/A',
            ];
        });

        return Inertia::render('main/CitizenRecords/settlement-history', [
            'histories' => $records,
            'filters' => [
                'search' => $request->search ?? ''
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'complainants' => 'required|array|min:1',
            'complainants.*.has_record' => 'boolean',
            'complainants.*.citizen_id' => 'nullable|string',
            'complainants.*.first_name' => 'required|string|max:255',
            'complainants.*.middle_name' => 'nullable|string|max:255',
            'complainants.*.last_name' => 'required|string|max:255',
            
            'subjects' => 'required|array|min:1',
            'subjects.*.has_record' => 'boolean',
            'subjects.*.citizen_id' => 'nullable|string',
            'subjects.*.first_name' => 'required|string|max:255',
            'subjects.*.middle_name' => 'nullable|string|max:255',
            'subjects.*.last_name' => 'required|string|max:255',
            'subjects.*.involvement_status' => 'nullable|string|max:255',
            'subjects.*.settlement_status' => 'required|string|max:255',

            'linked_history_id' => 'nullable|string',
            'complaint_description' => 'required|string|max:5000',
            'settlement_description' => 'nullable|string|max:5000',
            'date_of_settlement' => 'required|date',
            'mediator' => 'nullable|string|max:255',
            'case_classification' => 'nullable|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            $encodedBy = Auth::id() ?? 1;
            $now = now();

            // 1. Build Comprehensive Settlement Description
            $fullDescription = "Complaint: " . $validated['complaint_description'] . "\n\n";
            if (!empty($validated['settlement_description'])) $fullDescription .= "Resolution: " . $validated['settlement_description'] . "\n";
            if (!empty($validated['mediator'])) $fullDescription .= "Mediator: " . $validated['mediator'] . "\n";
            if (!empty($validated['case_classification'])) $fullDescription .= "Classification: " . $validated['case_classification'] . "\n";
            if (!empty($validated['linked_history_id'])) $fullDescription .= "Linked Previous History: " . $validated['linked_history_id'] . "\n";

            // 2. Create the Settlement Log first so we have the sett_id
            $settlementLog = SettlementLog::create([
                'settlement_description' => trim($fullDescription),
                'date_of_settlement' => $validated['date_of_settlement'],
                'date_encoded' => $now,
                'encoded_by'  => $encodedBy,
                'is_deleted' => false
            ]);

            // 3. Create Complainants attached to the Settlement
            foreach ($validated['complainants'] as $compData) {
                Complainant::create([
                    'first_name' => $compData['first_name'],
                    'middle_name' => $compData['middle_name'],
                    'last_name' => $compData['last_name'],
                    'ctz_id' => !empty($compData['citizen_id']) ? (int) str_replace('CTZ-', '', $compData['citizen_id']) : null,
                    'sett_id' => $settlementLog->sett_id,
                ]);
            }

            // 4. Create Subjects (CitizenHistories) attached to the Settlement
            foreach ($validated['subjects'] as $subData) {
                $subjectDesc = 'Involved in a barangay settlement.';
                if (!empty($subData['involvement_status'])) {
                    $subjectDesc .= "\nInvolvement: " . $subData['involvement_status'];
                }

                CitizenHistory::create([
                    'first_name'  => $subData['first_name'],
                    'middle_name' => $subData['middle_name'],
                    'last_name'   => $subData['last_name'],
                    'ctz_id'      => !empty($subData['citizen_id']) ? (int) str_replace('CTZ-', '', $subData['citizen_id']) : null,
                    'type'        => 'Settlement',
                    'title'       => 'Barangay Settlement / Blotter',
                    'description' => $subjectDesc,
                    'date_created' => $now,
                    'encoded_by'  => $encodedBy,
                    'status'      => $subData['settlement_status'],
                    'sett_id'     => $settlementLog->sett_id,
                ]);
            }

            DB::commit();

            return redirect()->back()->with('success', 'Settlement history added successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to create settlement record: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'complainants' => 'required|array|min:1',
            'complainants.*.has_record' => 'boolean',
            'complainants.*.citizen_id' => 'nullable|string',
            'complainants.*.first_name' => 'required|string|max:255',
            'complainants.*.middle_name' => 'nullable|string|max:255',
            'complainants.*.last_name' => 'required|string|max:255',
            
            'subjects' => 'required|array|min:1',
            'subjects.*.has_record' => 'boolean',
            'subjects.*.citizen_id' => 'nullable|string',
            'subjects.*.first_name' => 'required|string|max:255',
            'subjects.*.middle_name' => 'nullable|string|max:255',
            'subjects.*.last_name' => 'required|string|max:255',
            'subjects.*.involvement_status' => 'nullable|string|max:255',
            'subjects.*.settlement_status' => 'required|string|max:255',

            'settlement_description' => 'required|string|max:5000',
            'date_of_settlement' => 'required|date',
        ]);

        try {
            DB::beginTransaction();

            $record = SettlementLog::where('sett_id', $id)->firstOrFail();
            $updatedBy = Auth::id() ?? 1;
            $now = now();

            // 1. Update SettlementLog
            $record->update([
                'settlement_description' => $validated['settlement_description'],
                'date_of_settlement' => $validated['date_of_settlement'],
                'date_updated' => $now,
                'updated_by' => $updatedBy,
            ]);

            // 2. Sync Complainants (Simplest approach: Delete existing and recreate, or since edit UI usually manages all, full replace is easiest for arrays without IDs)
            $record->complainants()->delete();
            foreach ($validated['complainants'] as $compData) {
                Complainant::create([
                    'first_name' => $compData['first_name'],
                    'middle_name' => $compData['middle_name'],
                    'last_name' => $compData['last_name'],
                    'ctz_id' => !empty($compData['citizen_id']) ? (int) str_replace('CTZ-', '', $compData['citizen_id']) : null,
                    'sett_id' => $record->sett_id,
                ]);
            }

            // 3. Sync Subjects (CitizenHistories)
            $record->citizenHistories()->delete();
            foreach ($validated['subjects'] as $subData) {
                $subjectDesc = 'Involved in a barangay settlement.';
                if (!empty($subData['involvement_status'])) {
                    $subjectDesc .= "\nInvolvement: " . $subData['involvement_status'];
                }

                CitizenHistory::create([
                    'first_name'  => $subData['first_name'],
                    'middle_name' => $subData['middle_name'],
                    'last_name'   => $subData['last_name'],
                    'ctz_id'      => !empty($subData['citizen_id']) ? (int) str_replace('CTZ-', '', $subData['citizen_id']) : null,
                    'type'        => 'Settlement',
                    'title'       => 'Barangay Settlement / Blotter',
                    'description' => $subjectDesc,
                    'date_created' => $now,
                    'encoded_by'  => $updatedBy,
                    'status'      => $subData['settlement_status'],
                    'sett_id'     => $record->sett_id,
                ]);
            }

            DB::commit();

            return redirect()->back()->with('success', 'Settlement history updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to update settlement record: ' . $e->getMessage()]);
        }
    }

    public function destroy(Request $request, $id)
    {
        $validated = $request->validate([
            'delete_reason' => 'required|string|max:1000'
        ]);

        try {
            DB::beginTransaction();
            
            $record = SettlementLog::where('sett_id', $id)->firstOrFail();
            $record->is_deleted = true;
            $record->delete_reason = $validated['delete_reason'];
            $record->save();

            DB::commit();

            return redirect()->back()->with('success', 'Settlement record successfully moved to archive.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to archive settlement record: ' . $e->getMessage()]);
        }
    }
}
