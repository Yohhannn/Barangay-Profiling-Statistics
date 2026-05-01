<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Infrastructure;
use Carbon\Carbon;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('infrastructures', function (Blueprint $table) {
            $table->string('inf_uuid', 20)->nullable()->unique()->after('inf_id');
        });

        // Backfill existing records: INF-<YY><3 random digits>
        $year = substr(date('Y'), 2); // e.g. "26"
        Infrastructure::whereNull('inf_uuid')->get()->each(function ($inf) use ($year) {
            do {
                $random = str_pad(rand(100, 999), 3, '0', STR_PAD_LEFT);
                $uuid = "INF-{$year}{$random}";
            } while (Infrastructure::where('inf_uuid', $uuid)->exists());

            $inf->inf_uuid = $uuid;
            $inf->save();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('infrastructures', function (Blueprint $table) {
            $table->dropColumn('inf_uuid');
        });
    }
};
