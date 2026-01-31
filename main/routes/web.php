<?php

use Illuminate\Support\Facades\Route;
use App\Models\Sitio;
use App\Http\Controllers\Citizens\CitizenController;
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
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // --- CITIZEN PANEL ---
    Route::get('citizen-panel', function () {
        return Inertia::render('main/CitizenPanel/citizen-panel');
    })->name('citizen-panel');

    // Sub-modules
    Route::get('citizen-panel/citizen-profile', function () {
        return Inertia::render('main/CitizenPanel/citizen-profiles');
    })->name('citizen-profile');

    Route::get('citizen-panel/household-profile', function () {
        return Inertia::render('main/CitizenPanel/household-profiles');
    })->name('household-profile');

    // --- CITIZEN RECORDS ---
    Route::get('citizen-records', function () {
        return Inertia::render('main/CitizenRecords/citizen-records');
    })->name('citizen-records');

    // Sub-modules
    Route::get('citizen-records/citizen-history', function () {
        return Inertia::render('main/CitizenRecords/citizen-history');
    })->name('citizen-history');

    Route::get('citizen-records/medical-history', function () {
        return Inertia::render('main/CitizenRecords/medical-history');
    })->name('medical-history');

    Route::get('citizen-records/settlement-history', function () {
        return Inertia::render('main/CitizenRecords/settlement-history');
    })->name('settlement-history');

    // --- STATISTICS ---
    Route::get('statistics', function () {
        return Inertia::render('main/Statistics/statistics');
    })->name('statistics');

    // Sub-modules
    Route::get('statistics/demographic', function () {
        return Inertia::render('main/Statistics/demographic-stats');
    })->name('demographic-stats');

    Route::get('statistics/neighborhood', function () {
        return Inertia::render('main/Statistics/neighborhood-stats');
    })->name('neighborhood-stats');

    Route::get('statistics/household', function () {
        return Inertia::render('main/Statistics/household-stats');
    })->name('household-stats');

    Route::get('statistics/education', function () {
        return Inertia::render('main/Statistics/education-stats');
    })->name('education-stats');

    Route::get('statistics/employment', function () {
        return Inertia::render('main/Statistics/employment-stats');
    })->name('employment-stats');

    Route::get('statistics/health', function () {
        return Inertia::render('main/Statistics/health-stats');
    })->name('health-stats');

    Route::get('statistics/business', function () {
        return Inertia::render('main/Statistics/business-stats');
    })->name('business-stats');

    Route::get('statistics/infrastructure', function () {
        return Inertia::render('main/Statistics/infrastructure-stats');
    })->name('infrastructure-stats');

    // --- INSTITUTIONS ---
    Route::get('institutions', function () {
        return Inertia::render('main/Institutions/institutions');
    })->name('institutions');

    // Sub-modules
    Route::get('institutions/business-profile', function () {
        return Inertia::render('main/Institutions/business-profile');
    })->name('business-profile');

    Route::get('institutions/infrastructures-profile', function () {
        return Inertia::render('main/Institutions/infrastructures-profile');
    })->name('infrastructures-profile');

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


    Route::get('/api/sitio-list', function () {
        return Sitio::select('sitio_id', 'sitio_name')->orderBy('sitio_name')->get();
    });
});

require __DIR__.'/settings.php';
