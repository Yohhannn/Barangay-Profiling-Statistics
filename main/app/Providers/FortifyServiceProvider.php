<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Services\NotificationService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);

        // Custom authentication: use sys_account_id as login identifier,
        // check sys_password, and block deactivated accounts.
        Fortify::authenticateUsing(function (\Illuminate\Http\Request $request) {
            $accountId = $request->input(Fortify::username());
            $ip        = $request->ip();

            $user = \App\Models\SystemAccount::where('sys_account_id', $accountId)->first();

            if (!$user) {
                return null;
            }

            // Block deactivated accounts
            if ($user->is_deleted) {
                return null;
            }

            // Validate password against sys_password column
            if (\Illuminate\Support\Facades\Hash::check($request->password, $user->sys_password)) {
                $user->update(['last_login' => now()]);

                // Reset failed-login counter on success
                Cache::forget("failed_login_{$user->sys_id}");

                // ── ALERT: After-hours login (before 06:00 or after 22:00) ──
                $hour = now()->hour;
                if ($hour < 6 || $hour >= 22) {
                    $timeStr = now()->format('h:i A');
                    NotificationService::sendAlert(
                        'After-Hours Login Detected',
                        "Account #{$user->sys_account_id} ({$user->sys_fname} {$user->sys_lname}) logged in at {$timeStr} from IP {$ip}.",
                        '/activity-logs',
                        $user->sys_id
                    );
                }

                return $user;
            }

            // ── ALERT: Repeated failed login attempts ──
            if ($user) {
                NotificationService::trackAndAlert(
                    "failed_login_{$user->sys_id}",
                    3,    // alert after 3rd failure
                    900,  // 15-minute window
                    function () use ($user, $ip) {
                        NotificationService::sendAlert(
                            'Multiple Failed Login Attempts',
                            "Account #{$user->sys_account_id} ({$user->sys_fname} {$user->sys_lname}) has had 3 consecutive failed login attempts from IP {$ip}.",
                            '/activity-logs'
                        );
                    }
                );
            }

            return null;
        });
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn (Request $request) => Inertia::render('landing', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::resetPasswordView(fn (Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]));

        Fortify::requestPasswordResetLinkView(fn (Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn (Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::registerView(fn () => Inertia::render('auth/register'));

        Fortify::twoFactorChallengeView(fn () => Inertia::render('auth/two-factor-challenge'));

        Fortify::confirmPasswordView(fn () => Inertia::render('auth/confirm-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });
    }
}
