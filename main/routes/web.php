<?php

use Illuminate\Support\Facades\Route;
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

    // NEW: Settlement History Route
    Route::get('citizen-records/settlement-history', function () {
        return Inertia::render('main/CitizenRecords/settlement-history');
    })->name('settlement-history');

    // --- STATISTICS ---
    Route::get('statistics', function () {
        return Inertia::render('main/Statistics/statistics');
    })->name('statistics');

    // --- INSTITUTIONS ---
    Route::get('institutions', function () {
        return Inertia::render('main/Institutions/institutions');
    })->name('institutions');

    // --- TRANSACTIONS ---
    Route::get('transactions', function () {
        return Inertia::render('main/Transactions/transactions');
    })->name('transactions');

    // --- ADMIN PANEL ---
    Route::get('admin-panel', function () {
        return Inertia::render('admin/AdminPanel/admin-panel');
    })->name('admin-panel');

    // --- ACTIVITY LOGS ---
    Route::get('activity-logs', function () {
        return Inertia::render('admin/ActivityLogs/activity-logs');
    })->name('activity-logs');

    // --- ARCHIVES ---
    Route::get('archives', function () {
        return Inertia::render('admin/Archives/archives');
    })->name('archives');
});

require __DIR__.'/settings.php';
