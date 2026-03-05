<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\SettlementLog;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('settlement_logs', function (Blueprint $table) {
            $table->string('sett_uuid')->nullable()->unique()->after('sett_id');
        });

        // Populate existing records with random SETT-XXXX
        $records = SettlementLog::whereNull('sett_uuid')->get();
        foreach ($records as $record) {
            do {
                $uuid = 'SETT-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
            } while (SettlementLog::where('sett_uuid', $uuid)->exists());
            
            $record->sett_uuid = $uuid;
            $record->save();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('settlement_logs', function (Blueprint $table) {
            $table->dropColumn('sett_uuid');
        });
    }
};
