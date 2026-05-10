<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Citizen;
use App\Models\HouseholdInfo;
use App\Models\businessInfo;
use App\Models\Infrastructure;
use App\Models\TransactionLog;
use App\Models\MedicalHistory;
use App\Models\SettlementLog;
use App\Models\CitizenHistory;
use App\Models\SystemAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ArchiveController extends Controller
{
    private function getSystemAccounts()
    {
        return SystemAccount::select('sys_id', 'sys_fname', 'sys_lname')
            ->get()
            ->map(fn($a) => ['id' => $a->sys_id, 'name' => trim($a->sys_fname . ' ' . $a->sys_lname)])
            ->values();
    }

    public function index()
    {
        $counts = [
            'citizens'           => Citizen::where('is_deleted', true)->count(),
            'household'          => HouseholdInfo::where('is_deleted', true)->count(),
            'business'           => businessInfo::where('is_deleted', true)->count(),
            'infrastructures'    => Infrastructure::where('is_deleted', true)->count(),
            'services'           => TransactionLog::where('is_deleted', true)->count(),
            'medical_history'    => MedicalHistory::where('is_deleted', true)->count(),
            'settlement_history' => SettlementLog::where('is_deleted', true)->count(),
            'citizen_history'    => CitizenHistory::where('is_deleted', true)->count(),
        ];

        return Inertia::render('admin/Archives/archives', [
            'counts' => $counts
        ]);
    }

    // ─────────────── CITIZENS ───────────────
    public function citizens(Request $request)
    {
        $query = Citizen::with(['info.sitio', 'encodedByAccount', 'updatedByAccount'])
            ->where('is_deleted', true);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('info', function ($sq) use ($search) {
                    $sq->whereRaw("LOWER(CONCAT(first_name,' ',last_name)) LIKE ?", ['%' . strtolower($search) . '%']);
                })->orWhere('ctz_uuid', 'like', "%{$search}%");
            });
        }

        $citizens = $query->orderBy('date_updated', 'desc')->get()->map(function ($c) {
            $getSystemName = fn($acc) => $acc ? trim($acc->sys_fname . ' ' . $acc->sys_lname) : 'System';
            return [
                'id'           => $c->ctz_id,
                'citizenId'    => $c->ctz_uuid,
                'firstName'    => $c->info?->first_name ?? 'N/A',
                'middleName'   => $c->info?->middle_name ?? '',
                'lastName'     => $c->info?->last_name ?? 'N/A',
                'suffix'       => $c->info?->suffix ?? '',
                'sitio'        => $c->info?->sitio?->sitio_name ?? 'N/A',
                'sex'          => $c->info?->sex ?? 'N/A',
                'status'       => $c->info?->civil_status ?? 'N/A',
                'deleteReason' => $c->deleted_reason ?? 'No reason provided.',
                'dateEncoded'  => $c->date_encoded ? Carbon::parse($c->date_encoded)->format('M d, Y | h:i A') : 'N/A',
                'encodedBy'    => $getSystemName($c->encodedByAccount),
                'dateUpdated'  => $c->date_updated ? Carbon::parse($c->date_updated)->format('M d, Y | h:i A') : 'N/A',
                'updatedBy'    => $getSystemName($c->updatedByAccount),
            ];
        });

        return Inertia::render('admin/Archives/citizens-archive', [
            'records'        => $citizens,
            'systemAccounts' => $this->getSystemAccounts(),
            'filters'        => $request->only(['search']),
        ]);
    }

    public function restoreCitizen($id)
    {
        $citizen = Citizen::findOrFail($id);
        $citizen->update(['is_deleted' => false, 'deleted_reason' => null]);
        return redirect()->back()->with('success', 'Citizen restored successfully.');
    }

    // ─────────────── HOUSEHOLD ───────────────
    public function household(Request $request)
    {
        $query = HouseholdInfo::with(['sitio', 'encodedByAccount', 'updatedByAccount', 'members.info'])
            ->where('is_deleted', true);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('hh_uuid', 'like', "%{$search}%")
                  ->orWhere('house_number', 'like', "%{$search}%");
            });
        }

        $households = $query->orderBy('date_updated', 'desc')->get()->map(function ($hh) {
            $getSystemName = fn($acc) => $acc ? trim($acc->sys_fname . ' ' . $acc->sys_lname) : 'System';
            return [
                'id'              => $hh->hh_id,
                'householdId'     => $hh->hh_uuid,
                'householdNumber' => $hh->house_number ?? 'N/A',
                'sitio'           => $hh->sitio?->sitio_name ?? 'N/A',
                'ownershipStatus' => $hh->ownership_status ?? 'N/A',
                'waterSource'     => $hh->water_type ?? 'N/A',
                'toiletType'      => $hh->toilet_type ?? 'N/A',
                'homeAddress'     => $hh->address ?? 'N/A',
                'interviewedBy'   => $hh->interviewer_name ?? 'N/A',
                'reviewedBy'      => $hh->reviewer_name ?? 'N/A',
                'dateOfVisit'     => $hh->date_visited ? Carbon::parse($hh->date_visited)->format('M d, Y') : 'N/A',
                'members'         => $hh->members->map(fn($m) => [
                    'id'           => $m->ctz_id,
                    'firstName'    => $m->info?->first_name ?? 'N/A',
                    'lastName'     => $m->info?->last_name ?? 'N/A',
                    'relationship' => $m->pivot->relationship ?? 'Member',
                ]),
                'deleteReason'    => $hh->delete_reason ?? 'No reason provided.',
                'dateEncoded'     => $hh->date_encoded ? Carbon::parse($hh->date_encoded)->format('M d, Y | h:i A') : 'N/A',
                'encodedBy'       => $getSystemName($hh->encodedByAccount),
                'dateUpdated'     => $hh->date_updated ? Carbon::parse($hh->date_updated)->format('M d, Y | h:i A') : 'N/A',
                'updatedBy'       => $getSystemName($hh->updatedByAccount),
            ];
        });

        return Inertia::render('admin/Archives/household-archive', [
            'records'        => $households,
            'systemAccounts' => $this->getSystemAccounts(),
            'filters'        => $request->only(['search']),
        ]);
    }

    public function restoreHousehold($id)
    {
        $hh = HouseholdInfo::findOrFail($id);
        $hh->update(['is_deleted' => false, 'delete_reason' => null]);
        return redirect()->back()->with('success', 'Household restored successfully.');
    }

    // ─────────────── BUSINESS ───────────────
    public function business(Request $request)
    {
        $query = businessInfo::with(['sitio', 'owners.citizen.info', 'encodedByAccount', 'updatedByAccount'])
            ->where('is_deleted', true);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('bs_uuid', 'like', "%{$search}%");
            });
        }

        $businesses = $query->orderBy('date_updated', 'desc')->get()->map(function ($b) {
            $getSystemName = fn($acc) => $acc ? trim($acc->sys_fname . ' ' . $acc->sys_lname) : 'System';
            $owners = $b->owners->map(fn($o) => [
                'id'       => $o->bo_id,
                'fullName' => trim("{$o->bo_fname} {$o->bo_mname} {$o->bo_lname}"),
                'ctzId'    => $o->ctz_id,
                'ctzUuid'  => $o->citizen?->ctz_uuid,
            ]);
            return [
                'id'           => $b->bs_id,
                'businessId'   => $b->bs_uuid,
                'businessName' => $b->name,
                'businessType' => $b->type ?? 'N/A',
                'status'       => $b->status ?? 'N/A',
                'sitio'        => $b->sitio?->sitio_name ?? 'N/A',
                'address'      => $b->address ?? 'N/A',
                'description'  => $b->description ?? '',
                'primaryOwner' => $owners->first()?->get('fullName') ?? 'N/A',
                'owners'       => $owners,
                'deleteReason' => $b->delete_reason ?? 'No reason provided.',
                'dateEncoded'  => $b->date_encoded ? Carbon::parse($b->date_encoded)->format('M d, Y | h:i A') : 'N/A',
                'encodedBy'    => $getSystemName($b->encodedByAccount),
                'dateUpdated'  => $b->date_updated ? Carbon::parse($b->date_updated)->format('M d, Y | h:i A') : 'N/A',
                'updatedBy'    => $getSystemName($b->updatedByAccount),
            ];
        });

        return Inertia::render('admin/Archives/business-archive', [
            'records'        => $businesses,
            'systemAccounts' => $this->getSystemAccounts(),
            'filters'        => $request->only(['search']),
        ]);
    }

    public function restoreBusiness($id)
    {
        $b = businessInfo::findOrFail($id);
        $b->update(['is_deleted' => false, 'delete_reason' => null]);
        return redirect()->back()->with('success', 'Business restored successfully.');
    }

    // ─────────────── INFRASTRUCTURES ───────────────
    public function infrastructures(Request $request)
    {
        $query = Infrastructure::with(['sitio', 'encodedByAccount', 'updatedByAccount'])
            ->where('is_deleted', true);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('inf_uuid', 'like', "%{$search}%");
            });
        }

        $infrastructures = $query->orderBy('date_updated', 'desc')->get()->map(function ($inf) {
            $getSystemName = fn($acc) => $acc ? trim($acc->sys_fname . ' ' . $acc->sys_lname) : 'System';
            return [
                'id'           => $inf->inf_id,
                'infraId'      => $inf->inf_uuid,
                'name'         => $inf->name,
                'type'         => $inf->type ?? 'N/A',
                'sitio'        => $inf->sitio?->sitio_name ?? 'N/A',
                'address'      => $inf->address_description ?? 'N/A',
                'description'  => $inf->description ?? '',
                'ownerFullName'=> trim(($inf->owner_fname ?? '') . ' ' . ($inf->owner_mname ? $inf->owner_mname . ' ' : '') . ($inf->owner_lname ?? '') . ($inf->owner_suffix ? ', ' . $inf->owner_suffix : '')),
                'deleteReason' => $inf->delete_reason ?? 'No reason provided.',
                'dateEncoded'  => $inf->date_encoded ? Carbon::parse($inf->date_encoded)->format('M d, Y | h:i A') : 'N/A',
                'encodedBy'    => $getSystemName($inf->encodedByAccount),
                'dateUpdated'  => $inf->date_updated ? Carbon::parse($inf->date_updated)->format('M d, Y | h:i A') : 'N/A',
                'updatedBy'    => $getSystemName($inf->updatedByAccount),
            ];
        });

        return Inertia::render('admin/Archives/infrastructures-archive', [
            'records'        => $infrastructures,
            'systemAccounts' => $this->getSystemAccounts(),
            'filters'        => $request->only(['search']),
        ]);
    }

    public function restoreInfrastructure($id)
    {
        $inf = Infrastructure::findOrFail($id);
        $inf->update(['is_deleted' => false, 'delete_reason' => null]);
        return redirect()->back()->with('success', 'Infrastructure restored successfully.');
    }

    // ─────────────── SERVICES (Transactions) ───────────────
    public function services(Request $request)
    {
        $query = TransactionLog::with(['citizen.info', 'encodedByAccount', 'updatedByAccount'])
            ->where('is_deleted', true);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('tl_uuid', 'like', "%{$search}%")
                  ->orWhere('type', 'like', "%{$search}%")
                  ->orWhere('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%");
            });
        }

        $services = $query->orderBy('date_updated', 'desc')->get()->map(function ($t) {
            $getSystemName = fn($acc) => $acc ? trim($acc->sys_fname . ' ' . $acc->sys_lname) : 'System';
            $citizenName = trim($t->first_name . ' ' . $t->last_name);
            return [
                'id'              => $t->tl_id,
                'transactionId'   => $t->tl_uuid,
                'transactionType' => $t->type ?? 'N/A',
                'status'          => $t->status ?? 'N/A',
                'purpose'         => $t->purpose ?? '',
                'citizenName'     => $citizenName,
                'citizenId'       => $t->citizen?->ctz_uuid,
                'deleteReason'    => $t->delete_reason ?? 'No reason provided.',
                'dateRequested'   => $t->date_requested ? Carbon::parse($t->date_requested)->format('M d, Y') : 'N/A',
                'dateEncoded'     => $t->date_encoded ? Carbon::parse($t->date_encoded)->format('M d, Y | h:i A') : 'N/A',
                'encodedBy'       => $getSystemName($t->encodedByAccount),
                'dateUpdated'     => $t->date_updated ? Carbon::parse($t->date_updated)->format('M d, Y | h:i A') : 'N/A',
                'updatedBy'       => $getSystemName($t->updatedByAccount),
            ];
        });

        return Inertia::render('admin/Archives/services-archive', [
            'records'        => $services,
            'systemAccounts' => $this->getSystemAccounts(),
            'filters'        => $request->only(['search']),
        ]);
    }

    public function restoreService($id)
    {
        $t = TransactionLog::findOrFail($id);
        $t->update(['is_deleted' => false, 'delete_reason' => null]);
        return redirect()->back()->with('success', 'Transaction restored successfully.');
    }

    // ─────────────── MEDICAL HISTORY ───────────────
    public function medicalHistory(Request $request)
    {
        $query = MedicalHistory::with(['citizen.info', 'encodedByAccount', 'updatedByAccount'])
            ->where('is_deleted', true);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereRaw("LOWER(CONCAT(first_name,' ',last_name)) LIKE ?", ['%' . strtolower($search) . '%'])
                  ->orWhere('mh_uuid', 'like', "%{$search}%");
            });
        }

        $records = $query->orderBy('date_updated', 'desc')->get()->map(function ($h) {
            $getSystemName = fn($acc) => $acc ? trim($acc->sys_fname . ' ' . $acc->sys_lname) : 'System';
            return [
                'id'            => $h->mh_id,
                'uuid'          => $h->mh_uuid,
                'firstName'     => $h->first_name,
                'middleName'    => $h->middle_name ?? '',
                'lastName'      => $h->last_name,
                'type'          => $h->type ?? 'N/A',
                'description'   => $h->description ?? '',
                'dateDiagnosed' => $h->date_diagnosed ? Carbon::parse($h->date_diagnosed)->format('M d, Y') : 'N/A',
                'citizenId'     => $h->citizen?->ctz_uuid,
                'deleteReason'  => $h->delete_reason ?? 'No reason provided.',
                'dateEncoded'   => $h->date_encoded ? Carbon::parse($h->date_encoded)->format('M d, Y | h:i A') : 'N/A',
                'encodedBy'     => $getSystemName($h->encodedByAccount),
                'dateUpdated'   => $h->date_updated ? Carbon::parse($h->date_updated)->format('M d, Y | h:i A') : 'N/A',
                'updatedBy'     => $getSystemName($h->updatedByAccount),
            ];
        });

        return Inertia::render('admin/Archives/medical-history-archive', [
            'records'        => $records,
            'systemAccounts' => $this->getSystemAccounts(),
            'filters'        => $request->only(['search']),
        ]);
    }

    public function restoreMedicalHistory($id)
    {
        $h = MedicalHistory::findOrFail($id);
        $h->update(['is_deleted' => false, 'delete_reason' => null]);
        return redirect()->back()->with('success', 'Medical history record restored successfully.');
    }

    // ─────────────── SETTLEMENT HISTORY ───────────────
    public function settlementHistory(Request $request)
    {
        $query = SettlementLog::with(['complainants', 'citizenHistories', 'encodedByAccount', 'updatedByAccount'])
            ->where('is_deleted', true);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('sett_uuid', 'like', "%{$search}%")
                  ->orWhereHas('complainants', fn($sub) => $sub->where('first_name', 'like', "%{$search}%")->orWhere('last_name', 'like', "%{$search}%"));
            });
        }

        $records = $query->orderBy('date_updated', 'desc')->get()->map(function ($s) {
            $getSystemName = fn($acc) => $acc ? trim($acc->sys_fname . ' ' . $acc->sys_lname) : 'System';
            $firstComp = $s->complainants->first();
            return [
                'id'                   => $s->sett_id,
                'uuid'                 => $s->sett_uuid,
                'complainantFirstName' => $firstComp?->first_name ?? 'N/A',
                'complainantLastName'  => $firstComp?->last_name ?? '',
                'complainantCount'     => $s->complainants->count(),
                'complainantDescription' => $firstComp?->comp_description ?? '',
                'complaintDescription' => $s->complaint_description ?? '',
                'settlementDescription'=> $s->settlement_description ?? '',
                'dateOfSettlement'     => $s->date_of_settlement ? Carbon::parse($s->date_of_settlement)->format('M d, Y') : 'N/A',
                'mediator'             => $s->mediator ?? 'N/A',
                'complainants'         => $s->complainants->map(fn($c) => ['name' => trim($c->first_name . ' ' . $c->last_name)]),
                'respondents'          => $s->citizenHistories->map(fn($h) => ['name' => trim($h->first_name . ' ' . $h->last_name), 'type' => $h->type, 'status' => $h->status]),
                'deleteReason'         => $s->delete_reason ?? 'No reason provided.',
                'dateEncoded'          => $s->date_encoded ? Carbon::parse($s->date_encoded)->format('M d, Y | h:i A') : 'N/A',
                'encodedBy'            => $getSystemName($s->encodedByAccount),
                'dateUpdated'          => $s->date_updated ? Carbon::parse($s->date_updated)->format('M d, Y | h:i A') : 'N/A',
                'updatedBy'            => $getSystemName($s->updatedByAccount),
            ];
        });

        return Inertia::render('admin/Archives/settlement-history-archive', [
            'records'        => $records,
            'systemAccounts' => $this->getSystemAccounts(),
            'filters'        => $request->only(['search']),
        ]);
    }

    public function restoreSettlementHistory($id)
    {
        $s = SettlementLog::findOrFail($id);
        $s->update(['is_deleted' => false, 'delete_reason' => null]);
        return redirect()->back()->with('success', 'Settlement record restored successfully.');
    }

    // ─────────────── CITIZEN HISTORY ───────────────
    public function citizenHistory(Request $request)
    {
        $query = CitizenHistory::with(['citizen.info', 'encodedByAccount', 'updatedByAccount'])
            ->where('is_deleted', true);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereRaw("LOWER(CONCAT(first_name,' ',last_name)) LIKE ?", ['%' . strtolower($search) . '%']);
            });
        }

        $records = $query->orderBy('date_updated', 'desc')->get()->map(function ($h) {
            $getSystemName = fn($acc) => $acc ? trim($acc->sys_fname . ' ' . $acc->sys_lname) : 'System';
            return [
                'id'           => $h->cihi_id,
                'firstName'    => $h->first_name,
                'middleName'   => $h->middle_name ?? '',
                'lastName'     => $h->last_name,
                'type'         => $h->type ?? 'N/A',
                'description'  => $h->description ?? '',
                'dateCreated'  => $h->date_created ? Carbon::parse($h->date_created)->format('M d, Y | h:i A') : 'N/A',
                'citizenId'    => $h->citizen?->ctz_uuid,
                'deleteReason' => $h->delete_reason ?? 'No reason provided.',
                'dateEncoded'  => $h->date_created ? Carbon::parse($h->date_created)->format('M d, Y | h:i A') : 'N/A',
                'encodedBy'    => $getSystemName($h->encodedByAccount),
                'dateUpdated'  => $h->date_updated ? Carbon::parse($h->date_updated)->format('M d, Y | h:i A') : 'N/A',
                'updatedBy'    => $getSystemName($h->updatedByAccount),
            ];
        });

        return Inertia::render('admin/Archives/citizen-history-archive', [
            'records'        => $records,
            'systemAccounts' => $this->getSystemAccounts(),
            'filters'        => $request->only(['search']),
        ]);
    }

    public function restoreCitizenHistory($id)
    {
        $h = CitizenHistory::findOrFail($id);
        $h->update(['is_deleted' => false, 'delete_reason' => null]);
        return redirect()->back()->with('success', 'Citizen history record restored successfully.');
    }
}
