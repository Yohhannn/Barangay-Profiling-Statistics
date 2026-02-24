<?php

namespace App\Http\Controllers\Citizens;

use App\Http\Controllers\Controller;
use App\Models\HouseholdInfo;
use App\Models\Sitio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class HouseholdController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = HouseholdInfo::with(['sitio', 'encodedByAccount', 'updatedByAccount'])
            ->where('is_deleted', false);

        // Search by Household ID
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('hh_uuid', 'ilike', '%' . $search . '%');
        }

        // Apply specific filters
        if ($request->filled('sitio') && $request->sitio !== 'All') {
            $query->whereHas('sitio', function ($q) use ($request) {
                $q->where('sitio_name', $request->sitio);
            });
        }
        if ($request->filled('water_type') && $request->water_type !== 'All') {
            $query->where('water_type', $request->water_type);
        }
        if ($request->filled('toilet_type') && $request->toilet_type !== 'All') {
            $query->where('toilet_type', $request->toilet_type);
        }
        if ($request->filled('ownership_status') && $request->ownership_status !== 'All') {
            $query->where('ownership_status', $request->ownership_status);
        }

        $households = $query->orderBy('date_encoded', 'desc')->get()->map(function($hh) {
            $encodedByName = $hh->encodedByAccount ? trim($hh->encodedByAccount->sys_fname . ' ' . $hh->encodedByAccount->sys_lname) : 'Unknown User';
            
            // Default updatedBy to encodedBy if not explicitly set
            $updatedByName = $hh->updatedByAccount ? trim($hh->updatedByAccount->sys_fname . ' ' . $hh->updatedByAccount->sys_lname) : $encodedByName;

            return [
                'id' => $hh->hh_id,
                'householdId' => $hh->hh_uuid,
                'householdNumber' => $hh->house_number ?? 'N/A',
                'sitio' => $hh->sitio ? $hh->sitio->sitio_name : 'Unknown',
                'ownershipStatus' => $hh->ownership_status,
                'interviewedBy' => $hh->interviewer_name ?? 'N/A',
                'reviewedBy' => $hh->reviewer_name ?? 'N/A',
                'dateOfVisit' => $hh->date_visited ? $hh->date_visited->format('Y-m-d') : 'N/A',
                'waterSource' => $hh->water_type,
                'toiletType' => $hh->toilet_type,
                'homeAddress' => $hh->address,
                'homeLink' => $hh->home_link ?? 'N/A',
                'coordinates' => $hh->coordinates ?? 'N/A',
                'members' => [], // TODO: Link citizens here
                'dateEncoded' => $hh->date_encoded ? \Carbon\Carbon::parse($hh->date_encoded)->format('M d, Y | h:i A') : 'N/A',
                'encodedBy' => $encodedByName,
                'dateUpdated' => $hh->date_updated ? \Carbon\Carbon::parse($hh->date_updated)->format('M d, Y | h:i A') : 'N/A',
                'updatedBy' => $hh->date_updated ? $updatedByName : 'N/A',
            ];
        });

        return \Inertia\Inertia::render('main/CitizenPanel/household-profiles', [
            'households' => $households,
            'filters' => [
                'search' => $request->search ?? '',
                'sitio' => $request->sitio ?? 'All',
                'water_type' => $request->water_type ?? 'All',
                'toilet_type' => $request->toilet_type ?? 'All',
                'ownership_status' => $request->ownership_status ?? 'All',
            ]
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
        $validated = $request->validate([
            'house_number' => 'nullable|string|max:255',
            'home_address' => 'required|string|max:500',
            'sitio' => 'required|exists:sitios,sitio_name',
            'ownership_status' => 'required|string',
            'home_link' => 'nullable|url|max:1000',
            'water_type' => 'required|string',
            'toilet_type' => 'required|string',
            'date_visited' => 'nullable|date',
            'interviewer_name' => 'nullable|string|max:255',
            'reviewer_name' => 'nullable|string|max:255',
            'coordinates' => 'nullable|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            $sitioObj = Sitio::where('sitio_name', $validated['sitio'])->first();

            $household = HouseholdInfo::create([
                // hh_uuid is auto-generated in the model's booted event
                'house_number' => $validated['house_number'] ?? null,
                'address' => $validated['home_address'],
                'sitio_id' => $sitioObj->sitio_id,
                'ownership_status' => $validated['ownership_status'],
                'home_link' => $validated['home_link'] ?? null,
                'water_type' => $validated['water_type'],
                'toilet_type' => $validated['toilet_type'],
                'coordinates' => $validated['coordinates'] ?? null,
                'date_visited' => $validated['date_visited'] ?? null,
                'interviewer_name' => $validated['interviewer_name'] ?? null,
                'reviewer_name' => $validated['reviewer_name'] ?? null,
                'date_encoded' => now(),
                'encoded_by' => Auth::id() ?? 1,
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Household Created Successfully! Code: ' . $household->hh_uuid);

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Error creating household: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(HouseholdInfo $householdInfo)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(HouseholdInfo $householdInfo)
    {
        //
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'house_number' => 'nullable|string|max:255',
            'home_address' => 'required|string|max:500',
            'sitio' => 'required|exists:sitios,sitio_name',
            'ownership_status' => 'required|string',
            'home_link' => 'nullable|string|max:1000',
            'water_type' => 'required|string',
            'toilet_type' => 'required|string',
            'date_visited' => 'nullable|date',
            'interviewer_name' => 'nullable|string|max:255',
            'reviewer_name' => 'nullable|string|max:255',
            'coordinates' => 'nullable|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            $household = HouseholdInfo::where('hh_id', $id)->firstOrFail();
            $sitioObj = Sitio::where('sitio_name', $validated['sitio'])->first();

            $household->update([
                'house_number' => $validated['house_number'] ?? null,
                'address' => $validated['home_address'],
                'sitio_id' => $sitioObj->sitio_id,
                'ownership_status' => $validated['ownership_status'],
                'home_link' => $validated['home_link'] ?? null,
                'water_type' => $validated['water_type'],
                'toilet_type' => $validated['toilet_type'],
                'coordinates' => $validated['coordinates'] ?? null,
                'date_visited' => $validated['date_visited'] ?? null,
                'interviewer_name' => $validated['interviewer_name'] ?? null,
                'reviewer_name' => $validated['reviewer_name'] ?? null,
                'date_updated' => now(),
                'updated_by' => Auth::id() ?? 1,
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Household Updated Successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Error updating household: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $validated = $request->validate([
            'delete_reason' => 'required|string|max:1000'
        ]);

        try {
            DB::beginTransaction();
            
            // Find the household by ID
            $household = HouseholdInfo::where('hh_id', $id)->firstOrFail();
            $household->is_deleted = true;
            $household->delete_reason = $validated['delete_reason'];
            $household->save();

            DB::commit();

            return redirect()->back()->with('success', 'Household successfully moved to archive.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Error archiving household: ' . $e->getMessage()]);
        }
    }

    public function search(Request $request)
    {
        $query = $request->query('q');

        if (!$query || strlen($query) < 3) {
            return response()->json([]);
        }

        $households = HouseholdInfo::with(['citizen_informations.citizens'])
        ->where('hh_uuid', 'like', '%' . $query . '%')
        ->where('is_deleted', false)
        ->take(5)
        ->get();

        $results = $households->map(function ($hh) {
            $activeMembers = $hh->citizen_informations->filter(function ($info) {
                return $info->citizens->where('is_deleted', false)->isNotEmpty();
            });

            $members = $activeMembers->map(function ($info) {
                return [
                    'name' => trim(($info->first_name ?? '') . ' ' . ($info->last_name ?? '')),
                    'relationship' => $info->relationship_type ?? 'Member'
                ];
            });

            return [
                'id' => $hh->hh_id,
                'hh_id' => $hh->hh_uuid,
                'status' => $hh->ownership_status,
                'members' => $members->values()->all()
            ];
        });

        return response()->json($results);
    }
}
