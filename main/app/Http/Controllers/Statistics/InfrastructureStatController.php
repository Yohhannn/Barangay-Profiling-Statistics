<?php

namespace App\Http\Controllers\Statistics;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Infrastructure;
use App\Models\Sitio;
use Carbon\Carbon;

class InfrastructureStatController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        $dateFilterType = $request->query('dateFilterType');

        $originalData = $this->aggregateInfrastructureStats(null, null, null);

        $filteredData = null;
        if ($startDate && $endDate && $dateFilterType) {
            $filteredData = $this->aggregateInfrastructureStats($startDate, $endDate, $dateFilterType);
        }

        return Inertia::render('main/Statistics/infrastructure-stats', [
            'originalData' => $originalData,
            'filteredData' => $filteredData,
            'filters'      => [
                'startDate'      => $startDate,
                'endDate'        => $endDate,
                'dateFilterType' => $dateFilterType,
            ]
        ]);
    }

    private function aggregateInfrastructureStats($startDate, $endDate, $dateFilterType)
    {
        $query = Infrastructure::with('sitio')->where('is_deleted', false);

        if ($startDate && $endDate && $dateFilterType) {
            $column = $dateFilterType === 'updated' ? 'date_updated' : 'date_encoded';
            $start = Carbon::parse($startDate)->startOfDay();
            $end = Carbon::parse($endDate)->endOfDay();
            $query->whereBetween($column, [$start->format('Y-m-d H:i:s'), $end->format('Y-m-d H:i:s')]);
        }

        $infrastructures = $query->get();
        $sitios = Sitio::orderBy('sitio_name')->get();

        $infrastructureData = [];
        foreach ($sitios as $sitio) {
            $infrastructureData[$sitio->sitio_id] = [
                'name' => $sitio->sitio_name,
                'school' => 0,
                'sports' => 0,
                'health' => 0,
                'chapel' => 0,
                'barangay' => 0,
                'other' => 0,
            ];
        }

        $totalInfra = 0;
        $publicCount = 0;
        $privateCount = 0;

        $infrastructureTypesRaw = [
            'Chapel / Religious' => 0,
            'Health Center' => 0,
            'Daycare Center' => 0,
            'Barangay Hall / Outpost' => 0,
            'Plaza / Sports Complex' => 0,
            'School / Educational' => 0,
            'Commercial Building' => 0,
            'Others' => 0,
        ];

        foreach ($infrastructures as $infra) {
            // Count total
            $totalInfra++;

            // Detect Ownership
            if (!empty($infra->owner_fname) || !empty($infra->owner_lname)) {
                $privateCount++;
            } else {
                $publicCount++;
            }

            // Categorize
            $t = $infra->type ?? 'Others';
            $sid = $infra->sitio_id;
            
            // Try to match Type String
            $mapped = false;
            foreach (array_keys($infrastructureTypesRaw) as $k) {
                // simple sub-word match
                $short = explode(' ', $k)[0];
                if (stripos($t, $short) !== false || stripos($k, $t) !== false) {
                    $infrastructureTypesRaw[$k]++;
                    $mapped = true;
                    // also tally for main table
                    if (isset($infrastructureData[$sid])) {
                        if (stripos($k, 'school') !== false) $infrastructureData[$sid]['school']++;
                        elseif (stripos($k, 'sport') !== false || stripos($k, 'plaza') !== false) $infrastructureData[$sid]['sports']++;
                        elseif (stripos($k, 'health') !== false) $infrastructureData[$sid]['health']++;
                        elseif (stripos($k, 'chapel') !== false) $infrastructureData[$sid]['chapel']++;
                        elseif (stripos($k, 'barangay') !== false) $infrastructureData[$sid]['barangay']++;
                        else $infrastructureData[$sid]['other']++;
                    }
                    break;
                }
            }

            if (!$mapped) {
                // If it didn't map at all, maybe some distinct strings
                if (stripos($t, 'educational') !== false) {
                    $infrastructureTypesRaw['School / Educational']++;
                    if (isset($infrastructureData[$sid])) $infrastructureData[$sid]['school']++;
                } else if (stripos($t, 'church') !== false || stripos($t, 'mosque') !== false) {
                    $infrastructureTypesRaw['Chapel / Religious']++;
                    if (isset($infrastructureData[$sid])) $infrastructureData[$sid]['chapel']++;
                } else if (stripos($t, 'medical') !== false || stripos($t, 'clinic') !== false) {
                    $infrastructureTypesRaw['Health Center']++;
                    if (isset($infrastructureData[$sid])) $infrastructureData[$sid]['health']++;
                } else if (stripos($t, 'court') !== false || stripos($t, 'park') !== false) {
                    $infrastructureTypesRaw['Plaza / Sports Complex']++;
                    if (isset($infrastructureData[$sid])) $infrastructureData[$sid]['sports']++;
                } else if (stripos($t, 'outpost') !== false || stripos($t, 'hall') !== false) {
                    $infrastructureTypesRaw['Barangay Hall / Outpost']++;
                    if (isset($infrastructureData[$sid])) $infrastructureData[$sid]['barangay']++;
                } else if (stripos($t, 'commercial') !== false || stripos($t, 'business') !== false) {
                    $infrastructureTypesRaw['Commercial Building']++;
                    if (isset($infrastructureData[$sid])) $infrastructureData[$sid]['other']++;
                } else {
                    $infrastructureTypesRaw['Others']++;
                    if (isset($infrastructureData[$sid])) $infrastructureData[$sid]['other']++;
                }
            }
        }

        // Prepare Frontend Types Format
        $infrastructureTypes = [
            [ 'label' => 'Chapel / Religious', 'count' => $infrastructureTypesRaw['Chapel / Religious'], 'color' => 'bg-indigo-500' ],
            [ 'label' => 'Health Center', 'count' => $infrastructureTypesRaw['Health Center'], 'color' => 'bg-rose-500' ],
            [ 'label' => 'Daycare Center', 'count' => $infrastructureTypesRaw['Daycare Center'], 'color' => 'bg-amber-400' ],
            [ 'label' => 'Barangay Hall / Outpost', 'count' => $infrastructureTypesRaw['Barangay Hall / Outpost'], 'color' => 'bg-blue-600' ],
            [ 'label' => 'Plaza / Sports Complex', 'count' => $infrastructureTypesRaw['Plaza / Sports Complex'], 'color' => 'bg-emerald-500' ],
            [ 'label' => 'School / Educational', 'count' => $infrastructureTypesRaw['School / Educational'], 'color' => 'bg-cyan-500' ],
            [ 'label' => 'Commercial Building', 'count' => $infrastructureTypesRaw['Commercial Building'], 'color' => 'bg-slate-700' ],
            [ 'label' => 'Others', 'count' => $infrastructureTypesRaw['Others'], 'color' => 'bg-neutral-500' ],
        ];

        return [
            'infrastructureData' => array_values($infrastructureData),
            'infrastructureTypes' => $infrastructureTypes,
            'totalInfra' => $totalInfra,
            'ownershipData' => [
                'public' => $publicCount,
                'private' => $privateCount,
            ]
        ];
    }
}
