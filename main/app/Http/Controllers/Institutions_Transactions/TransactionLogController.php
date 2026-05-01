<?php

namespace App\Http\Controllers\Institutions_Transactions;

use App\Http\Controllers\Controller;
use App\Models\TransactionLog;
use App\Models\Citizen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Inertia\Inertia;

class TransactionLogController extends Controller
{
    public function index()
    {
        $transactions = TransactionLog::with(['citizen', 'encodedByAccount', 'updatedByAccount'])
            ->where('is_deleted', false)
            ->orderBy('tl_id', 'desc')
            ->get()
            ->map(function ($trx) {
                $getSystemName = function ($account) {
                    if (!$account) return 'System';
                    return trim(($account->sys_fname ?? '') . ' ' . ($account->sys_lname ?? '')) ?: 'System';
                };

                $trxIdStr = $trx->tl_uuid;

                $isUpdated = $trx->date_updated && $trx->date_encoded != $trx->date_updated;

                return [
                    'id'             => $trx->tl_id,
                    'tlUuid'         => $trx->tl_uuid,
                    'transactionId'  => $trxIdStr,
                    'firstName'      => $trx->first_name,
                    'lastName'       => $trx->last_name,
                    'middleName'     => $trx->middle_name ?? '',
                    'suffix'         => $trx->suffix ?? '',
                    'fullName'       => trim($trx->first_name . ' ' . ($trx->middle_name ? $trx->middle_name . ' ' : '') . $trx->last_name . ($trx->suffix ? ' ' . $trx->suffix : '')),
                    'dateRequested'  => $trx->date_requested ? Carbon::parse($trx->date_requested)->format('F d, Y') : 'N/A',
                    'dateRequestedRaw' => $trx->date_requested ? Carbon::parse($trx->date_requested)->format('Y-m-d') : null,
                    'type'           => $trx->type,
                    'status'         => $trx->status,
                    'purpose'        => $trx->purpose ?? '',
                    'ctzId'          => $trx->ctz_id,
                    'ctzUuid'        => $trx->citizen?->ctz_uuid,
                    
                    // Audit Trail
                    'dateEncoded'    => $trx->date_encoded ? Carbon::parse($trx->date_encoded)->format('M d, Y | h:i A') : 'N/A',
                    'encodedBy'      => $getSystemName($trx->encodedByAccount),
                    'dateUpdated'    => $isUpdated ? Carbon::parse($trx->date_updated)->format('M d, Y | h:i A') : 'N/A',
                    'updatedBy'      => $isUpdated ? $getSystemName($trx->updatedByAccount) : 'N/A',
                ];
            });

        return Inertia::render('main/Transactions/services-profile', [
            'transactions' => $transactions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'suffix' => 'nullable|in:Jr.,Sr.,I,II,IV,V',
            'date_requested' => 'required|date',
            'type' => 'required|in:Business Clearance,Business Permit,Complaint',
            'status' => 'required|in:Pending,Approved,Declined',
            'purpose' => 'nullable|string|max:1000',
            'ctz_id' => 'nullable|exists:citizens,ctz_id',
        ]);

        try {
            TransactionLog::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'middle_name' => $validated['middle_name'] ?? null,
                'suffix' => $validated['suffix'] ?? null,
                'date_requested' => $validated['date_requested'],
                'type' => $validated['type'],
                'status' => $validated['status'],
                'purpose' => $validated['purpose'] ?? null,
                'ctz_id' => $validated['ctz_id'] ?? null,
                'date_encoded' => now(),
                'date_updated' => now(),
                'is_deleted' => false,
                'encoded_by' => Auth::id() ?? 1,
                'updated_by' => Auth::id() ?? 1,
            ]);

            return redirect()->back()->with('success', 'Transaction registered successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Error registering transaction: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'suffix' => 'nullable|in:Jr.,Sr.,I,II,IV,V',
            'date_requested' => 'required|date',
            'type' => 'required|in:Business Clearance,Business Permit,Complaint',
            'status' => 'required|in:Pending,Approved,Declined',
            'purpose' => 'nullable|string|max:1000',
            'ctz_id' => 'nullable|exists:citizens,ctz_id',
        ]);

        try {
            $trx = TransactionLog::findOrFail($id);
            $trx->update([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'middle_name' => $validated['middle_name'] ?? null,
                'suffix' => $validated['suffix'] ?? null,
                'date_requested' => $validated['date_requested'],
                'type' => $validated['type'],
                'status' => $validated['status'],
                'purpose' => $validated['purpose'] ?? null,
                'ctz_id' => $validated['ctz_id'] ?? null,
                'date_updated' => now(),
                'updated_by' => Auth::id() ?? 1,
            ]);

            return redirect()->back()->with('success', 'Transaction updated successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Error updating transaction: ' . $e->getMessage()]);
        }
    }

    public function destroy(Request $request, $id)
    {
        $validated = $request->validate([
            'deleted_reason' => 'required|string|max:1000'
        ]);

        try {
            $trx = TransactionLog::findOrFail($id);
            $trx->update([
                'is_deleted' => true,
                'delete_reason' => $validated['deleted_reason'],
                'date_updated' => now(),
                'updated_by' => Auth::id() ?? 1,
            ]);

            return redirect()->back()->with('success', 'Transaction moved to archives.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Failed to archive transaction: ' . $e->getMessage()]);
        }
    }

    public function getQuickViewData($id)
    {
        try {
            $trx = TransactionLog::with(['citizen', 'encodedByAccount', 'updatedByAccount'])
                ->where('tl_id', $id)
                ->where('is_deleted', false)
                ->firstOrFail();

            $getSystemName = function ($account) {
                if (!$account) return 'System';
                return trim(($account->sys_fname ?? '') . ' ' . ($account->sys_lname ?? '')) ?: 'System';
            };

            $isUpdated = $trx->date_updated && $trx->date_encoded != $trx->date_updated;
            
            $trxIdStr = $trx->tl_uuid;

            return response()->json([
                'id' => $trx->tl_id,
                'transactionId' => $trxIdStr,
                'fullName' => trim($trx->first_name . ' ' . ($trx->middle_name ? $trx->middle_name . ' ' : '') . $trx->last_name . ($trx->suffix ? ' ' . $trx->suffix : '')),
                'type' => $trx->type,
                'status' => $trx->status,
                'purpose' => $trx->purpose ?? '',
                'dateRequested' => $trx->date_requested ? Carbon::parse($trx->date_requested)->format('F d, Y') : 'N/A',
                'ctzId' => $trx->ctz_id,
                'ctzUuid' => $trx->citizen?->ctz_uuid,
                'dateEncoded' => $trx->date_encoded ? Carbon::parse($trx->date_encoded)->format('M d, Y | h:i A') : 'N/A',
                'encodedBy' => $getSystemName($trx->encodedByAccount),
                'dateUpdated' => $isUpdated ? Carbon::parse($trx->date_updated)->format('M d, Y | h:i A') : 'N/A',
                'updatedBy' => $isUpdated ? $getSystemName($trx->updatedByAccount) : 'N/A',
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Transaction not found.'], 404);
        }
    }
}
