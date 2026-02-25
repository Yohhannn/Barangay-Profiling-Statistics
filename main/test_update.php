<?php
use App\Models\Citizen;
use App\Models\CitizenInformation;
use Illuminate\Support\Facades\DB;

$info = CitizenInformation::first();
echo "Updating: " . $info->ctz_info_id . "\n";

DB::enableQueryLog();

try {
    $info->update([
        'is_deceased' => true,
        'date_of_death' => '2026-02-25',
        'cause_of_death' => 'ded',
        'is_registered_voter' => false,
        'is_indigenous' => false,
    ]);
    echo "Success!\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

print_r(DB::getQueryLog());
