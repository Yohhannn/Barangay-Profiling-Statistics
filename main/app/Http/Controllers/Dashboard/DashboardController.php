<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Citizen;
use App\Models\HouseholdInfo;
use App\Models\businessInfo; 
use App\Models\Infrastructure;
use App\Models\TransactionLog;
use App\Models\SettlementLog;

class DashboardController extends Controller
{
    /**
     * Display the statistical overview display.
     */
    public function index()
    {
        $totalCitizens = Citizen::where('is_deleted', false)->count();
        $totalHouseholds = HouseholdInfo::where('is_deleted', false)->count();
        $totalBusinesses = businessInfo::where('is_deleted', false)->count(); 
        $totalInfrastructures = Infrastructure::where('is_deleted', false)->count();
        
        // Additional demographic stats
        $totalVoters = \App\Models\CitizenInformation::where('is_registered_voter', true)->count();
        $totalMale = \App\Models\CitizenInformation::where('sex', 'Male')->count();
        $totalFemale = \App\Models\CitizenInformation::where('sex', 'Female')->count();

        // Transaction & Settlement Stats
        $totalTransactions = TransactionLog::count(); // Could add where('status', 'Pending') etc. if there was a requirement
        $totalSettlements = SettlementLog::where('is_deleted', false)->count();

        // Getting recently added citizens, joined with `citizenInformation` and its `sitio`
        $recentCitizensRaw = Citizen::with(['citizenInformation.sitio'])
            ->where('is_deleted', false)
            ->latest('date_encoded')
            ->take(6)
            ->get();
            
        // Map the payload matching Typescript React component
        $recentCitizens = $recentCitizensRaw->map(function ($citizen) {
            $info = $citizen->citizenInformation;
            $firstName = $info ? $info->first_name : 'Unknown';
            $lastName = $info ? $info->last_name : '';
            
            // Getting Sitio name if applicable
            $sitioName = 'N/A';
            if ($info && $info->sitio) {
                 $sitioName = $info->sitio->sitio_name;
            }

            return [
                'id' => $citizen->ctz_id,
                'name' => trim("$firstName $lastName"),
                'barangay_id' => $sitioName, // We are utilizing `barangay_id` prop as location/Sitio string according to component ui
                'status' => $info && $info->is_registered_voter ? 'VOTER' : 'NON-VOTER',
                'created_at' => $citizen->date_encoded ? $citizen->date_encoded->toIsoString() : now()->toIsoString(),
            ];
        });

        return Inertia::render('dashboard', [
            'stats' => [
                'totalCitizens' => $totalCitizens,
                'totalHouseholds' => $totalHouseholds,
                'totalBusinesses' => $totalBusinesses,
                'totalInfrastructures' => $totalInfrastructures,
                'totalVoters' => $totalVoters,
                'totalMale' => $totalMale,
                'totalFemale' => $totalFemale,
                'totalTransactions' => $totalTransactions,
                'totalSettlements' => $totalSettlements,
            ],
            'recentCitizens' => $recentCitizens,
        ]);
    }
}
