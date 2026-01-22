<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TwoFactorAuthenticationController extends Controller
{
    /**
     * Display the two-factor authentication settings.
     */
    public function show(Request $request): Response
    {
        return Inertia::render('settings/two-factor', [
            'status' => session('status'),
        ]);
    }
}
