<?php
use Illuminate\Support\Facades\Cache;
class ServiceLimiting{

    public static function limitService($serviceName, $sysId){
        Cache::put($serviceName . '_service_' . $sysId, true, now()->addSeconds(10));
    }

    public static function isServiceLimited($serviceName, $sysId){
        return Cache::has($serviceName . '_service_' . $sysId);
    }
}