<?php

namespace App\Http\Controllers\Statistics;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Citizen;
use App\Models\Sitio;
use Carbon\Carbon;

class NeighborhoodController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        $dateFilterType = $request->query('dateFilterType');

        $originalData = $this->aggregateNeighborhoodStats(null, null, null);

        $filteredData = null;
        if ($startDate && $endDate && $dateFilterType) {
            $filteredData = $this->aggregateNeighborhoodStats($startDate, $endDate, $dateFilterType);
        }

        return Inertia::render('main/Statistics/neighborhood-stats', [
            'originalData' => $originalData,
            'filteredData' => $filteredData,
            'filters'      => [
                'startDate'      => $startDate,
                'endDate'        => $endDate,
                'dateFilterType' => $dateFilterType,
            ]
        ]);
    }

    private function aggregateNeighborhoodStats($startDate, $endDate, $dateFilterType)
    {
        $query = Citizen::with(['info.demographic.healthRiskStatus', 'info.sitio'])->whereHas('info', function ($q) {
            $q->where('is_deceased', false);
        });

        if ($startDate && $endDate && $dateFilterType) {
            $column = $dateFilterType === 'updated' ? 'date_updated' : 'date_encoded';
            $start = Carbon::parse($startDate)->startOfDay();
            $end = Carbon::parse($endDate)->endOfDay();
            $query->whereBetween($column, [$start->format('Y-m-d H:i:s'), $end->format('Y-m-d H:i:s')]);
        }

        $citizens = $query->get();
        $sitios = Sitio::orderBy('sitio_name')->get();

        $neighborhoodData = [];
        $sitioTotals = [];

        foreach ($sitios as $sitio) {
            $neighborhoodData[$sitio->sitio_id] = [
                'name' => $sitio->sitio_name,
                'male' => 0,
                'female' => 0,
                'seniors' => 0,
                'pwd' => 0,
                'voters' => 0,
                'total' => 0,
            ];
            $sitioTotals[$sitio->sitio_id] = 0;
        }

        $totalMale = 0;
        $totalFemale = 0;

        foreach ($citizens as $citizen) {
            $info = $citizen->info;
            if (!$info) continue;

            $sid = $info->sitio_id;
            if (!isset($neighborhoodData[$sid])) continue;

            // Base tracking
            $neighborhoodData[$sid]['total']++;
            $sitioTotals[$sid]++;

            // Gender
            if (strtolower($info->sex) === 'male') {
                $neighborhoodData[$sid]['male']++;
                $totalMale++;
            } else {
                $neighborhoodData[$sid]['female']++;
                $totalFemale++;
            }

            // Seniors
            if ($info->date_of_birth) {
                $age = Carbon::parse($info->date_of_birth)->age;
                if ($age >= 60) {
                    $neighborhoodData[$sid]['seniors']++;
                }
            }

            // Voters
            if ($info->is_registered_voter) {
                $neighborhoodData[$sid]['voters']++;
            }

            // PWD
            $demo = $info->demographic;
            if ($demo && $demo->healthRiskStatus) {
                $cl = strtolower($demo->healthRiskStatus->clah_classification_name ?? '');
                if (str_contains($cl, 'pwd') || str_contains($cl, 'disability')) {
                    $neighborhoodData[$sid]['pwd']++;
                }
            }
        }

        // Extracted Analytics
        $totalPopulation = array_sum($sitioTotals);
        
        $highestPopulation = null;
        $lowestPopulation = null;

        if (count($sitioTotals) > 0) {
            arsort($sitioTotals); // Sort high to low
            $sids = array_keys($sitioTotals);
            
            $highId = $sids[0];
            $lowId = end($sids); 

            // Make sure high/low count > 0 if filtering applied
            // But if filtered is 0 everywhere, they're both 0
            $highestPopulation = [
                'name' => $neighborhoodData[$highId]['name'] ?? 'None',
                'count' => $sitioTotals[$highId] ?? 0
            ];
            $lowestPopulation = [
                'name' => $neighborhoodData[$lowId]['name'] ?? 'None',
                'count' => $sitioTotals[$lowId] ?? 0
            ];
        }

        return [
            'neighborhoodData' => array_values($neighborhoodData),
            'totalPopulation' => $totalPopulation,
            'totalMale' => $totalMale,
            'totalFemale' => $totalFemale,
            'highestPopulation' => $highestPopulation,
            'lowestPopulation' => $lowestPopulation,
        ];
    }
}
