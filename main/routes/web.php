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
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// Import additional route groups
require __DIR__.'/settings.php';
