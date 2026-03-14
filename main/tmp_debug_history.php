<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\CitizenHistory;
use App\Models\SettlementLog;

$uuid = 'CIHI-4042';
$history = CitizenHistory::where('cihi_uuid', $uuid)->first();

if ($history) {
    echo "History Found: " . $history->cihi_uuid . "\n";
    echo "Status: " . $history->status . "\n";
    echo "sett_id: " . ($history->sett_id ?? 'NULL') . "\n";
    
    if ($history->sett_id) {
        $settlement = SettlementLog::find($history->sett_id);
        if ($settlement) {
            echo "Settlement UUID: " . $settlement->sett_uuid . "\n";
        } else {
            echo "Settlement Record NOT FOUND for ID: " . $history->sett_id . "\n";
        }
    }
} else {
    echo "History NOT FOUND: " . $uuid . "\n";
}
