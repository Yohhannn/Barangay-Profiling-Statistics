<?php

namespace App\Http\Controllers\Institutions_Transactions;

use App\Http\Controllers\Controller;
use App\Models\Infrastructure;
use App\Models\Sitio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Inertia\Inertia;

class InfrastructureController extends Controller
{
    /**
     * Display a listing of infrastructures.
     */
    public function index()
    {
        $infrastructures = Infrastructure::with(['sitio', 'encodedByAccount', 'updatedByAccount'])
            ->where('is_deleted', false)
            ->orderBy('inf_id', 'desc')
            ->get()
            ->map(function ($inf) {
                $ownerName = trim(
                    ($inf->owner_fname ?? '') . ' ' .
                    ($inf->owner_mname ? $inf->owner_mname . ' ' : '') .
                    ($inf->owner_lname ?? '') .
                    ($inf->owner_suffix ? ', ' . $inf->owner_suffix : '')
                );

                $getSystemName = function ($account) {
                    if (!$account) return 'System';
                    $fullname = trim(($account->sys_fname ?? '') . ' ' . ($account->sys_lname ?? ''));
                    return $fullname ?: 'System';
                };

                return [
                    'id'             => $inf->inf_id,
                    'infraId'        => 'INF-' . Carbon::parse($inf->date_encoded)->format('Y') . '-' . str_pad($inf->inf_id, 3, '0', STR_PAD_LEFT),
                    'name'           => $inf->name,
                    'owner'          => $ownerName,
                    'ownerFname'     => $inf->owner_fname,
                    'ownerMname'     => $inf->owner_mname ?? '',
                    'ownerLname'     => $inf->owner_lname,
                    'ownerSuffix'    => $inf->owner_suffix ?? '',
                    'type'           => $inf->type,
                    'address'        => $inf->address_description ?? '',
                    'sitio'          => $inf->sitio?->sitio_name ?? 'N/A',
                    'sitioId'        => $inf->sitio_id,
                    'description'    => $inf->description ?? '',
                    'ctzId'          => $inf->ctz_id,
                    'dateRegistered' => $inf->date_encoded ? Carbon::parse($inf->date_encoded)->format('F d, Y') : 'N/A',
                    'dateEncoded'    => $inf->date_encoded ? Carbon::parse($inf->date_encoded)->format('M d, Y') : 'N/A',
                    'encodedBy'      => $getSystemName($inf->encodedByAccount),
                    'dateUpdated'    => $inf->date_updated ? Carbon::parse($inf->date_updated)->format('M d, Y') : 'N/A',
                    'updatedBy'      => $inf->date_updated ? $getSystemName($inf->updatedByAccount) : 'N/A',
                ];
            });

        return Inertia::render('main/Institutions/infrastructures-profile', [
            'infrastructures' => $infrastructures,
            'sitios'          => Sitio::select('sitio_id', 'sitio_name')->orderBy('sitio_name')->get(),
        ]);
    }

    /**
     * Store a newly created infrastructure.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'                => 'required|string|max:255',
            'type'                => 'required|string',
            'address_description' => 'nullable|string',
            'sitio_id'            => 'required|exists:sitios,sitio_id',
            'description'         => 'nullable|string',
            'owner_fname'         => 'required|string|max:60',
            'owner_lname'         => 'required|string|max:60',
            'owner_mname'         => 'nullable|string|max:60',
            'owner_suffix'        => 'nullable|string',
            'ctz_id'              => 'nullable|exists:citizens,ctz_id',
        ]);

        try {
            $systemUserId = Auth::id() ?? 1;

            Infrastructure::create([
                'name'                => $validated['name'],
                'type'                => $validated['type'],
                'address_description' => $validated['address_description'] ?? null,
                'sitio_id'            => $validated['sitio_id'],
                'description'         => $validated['description'] ?? null,
                'owner_fname'         => $validated['owner_fname'],
                'owner_lname'         => $validated['owner_lname'],
                'owner_mname'         => $validated['owner_mname'] ?? null,
                'owner_suffix'        => $validated['owner_suffix'] ?? null,
                'ctz_id'              => $validated['ctz_id'] ?? null,
                'date_encoded'        => now(),
                'date_updated'        => now(),
                'is_deleted'          => false,
                'encoded_by'          => $systemUserId,
                'updated_by'          => $systemUserId,
            ]);

            return redirect()->back()->with('success', 'Infrastructure registered successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Error registering infrastructure: ' . $e->getMessage()]);
        }
    }

    /**
     * Update the specified infrastructure.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name'                => 'required|string|max:255',
            'type'                => 'required|string',
            'address_description' => 'nullable|string',
            'sitio_id'            => 'required|exists:sitios,sitio_id',
            'description'         => 'nullable|string',
            'owner_fname'         => 'required|string|max:60',
            'owner_lname'         => 'required|string|max:60',
            'owner_mname'         => 'nullable|string|max:60',
            'owner_suffix'        => 'nullable|string',
            'ctz_id'              => 'nullable|exists:citizens,ctz_id',
        ]);

        try {
            $infrastructure = Infrastructure::findOrFail($id);
            $infrastructure->update([
                'name'                => $validated['name'],
                'type'                => $validated['type'],
                'address_description' => $validated['address_description'] ?? null,
                'sitio_id'            => $validated['sitio_id'],
                'description'         => $validated['description'] ?? null,
                'owner_fname'         => $validated['owner_fname'],
                'owner_lname'         => $validated['owner_lname'],
                'owner_mname'         => $validated['owner_mname'] ?? null,
                'owner_suffix'        => $validated['owner_suffix'] ?? null,
                'ctz_id'              => $validated['ctz_id'] ?? null,
                'date_updated'        => now(),
                'updated_by'          => Auth::id() ?? 1,
            ]);

            return redirect()->back()->with('success', 'Infrastructure updated successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Error updating infrastructure: ' . $e->getMessage()]);
        }
    }

    /**
     * Soft-delete the specified infrastructure.
     */
    public function destroy(Request $request, $id)
    {
        $validated = $request->validate([
            'delete_reason' => 'nullable|string|max:1000',
        ]);

        try {
            $infrastructure = Infrastructure::findOrFail($id);
            $infrastructure->update([
                'is_deleted'    => true,
                'delete_reason' => $validated['delete_reason'] ?? null,
                'date_updated'  => now(),
                'updated_by'    => Auth::id() ?? 1,
            ]);

            return redirect()->back()->with('success', 'Infrastructure archived successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Error archiving infrastructure: ' . $e->getMessage()]);
        }
    }
}
