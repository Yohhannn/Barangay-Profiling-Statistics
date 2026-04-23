<?php

namespace App\Http\Controllers\Institutions_Transactions;

use App\Http\Controllers\Controller;
use App\Models\businessInfo;
use App\Models\BusinessOwner;
use App\Models\Sitio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Inertia\Inertia;

class BusinessController extends Controller
{
    /**
     * Generate a unique business UUID: BUS-<YY><3 random digits>
     * e.g. BUS-26242 (year 2026, random 242)
     */
    private function generateUuid(): string
    {
        $year = substr(date('Y'), 2); // "26" for 2026
        do {
            $random = rand(100, 999);
            $uuid = "BUS-{$year}{$random}";
        } while (businessInfo::where('bs_uuid', $uuid)->exists());

        return $uuid;
    }

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
                    return trim(($account->sys_fname ?? '') . ' ' . ($account->sys_lname ?? '')) ?: 'System';
                };

                $owners = $b->owners->map(function ($o) {
                    return [
                        'id'       => $o->bo_id,
                        'fname'    => $o->bo_fname,
                        'lname'    => $o->bo_lname,
                        'mname'    => $o->bo_mname ?? '',
                        'fullName' => trim(
                            $o->bo_fname . ' ' .
                            ($o->bo_mname ? $o->bo_mname . ' ' : '') .
                            $o->bo_lname
                        ),
                        'ctzId'    => $o->ctz_id,
                        'ctzUuid'  => $o->citizen?->ctz_uuid ?? null,
                    ];
                })->values()->all();

                return [
                    'id'             => $b->bs_id,
                    'businessId'     => $b->bs_uuid ?? ('BUS-' . Carbon::parse($b->date_encoded)->format('Y') . '-' . str_pad($b->bs_id, 3, '0', STR_PAD_LEFT)),
                    'businessName'   => $b->name,
                    'owners'         => $owners,
                    'primaryOwner'   => !empty($owners) ? $owners[0]['fullName'] : 'No Owner',
                    'businessType'   => $b->type,
                    'status'         => $b->status,
                    'address'        => $b->address,
                    'sitio'          => $b->sitio?->sitio_name ?? 'N/A',
                    'sitioId'        => $b->sitio_id,
                    'description'    => $b->description ?? '',
                    'isDti'          => (bool) $b->is_dti,
                    'dtiPhoto'       => $b->dti_photo ? Storage::url($b->dti_photo) : null,
                    'dateRegistered' => $b->date_encoded ? Carbon::parse($b->date_encoded)->format('F d, Y') : 'N/A',
                    'dateEncoded'    => $b->date_encoded ? \Carbon\Carbon::parse($b->date_encoded)->format('F d, Y | h:i A') : 'N/A',
                    'encodedBy'      => $getSystemName($b->encodedByAccount),
                    'dateUpdated'    => ($b->date_updated && $b->date_encoded != $b->date_updated) ? \Carbon\Carbon::parse($b->date_updated)->format('F d, Y | h:i A') : null,
                    'updatedBy'      => ($b->date_updated && $b->date_encoded != $b->date_updated) ? $getSystemName($b->updatedByAccount) : null,
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
            'dti_photo'   => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            // Owners array
            'owners'            => 'required|array|min:1',
            'owners.*.fname'    => 'required|string|max:60',
            'owners.*.lname'    => 'required|string|max:60',
            'owners.*.mname'    => 'nullable|string|max:60',
            'owners.*.ctz_id'   => 'nullable|integer|exists:citizens,ctz_id',
        ]);

        try {
            DB::beginTransaction();

            $systemUserId = Auth::id() ?? 1;

            // Handle DTI photo upload
            $dtiPhotoPath = null;
            if ($request->hasFile('dti_photo') && $request->file('dti_photo')->isValid()) {
                $dtiPhotoPath = $request->file('dti_photo')->store('dti_photos', 'public');
            }

            $business = businessInfo::create([
                'bs_uuid'      => $this->generateUuid(),
                'name'         => $validated['name'],
                'type'         => $validated['type'],
                'status'       => $validated['status'],
                'address'      => $validated['address'],
                'sitio_id'     => $validated['sitio_id'],
                'description'  => $validated['description'] ?? null,
                'is_dti'       => $request->boolean('is_dti'),
                'dti_photo'    => $dtiPhotoPath,
                'date_encoded' => now(),
                'date_updated' => now(),
                'is_deleted'   => false,
                'encoded_by'   => $systemUserId,
                'updated_by'   => $systemUserId,
            ]);

            foreach ($validated['owners'] as $owner) {
                BusinessOwner::create([
                    'bs_id'    => $business->bs_id,
                    'bo_fname' => $owner['fname'],
                    'bo_lname' => $owner['lname'],
                    'bo_mname' => $owner['mname'] ?? null,
                    'ctz_id'   => $owner['ctz_id'] ?? null,
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
            'dti_photo'   => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'owners'            => 'required|array|min:1',
            'owners.*.fname'    => 'required|string|max:60',
            'owners.*.lname'    => 'required|string|max:60',
            'owners.*.mname'    => 'nullable|string|max:60',
            'owners.*.ctz_id'   => 'nullable|integer|exists:citizens,ctz_id',
        ]);

        try {
            DB::beginTransaction();

            $business = businessInfo::findOrFail($id);

            // Handle DTI photo: replace, remove, or keep existing
            $dtiPhotoPath = $business->dti_photo;
            if ($request->hasFile('dti_photo') && $request->file('dti_photo')->isValid()) {
                if ($dtiPhotoPath) Storage::disk('public')->delete($dtiPhotoPath);
                $dtiPhotoPath = $request->file('dti_photo')->store('dti_photos', 'public');
            } elseif ($request->input('remove_dti_photo') === '1') {
                if ($dtiPhotoPath) Storage::disk('public')->delete($dtiPhotoPath);
                $dtiPhotoPath = null;
            }

            $business->update([
                'name'         => $validated['name'],
                'type'         => $validated['type'],
                'status'       => $validated['status'],
                'address'      => $validated['address'],
                'sitio_id'     => $validated['sitio_id'],
                'description'  => $validated['description'] ?? null,
                'is_dti'       => $request->boolean('is_dti'),
                'dti_photo'    => $dtiPhotoPath,
                'date_updated' => now(),
                'updated_by'   => Auth::id() ?? 1,
            ]);

            BusinessOwner::where('bs_id', $id)->delete();

            foreach ($validated['owners'] as $owner) {
                BusinessOwner::create([
                    'bs_id'    => $business->bs_id,
                    'bo_fname' => $owner['fname'],
                    'bo_lname' => $owner['lname'],
                    'bo_mname' => $owner['mname'] ?? null,
                    'ctz_id'   => $owner['ctz_id'] ?? null,
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
     * Soft-delete the specified business.
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

    public function getQuickViewData($uuid)
    {
        $business = businessInfo::with(['sitio', 'owners', 'encodedByAccount', 'updatedByAccount'])
            ->where('bs_uuid', $uuid)
            ->where('is_deleted', false)
            ->firstOrFail();

        return response()->json([
            'id' => $business->bs_id,
            'uuid' => $business->bs_uuid,
            'businessName' => $business->name,
            'businessType' => $business->type,
            'status' => $business->status,
            'address' => $business->address,
            'sitio' => $business->sitio->sitio_name ?? 'Unknown',
            'description' => $business->description,
            'isDti' => (bool)$business->is_dti,
            'dtiPhoto' => $business->dti_photo,
            'owners' => $business->owners->map(function ($owner) {
                return [
                    'id' => $owner->bo_id,
                    'fullName' => trim($owner->bo_fname . ' ' . ($owner->bo_mname ? $owner->bo_mname . ' ' : '') . $owner->bo_lname),
                    'ctzUuid' => $owner->citizen ? $owner->citizen->ctz_uuid : null,
                ];
            })->values()->all(),
            'dateEncoded' => \Carbon\Carbon::parse($business->date_encoded)->format('F d, Y | h:i A'),
            'encodedBy' => $business->encodedByAccount ? trim($business->encodedByAccount->sys_fname . ' ' . $business->encodedByAccount->sys_lname) : 'System',
            'dateUpdated' => ($business->date_updated && $business->date_encoded != $business->date_updated) ? \Carbon\Carbon::parse($business->date_updated)->format('F d, Y | h:i A') : null,
            'updatedBy' => ($business->date_updated && $business->date_encoded != $business->date_updated) ? ($business->updatedByAccount ? trim($business->updatedByAccount->sys_fname . ' ' . $business->updatedByAccount->sys_lname) : 'System') : null,
        ]);
    }
}
