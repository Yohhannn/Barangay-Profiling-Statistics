import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { DotScreenShader } from '@/components/ui/dot-shader-background';
import { store } from '@/routes/login';
import { Form, Head } from '@inertiajs/react';
import {
    ArrowRight,
    Eye,
    EyeOff,
    Hash,
    Lock,
    ShieldCheck,
    Users,
    BarChart3,
    FileText,
} from 'lucide-react';

interface LandingProps {
    status?: string;
}

export default function Landing({ status }: LandingProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative flex min-h-screen overflow-hidden bg-white">
            <Head title="MaPro — Barangay Marigondon" />

            {/* ── LEFT PANEL — branding ────────────────────────────────── */}
            <div className="relative hidden flex-col justify-between overflow-hidden bg-blue-700 p-12 lg:flex lg:w-1/2">
                {/* Dot shader overlay */}
                <div className="pointer-events-none absolute inset-0 z-0 opacity-20">
                    <DotScreenShader />
                </div>

                {/* Top: logo + name */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                        <img src="/logo/w-icon.png" alt="MaPro" className="h-8 w-8 object-contain" />
                    </div>
                    <div>
                        <p className="text-xl font-black tracking-tight text-white">MaPro</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Barangay Marigondon</p>
                    </div>
                    <div className="ml-auto">
                        <img src="/logo/brgylogo.png" alt="Barangay Marigondon Seal" className="h-12 w-12 object-contain opacity-90 drop-shadow-lg" />
                    </div>
                </div>

                {/* Center: headline */}
                <div className="relative z-10">
                    {/* Barangay seal — decorative large */}
                    <div className="mb-6 flex items-center gap-4">
                        <img src="/logo/brgylogo.png" alt="Barangay Marigondon Official Seal" className="h-20 w-20 object-contain opacity-95 drop-shadow-xl" />
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-blue-200/70">Republic of the Philippines</p>
                            <p className="text-sm font-black uppercase tracking-wide text-white">Barangay Marigondon</p>
                            <p className="text-xs text-blue-100/60">Lapu-Lapu City, Cebu</p>
                        </div>
                    </div>

                    <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-200 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-100">v1.0.0 — Beta</span>
                    </div>

                    <h1 className="mb-4 text-4xl font-black leading-tight text-white xl:text-5xl">
                        Modernizing<br />
                        <span className="text-blue-200">Local Governance.</span>
                    </h1>
                    <p className="max-w-sm text-base leading-relaxed text-blue-100/80">
                        A real-time records and statistics system built for Barangay Marigondon — fast, secure, and built for the people.
                    </p>

                    {/* Feature pills */}
                    <div className="mt-8 flex flex-col gap-3">
                        {[
                            { icon: Users,      text: 'Citizen & Household Profiles'   },
                            { icon: BarChart3,  text: 'Real-Time Barangay Statistics'  },
                            { icon: FileText,   text: 'Transaction & Document Logs'    },
                            { icon: ShieldCheck,text: 'Role-Based Secure Access'       },
                        ].map(({ icon: Icon, text }) => (
                            <div key={text} className="flex items-center gap-3 text-sm text-blue-100/90">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
                                    <Icon className="h-3.5 w-3.5 text-white" />
                                </div>
                                {text}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom: credits */}
                <div className="relative z-10 flex items-center gap-2">
                    <img src="/logo/ravenlabs.png" alt="RavenLabs" className="h-5 w-5 object-contain opacity-70" />
                    <p className="text-xs text-blue-200/60">© 2026 RavenLabs Development</p>
                </div>
            </div>

            {/* ── RIGHT PANEL — login form ──────────────────────────────── */}
            <div className="flex w-full flex-col items-center justify-center bg-slate-50 px-6 py-12 lg:w-1/2">

                {/* Mobile logo */}
                <div className="mb-8 flex flex-col items-center lg:hidden">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
                            <img src="/logo/w-icon.png" alt="MaPro" className="h-9 w-9 object-contain" />
                        </div>
                        <img src="/logo/brgylogo.png" alt="Barangay Marigondon Seal" className="h-14 w-14 object-contain drop-shadow-md" />
                    </div>
                    <p className="text-xl font-black tracking-tight text-slate-900">MaPro</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Barangay Marigondon</p>
                </div>

                <div className="w-full max-w-sm">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">Welcome Back</h2>
                        <p className="mt-1 text-sm text-slate-500">Sign in to access the portal</p>
                    </div>

                    {/* Success banner */}
                    {status && (
                        <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-3.5 text-green-700">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100">
                                <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-sm font-semibold">{status}</p>
                        </div>
                    )}

                    <Form {...store.form()} resetOnSuccess={['password']} className="flex flex-col gap-4">
                        {({ processing, errors }) => (
                            <>
                                {/* Error banner */}
                                {(errors.sys_account_id || errors.password) && (
                                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-red-700">
                                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100">
                                            <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">Authentication Failed</p>
                                            <p className="mt-0.5 text-xs text-red-600">
                                                {errors.sys_account_id || errors.password || 'Invalid credentials. Please check your Account ID and PIN.'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Account ID */}
                                <div className="grid gap-1.5">
                                    <Label htmlFor="account_id" className="ml-0.5 text-sm font-bold text-slate-700">Account ID</Label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="account_id"
                                            type="text"
                                            name="sys_account_id"
                                            maxLength={6}
                                            inputMode="numeric"
                                            onInput={(e) => {
                                                e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                                            }}
                                            className={`h-11 pl-10 font-mono tracking-[0.2em] text-slate-900 ${errors.sys_account_id ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`}
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            placeholder="XXXXXX"
                                        />
                                    </div>
                                </div>

                                {/* Security PIN */}
                                <div className="grid gap-1.5">
                                    <Label htmlFor="password" className="ml-0.5 text-sm font-bold text-slate-700">Security PIN</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            maxLength={6}
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            onInput={(e) => {
                                                e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                                            }}
                                            className={`h-11 pl-10 pr-10 font-mono tracking-[0.3em] text-slate-900 ${errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`}
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember me */}
                                <div className="flex items-center gap-2.5">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                        className="border-slate-300 data-[state=checked]:bg-blue-600"
                                    />
                                    <Label htmlFor="remember" className="cursor-pointer text-sm font-medium text-slate-600">
                                        Remember this session
                                    </Label>
                                </div>

                                {/* Submit */}
                                <Button
                                    type="submit"
                                    tabIndex={4}
                                    disabled={processing}
                                    className="group relative mt-2 h-11 w-full overflow-hidden rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-200 transition-all duration-300 hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-700 group-hover:translate-x-full" />
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {processing ? <Spinner /> : (
                                            <>
                                                Authenticate
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </span>
                                </Button>
                            </>
                        )}
                    </Form>

                    <p className="mt-8 text-center text-xs text-slate-400">
                        Barangay Marigondon Information System · For authorized personnel only
                    </p>
                </div>
            </div>
        </div>
    );
}
