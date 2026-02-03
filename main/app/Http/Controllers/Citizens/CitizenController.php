<?php

namespace App\Http\Controllers\Citizens;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Inertia\Inertia;

// Models
use App\Models\Citizen;
use App\Models\CitizenInformation;
use App\Models\Demographic;
use App\Models\Employment;
use App\Models\Phone;
use App\Models\Contact;
use App\Models\SocioEconomicStatus;
use App\Models\ClassificationHealthRisk;
use App\Models\FamilyPlanning;
use App\Models\EduHistory;
use App\Models\EducationStatus;
use App\Models\Philhealth;
use App\Models\Sitio;
use App\Models\HouseholdInfo;

class CitizenController extends Controller
{
    public function index()
    {
        // 1. Fetch Citizens with ALL relationships to avoid N+1 query performance issues
        $citizensQuery = Citizen::with([
            'info.sitio',
            'info.employment',
            'info.contact.phone',
            'info.demographic.socioEconomic',
            'info.demographic.healthRisk',
            'info.demographic.familyPlanning',
            'info.demographic.educationStatus.educationHistory',
            'info.demographic.philhealth',
            'encodedBy',
            'updatedBy'
        ])
            ->where('is_deleted', false) // Only fetch active records
            ->orderBy('date_encoded', 'desc')
            ->get();

        // 2. Transform Data: Map DB structure to Frontend Interface
        $mappedCitizens = $citizensQuery->map(function ($citizen) {
            $info = $citizen->info;
            $demo = $info->demographic;

            // Helper to get contact number safely
            $contactNum = $info->contact && $info->contact->phone
                ? $info->contact->phone->phone_number
                : null;

            return [
                'id' => $citizen->ctz_id,

                // Header
                'firstName' => $info->first_name,
                'middleName' => $info->middle_name ?? '',
                'lastName' => $info->last_name,
                'suffix' => $info->suffix ?? '',
                'citizenId' => $citizen->ctz_uuid ?? 'PENDING',
                'status' => $info->is_deceased ? 'Deceased' : 'Active',

                // Personal
                'dob' => $info->date_of_birth,
                'age' => Carbon::parse($info->date_of_birth)->age,
                'sex' => $info->sex,
                'bloodType' => $info->blood_type ?? 'Unknown',
                'civilStatus' => $info->civil_status,
                'religion' => $info->religion,
                'pob' => $info->place_of_birth ?? 'N/A',

                // Contact & Address
                'email' => $info->contact->email ?? 'N/A',
                'contact' => $contactNum ? [$contactNum] : [], // Wrap in array for frontend
                'fullAddress' => $info->sitio ? $info->sitio->sitio_name . ', Marigondon' : 'N/A',
                'sitio' => $info->sitio ? $info->sitio->sitio_name : 'Unknown',

                // Socio-Economic
                'employmentStatus' => $info->employment->status ?? 'N/A',
                'occupation' => $info->employment->occupation ?? 'N/A',
                'socioEconomicStatus' => $demo->socioEconomic->soec_status ?? 'N/A',

                // Flags
                'isGovWorker' => (bool) ($info->employment->is_gov_worker ?? false),
                'isStudent' => (bool) ($demo->educationStatus->is_current_student ?? false),
                'isVoter' => (bool) $info->is_registered_voter,
                'isIp' => (bool) $info->is_indigenous,
                'isDeceased' => (bool) $info->is_deceased,

                // Conditional Data
                'dateOfDeath' => $info->date_of_death,
                'causeOfDeath' => $info->cause_of_death,

                'educAttainment' => $demo->educationStatus->education_level ?? 'N/A',
                'schoolName' => $demo->educationStatus->institution_name ?? 'N/A',

                'fpStatus' => $demo->familyPlanning->status ?? 'N/A',
                'fpMethod' => $demo->familyPlanning->method ?? 'N/A',
                'fpDateStarted' => $demo->familyPlanning->start_date ?? null,
                'fpDateEnded' => $demo->familyPlanning->end_date ?? null,

                // System IDs
                'nhtsNumber' => $demo->socioEconomic->soec_number,
                'householdId' => $info->hh_id ?? 'N/A',
                'relationship' => $info->relationship_type ?? 'Head',
                'philhealthCategory' => $demo->philhealth->category_name ?? 'N/A',
                'philhealthId' => $demo->philhealth->philhealth_id_number,
                'membershipType' => $demo->philhealth->phea_membership_type,
                'healthClassification' => $demo->healthRisk->clah_classification_name ?? 'Healthy',

                // Audit
                'dateEncoded' => Carbon::parse($citizen->date_encoded)->format('Y-m-d'),
                'encodedBy' => $citizen->encodedBy->username ?? 'System',
                'dateUpdated' => $citizen->date_updated ? Carbon::parse($citizen->date_updated)->format('Y-m-d') : 'N/A',
                'updatedBy' => $citizen->updatedBy->username ?? 'System',
            ];
        });

        // 3. Pass data to React
        return Inertia::render('Main/CitizenRecords/Index', [
            'citizens' => $mappedCitizens,
            'sitios' => Sitio::select('sitio_id', 'sitio_name')->orderBy('sitio_name')->get()
        ]);
    }

