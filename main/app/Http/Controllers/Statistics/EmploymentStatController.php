<?php

namespace App\Http\Controllers\Statistics;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Citizen;
use App\Models\Sitio;
use Carbon\Carbon;

class EmploymentStatController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        $dateFilterType = $request->query('dateFilterType');

        $originalData = $this->aggregateEmploymentStats(null, null, null);

        $filteredData = null;
        if ($startDate && $endDate && $dateFilterType) {
            $filteredData = $this->aggregateEmploymentStats($startDate, $endDate, $dateFilterType);
        }

        return Inertia::render('main/Statistics/employment-stats', [
            'originalData' => $originalData,
            'filteredData' => $filteredData,
            'filters'      => [
                'startDate'      => $startDate,
                'endDate'        => $endDate,
                'dateFilterType' => $dateFilterType,
            ]
        ]);
    }

    private function aggregateEmploymentStats($startDate, $endDate, $dateFilterType)
    {
        $query = Citizen::with(['info.employment', 'info.sitio'])->whereHas('info', function ($q) {
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

        $employmentData = [];
        foreach ($sitios as $sitio) {
            $employmentData[$sitio->sitio_id] = [
                'name' => $sitio->sitio_name,
                'employed' => 0,
                'unemployed' => 0,
                'selfEmployed' => 0,
                'notInLabor' => 0,
            ];
        }

        $govWorkers = 0;
        $nonGovWorkers = 0;

        $overallStatus = [
            'employed' => 0,
            'unemployed' => 0,
            'selfEmployed' => 0,
            'notInLabor' => 0,
            'total' => 0,
        ];

        foreach ($citizens as $citizen) {
            $info = $citizen->info;
            if (!$info) continue;

            $emp = $info->employment;
            $sitioId = $info->sitio_id;

            $statusStr = $emp ? strtolower($emp->status ?? '') : 'not in labor force'; // fallback

            // 1. Evaluate Overall Status and Sitio Count
            if (str_contains($statusStr, 'self-employed') || str_contains($statusStr, 'self employed')) {
                if (isset($employmentData[$sitioId])) $employmentData[$sitioId]['selfEmployed']++;
                $overallStatus['selfEmployed']++;
            } elseif (str_contains($statusStr, 'unemployed')) {
                if (isset($employmentData[$sitioId])) $employmentData[$sitioId]['unemployed']++;
                $overallStatus['unemployed']++;
            } elseif (str_contains($statusStr, 'employed')) {
                // If the string says "employed", it's employed count (excluding self-employed caught above)
                if (isset($employmentData[$sitioId])) $employmentData[$sitioId]['employed']++;
                $overallStatus['employed']++;
            } else {
                if (isset($employmentData[$sitioId])) $employmentData[$sitioId]['notInLabor']++;
                $overallStatus['notInLabor']++;
            }
            $overallStatus['total']++;

            // 2. Evaluate Gov / Non-Gov
            // Make sure the person is active in the workforce
            if ($emp && str_contains($statusStr, 'employed')) {
                if ($emp->is_gov_worker) {
                    $govWorkers++;
                } else {
                    $nonGovWorkers++;
                }
            }
        }

        return [
            'employmentData' => array_values($employmentData),
            'governmentData' => [
                'govWorkers' => $govWorkers,
                'nonGovWorkers' => $nonGovWorkers,
            ],
            'overallStatus' => $overallStatus,
        ];
    }
}
