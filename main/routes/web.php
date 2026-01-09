<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

// Root route now correctly renders the Landing page as the home page
Route::get('/', function () {
    return Inertia::render('landing');
})->name('home');

// Auth routes for standard users
Route::middleware(['auth', 'verified'])->group(function () {

    // ------------------------------------------------  DASHBOARD
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // ------------------------------------------------  CITIZEN PANEL
    Route::get('citizen-panel', function () {
        return Inertia::render('main/CitizenPanel/citizen-panel');
    })->name('citizen-panel');

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
});

// Import additional route groups
require __DIR__.'/settings.php';
