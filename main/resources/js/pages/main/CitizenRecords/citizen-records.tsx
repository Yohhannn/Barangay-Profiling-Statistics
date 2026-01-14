import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    FileClock,
    Stethoscope,
    Handshake,
    ArrowRight,
    History,
    FolderSearch
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'History Records', // Updated to match the image
        href: '/citizen-records',
    },
];

export default function HistoryRecords() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="History Records" />

            <div className="flex flex-col gap-8 p-6 lg:p-8 h-full min-h-[85vh] max-w-7xl mx-auto w-full">

                {/* --- Header Section --- */}
                <div className="relative overflow-hidden rounded-2xl border border-sidebar-border/60 bg-gradient-to-br from-sidebar via-sidebar to-neutral-50/50 dark:to-neutral-900/20 p-8 shadow-sm">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                History Records
                            </h1>
                            <div className="flex items-center gap-3 text-sm font-medium text-neutral-500">
                                <span className="flex h-6 items-center rounded-full bg-neutral-100 px-3 text-xs font-bold uppercase tracking-wider text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                                    Archives
                                </span>
                                <span className="text-neutral-400">Overview of History Record Categories</span>
                            </div>
                            <p className="max-w-xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 pt-2">
                                Interact with the cards below to explore detailed insights. Select a category to view historical logs, medical records, or settlement agreements.
                            </p>
                        </div>
                        {/* Decorative Icon */}
                        <div className="hidden md:block opacity-10 rotate-12 transform">
                            <History className="size-32" />
                        </div>
                    </div>
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/5 dark:stroke-neutral-100/5 -z-0" />
                </div>

                {/* --- Main Cards Grid (3 Columns) --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 items-start">

                    {/* Card 1: Citizen History (Blue) */}
                    <Link
                        href="/history/citizen"
                        className="group relative flex flex-col items-center justify-center rounded-3xl border border-sidebar-border/60 bg-white dark:bg-sidebar p-8 py-12 text-center shadow-sm transition-all duration-300 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-50/30 dark:to-blue-900/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-3xl" />

                        {/* Icon */}
                        <div className="relative z-10 mb-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-5 shadow-inner dark:from-blue-900/20 dark:to-blue-900/10 group-hover:scale-110 transition-transform duration-300 ease-out">
                            <FileClock className="size-12 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
                        </div>

                        {/* Text */}
                        <div className="relative z-10 space-y-2 mb-8">
                            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                Citizen History
                            </h2>
                            <p className="text-xs text-neutral-400 font-medium opacity-80 group-hover:opacity-100 transition-opacity px-4">
                                Track profiling updates and residency logs.
                            </p>
                        </div>

                        {/* Button */}
                        <div className="relative z-10 mt-auto flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-neutral-600 shadow-sm transition-all dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:border-blue-800 dark:group-hover:bg-blue-900/20 dark:group-hover:text-blue-300">
                            <FolderSearch className="size-3" />
                            <span>VIEW LOGS</span>
                            <ArrowRight className="size-3 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                    </Link>

                    {/* Card 2: Medical History (Rose/Red) */}
                    <Link
                        href="/history/medical"
                        className="group relative flex flex-col items-center justify-center rounded-3xl border border-sidebar-border/60 bg-white dark:bg-sidebar p-8 py-12 text-center shadow-sm transition-all duration-300 hover:border-rose-500/30 hover:shadow-xl hover:shadow-rose-500/5 hover:-translate-y-1"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-rose-50/30 dark:to-rose-900/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-3xl" />

                        {/* Icon */}
                        <div className="relative z-10 mb-6 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 p-5 shadow-inner dark:from-rose-900/20 dark:to-rose-900/10 group-hover:scale-110 transition-transform duration-300 ease-out">
                            <Stethoscope className="size-12 text-rose-600 dark:text-rose-400" strokeWidth={1.5} />
                        </div>

                        {/* Text */}
                        <div className="relative z-10 space-y-2 mb-8">
                            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                Medical History
                            </h2>
                            <p className="text-xs text-neutral-400 font-medium opacity-80 group-hover:opacity-100 transition-opacity px-4">
                                Health records, checkups, and vaccinations.
                            </p>
                        </div>

                        {/* Button */}
                        <div className="relative z-10 mt-auto flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-neutral-600 shadow-sm transition-all dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 group-hover:border-rose-200 group-hover:bg-rose-50 group-hover:text-rose-600 dark:group-hover:border-rose-800 dark:group-hover:bg-rose-900/20 dark:group-hover:text-rose-300">
                            <FolderSearch className="size-3" />
                            <span>VIEW LOGS</span>
                            <ArrowRight className="size-3 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                    </Link>

                    {/* Card 3: Settlement History (Amber/Orange) */}
                    <Link
                        href="/history/settlement"
                        className="group relative flex flex-col items-center justify-center rounded-3xl border border-sidebar-border/60 bg-white dark:bg-sidebar p-8 py-12 text-center shadow-sm transition-all duration-300 hover:border-amber-500/30 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-50/30 dark:to-amber-900/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-3xl" />

                        {/* Icon */}
                        <div className="relative z-10 mb-6 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 p-5 shadow-inner dark:from-amber-900/20 dark:to-amber-900/10 group-hover:scale-110 transition-transform duration-300 ease-out">
                            <Handshake className="size-12 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
                        </div>

                        {/* Text */}
                        <div className="relative z-10 space-y-2 mb-8">
                            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                Settlement History
                            </h2>
                            <p className="text-xs text-neutral-400 font-medium opacity-80 group-hover:opacity-100 transition-opacity px-4">
                                Dispute resolutions and legal agreements.
                            </p>
                        </div>

                        {/* Button */}
                        <div className="relative z-10 mt-auto flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-neutral-600 shadow-sm transition-all dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 group-hover:border-amber-200 group-hover:bg-amber-50 group-hover:text-amber-600 dark:group-hover:border-amber-800 dark:group-hover:bg-amber-900/20 dark:group-hover:text-amber-300">
                            <FolderSearch className="size-3" />
                            <span>VIEW LOGS</span>
                            <ArrowRight className="size-3 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
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
