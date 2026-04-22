<?php

use Illuminate\Support\Facades\Route;
use App\Models\Sitio;
use App\Http\Controllers\Citizens\CitizenController;
use App\Http\Controllers\Citizens\HouseholdController;
use App\Http\Controllers\Institutions_Transactions\BusinessController;
use App\Http\Controllers\Institutions_Transactions\InfrastructureController;
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
    Route::get('dashboard', [App\Http\Controllers\Dashboard\DashboardController::class, 'index'])->name('dashboard');

    // --- CITIZEN PANEL ---
    Route::get('citizen-panel', function () {
        return Inertia::render('main/CitizenPanel/citizen-panel');
    })->name('citizen-panel');

    // Sub-modules
    Route::get('citizen-panel/citizen-profile', [CitizenController::class, 'index'])->name('citizen-profile');

    Route::get('citizen-panel/household-profile', [HouseholdController::class, 'index'])->name('household-profile');
    Route::delete('/households/{id}', [HouseholdController::class, 'destroy']);

    // --- CITIZEN RECORDS ---
    Route::get('citizen-records', function () {
        return Inertia::render('main/CitizenRecords/citizen-records');
    })->name('citizen-records');

    // Sub-modules
    Route::get('citizen-records/citizen-history', [\App\Http\Controllers\Records\CitizenHistoryController::class, 'index'])->name('citizen-history');
    Route::post('citizen-records/citizen-history', [\App\Http\Controllers\Records\CitizenHistoryController::class, 'store']);
    Route::put('citizen-records/citizen-history/{id}', [\App\Http\Controllers\Records\CitizenHistoryController::class, 'update']);
    Route::delete('citizen-records/citizen-history/{id}', [\App\Http\Controllers\Records\CitizenHistoryController::class, 'destroy']);

    Route::get('citizen-records/medical-history', [\App\Http\Controllers\Records\MedicalHistoryController::class, 'index'])->name('medical-history');
    Route::post('citizen-records/medical-history', [\App\Http\Controllers\Records\MedicalHistoryController::class, 'store']);
    Route::put('citizen-records/medical-history/{id}', [\App\Http\Controllers\Records\MedicalHistoryController::class, 'update']);
    Route::delete('citizen-records/medical-history/{id}', [\App\Http\Controllers\Records\MedicalHistoryController::class, 'destroy']);

    Route::get('citizen-records/settlement-history', [\App\Http\Controllers\Records\SettlementController::class, 'index'])->name('settlement-history');
    Route::post('citizen-records/settlement-history', [\App\Http\Controllers\Records\SettlementController::class, 'store']);
    Route::put('citizen-records/settlement-history/{id}', [\App\Http\Controllers\Records\SettlementController::class, 'update']);
    Route::delete('citizen-records/settlement-history/{id}', [\App\Http\Controllers\Records\SettlementController::class, 'destroy']);

    // --- STATISTICS ---
    Route::get('statistics', function () {
        return Inertia::render('main/Statistics/statistics');
    })->name('statistics');

    // Sub-modules
    Route::get('statistics/demographic', [\App\Http\Controllers\Statistics\DemographicStatController::class, 'index'])->name('demographic-stats');

    Route::get('statistics/neighborhood', [\App\Http\Controllers\Statistics\NeighborhoodController::class, 'index'])->name('neighborhood-stats');

    Route::get('statistics/household', [\App\Http\Controllers\Statistics\HouseholdStatController::class, 'index'])->name('household-stats');

    Route::get('statistics/education', [\App\Http\Controllers\Statistics\EducationStatController::class, 'index'])->name('education-stats');

    Route::get('statistics/employment', [\App\Http\Controllers\Statistics\EmploymentStatController::class, 'index'])->name('employment-stats');

    Route::get('statistics/health', [\App\Http\Controllers\Statistics\HealthStatController::class, 'index'])->name('health-stats');

    Route::get('statistics/business', [\App\Http\Controllers\Statistics\BusinessStatController::class, 'index'])->name('business-stats');

    Route::get('statistics/infrastructure', [\App\Http\Controllers\Statistics\InfrastructureStatController::class, 'index'])->name('infrastructure-stats');

    // --- INSTITUTIONS ---
    Route::get('institutions', function () {
        return Inertia::render('main/Institutions/institutions');
    })->name('institutions');

    // Sub-modules
    Route::get('institutions/business-profile', [BusinessController::class, 'index'])->name('business-profile');
    Route::post('/institutions/business', [BusinessController::class, 'store']);
    Route::put('/institutions/business/{id}', [BusinessController::class, 'update']);
    Route::delete('/institutions/business/{id}', [BusinessController::class, 'destroy']);

    Route::get('institutions/infrastructures-profile', [InfrastructureController::class, 'index'])->name('infrastructures-profile');
    Route::post('/institutions/infrastructure', [InfrastructureController::class, 'store']);
    Route::put('/institutions/infrastructure/{id}', [InfrastructureController::class, 'update']);
    Route::delete('/institutions/infrastructure/{id}', [InfrastructureController::class, 'destroy']);

    // --- TRANSACTIONS ---
    Route::get('transactions', function () {
        return Inertia::render('main/Transactions/transactions');
    })->name('transactions');

    // Sub-modules
    Route::get('transactions/services-profile', function () {
        return Inertia::render('main/Transactions/services-profile');
    })->name('services-profile');

    // --- ADMIN PANEL ---
    Route::get('admin-panel', function () {
        return Inertia::render('admin/AdminPanel/admin-panel');
    })->name('admin-panel');

    // Sub-modules
    Route::get('admin-panel/manage-accounts', function () {
        return Inertia::render('admin/AdminPanel/manage-accounts');
    })->name('manage-accounts');

    // NEW: Admin Control Route
    Route::get('admin-panel/admin-control', function () {
        return Inertia::render('admin/AdminPanel/admin-control');
    })->name('admin-control');

    // --- ACTIVITY LOGS ---
    Route::get('activity-logs', function () {
        return Inertia::render('admin/ActivityLogs/activity-logs');
    })->name('activity-logs');

    // --- ARCHIVES ---
    Route::get('archives', function () {
        return Inertia::render('admin/Archives/archives');
    })->name('archives');


    Route::post('/citizens/store', [CitizenController::class, 'store']);
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
    Route::get('/api/citizen/{id}', [CitizenController::class, 'getQuickViewData']);
});

require __DIR__.'/settings.php';
