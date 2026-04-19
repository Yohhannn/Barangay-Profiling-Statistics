<?php

namespace App\Http\Controllers\Statistics;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\BusinessInfo;
use App\Models\Sitio;
use Carbon\Carbon;

class BusinessStatController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        $dateFilterType = $request->query('dateFilterType'); // 'created' or 'updated'

        // Get Original Overall Data (no date filter applied)
        $originalData = $this->aggregateBusinessStats(null, null, null);

        // Get Filtered Data
        $filteredData = null;
        if ($startDate && $endDate && $dateFilterType) {
            $filteredData = $this->aggregateBusinessStats($startDate, $endDate, $dateFilterType);
        }

        return Inertia::render('main/Statistics/business-stats', [
            'originalData' => $originalData,
            'filteredData' => $filteredData,
            'filters'      => [
                'startDate'      => $startDate,
                'endDate'        => $endDate,
                'dateFilterType' => $dateFilterType,
            ]
        ]);
    }

    private function aggregateBusinessStats($startDate, $endDate, $dateFilterType)
    {
        $query = BusinessInfo::with('sitio')->where('is_deleted', false);

        if ($startDate && $endDate && $dateFilterType) {
            $column = $dateFilterType === 'updated' ? 'date_updated' : 'date_encoded';

            // Parse dates
            $start = Carbon::parse($startDate)->startOfDay();
            $end = Carbon::parse($endDate)->endOfDay();

            // Support models where date_updated/date_encoded might be strings or date types
            $query->whereBetween($column, [$start->format('Y-m-d'), $end->format('Y-m-d')]);
        }

        $businesses = $query->get();

        // 1. Group by Sitio
        $sitios = Sitio::orderBy('sitio_name')->get();
        $businessData = [];
        foreach ($sitios as $sitio) {
            $businessData[$sitio->sitio_id] = [
                'name' => $sitio->sitio_name,
                'active' => 0,
                'inactive' => 0,
                'closed' => 0,
                'suspended' => 0,
            ];
        }

        $totalActive = 0;
        
        // 2. Types Breakdown
        $typesCount = [
            'Sole Proprietorship' => 0,
            'Partnership' => 0,
            'Corporation' => 0,
            'Cooperative' => 0,
            'Franchise' => 0,
            'Others' => 0,
        ];

        foreach ($businesses as $biz) {
            // Count status by Sitio
            if (isset($businessData[$biz->sitio_id])) {
                $status = strtolower($biz->status ?? '');
                if ($status === 'active') {
                    $businessData[$biz->sitio_id]['active']++;
                    $totalActive++;
                } elseif ($status === 'inactive') {
                    $businessData[$biz->sitio_id]['inactive']++;
                } elseif ($status === 'closed') {
                    $businessData[$biz->sitio_id]['closed']++;
                } elseif ($status === 'suspended') {
                    $businessData[$biz->sitio_id]['suspended']++;
                } else {
                    // Default to active if unknown but not deleted? Or omit. Let's omit if unknown.
                }
            }

            // Count Types
            $type = $biz->type;
            if (array_key_exists($type, $typesCount)) {
                $typesCount[$type]++;
            } else {
                $typesCount['Others']++;
            }
        }

        $businessTypes = [
            [ 'label' => 'Sole Proprietorship', 'count' => $typesCount['Sole Proprietorship'], 'color' => 'bg-blue-500' ],
            [ 'label' => 'Partnership', 'count' => $typesCount['Partnership'], 'color' => 'bg-green-500' ],
            [ 'label' => 'Corporation', 'count' => $typesCount['Corporation'], 'color' => 'bg-purple-500' ],
            [ 'label' => 'Cooperative', 'count' => $typesCount['Cooperative'], 'color' => 'bg-orange-500' ],
            [ 'label' => 'Franchise', 'count' => $typesCount['Franchise'], 'color' => 'bg-rose-500' ],
            [ 'label' => 'Others', 'count' => $typesCount['Others'], 'color' => 'bg-neutral-400' ],
        ];

        return [
            'businessData' => array_values($businessData),
            'businessTypes' => $businessTypes,
            'totalActive' => $totalActive,
        ];
    }
}
