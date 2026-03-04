<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('settlement_logs', function (Blueprint $table) {
            $table->text('complaint_description')->nullable();
            $table->string('mediator')->nullable();
            $table->string('case_classification')->nullable();
            $table->json('linked_histories')->nullable();
        });

        // Migrate existing data gently
        $logs = DB::table('settlement_logs')->get();
        foreach ($logs as $log) {
            $desc = $log->settlement_description;
            if (!$desc) continue;

            $complaint = '';
            $resolution = '';
            $mediator = '';
            $classification = '';
            $linksStr = '';

            // Extreme basic parsing based on the old template format
            if (str_contains($desc, 'Complaint: ')) {
                $complaintBlock = explode('Resolution:', $desc)[0];
                $complaintBlock = explode('Mediator:', $complaintBlock)[0];
                $complaint = trim(str_replace('Complaint: ', '', $complaintBlock));
            } else {
                $complaint = $desc; // fallback
            }

            if (str_contains($desc, 'Resolution: ')) {
                $resBlock = explode('Mediator:', explode('Resolution: ', $desc)[1] ?? '')[0];
                $resBlock = explode('Classification:', $resBlock)[0];
                $resolution = trim($resBlock);
            }

            if (str_contains($desc, 'Mediator: ')) {
                $medBlock = explode('Classification:', explode('Mediator: ', $desc)[1] ?? '')[0];
                $medBlock = explode('Linked Previous Histories:', $medBlock)[0];
                $mediator = trim($medBlock);
            }

            if (str_contains($desc, 'Classification: ')) {
                $classBlock = explode('Linked Previous Histories:', explode('Classification: ', $desc)[1] ?? '')[0];
                $classification = trim($classBlock);
            }

            if (str_contains($desc, 'Linked Previous Histories: ')) {
                $linksStr = trim(explode('Linked Previous Histories: ', $desc)[1] ?? '');
            }

            $links = [];
            if ($linksStr) {
                $linksArr = array_filter(array_map('trim', explode(',', $linksStr)));
                foreach ($linksArr as $l) {
                    $links[] = $l;
                }
            }

            DB::table('settlement_logs')->where('sett_id', $log->sett_id)->update([
                'complaint_description' => $complaint ?: null,
                'settlement_description' => $resolution ?: null,
                'mediator' => $mediator ?: null,
                'case_classification' => $classification ?: null,
                'linked_histories' => !empty($links) ? json_encode($links) : null,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('settlement_logs', function (Blueprint $table) {
            $table->dropColumn(['complaint_description', 'mediator', 'case_classification', 'linked_histories']);
        });
    }
};
