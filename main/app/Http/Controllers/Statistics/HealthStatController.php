<?php

namespace App\Http\Controllers\Statistics;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Citizen;
use App\Models\MedicalHistory;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class HealthStatController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        $dateFilterType = $request->query('dateFilterType');

        $originalData = $this->aggregateHealthStats(null, null, null);

        $filteredData = null;
        if ($startDate && $endDate && $dateFilterType) {
            $filteredData = $this->aggregateHealthStats($startDate, $endDate, $dateFilterType);
        }

        return Inertia::render('main/Statistics/health-stats', [
            'originalData' => $originalData,
            'filteredData' => $filteredData,
            'filters'      => [
                'startDate'      => $startDate,
                'endDate'        => $endDate,
                'dateFilterType' => $dateFilterType,
            ]
        ]);
    }

    private function aggregateHealthStats($startDate, $endDate, $dateFilterType)
    {
        // 1. Base Query for Citizens (for Risk Groups, Blood Types, PhilHealth)
        $citizenQuery = Citizen::with([
            'info.demographic.philhealth',
            'info.demographic.healthRiskStatus',
            'medicalHistories', // assuming Citizen model has a medicalHistories relation. Wait, medical history links by ctz_id
        ])->whereHas('info', function ($q) {
            $q->where('is_deceased', false);
        });

        // Date Filtering
        if ($startDate && $endDate && $dateFilterType) {
            $column = $dateFilterType === 'updated' ? 'date_updated' : 'date_encoded';
            $start = Carbon::parse($startDate)->startOfDay();
            $end = Carbon::parse($endDate)->endOfDay();
            
            $citizenQuery->whereBetween($column, [$start->format('Y-m-d H:i:s'), $end->format('Y-m-d H:i:s')]);
        }

        $citizens = $citizenQuery->get();

        // 2. Risk Groups
        $riskGroupsCount = [
            'Pregnant' => 0,
            'Adolescent Pregnant' => 0,
            'Postpartum' => 0,
            'Infants (0-11 mos)' => 0,
            'Under 5 y/o' => 0,
            'PWDs' => 0,
        ];

        // 3. Blood Types
        $bloodTypesRaw = [
            'A+' => 0, 'A-' => 0,
            'B+' => 0, 'B-' => 0,
            'O+' => 0, 'O-' => 0,
            'AB+' => 0, 'AB-' => 0,
            'Unknown' => 0,
        ];

        // 4. Philhealth Categories
        $philhealthRaw = [
            'Formal Economy Private' => 0,
            'Formal Economy Government' => 0,
            'Informal Economy' => 0,
            'NHTS (Indigent)' => 0,
            'Senior Citizen' => 0,
            'Indigenous Person' => 0,
            'Unknown / None' => 0,
        ];

        // 5. Medical records gender tally
        $recordSummaryRaw = [
            'male' => 0,
            'female' => 0,
            'total' => 0,
        ];

        foreach ($citizens as $citizen) {
            $info = $citizen->info;
            if (!$info) continue;

            $demo = $info->demographic;

            // Age & Demographics
            $ageMonths = 999;
            $ageYears = 999;
            if ($info->date_of_birth) {
                $dob = Carbon::parse($info->date_of_birth);
                $ageMonths = $dob->diffInMonths(Carbon::now());
                $ageYears = $dob->age;
            }

            // --- Risk Groups ---
            if ($ageMonths <= 11) $riskGroupsCount['Infants (0-11 mos)']++;
            if ($ageYears < 5) $riskGroupsCount['Under 5 y/o']++;
            
            if ($demo) {
                // Blood Type
                $bt = $demo->blood_type;
                if (array_key_exists($bt, $bloodTypesRaw)) {
                    $bloodTypesRaw[$bt]++;
                } else {
                    $bloodTypesRaw['Unknown']++;
                }

                // Philhealth
                $ph = $demo->philhealth;
                if ($ph) {
                    $cat = $ph->category_name; // We expect things like NHTS, Formal Economy, etc.
                    $mapped = false;
                    foreach (array_keys($philhealthRaw) as $k) {
                        if (stripos($cat, $k) !== false || $k === $cat) {
                            $philhealthRaw[$k]++;
                            $mapped = true;
                            break;
                        }
                    }
                    if (!$mapped) $philhealthRaw['Unknown / None']++;
                } else {
                    $philhealthRaw['Unknown / None']++;
                }

                // Health Risk Status Class
                $hr = $demo->healthRiskStatus;
                if ($hr) {
                    $name = strtolower($hr->clah_classification_name ?? '');
                    if (str_contains($name, 'pregnant')) {
                        if ($ageYears < 20) $riskGroupsCount['Adolescent Pregnant']++;
                        else $riskGroupsCount['Pregnant']++;
                    }
                    if (str_contains($name, 'postpartum') || str_contains($name, 'post-partum')) {
                        $riskGroupsCount['Postpartum']++;
                    }
                    if (str_contains($name, 'pwd') || str_contains($name, 'person with disability')) {
                        $riskGroupsCount['PWDs']++;
                    }
                }
            } else {
                $bloodTypesRaw['Unknown']++;
                $philhealthRaw['Unknown / None']++;
            }
        }

        // --- Medical Records and Gender Tally ---
        $medQuery = MedicalHistory::where('is_deleted', false);
        
        if ($startDate && $endDate && $dateFilterType) {
            $columnM = $dateFilterType === 'updated' ? 'date_updated' : 'date_encoded';
            $medQuery->whereBetween($columnM, [$startDate, $endDate]);
        }
        
        $medicalCasesQuery = clone $medQuery;
        
        // Medical history records grouping
        $topCases = $medicalCasesQuery
            ->select('type as name', DB::raw('count(*) as count'))
            ->groupBy('type')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        // Let's identify the users who have medical records and track gender
        // A single citizen has medical records
        $ctzWithMed = $medQuery->select('ctz_id')->distinct()->pluck('ctz_id');
        $ctzDetails = Citizen::whereIn('ctz_id', $ctzWithMed)->with('info')->get();
        foreach ($ctzDetails as $c) {
             if ($c->info && strtolower($c->info->sex) === 'male') {
                 $recordSummaryRaw['male']++;
             } else {
                 $recordSummaryRaw['female']++;
             }
             $recordSummaryRaw['total']++;
        }

        // Format for frontend arrays
        $riskGroups = [
            ['label' => 'Pregnant', 'count' => $riskGroupsCount['Pregnant'], 'color' => 'bg-pink-500'],
            ['label' => 'Adolescent Pregnant', 'count' => $riskGroupsCount['Adolescent Pregnant'], 'color' => 'bg-rose-500'],
            ['label' => 'Postpartum', 'count' => $riskGroupsCount['Postpartum'], 'color' => 'bg-fuchsia-500'],
            ['label' => 'Infants (0-11 mos)', 'count' => $riskGroupsCount['Infants (0-11 mos)'], 'color' => 'bg-blue-400'],
            ['label' => 'Under 5 y/o', 'count' => $riskGroupsCount['Under 5 y/o'], 'color' => 'bg-cyan-500'],
            ['label' => 'PWDs', 'count' => $riskGroupsCount['PWDs'], 'color' => 'bg-amber-500'],
        ];

        $bloodTypes = [];
        foreach ($bloodTypesRaw as $type => $count) {
            $bloodTypes[] = ['type' => $type, 'count' => $count];
        }

        $medicalCases = [];
        $rank = 1;
        foreach ($topCases as $c) {
            $medicalCases[] = [ 'rank' => $rank++, 'name' => $c->name ?? 'Unknown', 'count' => $c->count ];
        }

        $philhealthData = [];
        foreach ($philhealthRaw as $label => $count) {
            $philhealthData[] = ['label' => $label, 'count' => $count];
        }

        return [
            'riskGroups' => $riskGroups,
            'bloodTypes' => $bloodTypes,
            'medicalCases' => $medicalCases,
            'philhealthData' => $philhealthData,
            'recordSummary' => $recordSummaryRaw,
        ];
    }
}
