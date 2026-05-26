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
            ];
        }

        $totalHouseholds = 0;

        // Keys match exact values stored by the household form
        $ownershipCount = [
            'Owned' => 0,
            'Rented' => 0,
            'Leased' => 0,
            'Informal Settler' => 0,
            'Unknown' => 0,
        ];

        $waterCount = [
            'Level 1 - Point Source' => 0,
            'Level 2 - Communal Faucet' => 0,
            'Level 3 - Individual Connection' => 0,
            'Unknown' => 0,
        ];

        $toiletCount = [
            'A - Pour/flush type connected to septic tank' => 0,
            'A - Pour/flush toilet connected to Sewerage System' => 0,
            'C - Ventilated Pit (VIP) latrine' => 0,
            'D - Water-sealed toilet' => 0,
            'E - G - Without toilet' => 0,
            'E - Overhung latrine' => 0,
            'F - Open pit latrine' => 0,
            'Unknown' => 0,
        ];

        foreach ($households as $hh) {
            // Ownership — exact match
            $own = $hh->ownership_status ?? null;
            if ($own && isset($ownershipCount[$own])) {
                $ownershipCount[$own]++;
            } else {
                $ownershipCount['Unknown']++;
            }

            // Water source — exact match
            $water = $hh->water_type ?? null;
            if ($water && isset($waterCount[$water])) {
                $waterCount[$water]++;
            } else {
                $waterCount['Unknown']++;
            }

            // Toilet type — exact match
            $toilet = $hh->toilet_type ?? null;
            if ($toilet && isset($toiletCount[$toilet])) {
                $toiletCount[$toilet]++;
            } else {
                $toiletCount['Unknown']++;
            }

            // Members per household
            $members = $hh->citizen_informations->filter(fn($info) => !$info->is_deceased);
            $countMembers = $members->count();
            $countMale = $members->filter(fn($c) => strtolower($c->sex) === 'male')->count();
            $countFemale = $members->filter(fn($c) => strtolower($c->sex) === 'female')->count();

            $sid = $hh->sitio_id;
            if (isset($householdData[$sid])) {
                $householdData[$sid]['totalHouseholds']++;
                $householdData[$sid]['totalMembers'] += $countMembers;
                $householdData[$sid]['totalMale'] += $countMale;
                $householdData[$sid]['totalFemale'] += $countFemale;
            }

            $totalHouseholds++;
        }

        $ownershipData = [
            ['label' => 'Owned',             'count' => $ownershipCount['Owned'],             'color' => 'bg-indigo-500'],
            ['label' => 'Rented',            'count' => $ownershipCount['Rented'],            'color' => 'bg-emerald-500'],
            ['label' => 'Leased',            'count' => $ownershipCount['Leased'],            'color' => 'bg-amber-500'],
            ['label' => 'Informal Settler',  'count' => $ownershipCount['Informal Settler'],  'color' => 'bg-rose-500'],
            ['label' => 'Unknown',           'count' => $ownershipCount['Unknown'],           'color' => 'bg-neutral-500'],
        ];

        $waterData = [];
        foreach ($waterCount as $label => $count) {
            $waterData[] = ['label' => $label, 'count' => $count];
        }

        $toiletData = [];
        foreach ($toiletCount as $label => $count) {
            $toiletData[] = ['label' => $label, 'count' => $count];
        }

        return [
            'householdData' => array_values($householdData),
            'ownershipData' => $ownershipData,
            'waterData' => $waterData,
            'toiletData' => $toiletData,
            'totalHouseholds' => $totalHouseholds,
        ];
    }
}
