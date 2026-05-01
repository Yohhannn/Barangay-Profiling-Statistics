<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\TransactionLog;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transaction_logs', function (Blueprint $table) {
            $table->string('tl_uuid', 20)->nullable()->unique()->after('tl_id');
        });

        // Backfill existing records: trx-26<3 random digits>
        $year = substr(date('Y'), 2); // e.g. "26"
        TransactionLog::whereNull('tl_uuid')->get()->each(function ($trx) use ($year) {
            do {
                $random = str_pad(rand(100, 999), 3, '0', STR_PAD_LEFT);
                $uuid = "TRX-{$year}{$random}";
            } while (TransactionLog::where('tl_uuid', $uuid)->exists());

            $trx->tl_uuid = $uuid;
            $trx->save();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transaction_logs', function (Blueprint $table) {
            $table->dropColumn('tl_uuid');
        });
    }
};
