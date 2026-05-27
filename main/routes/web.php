<?php

use Illuminate\Support\Facades\Route;
use App\Models\Sitio;
use App\Http\Controllers\Citizens\CitizenController;
use App\Http\Controllers\Citizens\HouseholdController;
use App\Http\Controllers\Institutions_Transactions\BusinessController;
use App\Http\Controllers\Institutions_Transactions\InfrastructureController;
use App\Http\Controllers\Institutions_Transactions\TransactionLogController;
use Inertia\Inertia;

// Root route
Route::get('/', function () {
    return Inertia::render('landing');
})->name('home');

// Scan route
Route::get('/scan', function () {
    return Inertia::render('scan');
});

// Auth routes
Route::middleware(['auth', 'verified'])->group(function () {

    // --- DASHBOARD ---
    Route::get('dashboard', [App\Http\Controllers\Dashboard\DashboardController::class, 'index'])
        ->middleware('permission:View Dashboard')
        ->name('dashboard');

    // --- CITIZEN PANEL ---
    Route::get('citizen-panel', function () {
        $citizenCount   = \App\Models\Citizen::where('is_deleted', false)->count();
        $householdCount = \App\Models\HouseholdInfo::where('is_deleted', false)->count();
        return Inertia::render('main/CitizenPanel/citizen-panel', [
            'citizenCount'   => $citizenCount,
            'householdCount' => $householdCount,
        ]);
    })->middleware('permission:View Citizen Profile,View Household Profile')->name('citizen-panel');

    // Sub-modules
    Route::get('citizen-panel/citizen-profile', [CitizenController::class, 'index'])
        ->middleware('permission:View Citizen Profile')->name('citizen-profile');

    Route::get('citizen-panel/household-profile', [HouseholdController::class, 'index'])
        ->middleware('permission:View Household Profile')->name('household-profile');
    Route::delete('/households/{id}', [HouseholdController::class, 'destroy'])
        ->middleware('permission:Delete Household Profile');

    // --- CITIZEN RECORDS ---
    Route::get('citizen-records', function () {
        $citizenHistoryCount    = \App\Models\CitizenHistory::where('is_deleted', false)->count();
        $medicalHistoryCount    = \App\Models\MedicalHistory::where('is_deleted', false)->count();
        $settlementHistoryCount = \App\Models\SettlementLog::where('is_deleted', false)->count();
        return Inertia::render('main/CitizenRecords/citizen-records', [
            'citizenHistoryCount'    => $citizenHistoryCount,
            'medicalHistoryCount'    => $medicalHistoryCount,
            'settlementHistoryCount' => $settlementHistoryCount,
        ]);
    })->middleware('permission:View Citizen History,View Medical History,View Settlement History')->name('citizen-records');

    // Sub-modules
    Route::middleware('permission:View Citizen History')->group(function () {
        Route::get('citizen-records/citizen-history', [\App\Http\Controllers\Records\CitizenHistoryController::class, 'index'])->name('citizen-history');
        Route::post('citizen-records/citizen-history', [\App\Http\Controllers\Records\CitizenHistoryController::class, 'store'])->middleware('permission:Create Citizen History');
        Route::put('citizen-records/citizen-history/{id}', [\App\Http\Controllers\Records\CitizenHistoryController::class, 'update'])->middleware('permission:Update Citizen History');
        Route::delete('citizen-records/citizen-history/{id}', [\App\Http\Controllers\Records\CitizenHistoryController::class, 'destroy'])->middleware('permission:Delete Citizen History');
    });

    Route::middleware('permission:View Medical History')->group(function () {
        Route::get('citizen-records/medical-history', [\App\Http\Controllers\Records\MedicalHistoryController::class, 'index'])->name('medical-history');
        Route::post('citizen-records/medical-history', [\App\Http\Controllers\Records\MedicalHistoryController::class, 'store'])->middleware('permission:Create Medical History');
        Route::put('citizen-records/medical-history/{id}', [\App\Http\Controllers\Records\MedicalHistoryController::class, 'update'])->middleware('permission:Update Medical History');
        Route::delete('citizen-records/medical-history/{id}', [\App\Http\Controllers\Records\MedicalHistoryController::class, 'destroy'])->middleware('permission:Delete Medical History');
    });

    Route::middleware('permission:View Settlement History')->group(function () {
        Route::get('citizen-records/settlement-history', [\App\Http\Controllers\Records\SettlementController::class, 'index'])->name('settlement-history');
        Route::post('citizen-records/settlement-history', [\App\Http\Controllers\Records\SettlementController::class, 'store'])->middleware('permission:Create Settlement History');
        Route::put('citizen-records/settlement-history/{id}', [\App\Http\Controllers\Records\SettlementController::class, 'update'])->middleware('permission:Update Settlement History');
        Route::delete('citizen-records/settlement-history/{id}', [\App\Http\Controllers\Records\SettlementController::class, 'destroy'])->middleware('permission:Delete Settlement History');
    });

    // --- STATISTICS ---
    Route::get('statistics', function () {
        return Inertia::render('main/Statistics/statistics');
    })->middleware('permission:View Demographic,View Neighborhood,View Household,View Education,View Employment,View Health,View Business,View Infrastructures')->name('statistics');

    // Sub-modules
    Route::get('statistics/demographic', [\App\Http\Controllers\Statistics\DemographicStatController::class, 'index'])->middleware('permission:View Demographic')->name('demographic-stats');
    Route::get('statistics/neighborhood', [\App\Http\Controllers\Statistics\NeighborhoodController::class, 'index'])->middleware('permission:View Neighborhood')->name('neighborhood-stats');
    Route::get('statistics/household', [\App\Http\Controllers\Statistics\HouseholdStatController::class, 'index'])->middleware('permission:View Household')->name('household-stats');
    Route::get('statistics/education', [\App\Http\Controllers\Statistics\EducationStatController::class, 'index'])->middleware('permission:View Education')->name('education-stats');
    Route::get('statistics/employment', [\App\Http\Controllers\Statistics\EmploymentStatController::class, 'index'])->middleware('permission:View Employment')->name('employment-stats');
    Route::get('statistics/health', [\App\Http\Controllers\Statistics\HealthStatController::class, 'index'])->middleware('permission:View Health')->name('health-stats');
    Route::get('statistics/business', [\App\Http\Controllers\Statistics\BusinessStatController::class, 'index'])->middleware('permission:View Business')->name('business-stats');
    Route::get('statistics/infrastructure', [\App\Http\Controllers\Statistics\InfrastructureStatController::class, 'index'])->middleware('permission:View Infrastructures')->name('infrastructure-stats');

    // --- INSTITUTIONS ---
    Route::get('institutions', function () {
        $businessCount       = \App\Models\businessInfo::where('is_deleted', false)->count();
        $infrastructureCount = \App\Models\Infrastructure::where('is_deleted', false)->count();
        return Inertia::render('main/Institutions/institutions', [
            'businessCount'       => $businessCount,
            'infrastructureCount' => $infrastructureCount,
        ]);
    })->middleware('permission:View Business,View Infrastructure')->name('institutions');

    // Sub-modules
    Route::get('institutions/business-profile', [BusinessController::class, 'index'])->middleware('permission:View Business')->name('business-profile');
    Route::post('/institutions/business', [BusinessController::class, 'store'])->middleware('permission:Create Business');
    Route::put('/institutions/business/{id}', [BusinessController::class, 'update'])->middleware('permission:Update Business');
    Route::delete('/institutions/business/{id}', [BusinessController::class, 'destroy'])->middleware('permission:Delete Business');

    Route::get('institutions/infrastructures-profile', [InfrastructureController::class, 'index'])->middleware('permission:View Infrastructure')->name('infrastructures-profile');
    Route::post('/institutions/infrastructure', [InfrastructureController::class, 'store'])->middleware('permission:Create Infrastructure');
    Route::put('/institutions/infrastructure/{id}', [InfrastructureController::class, 'update'])->middleware('permission:Update Infrastructure');
    Route::delete('/institutions/infrastructure/{id}', [InfrastructureController::class, 'destroy'])->middleware('permission:Delete Infrastructure');

    // --- TRANSACTIONS ---
    Route::get('transactions', function () {
        $pendingCount = \App\Models\TransactionLog::where('is_deleted', false)
            ->where('status', 'Pending')
            ->count();
        return Inertia::render('main/Transactions/transactions', [
            'pendingCount' => $pendingCount,
        ]);
    })->middleware('permission:View Services')->name('transactions');

    // Sub-modules
    Route::get('transactions/services-profile', [TransactionLogController::class, 'index'])->middleware('permission:View Services')->name('services-profile');
    Route::post('/transactions/services', [TransactionLogController::class, 'store'])->middleware('permission:Create Services');
    Route::put('/transactions/services/{id}', [TransactionLogController::class, 'update'])->middleware('permission:Update Services');
    Route::delete('/transactions/services/{id}', [TransactionLogController::class, 'destroy'])->middleware('permission:Delete Services');
    Route::post('/transactions/services/{id}/export-log', [TransactionLogController::class, 'recordExport'])->middleware('permission:Export Services');

    // --- ADMIN PANEL (requires any Admin Panel permission) ---
    Route::middleware('permission:View Account,View Archive,View Audit Logs,View Control')->group(function () {
        Route::get('admin-panel', function () {
            $staffCount = \App\Models\SystemAccount::where('is_deleted', false)->count();
            $logsCount = \App\Models\AuditLog::count();
            $archivesCount =
                \App\Models\Citizen::where('is_deleted', true)->count() +
                \App\Models\HouseholdInfo::where('is_deleted', true)->count() +
                \App\Models\businessInfo::where('is_deleted', true)->count() +
                \App\Models\Infrastructure::where('is_deleted', true)->count() +
                \App\Models\TransactionLog::where('is_deleted', true)->count() +
                \App\Models\MedicalHistory::where('is_deleted', true)->count() +
                \App\Models\SettlementLog::where('is_deleted', true)->count() +
                \App\Models\CitizenHistory::where('is_deleted', true)->count();

            return Inertia::render('admin/AdminPanel/admin-panel', [
                'staffCount'   => $staffCount,
                'logsCount'    => $logsCount,
                'archivesCount'=> $archivesCount,
            ]);
        })->name('admin-panel');

        // Manage Accounts CRUD Routes
        Route::middleware('permission:View Account')->group(function () {
            Route::get('admin-panel/manage-accounts', [\App\Http\Controllers\Admin\SystemAccountController::class, 'index'])->name('manage-accounts');
            Route::post('admin-panel/manage-accounts', [\App\Http\Controllers\Admin\SystemAccountController::class, 'store'])->middleware('permission:Create Account');
            Route::put('admin-panel/manage-accounts/{id}', [\App\Http\Controllers\Admin\SystemAccountController::class, 'update'])->middleware('permission:Update Account');
            Route::delete('admin-panel/manage-accounts/{id}', [\App\Http\Controllers\Admin\SystemAccountController::class, 'destroy'])->middleware('permission:Deactivate Account');
            Route::post('admin-panel/manage-accounts/{id}/restore', [\App\Http\Controllers\Admin\SystemAccountController::class, 'restore'])->middleware('permission:Reactivate Account');
            Route::post('admin-panel/manage-accounts/{id}/log-view', [\App\Http\Controllers\Admin\SystemAccountController::class, 'logView'])->name('manage-accounts.log-view');
        });

        // Role Management Routes
        Route::middleware('permission:View Account')->group(function () {
            Route::post('admin-panel/roles', [\App\Http\Controllers\Admin\RoleController::class, 'store'])->middleware('permission:Create Role');
            Route::put('admin-panel/roles/{id}', [\App\Http\Controllers\Admin\RoleController::class, 'update'])->middleware('permission:Update Role');
            Route::delete('admin-panel/roles/{id}', [\App\Http\Controllers\Admin\RoleController::class, 'destroy'])->middleware('permission:Delete Role');
        });

        // Admin Control Route
        Route::get('admin-panel/admin-control', function () {
            return Inertia::render('admin/AdminPanel/admin-control');
        })->name('admin-control');

        // Activity Logs
        Route::get('activity-logs', [\App\Http\Controllers\Admin\AuditLogController::class, 'index'])
            ->middleware('permission:View Audit Logs')->name('activity-logs');

        // Archives
        Route::middleware('permission:View Archive')->group(function () {
            Route::get('/archives', [\App\Http\Controllers\Admin\ArchiveController::class, 'index'])->name('archives');
        });
    });

    // Archive sub-pages
    Route::get('archives/citizens', [\App\Http\Controllers\Admin\ArchiveController::class, 'citizens'])->name('archives.citizens');
    Route::post('archives/citizens/{id}/restore', [\App\Http\Controllers\Admin\ArchiveController::class, 'restoreCitizen'])->name('archives.citizens.restore');

    Route::get('archives/household', [\App\Http\Controllers\Admin\ArchiveController::class, 'household'])->name('archives.household');
    Route::post('archives/household/{id}/restore', [\App\Http\Controllers\Admin\ArchiveController::class, 'restoreHousehold'])->name('archives.household.restore');

    Route::get('archives/business', [\App\Http\Controllers\Admin\ArchiveController::class, 'business'])->name('archives.business');
    Route::post('archives/business/{id}/restore', [\App\Http\Controllers\Admin\ArchiveController::class, 'restoreBusiness'])->name('archives.business.restore');

    Route::get('archives/infrastructures', [\App\Http\Controllers\Admin\ArchiveController::class, 'infrastructures'])->name('archives.infrastructures');
    Route::post('archives/infrastructures/{id}/restore', [\App\Http\Controllers\Admin\ArchiveController::class, 'restoreInfrastructure'])->name('archives.infrastructures.restore');

    Route::get('archives/services', [\App\Http\Controllers\Admin\ArchiveController::class, 'services'])->name('archives.services');
    Route::post('archives/services/{id}/restore', [\App\Http\Controllers\Admin\ArchiveController::class, 'restoreService'])->name('archives.services.restore');

    Route::get('archives/medical-history', [\App\Http\Controllers\Admin\ArchiveController::class, 'medicalHistory'])->name('archives.medical-history');
    Route::post('archives/medical-history/{id}/restore', [\App\Http\Controllers\Admin\ArchiveController::class, 'restoreMedicalHistory'])->name('archives.medical-history.restore');

    Route::get('archives/settlement-history', [\App\Http\Controllers\Admin\ArchiveController::class, 'settlementHistory'])->name('archives.settlement-history');
    Route::post('archives/settlement-history/{id}/restore', [\App\Http\Controllers\Admin\ArchiveController::class, 'restoreSettlementHistory'])->name('archives.settlement-history.restore');

    Route::get('archives/citizen-history', [\App\Http\Controllers\Admin\ArchiveController::class, 'citizenHistory'])->name('archives.citizen-history');
    Route::post('archives/citizen-history/{id}/restore', [\App\Http\Controllers\Admin\ArchiveController::class, 'restoreCitizenHistory'])->name('archives.citizen-history.restore');


    Route::post('/citizens/store', [CitizenController::class, 'store']);
    Route::post('/citizens/register-face', [CitizenController::class, 'registerFace']);
    Route::post('/citizens/search-face', [CitizenController::class, 'searchFace']);
    Route::put('/citizens/{id}', [CitizenController::class, 'update']);
    Route::delete('/citizens/{id}', [CitizenController::class, 'destroy']);

    // Households
    Route::post('/households/store', [HouseholdController::class, 'store']);
    Route::put('/households/{id}', [HouseholdController::class, 'update']);

    Route::get('/api/sitio-list', function () {
        return Sitio::select('sitio_id', 'sitio_name')->orderBy('sitio_name')->get();
    });

    Route::get('/api/household-search', [HouseholdController::class, 'search']);
    Route::get('/api/citizen-search', [CitizenController::class, 'searchForHousehold']);
    Route::get('/api/verify-history-link', [\App\Http\Controllers\Records\CitizenHistoryController::class, 'verifyHistoryLink']);
    Route::get('/api/recent-histories', [\App\Http\Controllers\Records\CitizenHistoryController::class, 'getRecentHistories']);
    Route::get('/api/citizen-history-search', [\App\Http\Controllers\Records\CitizenHistoryController::class, 'search']);
    Route::get('/api/history-detail/{uuid}', [\App\Http\Controllers\Records\CitizenHistoryController::class, 'getHistoryDetail']);
    Route::get('/api/settlement-detail/{uuid}', [\App\Http\Controllers\Records\SettlementController::class, 'getSettlementDetail']);
    Route::get('/api/medical-detail/{uuid}', [\App\Http\Controllers\Records\MedicalHistoryController::class, 'getMedicalDetail']);
    Route::get('/api/household-detail/{uuid}', [HouseholdController::class, 'getHouseholdDetail']);
    Route::get('/api/business-detail/{uuid}', [\App\Http\Controllers\Institutions_Transactions\BusinessController::class, 'getQuickViewData']);
    Route::get('/api/infrastructure-detail/{id}', [\App\Http\Controllers\Institutions_Transactions\InfrastructureController::class, 'getQuickViewData']);
    Route::get('/api/transaction-detail/{id}', [TransactionLogController::class, 'getQuickViewData']);
    Route::get('/api/citizen/{id}', [CitizenController::class, 'getQuickViewData']);

    // --- NOTIFICATIONS ---
    Route::prefix('api/notifications')->group(function () {
        Route::get('/', [\App\Http\Controllers\NotificationController::class, 'index']);
        Route::get('/unread-count', [\App\Http\Controllers\NotificationController::class, 'unreadCount']);
        Route::post('/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markRead']);
        Route::post('/mark-all-read', [\App\Http\Controllers\NotificationController::class, 'markAllRead']);
        Route::delete('/{id}', [\App\Http\Controllers\NotificationController::class, 'destroy']);
        Route::delete('/clear-read', [\App\Http\Controllers\NotificationController::class, 'clearRead']);
    });
});

require __DIR__.'/settings.php';
