import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { Form, Head, Link } from '@inertiajs/react';
import { DotScreenShader } from "@/components/ui/dot-shader-background";
import { Hash, Lock, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface LoginProps {
    status?: string;
}

export default function Login({ status }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative min-h-screen bg-slate-50 flex items-center justify-center p-6 overflow-hidden">
            {/* Return Button - Top Left */}
            <Link
                href="/"
                className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 font-semibold text-sm shadow-sm hover:bg-slate-50 hover:text-blue-600 transition-all duration-200 group"
            >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Return
            </Link>

            {/* Background Shader - MaPro Theme */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                <DotScreenShader />
            </div>

            <Head title="Log in" />

            <div className="relative z-10 w-full max-w-md">
                {/* Branding Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className=" p-3 rounded-full mb-4">
                        <img
                            src="/logo/brgylogo.png"
                            alt="MaPro Logo"
                            className="w-16 h-16 object-contain"
                        />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Welcome Back</h1>
                    <p className="text-slate-500 font-medium italic text-center">Barangay Marigondon Records & Statistics</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8">
                    {/* Status / Success Banner */}
                    {status && (
                        <div className="mb-5 flex items-center gap-3 p-3.5 bg-green-50 rounded-xl border border-green-200 text-green-700">
                            <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <p className="text-sm font-semibold">{status}</p>
                        </div>
                    )}

                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        className="flex flex-col gap-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                {/* Error Banner */}
                                {(errors.sys_account_id || errors.password) && (
                                    <div className="flex items-start gap-3 p-3.5 bg-red-50 rounded-xl border border-red-200 text-red-700">
                                        <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                                            <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">Authentication Failed</p>
                                            <p className="text-xs mt-0.5 text-red-600">
                                                {errors.sys_account_id || errors.password || 'Invalid credentials. Please check your Account ID and PIN.'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid gap-5">
                                    {/* User ID Field */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="user_id" className="text-slate-700 font-bold ml-1">Account ID</Label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <Input
                                                id="user_id"
                                                type="text"
                                                name="sys_account_id"
                                                maxLength={6}
                                                inputMode="numeric"
                                                onInput={(e) => {
                                                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                                                }}
                                                className={`pl-10 bg-white text-slate-900 focus:ring-blue-500 focus:border-blue-500 h-11 font-mono tracking-[0.2em] ${errors.sys_account_id ? 'border-red-400 bg-red-50 focus:ring-red-500/20' : 'border-slate-200'}`}
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                placeholder="XXXXXX"
                                            />
                                        </div>
                                    </div>

                                    {/* PIN Field (Replaced Password) */}
                                    <div className="grid gap-2">
                                        <div className="flex items-center ml-1">
                                            <Label htmlFor="password" className="text-slate-700 font-bold">Security PIN</Label>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                maxLength={6}
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                onInput={(e) => {
                                                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                                                }}
                                                className={`pl-10 pr-10 bg-white text-slate-900 focus:ring-blue-500 focus:border-blue-500 h-11 font-mono tracking-[0.3em] ${errors.password ? 'border-red-400 bg-red-50 focus:ring-red-500/20' : 'border-slate-200'}`}
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 ml-1">
                                        <Checkbox id="remember" name="remember" tabIndex={3} className="border-slate-300 data-[state=checked]:bg-blue-600" />
                                        <Label htmlFor="remember" className="text-sm text-slate-600 font-medium cursor-pointer">Remember this session</Label>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="group relative overflow-hidden mt-4 w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-100"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>

                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            {processing ? <Spinner /> : 'Authenticate'}
                                            {!processing && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                                        </span>
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </div>
    );
}
