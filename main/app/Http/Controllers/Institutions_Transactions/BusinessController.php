<?php

namespace App\Http\Controllers\Institutions_Transactions;

use App\Http\Controllers\Controller;
use App\Models\businessInfo;
use App\Models\BusinessOwner;
use App\Models\Sitio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class BusinessController extends Controller
{
    /**
     * Display a listing of businesses.
     */
    public function index()
    {
        $businesses = businessInfo::with(['owners.citizen', 'sitio', 'encodedByAccount', 'updatedByAccount'])
            ->where('is_deleted', false)
            ->orderBy('bs_id', 'desc')
            ->get()
            ->map(function ($b) {

                $getSystemName = function ($account) {
                    if (!$account) return 'System';
                    $fullname = trim(($account->sys_fname ?? '') . ' ' . ($account->sys_lname ?? ''));
                    return $fullname ?: 'System';
                };

                $owners = $b->owners->map(function ($o) {
                    return [
                        'id'      => $o->bo_id,
                        'fname'   => $o->bo_fname,
                        'lname'   => $o->bo_lname,
                        'mname'   => $o->bo_mname ?? '',
                        'suffix'  => $o->bo_suffix ?? '',
                        'fullName' => trim(
                            $o->bo_fname . ' ' .
                            ($o->bo_mname ? $o->bo_mname . ' ' : '') .
                            $o->bo_lname .
                            ($o->bo_suffix ? ', ' . $o->bo_suffix : '')
                        ),
                        'ctzId'   => $o->ctz_id,
                        'ctzUuid' => $o->citizen?->ctz_uuid ?? null,
                    ];
                })->values()->all();

                return [
                    'id'             => $b->bs_id,
                    'businessId'     => 'BUS-' . Carbon::parse($b->date_encoded)->format('Y') . '-' . str_pad($b->bs_id, 3, '0', STR_PAD_LEFT),
                    'businessName'   => $b->name,
                    'owners'         => $owners,
                    // Convenience: first owner name for list display
                    'primaryOwner'   => !empty($owners) ? $owners[0]['fullName'] : 'No Owner',
                    'businessType'   => $b->type,
                    'status'         => $b->status,
                    'address'        => $b->address,
                    'sitio'          => $b->sitio?->sitio_name ?? 'N/A',
                    'sitioId'        => $b->sitio_id,
                    'description'    => $b->description ?? '',
                    'isDti'          => (bool) $b->is_dti,
                    'dateRegistered' => $b->date_encoded ? Carbon::parse($b->date_encoded)->format('F d, Y') : 'N/A',
                    'dateEncoded'    => $b->date_encoded ? Carbon::parse($b->date_encoded)->format('M d, Y') : 'N/A',
                    'encodedBy'      => $getSystemName($b->encodedByAccount),
                    'dateUpdated'    => $b->date_updated ? Carbon::parse($b->date_updated)->format('M d, Y') : 'N/A',
                    'updatedBy'      => $b->date_updated ? $getSystemName($b->updatedByAccount) : 'N/A',
                ];
            });

        return Inertia::render('main/Institutions/business-profile', [
            'businesses' => $businesses,
            'sitios'     => Sitio::select('sitio_id', 'sitio_name')->orderBy('sitio_name')->get(),
        ]);
    }

    /**
     * Store a newly created business with its owners.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'type'        => 'required|string',
            'status'      => 'required|string',
            'address'     => 'required|string|max:100',
            'sitio_id'    => 'required|exists:sitios,sitio_id',
            'description' => 'nullable|string',
            'is_dti'      => 'boolean',
            // Owners array
            'owners'               => 'required|array|min:1',
            'owners.*.fname'       => 'required|string|max:60',
            'owners.*.lname'       => 'required|string|max:60',
            'owners.*.mname'       => 'nullable|string|max:60',
            'owners.*.suffix'      => 'nullable|string',
            'owners.*.ctz_id'      => 'nullable|exists:citizens,ctz_id',
        ]);

        try {
            DB::beginTransaction();

            $systemUserId = Auth::id() ?? 1;

            $business = businessInfo::create([
                'name'         => $validated['name'],
                'type'         => $validated['type'],
                'status'       => $validated['status'],
                'address'      => $validated['address'],
                'sitio_id'     => $validated['sitio_id'],
                'description'  => $validated['description'] ?? null,
                'is_dti'       => $request->boolean('is_dti'),
                'date_encoded' => now(),
                'date_updated' => now(),
                'is_deleted'   => false,
                'encoded_by'   => $systemUserId,
                'updated_by'   => $systemUserId,
            ]);

            foreach ($validated['owners'] as $owner) {
                BusinessOwner::create([
                    'bs_id'     => $business->bs_id,
                    'bo_fname'  => $owner['fname'],
                    'bo_lname'  => $owner['lname'],
                    'bo_mname'  => $owner['mname'] ?? null,
                    'bo_suffix' => $owner['suffix'] ?? null,
                    'ctz_id'    => $owner['ctz_id'] ?? null,
                ]);
            }

            DB::commit();

            return redirect()->back()->with('success', 'Business registered successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Error registering business: ' . $e->getMessage()]);
        }
    }

    /**
     * Update the specified business and sync its owners.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'type'        => 'required|string',
            'status'      => 'required|string',
            'address'     => 'required|string|max:100',
            'sitio_id'    => 'required|exists:sitios,sitio_id',
            'description' => 'nullable|string',
            'is_dti'      => 'boolean',
            'owners'               => 'required|array|min:1',
            'owners.*.fname'       => 'required|string|max:60',
            'owners.*.lname'       => 'required|string|max:60',
            'owners.*.mname'       => 'nullable|string|max:60',
            'owners.*.suffix'      => 'nullable|string',
            'owners.*.ctz_id'      => 'nullable|exists:citizens,ctz_id',
        ]);

        try {
            DB::beginTransaction();

            $business = businessInfo::findOrFail($id);
            $business->update([
                'name'         => $validated['name'],
                'type'         => $validated['type'],
                'status'       => $validated['status'],
                'address'      => $validated['address'],
                'sitio_id'     => $validated['sitio_id'],
                'description'  => $validated['description'] ?? null,
                'is_dti'       => $request->boolean('is_dti'),
                'date_updated' => now(),
                'updated_by'   => Auth::id() ?? 1,
            ]);

            // Sync owners: delete all and re-insert
            BusinessOwner::where('bs_id', $id)->delete();

            foreach ($validated['owners'] as $owner) {
                BusinessOwner::create([
                    'bs_id'     => $business->bs_id,
                    'bo_fname'  => $owner['fname'],
                    'bo_lname'  => $owner['lname'],
                    'bo_mname'  => $owner['mname'] ?? null,
                    'bo_suffix' => $owner['suffix'] ?? null,
                    'ctz_id'    => $owner['ctz_id'] ?? null,
                ]);
            }

            DB::commit();

            return redirect()->back()->with('success', 'Business updated successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Error updating business: ' . $e->getMessage()]);
        }
    }

    /**
     * Soft-delete the specified business (owners cascade-deleted by FK).
     */
    public function destroy(Request $request, $id)
    {
        $validated = $request->validate([
            'delete_reason' => 'nullable|string|max:1000',
        ]);

        try {
            $business = businessInfo::findOrFail($id);
            $business->update([
                'is_deleted'    => true,
                'delete_reason' => $validated['delete_reason'] ?? null,
                'date_updated'  => now(),
                'updated_by'    => Auth::id() ?? 1,
            ]);

            return redirect()->back()->with('success', 'Business archived successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Error archiving business: ' . $e->getMessage()]);
        }
    }
}