    public function store(Request $request)
    {
        // 1. Validation
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'sex' => 'required|in:Male,Female',
            'date_of_birth' => 'required|date',
            'place_of_birth' => 'nullable|string|max:255',
            'civil_status' => 'nullable|string',
            'religion' => 'nullable|string',
            'blood_type' => 'nullable|string',
            'contact_numbers' => 'nullable|array',
            'contact_numbers.*' => 'nullable|string',
            'email' => 'nullable|email|max:255',
            'sitio' => 'nullable|exists:sitios,sitio_name',
            'household_id' => 'nullable|exists:household_infos,hh_id',
            'relationship_to_head' => 'nullable|required_with:household_id|string',
            'socio_economic_class' => 'nullable|string',
            'nhts_number' => 'nullable|string',
            'employment_status' => 'nullable|string',
            'occupation' => 'nullable|string',
            'is_gov' => 'boolean',
            'philhealth_id' => 'nullable|string',
            'philhealth_category' => 'nullable|string',
            'philhealth_membership' => 'nullable|string',
            'is_studying' => 'boolean',
            'school_name' => 'nullable|string',
            'current_level' => 'nullable|string',
            'elementary_name' => 'nullable|string',
            'highschool_name' => 'nullable|string',
            'senior_high_name' => 'nullable|string',
            'college_name' => 'nullable|string',
            'health_classification' => 'nullable|string',
            'is_voter' => 'boolean',
            'is_ip' => 'boolean',
            'is_deceased' => 'boolean',
            'date_of_death' => 'nullable|date',
            'cause_of_death' => 'nullable|string',
            'fp_method' => 'nullable|string',
            'fp_status' => 'nullable|string',
            'fp_start_date' => 'nullable|date',
            'fp_end_date' => 'nullable|date',
        ]);

        try {
            DB::beginTransaction();

            // --- STEP 1: Create Supporting Records ---

            $employment = Employment::create([
                'status' => $validated['employment_status'] ?? 'Unemployed',
                'occupation' => $validated['occupation'] ?? null,
                'is_gov_worker' => $request->boolean('is_gov'),
            ]);

            $primaryPhone = 'N/A';
            if (!empty($validated['contact_numbers']) && isset($validated['contact_numbers'][0])) {
                $primaryPhone = $validated['contact_numbers'][0];
            }

            $phone = Phone::create([
                'phone_number' => $primaryPhone,
            ]);

            $contact = Contact::create([
                'email' => $validated['email'] ?? null,
                'others' => null,
                'phone_id' => $phone->phone_id,
            ]);

            $socioEco = SocioEconomicStatus::create([
                'soec_status' => $validated['socio_economic_class'] ?? 'Non-NHTS',
                'soec_number' => $validated['nhts_number'] ?? null,
            ]);

            $healthRisk = ClassificationHealthRisk::create([
                'clah_classification_name' => $validated['health_classification'] ?? 'Healthy',
            ]);

            $familyPlanning = FamilyPlanning::create([
                'start_date' => $validated['fp_start_date'] ?? now(),
                'end_date' => $validated['fp_end_date'] ?? null,
                'status' => $validated['fp_status'] ?? 'New Acceptor',
                'method' => $validated['fp_method'] ?? null,
            ]);

            $philhealth = Philhealth::create([
                'philhealth_id_number' => $validated['philhealth_id'] ?? null,
                'category_name' => $validated['philhealth_category'] ?? 'Unknown',
                'phea_membership_type' => $validated['philhealth_membership'] ?? null,
            ]);

            $eduHistory = EduHistory::create([
                'elementary_name' => $validated['elementary_name'],
                'highschool_name' => $validated['highschool_name'],
                'sr_highschool_name' => $validated['senior_high_name'],
            ]);

            $eduStatus = EducationStatus::create([
                'is_current_student' => $request->boolean('is_studying'),
                'institution_name' => $validated['school_name'],
                'education_level' => $validated['current_level'] ?? null,
                'edu_hist' => $eduHistory->edu_hist,
            ]);

            // --- STEP 2: Create Demographic Aggregator ---

            $demographic = Demographic::create([
                'soec_id' => $socioEco->soec_id,
                'clah_id' => $healthRisk->clah_id,
                'fp_id' => $familyPlanning->fp_id,
                'edu_id' => $eduStatus->edu_id,
                'phea_id' => $philhealth->phea_id,
            ]);

            // --- STEP 3: Resolve Foreign Keys & Create Main Records ---

            $sitioId = null;
            if (!empty($validated['sitio'])) {
                $sitioObj = Sitio::where('sitio_name', $validated['sitio'])->first();
                if ($sitioObj) $sitioId = $sitioObj->sitio_id;
            }

            $citizenInfo = CitizenInformation::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'middle_name' => $validated['middle_name'],
                'suffix' => $validated['suffix'],
                'date_of_birth' => $validated['date_of_birth'],
                'place_of_birth' => $validated['place_of_birth'] ?? null,
                'sex' => $validated['sex'],
                'civil_status' => $validated['civil_status'] ?? 'Single',
                'blood_type' => $validated['blood_type'],
                'religion' => $validated['religion'],
                'is_deceased' => $request->boolean('is_deceased'),
                'is_registered_voter' => $request->boolean('is_voter'),
                'is_indigenous' => $request->boolean('is_ip'),
                'relationship_type' => $validated['relationship_to_head'] ?? null,

                'hh_id' => $validated['household_id'],
                'sitio_id' => $sitioId,
                'emp_id' => $employment->emp_id,
                'con_id' => $contact->con_id,
                'demo_id' => $demographic->demo_id,
            ]);

            // Create System Citizen Record
            // Note: ctz_uuid is handled by the Model event
            $ctzNumber = (int) (Carbon::now()->format('Y') . rand(1000, 9999));
            $systemUserId = Auth::id() ?? 1;

            Citizen::create([
                'ctz_number' => $ctzNumber,
                'ctz_info_id' => $citizenInfo->ctz_info_id,
                'is_deleted' => false,
                'date_encoded' => now(),
                'encoded_by' => $systemUserId,
                'updated_by' => $systemUserId,
                'face_recog_uuid' => null, // Explicitly null
                'photo_uuid' => null,      // Explicitly null
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Citizen Record Created Successfully!');


            /// MINOR LOGS
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Error creating record: ' . $e->getMessage()]);
        }
    }
}
