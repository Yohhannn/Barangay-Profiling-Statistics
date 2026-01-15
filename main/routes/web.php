<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

// Root route now correctly renders the Landing page as the home page
Route::get('/', function () {
    return Inertia::render('landing');
})->name('home');

Route::get('/scan', function () {
    return Inertia::render('scan'); // Points to resources/js/pages/scan.tsx
});

// Auth routes for standard users
Route::middleware(['auth', 'verified'])->group(function () {

    // ------------------------------------------------  DASHBOARD
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // ------------------------------------------------  CITIZEN PANEL (MENU)
    Route::get('citizen-panel', function () {
        return Inertia::render('main/CitizenPanel/citizen-panel');
    })->name('citizen-panel');

    // ------------------------------------------------  CITIZEN PROFILES (SUB-MODULE)
    Route::get('citizen-panel/citizen-profile', function () {
        return Inertia::render('main/CitizenPanel/citizen-profiles');
    })->name('citizen-profile');

    Route::get('citizen-panel/household-profile', function () {
        return Inertia::render('main/CitizenPanel/household-profiles');
    })->name('household-profile');

    // ------------------------------------------------  CITIZEN RECORDS
    Route::get('citizen-records', function () {
        return Inertia::render('main/CitizenRecords/citizen-records');
    })->name('citizen-records');

    // ------------------------------------------------  STATISTICS
    Route::get('statistics', function () {
        return Inertia::render('main/Statistics/statistics');
    })->name('statistics');

    // ------------------------------------------------  INSTITUTIONS
    Route::get('institutions', function () {
        return Inertia::render('main/Institutions/institutions');
    })->name('institutions');

    // ------------------------------------------------  TRANSACTIONS
    Route::get('transactions', function () {
        return Inertia::render('main/Transactions/transactions');
    })->name('transactions');

    // ------------------------------------------------  ADMIN PANEL
    Route::get('admin-panel', function () {
        return Inertia::render('admin/AdminPanel/admin-panel');
    })->name('admin-panel');

    // ------------------------------------------------  ACTIVITY LOGS
    Route::get('activity-logs', function () {
        return Inertia::render('admin/ActivityLogs/activity-logs');
    })->name('activity-logs');

    // ------------------------------------------------  ARCHIVES
    Route::get('archives', function () {
        return Inertia::render('admin/Archives/archives');
    })->name('archives');
});

// Import additional route groups
require __DIR__.'/settings.php';
