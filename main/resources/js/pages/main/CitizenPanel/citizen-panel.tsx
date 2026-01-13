import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { UserSquare2, Home, ArrowRight, Users, Database } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Citizen Panel',
        href: '/citizen-panel',
    },
];

interface CitizenPanelProps {
    citizenCount?: number;
    householdCount?: number;
}

export default function CitizenPanel({ citizenCount = 0, householdCount = 0 }: CitizenPanelProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Citizen Panel" />

            <div className="flex flex-col gap-8 p-6 lg:p-8 h-full min-h-[85vh] max-w-7xl mx-auto w-full">

                {/* --- Header Section --- */}
                <div className="relative overflow-hidden rounded-2xl border border-sidebar-border/60 bg-gradient-to-br from-sidebar via-sidebar to-neutral-50/50 dark:to-neutral-900/20 p-8 shadow-sm">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                Citizen Panel
                            </h1>
                            <div className="flex items-center gap-3 text-sm font-medium text-neutral-500">
                                <span className="flex h-6 items-center rounded-full bg-neutral-100 px-3 text-xs font-bold uppercase tracking-wider text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                                    Overview
                                </span>
                                <span className="text-neutral-400">Manage demographic data categories</span>
                            </div>
                            <p className="max-w-xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 pt-2">
                                Interact with the cards below to explore detailed insights. Select a category to access the master database.
                            </p>
                        </div>
                        <div className="hidden md:block opacity-10 rotate-12 transform">
                            <Users className="size-32" />
                        </div>
                    </div>
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/5 dark:stroke-neutral-100/5 -z-0" />
                </div>

                {/* --- Main Cards Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 items-start">

                    {/* Card 1: Citizen Profile */}
                    <Link
                        href="/citizens"
                        className="group relative flex flex-col items-center justify-center rounded-3xl border border-sidebar-border/60 bg-white dark:bg-sidebar p-12 text-center shadow-sm transition-all duration-300 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-50/30 dark:to-blue-900/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-3xl" />

                        {/* Modernized Counter (Floating Pill) */}
                        <div className="absolute top-6 right-6 z-10">
                            <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/80 dark:bg-black/20 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50 shadow-sm transition-transform group-hover:scale-105">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total</span>
                                <span className="text-sm font-mono font-bold text-neutral-700 dark:text-neutral-200">
                                    {String(citizenCount).padStart(2, '0')}
                                </span>
                            </div>
                        </div>

                        {/* Icon */}
                        <div className="relative z-10 mb-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-inner dark:from-blue-900/20 dark:to-blue-900/10 group-hover:scale-110 transition-transform duration-300 ease-out">
                            <UserSquare2 className="size-16 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
                        </div>

                        {/* Text */}
                        <div className="relative z-10 space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                Citizen Profile
                            </h2>
                            <p className="text-sm text-neutral-400 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                                Individual Records & Demographics
                            </p>
                        </div>

                        {/* Button: Better Default State */}
                        <div className="relative z-10 mt-10 flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-neutral-600 shadow-sm transition-all dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:border-blue-800 dark:group-hover:bg-blue-900/20 dark:group-hover:text-blue-300">
                            <Database className="size-3.5" />
                            <span>MANAGE CITIZEN DATA</span>
                            <ArrowRight className="size-3.5 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                    </Link>

                    {/* Card 2: Household */}
                    <Link
                        href="/households"
                        className="group relative flex flex-col items-center justify-center rounded-3xl border border-sidebar-border/60 bg-white dark:bg-sidebar p-12 text-center shadow-sm transition-all duration-300 hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-1"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-orange-50/30 dark:to-orange-900/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-3xl" />

                        {/* Modernized Counter (Floating Pill) */}
                        <div className="absolute top-6 right-6 z-10">
                            <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/80 dark:bg-black/20 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50 shadow-sm transition-transform group-hover:scale-105">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                </span>
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total</span>
                                <span className="text-sm font-mono font-bold text-neutral-700 dark:text-neutral-200">
                                    {String(householdCount).padStart(2, '0')}
                                </span>
                            </div>
                        </div>

                        {/* Icon */}
                        <div className="relative z-10 mb-8 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 p-6 shadow-inner dark:from-orange-900/20 dark:to-orange-900/10 group-hover:scale-110 transition-transform duration-300 ease-out">
                            <Home className="size-16 text-orange-600 dark:text-orange-400" strokeWidth={1.5} />
                        </div>

                        {/* Text */}
                        <div className="relative z-10 space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                Household
                            </h2>
                            <p className="text-sm text-neutral-400 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                                Family Groupings & Residences
                            </p>
                        </div>

                        {/* Button: Better Default State */}
                        <div className="relative z-10 mt-10 flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-neutral-600 shadow-sm transition-all dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 group-hover:border-orange-200 group-hover:bg-orange-50 group-hover:text-orange-600 dark:group-hover:border-orange-800 dark:group-hover:bg-orange-900/20 dark:group-hover:text-orange-300">
                            <Database className="size-3.5" />
                            <span>MANAGE HOUSEHOLD DATA</span>
                            <ArrowRight className="size-3.5 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                    </Link>

                </div>

                {/* --- Footer --- */}
                <div className="mt-auto pt-6 border-t border-dashed border-sidebar-border/50 text-center">
                    <p className="text-xs font-semibold text-neutral-400/80 tracking-wide">
                        &copy; 2026 RavenLabs Development
                    </p>
                </div>

            </div>
        </AppLayout>
    );
}
