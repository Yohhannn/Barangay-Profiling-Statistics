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
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
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

    /** Sanitize a search string: cap length and escape LIKE special characters. */
    private function safeLike(string $raw): string
    {
        $trimmed = substr(trim($raw), 0, 100);
        return str_replace(['\\', '%', '_'], ['\\\\', '\%', '\_'], $trimmed);
    }

    /** Abort with 403 if the authenticated SystemAccount lacks the given permission. */
    private function requirePermission(string $permission): void
    {
        /** @var \App\Models\SystemAccount $user */
        $user = Auth::user();
        abort_if(!$user->hasPermission($permission), 403);
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
        $this->requirePermission('View Archive');

        $query = Citizen::with([
            'info.sitio',
            'info.householdInfo.citizen_informations.citizens',
            'info.employment',
            'info.contact.phones',
            'info.demographic.socioEconomic',
            'info.demographic.healthRisk',
            'info.demographic.familyPlanning',
            'info.demographic.educationStatus.educationHistory',
            'info.demographic.philhealth',
            'medicalHistories',
            'histories.settlementLog',
            'businessOwnerships.business',
            'infrastructures',
            'transactionLogs',
            'encodedByAccount',
            'updatedByAccount',
        ])
            ->where('is_deleted', true);

        if ($request->filled('search')) {
            $safe = $this->safeLike($request->search);
            $query->where(function ($q) use ($safe) {
                $q->whereHas('info', function ($sq) use ($safe) {
                    $sq->whereRaw("LOWER(CONCAT(first_name,' ',last_name)) LIKE ?", ['%' . strtolower($safe) . '%']);
                })->orWhere('ctz_uuid', 'like', "%{$safe}%");
            });
        }

        $citizens = $query->orderBy('date_updated', 'desc')->get()->map(function ($c) {
            $getSystemName = fn($acc) => $acc ? trim($acc->sys_fname . ' ' . $acc->sys_lname) : 'System';
            $info = $c->info;
            $demo = $info?->demographic;
            $contactNums = $info?->contact?->phones ? $info->contact->phones->pluck('phone_number')->toArray() : [];
            return [
                'id'           => $c->ctz_id,
                'citizenId'    => $c->ctz_uuid,
                'firstName'    => $info?->first_name ?? 'N/A',
                'middleName'   => $info?->middle_name ?? '',
                'lastName'     => $info?->last_name ?? 'N/A',
                'suffix'       => $info?->suffix ?? '',
                'status'       => $info?->is_deceased ? 'Deceased' : 'Active',
                // Personal
                'dob'          => $info?->date_of_birth ? Carbon::parse($info->date_of_birth)->format('F d, Y') : 'N/A',
                'age'          => $info?->date_of_birth ? Carbon::parse($info->date_of_birth)->age : null,
                'sex'          => $info?->sex ?? 'N/A',
                'bloodType'    => $info?->blood_type ?? 'N/A',
                'civilStatus'  => $info?->civil_status ?? 'N/A',
                'religion'     => $info?->religion ?? 'N/A',
                'pob'          => $info?->place_of_birth ?? 'N/A',
                // Contact & Address
                'email'            => $info?->contact?->email ?? 'N/A',
                'contact'          => $contactNums,
                'personalAddress'  => $info?->personal_address ?? 'N/A',
                'householdAddress' => $info?->householdInfo ? trim(($info->householdInfo->house_number ? $info->householdInfo->house_number . ' ' : '') . ($info->householdInfo->address ?? '')) : 'N/A',
                'fullAddress'      => $info?->sitio ? $info->sitio->sitio_name . ', Marigondon' : 'N/A',
                'sitio'            => $info?->sitio?->sitio_name ?? 'N/A',
                // Socio-Economic
                'employmentStatus'    => $info?->employment?->status ?? 'N/A',
                'occupation'          => $info?->employment?->occupation ?? 'N/A',
                'socioEconomicStatus' => $demo?->socioEconomic?->soec_status ?? 'N/A',
                // Flags
                'isGovWorker' => (bool) ($info?->employment?->is_gov_worker ?? false),
                'isStudent'   => (bool) ($demo?->educationStatus?->is_current_student ?? false),
                'isVoter'     => (bool) ($info?->is_registered_voter ?? false),
                'isIp'        => (bool) ($info?->is_indigenous ?? false),
                'isDeceased'  => (bool) ($info?->is_deceased ?? false),
                // Conditional
                'dateOfDeath'      => $info?->date_of_death ? Carbon::parse($info->date_of_death)->format('F d, Y') : null,
                'causeOfDeath'     => $info?->cause_of_death,
                'educAttainment'   => $demo?->educationStatus?->education_level ?? 'N/A',
                'schoolName'       => $demo?->educationStatus?->institution_name ?? 'N/A',
                'elementary_name'  => $demo?->educationStatus?->educationHistory?->elementary_name ?? '',
                'highschool_name'  => $demo?->educationStatus?->educationHistory?->highschool_name ?? '',
                'senior_high_name' => $demo?->educationStatus?->educationHistory?->sr_highschool_name ?? '',
                'college_name'     => $demo?->educationStatus?->educationHistory?->college_name ?? '',
                'fpStatus'         => $demo?->familyPlanning?->status ?? 'N/A',
                'fpMethod'         => $demo?->familyPlanning?->method ?? 'N/A',
                'fpDateStarted'    => $demo?->familyPlanning?->start_date ? Carbon::parse($demo->familyPlanning->start_date)->format('F d, Y') : null,
                'fpDateEnded'      => $demo?->familyPlanning?->end_date ? Carbon::parse($demo->familyPlanning->end_date)->format('F d, Y') : null,
                // System IDs
                'nhtsNumber'          => $demo?->socioEconomic?->soec_number,
                'householdId'         => $info?->householdInfo?->hh_uuid ?? 'N/A',
                'relationship'        => $info?->relationship_type ?? 'Head',
                'householdMembers'    => $info?->householdInfo ? $info->householdInfo->citizen_informations->filter(function($hhInfo) use ($info) {
                    return $hhInfo->ctz_info_id !== $info->ctz_info_id;
                })->map(function($hhInfo) {
                    return [
                        'id'           => $hhInfo->ctz_info_id ?? mt_rand(),
                        'name'         => trim(($hhInfo->first_name ?? '') . ' ' . ($hhInfo->last_name ?? '')),
                        'relationship' => $hhInfo->relationship_type ?? 'Member',
                    ];
                })->values()->all() : [],
                'philhealthCategory'   => $demo?->philhealth?->category_name ?? 'N/A',
                'philhealthId'         => $demo?->philhealth?->philhealth_id_number,
                'membershipType'       => $demo?->philhealth?->phea_membership_type,
                'healthClassification' => $demo?->healthRisk?->clah_classification_name ?? 'Healthy',
                // Related records
                'medicalHistories' => $c->medicalHistories->map(fn($m) => [
                    'id' => $m->mh_id, 'uuid' => $m->mh_uuid, 'type' => $m->type,
                    'description' => $m->description,
                    'dateDiagnosed' => $m->date_diagnosed ? Carbon::parse($m->date_diagnosed)->format('F d, Y') : null,
                ])->values()->all(),
                'settlementHistories' => $c->histories->map(fn($h) => [
                    'id' => $h->cihi_id, 'uuid' => $h->cihi_uuid, 'title' => $h->title,
                    'type' => $h->type, 'description' => $h->description, 'status' => $h->status,
                    'dateCreated' => $h->date_created ? Carbon::parse($h->date_created)->format('F d, Y') : null,
                    'settlement_uuid' => $h->settlementLog?->sett_uuid,
                ])->values()->all(),
                'ownedBusinesses' => $c->businessOwnerships->map(fn($bo) => [
                    'id' => $bo->business?->bs_id, 'uuid' => $bo->business?->bs_uuid,
                    'name' => $bo->business?->name, 'type' => $bo->business?->type, 'status' => $bo->business?->status,
                ])->filter(fn($b) => $b['id'] !== null)->values()->all(),
                'ownedInfrastructures' => $c->infrastructures->map(fn($i) => [
                    'id' => $i->inf_id, 'infraId' => $i->inf_uuid, 'name' => $i->name, 'type' => $i->type,
                ])->values()->all(),
                'transactionLogs' => $c->transactionLogs->map(fn($t) => [
                    'id' => $t->tl_id, 'transactionId' => $t->tl_uuid, 'type' => $t->type,
                    'status' => $t->status,
                    'dateRequested' => $t->date_requested ? Carbon::parse($t->date_requested)->format('M d, Y') : 'N/A',
                ])->values()->all(),
                // Archive
                'deleteReason' => $c->deleted_reason ?? 'No reason provided.',
                // Audit
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
        $this->requirePermission('Restore Archive');

        $citizen = Citizen::findOrFail($id);
        $citizen->update(['is_deleted' => false, 'deleted_reason' => null]);
        NotificationService::notifyByPermission(
            'View Citizen Profile',
            'archive',
            'Citizen Record Restored',
            "Citizen #{$citizen->ctz_uuid} has been restored from archives.",
            '/citizen-panel/citizen-profile'
        );
        return redirect()->back()->with('success', 'Citizen restored successfully.');
    }

    // ─────────────── HOUSEHOLD ───────────────
    public function household(Request $request)
    {
        $this->requirePermission('View Archive');

        $query = HouseholdInfo::with(['sitio', 'encodedByAccount', 'updatedByAccount', 'citizen_informations.citizens'])
            ->where('is_deleted', true);

        if ($request->filled('search')) {
            $safe = $this->safeLike($request->search);
            $query->where(function ($q) use ($safe) {
                $q->where('hh_uuid', 'like', "%{$safe}%")
                  ->orWhere('house_number', 'like', "%{$safe}%");
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
                'homeLink'        => $hh->home_link ?? '',
                'coordinates'     => $hh->coordinates ?? '',
                'interviewedBy'   => $hh->interviewer_name ?? 'N/A',
                'reviewedBy'      => $hh->reviewer_name ?? 'N/A',
                'dateOfVisit'     => $hh->date_visited ? Carbon::parse($hh->date_visited)->format('M d, Y') : 'N/A',
                'members'         => $hh->citizen_informations->map(fn($ctzInfo) => [
                    'id'           => $ctzInfo->citizens->first()?->ctz_id,
                    'firstName'    => $ctzInfo->first_name ?? 'N/A',
                    'lastName'     => $ctzInfo->last_name ?? 'N/A',
                    'relationship' => $ctzInfo->relationship_type ?? 'Member',
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
        $this->requirePermission('Restore Archive');

        $hh = HouseholdInfo::findOrFail($id);
        $hh->update(['is_deleted' => false, 'delete_reason' => null]);
        NotificationService::notifyByPermission(
            'View Household Profile',
            'archive',
            'Household Record Restored',
            "Household #{$hh->hh_uuid} has been restored from archives.",
            '/citizen-panel/household-profile'
        );
        return redirect()->back()->with('success', 'Household restored successfully.');
    }

    // ─────────────── BUSINESS ───────────────
    public function business(Request $request)
    {
        $this->requirePermission('View Archive');

        $query = businessInfo::with(['sitio', 'owners.citizen.info', 'encodedByAccount', 'updatedByAccount'])
            ->where('is_deleted', true);

        if ($request->filled('search')) {
            $safe = $this->safeLike($request->search);
            $query->where(function ($q) use ($safe) {
                $q->where('name', 'like', "%{$safe}%")
                  ->orWhere('bs_uuid', 'like', "%{$safe}%");
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
                'primaryOwner'   => $owners->first()['fullName'] ?? 'N/A',
                'owners'         => $owners,
                'isDti'          => (bool) $b->is_dti,
                'dtiPhoto'       => $b->dti_photo ? Storage::url($b->dti_photo) : null,
                'dateRegistered' => $b->date_encoded ? Carbon::parse($b->date_encoded)->format('F d, Y') : 'N/A',
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
        $this->requirePermission('Restore Archive');

        $b = businessInfo::findOrFail($id);
        $b->update(['is_deleted' => false, 'delete_reason' => null]);
        NotificationService::notifyByPermission(
            'View Business',
            'archive',
            'Business Record Restored',
            "Business record has been restored from archives.",
            '/institutions/business-profile'
        );
        return redirect()->back()->with('success', 'Business restored successfully.');
    }

    // ─────────────── INFRASTRUCTURES ───────────────
    public function infrastructures(Request $request)
    {
        $this->requirePermission('View Archive');

        $query = Infrastructure::with(['sitio', 'citizen', 'encodedByAccount', 'updatedByAccount'])
            ->where('is_deleted', true);

        if ($request->filled('search')) {
            $safe = $this->safeLike($request->search);
            $query->where(function ($q) use ($safe) {
                $q->where('name', 'like', "%{$safe}%")
                  ->orWhere('inf_uuid', 'like', "%{$safe}%");
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
                'ownerFullName'  => trim(($inf->owner_fname ?? '') . ' ' . ($inf->owner_mname ? $inf->owner_mname . ' ' : '') . ($inf->owner_lname ?? '') . ($inf->owner_suffix ? ', ' . $inf->owner_suffix : '')),
                'ctzId'          => $inf->ctz_id,
                'ownerCtzUuid'   => $inf->citizen?->ctz_uuid,
                'dateRegistered' => $inf->date_encoded ? Carbon::parse($inf->date_encoded)->format('F d, Y') : 'N/A',
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
        $this->requirePermission('Restore Archive');

        $inf = Infrastructure::findOrFail($id);
        $inf->update(['is_deleted' => false, 'delete_reason' => null]);
        NotificationService::notifyByPermission(
            'View Infrastructure',
            'archive',
            'Infrastructure Record Restored',
            "Infrastructure record has been restored from archives.",
            '/institutions/infrastructures-profile'
        );
        return redirect()->back()->with('success', 'Infrastructure restored successfully.');
    }

    // ─────────────── SERVICES (Transactions) ───────────────
    public function services(Request $request)
    {
        $this->requirePermission('View Archive');

        $query = TransactionLog::with(['citizen.info', 'encodedByAccount', 'updatedByAccount'])
            ->where('is_deleted', true);

        if ($request->filled('search')) {
            $safe = $this->safeLike($request->search);
            $query->where(function ($q) use ($safe) {
                $q->where('tl_uuid', 'like', "%{$safe}%")
                  ->orWhere('type', 'like', "%{$safe}%")
                  ->orWhere('first_name', 'like', "%{$safe}%")
                  ->orWhere('last_name', 'like', "%{$safe}%");
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
                'firstName'       => $t->first_name ?? '',
                'lastName'        => $t->last_name ?? '',
                'middleName'      => $t->middle_name ?? '',
                'suffix'          => $t->suffix ?? '',
                'citizenName'     => $citizenName,
                'ctzId'           => $t->ctz_id,
                'citizenId'       => $t->citizen?->ctz_uuid,
                'ctzUuid'         => $t->citizen?->ctz_uuid,
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
        $this->requirePermission('Restore Archive');

        $t = TransactionLog::findOrFail($id);
        $t->update(['is_deleted' => false, 'delete_reason' => null]);
        NotificationService::notifyByPermission(
            'View Services',
            'archive',
            'Transaction Record Restored',
            "Transaction #{$t->tl_uuid} has been restored from archives.",
            '/transactions/services-profile'
        );
        return redirect()->back()->with('success', 'Transaction restored successfully.');
    }

    // ─────────────── MEDICAL HISTORY ───────────────
    public function medicalHistory(Request $request)
    {
        $this->requirePermission('View Archive');

        $query = MedicalHistory::with(['citizen.info', 'encodedByAccount', 'updatedByAccount'])
            ->where('is_deleted', true);

        if ($request->filled('search')) {
            $safe = $this->safeLike($request->search);
            $query->where(function ($q) use ($safe) {
                $q->whereRaw("LOWER(CONCAT(first_name,' ',last_name)) LIKE ?", ['%' . strtolower($safe) . '%'])
                  ->orWhere('mh_uuid', 'like', "%{$safe}%");
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
                'ctzId'         => $h->ctz_id,
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
        $this->requirePermission('Restore Archive');

        $h = MedicalHistory::findOrFail($id);
        $h->update(['is_deleted' => false, 'delete_reason' => null]);
        NotificationService::notifyByPermission(
            'View Medical History',
            'medical',
            'Medical Record Restored',
            "Medical record #{$h->mh_uuid} has been restored from archives.",
            '/citizen-records/medical-history'
        );
        return redirect()->back()->with('success', 'Medical history record restored successfully.');
    }

    // ─────────────── SETTLEMENT HISTORY ───────────────
    public function settlementHistory(Request $request)
    {
        $this->requirePermission('View Archive');

        $query = SettlementLog::with(['complainants.citizen', 'citizenHistories.citizen', 'encodedByAccount', 'updatedByAccount'])
            ->where('is_deleted', true);

        if ($request->filled('search')) {
            $safe = $this->safeLike($request->search);
            $query->where(function ($q) use ($safe) {
                $q->where('sett_uuid', 'like', "%{$safe}%")
                  ->orWhereHas('complainants', fn($sub) => $sub->where('first_name', 'like', "%{$safe}%")->orWhere('last_name', 'like', "%{$safe}%"));
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
                'complainants'         => $s->complainants->map(fn($c) => [
                    'id'              => $c->comp_id ?? $c->id,
                    'name'            => trim($c->first_name . ' ' . $c->last_name),
                    'firstName'       => $c->first_name ?? '',
                    'middleName'      => $c->middle_name ?? null,
                    'lastName'        => $c->last_name ?? '',
                    'ctzId'           => $c->ctz_id,
                    'citizenId'       => $c->citizen?->ctz_uuid,
                    'compDescription' => $c->comp_description ?? null,
                ]),
                'respondents'          => $s->citizenHistories->map(fn($h) => [
                    'id'        => $h->cihi_id,
                    'name'      => trim($h->first_name . ' ' . $h->last_name),
                    'firstName' => $h->first_name ?? '',
                    'lastName'  => $h->last_name ?? '',
                    'ctzId'     => $h->ctz_id,
                    'cihi_uuid' => $h->cihi_uuid,
                    'citizenId' => $h->citizen?->ctz_uuid,
                    'type'      => $h->type,
                    'status'    => $h->status,
                    'title'     => $h->title ?? '',
                ]),
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
        $this->requirePermission('Restore Archive');

        $s = SettlementLog::findOrFail($id);
        $s->update(['is_deleted' => false, 'delete_reason' => null]);
        NotificationService::notifyByPermission(
            'View Settlement History',
            'settlement',
            'Settlement Record Restored',
            "Settlement record has been restored from archives.",
            '/citizen-records/settlement-history'
        );
        return redirect()->back()->with('success', 'Settlement record restored successfully.');
    }

    // ─────────────── CITIZEN HISTORY ───────────────
    public function citizenHistory(Request $request)
    {
        $this->requirePermission('View Archive');

        $query = CitizenHistory::with(['citizen.info', 'settlementLog', 'encodedByAccount', 'updatedByAccount'])
            ->where('is_deleted', true);

        if ($request->filled('search')) {
            $safe = $this->safeLike($request->search);
            $query->where(function ($q) use ($safe) {
                $q->whereRaw("LOWER(CONCAT(first_name,' ',last_name)) LIKE ?", ['%' . strtolower($safe) . '%']);
            });
        }

        $records = $query->orderBy('date_updated', 'desc')->get()->map(function ($h) {
            $getSystemName = fn($acc) => $acc ? trim($acc->sys_fname . ' ' . $acc->sys_lname) : 'System';
            return [
                'id'             => $h->cihi_id,
                'uuid'           => $h->cihi_uuid,
                'firstName'      => $h->first_name,
                'middleName'     => $h->middle_name ?? '',
                'lastName'       => $h->last_name,
                'title'          => $h->title ?? '',
                'type'           => $h->type ?? 'N/A',
                'status'         => $h->status ?? 'N/A',
                'involvementType'     => $h->involvement_type ?? 'N/A',
                'caseClassification' => $h->case_classification ?? 'N/A',
                'description'        => $h->description ?? '',
                'dateRecorded'       => $h->date_created ? Carbon::parse($h->date_created)->format('M d, Y') : 'N/A',
                'citizenId'          => $h->citizen?->ctz_uuid,
                'ctzId'              => $h->ctz_id,
                'settlement'         => $h->settlementLog ? ['id' => $h->settlementLog->sett_id, 'uuid' => $h->settlementLog->sett_uuid] : null,
                'deleteReason'       => $h->delete_reason ?? 'No reason provided.',
                'dateEncoded'        => $h->date_created ? Carbon::parse($h->date_created)->format('M d, Y | h:i A') : 'N/A',
                'encodedBy'      => $getSystemName($h->encodedByAccount),
                'dateUpdated'    => $h->date_updated ? Carbon::parse($h->date_updated)->format('M d, Y | h:i A') : 'N/A',
                'updatedBy'      => $getSystemName($h->updatedByAccount),
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
        $this->requirePermission('Restore Archive');

        $h = CitizenHistory::findOrFail($id);
        $h->update(['is_deleted' => false, 'delete_reason' => null]);
        NotificationService::notifyByPermission(
            'View Citizen History',
            'citizen',
            'Citizen History Record Restored',
            "Citizen history record has been restored from archives.",
            '/citizen-records/citizen-history'
        );
        return redirect()->back()->with('success', 'Citizen history record restored successfully.');
    }
}
