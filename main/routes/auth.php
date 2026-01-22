<?php
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\AuthenticationController;
Route::get('/login', [AuthenticationController::class, 'index'])->name('login');
Route::post('/login', [AuthenticationController::class, 'login'])->name('login.attempt');