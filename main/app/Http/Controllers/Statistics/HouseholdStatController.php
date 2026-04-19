<?php

namespace App\Http\Controllers\Statistics;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\HouseholdInfo;
use App\Models\Sitio;
use Carbon\Carbon;

class HouseholdStatController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        $dateFilterType = $request->query('dateFilterType');

        $originalData = $this->aggregateHouseholdStats(null, null, null);

        $filteredData = null;
        if ($startDate && $endDate && $dateFilterType) {
            $filteredData = $this->aggregateHouseholdStats($startDate, $endDate, $dateFilterType);
        }

        return Inertia::render('main/Statistics/household-stats', [
            'originalData' => $originalData,
            'filteredData' => $filteredData,
            'filters'      => [
                'startDate'      => $startDate,
                'endDate'        => $endDate,
                'dateFilterType' => $dateFilterType,
            ]
        ]);
    }

    private function aggregateHouseholdStats($startDate, $endDate, $dateFilterType)
    {
        $query = HouseholdInfo::with(['sitio', 'citizen_informations'])->where('is_deleted', false);

        if ($startDate && $endDate && $dateFilterType) {
            $column = $dateFilterType === 'updated' ? 'date_updated' : 'date_encoded';
            $start = Carbon::parse($startDate)->startOfDay();
            $end = Carbon::parse($endDate)->endOfDay();
            $query->whereBetween($column, [$start->format('Y-m-d H:i:s'), $end->format('Y-m-d H:i:s')]);
        }

        $households = $query->get();
        $sitios = Sitio::orderBy('sitio_name')->get();

        $householdData = [];
        foreach ($sitios as $sitio) {
            $householdData[$sitio->sitio_id] = [
                'name' => $sitio->sitio_name,
                'totalHouseholds' => 0,
                'totalMembers' => 0,
                'totalMale' => 0,
                'totalFemale' => 0,
                // These will be computed below
                'avgScale' => 0,
                'avgMale' => 0,
                'avgFemale' => 0,
            ];
        }

        $totalHouseholds = 0;
        
        $ownershipCount = [
            'Owned' => 0,
            'Rented' => 0,
            'Rent Free' => 0,
            'Caretaker' => 0,
            'Unknown' => 0,
        ];

        $utilitiesCount = [
            'Level 1 (Point Source)' => 0,
            'Level 2 (Communal Faucet)' => 0,
            'Level 3 (Waterworks)' => 0,
            'Unknown' => 0,
        ];

        foreach ($households as $hh) {
            // Count ownership
            $ownStatus = $hh->ownership_status ?? 'Unknown';
            $mappedOwn = false;
            foreach (array_keys($ownershipCount) as $k) {
                if (stripos($ownStatus, $k) !== false) {
                    $ownershipCount[$k]++;
                    $mappedOwn = true;
                    break;
                }
            }
            if (!$mappedOwn && $ownStatus === 'Unknown') $ownershipCount['Unknown']++;
            else if (!$mappedOwn) $ownershipCount['Unknown']++;

            // Count utilities (water_type)
            $water = $hh->water_type ?? 'Unknown';
            $mappedWater = false;
            foreach (array_keys($utilitiesCount) as $k) {
                if (stripos($water, $k) !== false || stripos($k, $water) !== false) {
                    $utilitiesCount[$k]++;
                    $mappedWater = true;
                    break;
                }
            }
            if (!$mappedWater) $utilitiesCount['Unknown']++;

            // Determine members per household
            $members = $hh->citizen_informations->filter(function($info) {
                return !$info->is_deceased;
            });
            $countMembers = $members->count();
            $countMale = $members->where('sex', 'Male')->count();
            // Note: some string could be 'male' or 'Female' etc, case insensitive comparison is safer
            $countMale = $members->filter(fn($c) => strtolower($c->sex) === 'male')->count();
            $countFemale = $members->filter(fn($c) => strtolower($c->sex) === 'female')->count();

            // Store in sitio bucket
            $sid = $hh->sitio_id;
            if (isset($householdData[$sid])) {
                $householdData[$sid]['totalHouseholds']++;
                $householdData[$sid]['totalMembers'] += $countMembers;
                $householdData[$sid]['totalMale'] += $countMale;
                $householdData[$sid]['totalFemale'] += $countFemale;
            }

            $totalHouseholds++;
        }

        // Calculate averages per sitio
        foreach ($householdData as &$d) {
            if ($d['totalHouseholds'] > 0) {
                $d['avgScale'] = round($d['totalMembers'] / $d['totalHouseholds'], 1);
                $d['avgMale'] = round($d['totalMale'] / $d['totalHouseholds'], 1);
                $d['avgFemale'] = round($d['totalFemale'] / $d['totalHouseholds'], 1);
            }
        }
        unset($d);

        // Map for frontend components
        $ownershipData = [
            ['label' => 'Owned', 'count' => $ownershipCount['Owned'], 'color' => 'bg-indigo-500'],
            ['label' => 'Rented', 'count' => $ownershipCount['Rented'], 'color' => 'bg-emerald-500'],
            ['label' => 'Rent Free', 'count' => $ownershipCount['Rent Free'], 'color' => 'bg-rose-500'],
            ['label' => 'Caretaker', 'count' => $ownershipCount['Caretaker'], 'color' => 'bg-amber-500'],
            ['label' => 'Unknown', 'count' => $ownershipCount['Unknown'], 'color' => 'bg-neutral-500'],
        ];

        $utilitiesData = [];
        foreach ($utilitiesCount as $label => $count) {
            $utilitiesData[] = ['label' => $label, 'count' => $count];
        }

        return [
            'householdData' => array_values($householdData),
            'ownershipData' => $ownershipData,
            'utilitiesData' => $utilitiesData,
            'totalHouseholds' => $totalHouseholds,
        ];
    }
}
