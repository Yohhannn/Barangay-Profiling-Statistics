<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\HouseholdInfo;
use App\Models\Citizen;
use App\Models\CitizenInformation;
use App\Models\Sitio;
use App\Models\SystemAccount;

class HouseholdAndCitizenSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Make sure we have a reference to a sitio and an account
        $sitio = Sitio::first() ?? Sitio::create(['sitio_name' => 'Sample Sitio']);
        $account = SystemAccount::first() ?? SystemAccount::factory()->create();

        // 1. Create 10 Households
        $householdIds = [];
        for ($i = 1; $i <= 10; $i++) {
            $household = HouseholdInfo::create([
                'house_number' => 'HN-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'address' => 'Sample Address Block ' . $i,
                'sitio_id' => $sitio->sitio_id,
                'ownership_status' => collect(['Owned', 'Rented', 'Leased', 'Informal Settler'])->random(),
                'water_type' => collect(['Level 1 - Point Source', 'Level 2 - Communal Faucet', 'Level 3 - Individual Connection'])->random(),
                'toilet_type' => collect(['A - Pour/flush type connected to septic tank', 'D - Water-sealed toilet', 'E - G - Without toilet'])->random(),
                'date_visited' => now()->subDays(rand(1, 30)),
                'interviewer_name' => 'Interviewer ' . $i,
                'reviewer_name' => 'Reviewer ' . $i,
                'encoded_by' => $account->sys_id,
            ]);
            $householdIds[] = $household->hh_id;
        }

        // 2. Create 20 Citizens & connect some to the households
        for ($i = 1; $i <= 20; $i++) {
            // About 70% chance to be connected to a household
            $assignToHousehold = (rand(1, 100) <= 70);
            $hh_id = $assignToHousehold ? collect($householdIds)->random() : null;

            // Supporting records
            $employment = \App\Models\Employment::create([
                'status' => collect(['Employed','Unemployed','Self-Employed','Retired','Student','Homemaker'])->random(),
                'occupation' => 'Dummy Occupation ' . $i,
                'is_gov_worker' => (bool) rand(0, 1),
            ]);

            $contact = \App\Models\Contact::create([
                'email' => 'citizen'.$i.'@example.com',
                'others' => null,
            ]);
            \App\Models\Phone::create([
                'phone_number' => '09' . str_pad((string) rand(0, 999999999), 9, '0', STR_PAD_LEFT),
                'con_id' => $contact->con_id,
            ]);

            $socioEco = \App\Models\SocioEconomicStatus::create([
                'soec_status' => collect(['NHTS 4Ps', 'NHTS Non 4Ps', 'Non-NHTS'])->random(),
            ]);

            $healthRisk = \App\Models\ClassificationHealthRisk::create([
                'clah_classification_name' => 'Healthy',
            ]);

            $familyPlanning = \App\Models\FamilyPlanning::create([
                'start_date' => now(),
                'status' => collect(['Changing Clinic', 'Changing Method', 'Current User', 'Dropout', 'New Acceptor', 'Restarter'])->random(),
                'method' => collect(['Others', 'BTL', 'COC', 'Condom', 'DPT', 'Implant', 'Injectables', 'IUD', 'LAM', 'POP'])->random(),
            ]);

            $philhealth = \App\Models\Philhealth::create([
                'category_name' => collect(['Formal Economy Government', 'Formal Economy Private', 'Indigenous People', 'Informal Economy', 'NHTS', 'Senior Citizen', 'Unknown'])->random(),
            ]);

            $eduHistory = \App\Models\EduHistory::create([
                'elementary_name' => 'Sample Elem School ' . $i,
                'highschool_name' => 'Sample HS ' . $i,
                'sr_highschool_name' => null,
            ]);

            $eduStatus = \App\Models\EducationStatus::create([
                'is_current_student' => (bool) rand(0, 1),
                'education_level' => collect(['College Graduate', 'College Undergraduate', 'Elementary Graduate', 'Elementary undergraduate', 'Junior High School Graduate', 'Junior High School Undergraduate', 'Senior High School Graduate', 'Senior High School Undergraduate','Kindergarten','No Formal Education', 'Postgraduate'])->random(),
                'edu_hist' => $eduHistory->edu_hist,
            ]);

            $demographic = \App\Models\Demographic::create([
                'soec_id' => $socioEco->soec_id,
                'clah_id' => $healthRisk->clah_id,
                'fp_id' => $familyPlanning->fp_id,
                'edu_id' => $eduStatus->edu_id,
                'phea_id' => $philhealth->phea_id,
            ]);

            $citizenInfo = CitizenInformation::create([
                'first_name' => 'FirstName' . $i,
                'last_name' => 'LastName' . $i,
                'middle_name' => 'Middle' . $i,
                'date_of_birth' => now()->subYears(rand(18, 60))->subDays(rand(1, 300)),
                'sex' => collect(['Male', 'Female'])->random(),
                'civil_status' => collect(['Single', 'Married', 'Widowed', 'Separated'])->random(),
                'relationship_type' => collect(['Head', 'Spouse', 'Son', 'Daughter', 'Other'])->random(),
                'hh_id' => $hh_id,
                'sitio_id' => $sitio->sitio_id,
                'emp_id' => $employment->emp_id,
                'con_id' => $contact->con_id,
                'demo_id' => $demographic->demo_id,
                'religion' => 'Catholic',
                'is_registered_voter' => (bool) rand(0, 1),
                'is_indigenous' => (bool) rand(0, 1),
                'is_deceased' => false,
            ]);

            Citizen::create([
                'ctz_info_id' => $citizenInfo->ctz_info_id,
                'ctz_number' => (int) (date('Y') . str_pad($i, 5, '0', STR_PAD_LEFT)),
                'encoded_by' => $account->sys_id,
                'updated_by' => $account->sys_id,
            ]);
        }
    }
}
