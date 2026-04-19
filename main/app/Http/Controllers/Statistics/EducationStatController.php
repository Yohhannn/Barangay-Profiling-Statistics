<?php

namespace App\Http\Controllers\Statistics;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Citizen;
use Carbon\Carbon;

class EducationStatController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        $dateFilterType = $request->query('dateFilterType'); // 'created' or 'updated'

        // Get Original Overall Data
        $originalData = $this->aggregateEducationStats(null, null, null);

        // Get Filtered Data
        $filteredData = null;
        if ($startDate && $endDate && $dateFilterType) {
            $filteredData = $this->aggregateEducationStats($startDate, $endDate, $dateFilterType);
        }

        return Inertia::render('main/Statistics/education-stats', [
            'originalData' => $originalData,
            'filteredData' => $filteredData,
            'filters'      => [
                'startDate'      => $startDate,
                'endDate'        => $endDate,
                'dateFilterType' => $dateFilterType,
            ]
        ]);
    }

    private function aggregateEducationStats($startDate, $endDate, $dateFilterType)
    {
        // Query citizens with their education info
        $query = Citizen::with([
            'info.demographic.educationLevel'
        ])->whereHas('info', function ($q) {
            // Usually we only count living people for education stats
            $q->where('is_deceased', false);
        });

        if ($startDate && $endDate && $dateFilterType) {
            $column = $dateFilterType === 'updated' ? 'date_updated' : 'date_encoded';
            $start = Carbon::parse($startDate)->startOfDay();
            $end = Carbon::parse($endDate)->endOfDay();
            $query->whereBetween($column, [$start->format('Y-m-d H:i:s'), $end->format('Y-m-d H:i:s')]);
        }

        $citizens = $query->get();

        $studying = 0;
        $notStudying = 0;
        
        // Match the frontend mock labels
        $attainmentCounts = [
            'No Formal Education' => 0,
            'Kindergarten' => 0,
            'Elementary Undergraduate' => 0,
            'Elementary Graduate' => 0,
            'Junior High Undergraduate' => 0,
            'Junior High Graduate' => 0,
            'Senior High Undergraduate' => 0,
            'Senior High Graduate' => 0,
            'Vocational / Technical' => 0,
            'College Undergraduate' => 0,
            'College Graduate' => 0,
            'Postgraduate' => 0,
            'Unknown' => 0,
        ];

        foreach ($citizens as $citizen) {
            $info = $citizen->info;
            $demo = $info ? $info->demographic : null;
            $edu = $demo ? $demo->educationLevel : null;

            if ($edu) {
                if ($edu->is_current_student) {
                    $studying++;
                } else {
                    $notStudying++;
                }

                $level = $edu->education_level;
                // Try to find exact match or classify
                if ($level && array_key_exists($level, $attainmentCounts)) {
                    $attainmentCounts[$level]++;
                } else {
                    $attainmentCounts['Unknown']++;
                }
            } else {
                $notStudying++; // If no education record exists, default to not studying and unknown
                $attainmentCounts['Unknown']++;
            }
        }

        $educationStatus = [
            'studying' => $studying,
            'notStudying' => $notStudying,
            'total' => $studying + $notStudying,
        ];

        $educationAttainment = [
            [ 'label' => 'No Formal Education', 'count' => $attainmentCounts['No Formal Education'], 'color' => 'bg-slate-500' ],
            [ 'label' => 'Kindergarten', 'count' => $attainmentCounts['Kindergarten'], 'color' => 'bg-pink-500' ],
            [ 'label' => 'Elementary Undergraduate', 'count' => $attainmentCounts['Elementary Undergraduate'], 'color' => 'bg-blue-400' ],
            [ 'label' => 'Elementary Graduate', 'count' => $attainmentCounts['Elementary Graduate'], 'color' => 'bg-blue-600' ],
            [ 'label' => 'Junior High Undergraduate', 'count' => $attainmentCounts['Junior High Undergraduate'], 'color' => 'bg-indigo-400' ],
            [ 'label' => 'Junior High Graduate', 'count' => $attainmentCounts['Junior High Graduate'], 'color' => 'bg-indigo-600' ],
            [ 'label' => 'Senior High Undergraduate', 'count' => $attainmentCounts['Senior High Undergraduate'], 'color' => 'bg-purple-400' ],
            [ 'label' => 'Senior High Graduate', 'count' => $attainmentCounts['Senior High Graduate'], 'color' => 'bg-purple-600' ],
            [ 'label' => 'Vocational / Technical', 'count' => $attainmentCounts['Vocational / Technical'], 'color' => 'bg-orange-500' ],
            [ 'label' => 'College Undergraduate', 'count' => $attainmentCounts['College Undergraduate'], 'color' => 'bg-teal-400' ],
            [ 'label' => 'College Graduate', 'count' => $attainmentCounts['College Graduate'], 'color' => 'bg-teal-600' ],
            [ 'label' => 'Postgraduate', 'count' => $attainmentCounts['Postgraduate'], 'color' => 'bg-emerald-600' ],
            [ 'label' => 'Unknown', 'count' => $attainmentCounts['Unknown'], 'color' => 'bg-neutral-400' ],
        ];

        return [
            'educationStatus' => $educationStatus,
            'educationAttainment' => $educationAttainment,
        ];
    }
}
