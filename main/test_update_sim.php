<?php
use App\Models\Citizen;
use App\Models\CitizenInformation;
use Illuminate\Http\Request;
use App\Http\Controllers\Citizens\CitizenController;
use Illuminate\Support\Facades\DB;

$citizen = Citizen::whereHas('info')->first();
echo "Testing with Citizen ID: " . $citizen->ctz_id . " Info ID: " . $citizen->info->ctz_info_id . "\n";

$data = [
    'first_name' => 'Test',
    'last_name' => 'Data',
    'middle_name' => '',
    'suffix' => '',
    'sex' => 'Male',
    'date_of_birth' => '1990-01-01',
    'place_of_birth' => 'Test',
    'civil_status' => 'Single',
    'religion' => 'Catholic',
    'blood_type' => 'O+',
    'contact_numbers' => [],
    'email' => '',
    'sitio' => null,
    'household_id' => null,
    'relationship_to_head' => null,
    'socio_economic_class' => 'Non-NHTS',
    'nhts_number' => null,
    'employment_status' => 'Unemployed',
    'occupation' => null,
    'is_gov' => false,
    'philhealth_id' => null,
    'philhealth_category' => null,
    'philhealth_membership' => null,
    'is_studying' => false,
    'school_name' => null,
    'current_level' => null,
    'elementary_name' => null,
    'highschool_name' => null,
    'senior_high_name' => null,
    'college_name' => null,
    'health_classification' => null,
    'is_voter' => false,
    'is_ip' => false,
    'is_deceased' => true,
    'date_of_death' => '2026-02-25',
    'cause_of_death' => 'ded',
    'fp_method' => null,
    'fp_status' => null,
    'fp_start_date' => null,
    'fp_end_date' => null,
];

DB::enableQueryLog();

try {
    $request = new Request($data);
    $controller = new CitizenController();
    $controller->update($request, $citizen->ctz_id);
    echo "Controller update completed.\n";
} catch (\Exception $e) {
    echo "Controller Exception: " . $e->getMessage() . "\n";
}

$queries = DB::getQueryLog();
$lastQueries = array_slice($queries, -5);
foreach ($lastQueries as $q) {
    echo "SQL: " . $q['query'] . "\n";
    echo "Bindings: " . json_encode($q['bindings']) . "\n\n";
}
