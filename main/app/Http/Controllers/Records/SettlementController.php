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
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SettlementController extends Controller
{
    public function index(Request $request)
    {
        $query = SettlementLog::with(['complainants.citizen', 'citizenHistories.citizen', 'encodedByAccount', 'updatedByAccount'])
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
                'sett_uuid' => $settlement->sett_uuid,
                // Primary displays
                'complainantFirstName' => $firstComp->first_name ?? 'Unknown',
                'complainantLastName' => $firstComp->last_name ?? 'Complainant',
                'subjectFirstName' => $firstSub->first_name ?? 'None',
                'subjectLastName' => $firstSub->last_name ?? 'Linked',
                'ctz_id' => $firstSub->ctz_id ?? null,
                'citizenId' => ($firstSub && $firstSub->citizen) ? $firstSub->citizen->ctz_uuid : 'N/A',

                // Full Arrays
                'complainants' => $settlement->complainants->map(function($c) {
                    return [
                        'id' => $c->comp_id,
                        'first_name' => $c->first_name,
                        'middle_name' => $c->middle_name,
                        'last_name' => $c->last_name,
                        'citizen_id' => $c->citizen ? $c->citizen->ctz_uuid : null,
                        'comp_description' => $c->comp_description,
                    ];
                }),
                'linked_histories' => $settlement->citizenHistories->map(function($s) {
                    return [
                        'id' => $s->cihi_id,
                        'first_name' => $s->first_name,
                        'middle_name' => $s->middle_name,
                        'last_name' => $s->last_name,
                        'ctz_id' => $s->ctz_id,
                        'citizen_id' => $s->citizen ? $s->citizen->ctz_uuid : null,
                        'cihi_uuid' => $s->cihi_uuid,
                        'status' => $s->status,
                        'title' => $s->title,
                        'type' => $s->type,
                    ];
                }),

                'description' => $settlement->settlement_description,
                'complaint_description' => $settlement->complaint_description,
                'dateOfSettlement' => $settlement->date_of_settlement ? Carbon::parse($settlement->date_of_settlement)->format('Y-m-d') : 'N/A',
                'mediator' => $settlement->mediator,
                
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
            'complainants.*.comp_description' => 'nullable|string|max:2000',
            

            'linked_history_ids' => 'nullable|array',
            'linked_history_ids.*' => 'string',
            'complaint_description' => 'required|string|max:5000',
            'settlement_description' => 'required|string|max:5000',
            'date_of_settlement' => 'required|date',
            'mediator' => 'nullable|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            $encodedBy = Auth::id() ?? 1;
            $now = now();

            // 2. Create the Settlement Log first so we have the sett_id
            $settlementLog = SettlementLog::create([
                'complaint_description' => $validated['complaint_description'],
                'settlement_description' => $validated['settlement_description'] ?? null,
                'date_of_settlement' => $validated['date_of_settlement'],
                'date_encoded' => $now,
                'encoded_by'  => $encodedBy,
                'is_deleted' => false,
                'mediator' => $validated['mediator'] ?? null,
            ]);

            // 3. Link Existing Histories if provided
            if (!empty($validated['linked_history_ids'])) {
                CitizenHistory::whereIn('cihi_uuid', $validated['linked_history_ids'])
                    ->update(['sett_id' => $settlementLog->sett_id]);
            }
        

            // 3. Create Complainants attached to the Settlement
            foreach ($validated['complainants'] as $compData) {
                Complainant::create([
                    'first_name' => $compData['first_name'],
                    'middle_name' => $compData['middle_name'] ?? null,
                    'last_name' => $compData['last_name'],
                    'ctz_id' => !empty($compData['citizen_id']) ? (int) str_replace('CTZ-', '', $compData['citizen_id']) : null,
                    'sett_id' => $settlementLog->sett_id,
                    'comp_description' => $compData['comp_description'] ?? '',
                ]);
            }

            DB::commit();

            return redirect()->back()->with('success', 'Settlement history added successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Settlement Creation Error: ' . $e->getMessage(), [
                'request' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);
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
            'complainants.*.comp_description' => 'nullable|string|max:2000',

            'linked_history_ids' => 'nullable|array',
            'linked_history_ids.*' => 'string',
            'complaint_description' => 'required|string|max:5000',
            'settlement_description' => 'required|string|max:5000',
            'date_of_settlement' => 'required|date',
            'mediator' => 'nullable|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            $record = SettlementLog::where('sett_id', $id)->firstOrFail();
            $updatedBy = Auth::id() ?? 1;
            $now = now();

            // 1. Update SettlementLog
            $record->update([
                'complaint_description' => $validated['complaint_description'] ?? $record->complaint_description,
                'settlement_description' => $validated['settlement_description'],
                'date_of_settlement' => $validated['date_of_settlement'],
                'date_updated' => $now,
                'updated_by' => $updatedBy,
            ]);

            // 2. Clear old links to this settlement if any
            CitizenHistory::where('sett_id', $record->sett_id)->update(['sett_id' => null]);

            // 3. Re-link Histories if provided
            if (!empty($validated['linked_history_ids'])) {
                CitizenHistory::whereIn('cihi_uuid', $validated['linked_history_ids'])
                    ->update(['sett_id' => $record->sett_id]);
            }

            // 2. Sync Complainants (Simplest approach: Delete existing and recreate, or since edit UI usually manages all, full replace is easiest for arrays without IDs)
            $record->complainants()->delete();
            // 3. Re-create Complainants
            foreach ($validated['complainants'] as $compData) {
                Complainant::create([
                    'first_name' => $compData['first_name'],
                    'middle_name' => $compData['middle_name'] ?? null,
                    'last_name' => $compData['last_name'],
                    'ctz_id' => !empty($compData['citizen_id']) ? (int) str_replace('CTZ-', '', $compData['citizen_id']) : null,
                    'sett_id' => $record->sett_id,
                    'comp_description' => $compData['comp_description'] ?? '',
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
