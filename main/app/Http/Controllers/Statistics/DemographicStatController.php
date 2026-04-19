<?php

namespace App\Http\Controllers\Statistics;

use App\Http\Controllers\Controller;
use App\Models\demographic;
use Illuminate\Http\Request;

class DemographicStatController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $startDate = $request->input('startDate');
        $endDate = $request->input('endDate');
        $dateFilterType = $request->input('dateFilterType', 'created');

        // Base Query - Get all non-deleted citizens along with their info and demographic stats
        $baseQuery = \App\Models\Citizen::where('is_deleted', false)
            ->with([
                'citizenInformation.demographic.socioEconomicStatus',
            ]);

        // We fetch all records mapped for original Data
        $allCitizens = $baseQuery->get();
        $originalData = $this->aggregateDemographics($allCitizens);

        $filteredData = null;
        if ($startDate && $endDate && $dateFilterType) {
            $filterColumn = $dateFilterType === 'created' ? 'date_encoded' : 'date_updated';
            
            // Re-fetch with date filter
            $filteredCitizens = clone $baseQuery;
            $filteredCitizens = $filteredCitizens->whereDate($filterColumn, '>=', $startDate)
                                                 ->whereDate($filterColumn, '<=', $endDate)
                                                 ->get();
                                                 
            $filteredData = $this->aggregateDemographics($filteredCitizens);
        }

        return \Inertia\Inertia::render('main/Statistics/demographic-stats', [
            'originalData' => $originalData,
            'filteredData' => $filteredData,
            'filters'      => $request->only(['startDate', 'endDate', 'dateFilterType'])
        ]);
    }

    private function aggregateDemographics($citizens)
    {
        $totalPopulation = 0;
        $male = 0;
        $female = 0;

        $ageGroups = [
            'Infant (0-2)' => 0,
            'Child (3-12)' => 0,
            'Minor (13-17)' => 0,
            'Young Adult (18-24)' => 0,
            'Adult (25-39)' => 0,
            'Middle Aged (40-59)' => 0,
            'Senior (60+)' => 0,
        ];

        $voters = [
            'registered' => 0,
            'unregistered' => 0,
            'maleVoters' => 0,
            'femaleVoters' => 0,
        ];

        $religions = [];
        $civilStatuses = [];
        
        $beneficiaries = [
            'nhts4ps' => 0,
            'nhtsNon4ps' => 0,
            'nonNhts' => 0,
        ];

        $deceased = 0;
        $indigenous = 0;

        foreach ($citizens as $citizen) {
            $info = $citizen->citizenInformation;
            if (!$info) continue;

            // Deceased usually aren't counted in total pop for active stats
            if ($info->is_deceased) {
                $deceased++;
            } else {
                $totalPopulation++;
            }

            if ($info->is_indigenous) {
                $indigenous++;
            }

            // Gender
            $sexStr = strtolower($info->sex ?? 'unknown');
            if ($sexStr === 'male' || $sexStr === 'm') $male++;
            if ($sexStr === 'female' || $sexStr === 'f') $female++;

            // Age mapping
            if ($info->date_of_birth) {
                $age = \Carbon\Carbon::parse($info->date_of_birth)->age;
                if ($age <= 2) $ageGroups['Infant (0-2)']++;
                elseif ($age <= 12) $ageGroups['Child (3-12)']++;
                elseif ($age <= 17) $ageGroups['Minor (13-17)']++;
                elseif ($age <= 24) $ageGroups['Young Adult (18-24)']++;
                elseif ($age <= 39) $ageGroups['Adult (25-39)']++;
                elseif ($age <= 59) $ageGroups['Middle Aged (40-59)']++;
                else $ageGroups['Senior (60+)']++;
            }

            // Voters (assuming age 18+ can be unregistered, but DB has exact is_registered_voter toggle)
            if ($info->is_registered_voter) {
                $voters['registered']++;
                if ($sexStr === 'male' || $sexStr === 'm') $voters['maleVoters']++;
                if ($sexStr === 'female' || $sexStr === 'f') $voters['femaleVoters']++;
            } else {
                // If they are 18+ and not registered
                if (isset($age) && $age >= 18) {
                    $voters['unregistered']++;
                }
            }

            // Religion
            $religionName = $info->religion ?: 'Others';
            if (!isset($religions[$religionName])) {
                $religions[$religionName] = 0;
            }
            $religions[$religionName]++;

            // Civil Status
            $civilStatusName = $info->civil_status ?: 'Unknown';
            if (!isset($civilStatuses[$civilStatusName])) {
                $civilStatuses[$civilStatusName] = ['male' => 0, 'female' => 0];
            }
            if ($sexStr === 'male' || $sexStr === 'm') $civilStatuses[$civilStatusName]['male']++;
            if ($sexStr === 'female' || $sexStr === 'f') $civilStatuses[$civilStatusName]['female']++;

            // Beneficiaries via SocioEconomic
            $soec = $info->demographic?->socioEconomicStatus?->soec_status ?? '';
            $soecLower = strtolower($soec);

            if (str_contains($soecLower, '4ps') && !str_contains($soecLower, 'non')) {
                $beneficiaries['nhts4ps']++;
            } elseif (str_contains($soecLower, 'nhts') && str_contains($soecLower, 'non')) {
                $beneficiaries['nhtsNon4ps']++;
            } else {
                $beneficiaries['nonNhts']++;
            }
        }

        // Format outputs to match Frontend
        $formattedAgeGroups = [
            ['label' => 'Infant (0-2)', 'count' => $ageGroups['Infant (0-2)'], 'color' => 'bg-blue-500'],
            ['label' => 'Child (3-12)', 'count' => $ageGroups['Child (3-12)'], 'color' => 'bg-green-500'],
            ['label' => 'Minor (13-17)', 'count' => $ageGroups['Minor (13-17)'], 'color' => 'bg-teal-500'],
            ['label' => 'Young Adult (18-24)', 'count' => $ageGroups['Young Adult (18-24)'], 'color' => 'bg-purple-500'],
            ['label' => 'Adult (25-39)', 'count' => $ageGroups['Adult (25-39)'], 'color' => 'bg-indigo-500'],
            ['label' => 'Middle Aged (40-59)', 'count' => $ageGroups['Middle Aged (40-59)'], 'color' => 'bg-orange-500'],
            ['label' => 'Senior (60+)', 'count' => $ageGroups['Senior (60+)'], 'color' => 'bg-red-500'],
        ];

        $formattedReligions = [];
        // Sort religions by count desc
        arsort($religions);
        foreach ($religions as $name => $count) {
            $formattedReligions[] = ['name' => $name, 'count' => $count];
        }

        $formattedCivilStatus = [];
        foreach ($civilStatuses as $status => $counts) {
            $formattedCivilStatus[] = [
                'status' => $status,
                'male' => $counts['male'],
                'female' => $counts['female'],
            ];
        }

        return [
            'totalPopulation' => $totalPopulation,
            'gender' => ['male' => $male, 'female' => $female],
            'ageGroups' => $formattedAgeGroups,
            'voters' => $voters,
            'religion' => array_slice($formattedReligions, 0, 6), // limit to top 6 to avoid massive lists
            'civilStatus' => $formattedCivilStatus,
            'beneficiaries' => $beneficiaries,
            'others' => [
                'deceased' => $deceased,
                'indigenous' => $indigenous,
            ]
        ];
    }
}
