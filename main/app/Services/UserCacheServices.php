<?php
namespace App\Services;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;
use App\Models\Citizen;
use App\Models\HouseholdInfo;
use App\Models\businessInfo;
use App\Models\Infrastructure;
use App\Models\SystemPermission;
use App\Models\Sitio;

class UserCacheServices{

    public function getRoles(){
        return Cache::remember('user_roles'. Auth::id(),3600, function(){
            return Auth::user()->sys_role;
        });
    }
    // Load citizen with their household (foreign key relationship)
    public function getAllCitizen(){
        return Cache::remember('all_citizens',3600, function(){
            return Citizen::where('is_deleted', false)
                ->with('household')           
                ->with('medicalHistory')      
                ->get();
        });
    }
    // Load household with all its citizens
    public function getAllHousehold(){
        return Cache::remember('all_households',3600, function(){
            return HouseholdInfo::where('is_deleted', false)
                ->with('citizens')            
                ->with('sitio')               
                ->get();
        });
    }
    public function getAllSitios(){
        return Cache::remember('all_sitios',3600, function(){
            return Sitio::where('is_deleted', false)->get();
        });
    }
    public function getCountHousehold(){
        return Cache::remember('count_households',3600, function(){
            return HouseholdInfo::where('is_deleted', false)->count();
        });
    }
    public function getCountCitizen(){
        return Cache::remember('count_citizens',3600, function(){
            return Citizen::where('is_deleted', false)->count();
        });
    }
    // Multiple relationships at once
    public function getAllBusiness(){
        return Cache::remember('all_businesses',3600, function(){
            return businessInfo::where('is_deleted', false)
                ->with(['encodedBy', 'updatedBy']) 
                ->get();
        });
    }
    public function getCountBusiness(){
        return Cache::remember('count_businesses',3600, function(){
            return businessInfo::where('is_deleted', false)->count();
        });
    }
    public function getAllInfrastracture(){
        return Cache::remember('all_infrastructures',3600, function(){
            return Infrastructure::where('is_deleted', false)->get();
        });
    }
    public function getCountInfrastructures(){
        return Cache::remember('count_infrastructures',3600, function(){
            return Infrastructure::where('is_deleted', false)->count();
        });
    }
    public function getSystemPermissions(){
        return Cache::remember('system_permissions'. Auth::id(),3600, function(){
            return SystemPermission::where('sys_id', Auth::id())->with('permission')->get()->pluck('permission.name')->toArray();
        });
    }

    public function getLatestCitizens($limit = 5){
        return Citizen::where('is_deleted', false)
            ->orderBy('date_encoded', 'desc')
            ->limit($limit)
            ->get();
    }
    // Clear specific caches
    public function clearCitizenCache(){
        Cache::forget('all_citizens');
        Cache::forget('count_citizens');
    }
    
    public function clearHouseholdCache(){
        Cache::forget('all_households');
        Cache::forget('count_households');
    }
    
    public function clearBusinessCache(){
        Cache::forget('all_businesses');
        Cache::forget('count_businesses');
    }
    
    public function clearInfrastructureCache(){
        Cache::forget('all_infrastructures');
        Cache::forget('count_infrastructures');
    }
    
    public function clearUserCache(){
        Cache::forget('user_roles'. Auth::id());
        Cache::forget('system_permissions'. Auth::id());
    }

    // Clear everything
    public function clearAllCache(){
        $this->clearCitizenCache();
        $this->clearHouseholdCache();
        $this->clearBusinessCache();
        $this->clearInfrastructureCache();
        $this->clearUserCache();
        Cache::forget('all_sitios');
    }


}