<?php
namespace App\Http\Controllers\pages;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Services\UserCacheServices;
class DashboardController extends Controller
{
    public function __construct(private UserCacheServices $userCacheServices){}
    public function index(){ 

        $systemAcount = Auth::user();
        $statisticCounts = [
            'totalCitizens' => $this->userCacheServices->getCountCitizen(),
            'totalHouseholds' => $this->userCacheServices->getCountHousehold(),
            'totalBusinesses' => $this->userCacheServices->getCountBusiness(),
            'totalInfrastructures' => $this->userCacheServices->getCountInfrastructures(),
        ];
        $latestCitizens = $this->userCacheServices->getLatestCitizens()->map(function($citizen){
            return [
                    "id" => $citizen->ctz_id,
                    "name" => $citizen->ctz_fname . ' ' . $citizen->ctz_lname,
                    "barangay_id" => $citizen->barangay_id,
                    "created_at" => $citizen->created_at,
            ];
        });
        return Inertia::render('dashboard',[
            'stats' => $statisticCounts,
            'latestCitizens' => $latestCitizens,
        ]);
    }
    

}