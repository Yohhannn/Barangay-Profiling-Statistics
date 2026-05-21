import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ShieldCheck,
    UserCog,
    ArrowRight,
    UsersRound,
    History,
    Archive,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Panel',
        href: '/admin-panel',
    },
];

interface AdminPanelProps {
    staffCount?: number;
    logsCount?: number;
    archivesCount?: number;
}

export default function AdminPanel({
    staffCount = 0,
    logsCount = 0,
    archivesCount = 0,
}: AdminPanelProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Panel" />

            <div className="flex flex-col gap-8 p-6 lg:p-8 h-full min-h-[85vh] max-w-7xl mx-auto w-full">

                {/* --- Header Section --- */}
                <div className="relative overflow-hidden rounded-2xl border border-sidebar-border/60 bg-gradient-to-br from-sidebar via-sidebar to-neutral-50/50 dark:to-neutral-900/20 p-8 shadow-sm">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                Admin Panel
                            </h1>
                            <div className="flex items-center gap-3 text-sm font-medium text-neutral-500">
                                <span className="flex h-6 items-center rounded-full bg-neutral-100 px-3 text-xs font-bold uppercase tracking-wider text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                                    Administration
                                </span>
                                <span className="text-neutral-400">System & Access Control</span>
                            </div>
                            <p className="max-w-xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 pt-2">
                                Manage user accounts, monitor system events, and access archived records from this centralized dashboard.
                            </p>
                        </div>
                        <div className="hidden md:block opacity-10 rotate-12 transform">
                            <ShieldCheck className="size-32" />
                        </div>
                    </div>
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/5 dark:stroke-neutral-100/5 -z-0" />
                </div>

                {/* --- Main Cards Grid --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 flex-1 items-start">

                    {/* Card 1: Manage Accounts */}
                    <Link
                        href="/admin-panel/manage-accounts"
                        className="group relative flex flex-col items-center justify-center rounded-3xl border border-sidebar-border/60 bg-white dark:bg-sidebar p-12 text-center shadow-sm transition-all duration-300 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-50/30 dark:to-indigo-900/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-3xl" />

                        {/* Counter Pill */}
                        <div className="absolute top-6 right-6 z-10">
                            <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/80 dark:bg-black/20 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50 shadow-sm transition-transform group-hover:scale-105">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Active</span>
                                <span className="text-sm font-mono font-bold text-neutral-700 dark:text-neutral-200">
                                    {String(staffCount).padStart(2, '0')}
                                </span>
                            </div>
                        </div>

                        {/* Icon */}
                        <div className="relative z-10 mb-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 shadow-inner dark:from-indigo-900/20 dark:to-indigo-900/10 group-hover:scale-110 transition-transform duration-300 ease-out">
                            <UsersRound className="size-16 text-indigo-600 dark:text-indigo-400" strokeWidth={1.5} />
                        </div>

                        {/* Text */}
                        <div className="relative z-10 space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                Manage Accounts
                            </h2>
                            <p className="text-sm text-neutral-400 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                                Register, update & remove staff access
                            </p>
                        </div>

                        {/* Button */}
                        <div className="relative z-10 mt-10 flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-neutral-600 shadow-sm transition-all dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 group-hover:border-indigo-200 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:border-indigo-800 dark:group-hover:bg-indigo-900/20 dark:group-hover:text-indigo-300">
                            <UserCog className="size-3.5" />
                            <span>MANAGE STAFF</span>
                            <ArrowRight className="size-3.5 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                    </Link>

                    {/* Card 2: Activity Logs */}
                    <Link
                        href="/activity-logs"
                        className="group relative flex flex-col items-center justify-center rounded-3xl border border-sidebar-border/60 bg-white dark:bg-sidebar p-12 text-center shadow-sm transition-all duration-300 hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-500/5 hover:-translate-y-1"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-violet-50/30 dark:to-violet-900/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-3xl" />

                        {/* Counter Pill */}
                        <div className="absolute top-6 right-6 z-10">
                            <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/80 dark:bg-black/20 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50 shadow-sm transition-transform group-hover:scale-105">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                                </span>
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Logs</span>
                                <span className="text-sm font-mono font-bold text-neutral-700 dark:text-neutral-200">
                                    {String(logsCount).padStart(2, '0')}
                                </span>
                            </div>
                        </div>

                        {/* Icon */}
                        <div className="relative z-10 mb-8 rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100 p-6 shadow-inner dark:from-violet-900/20 dark:to-violet-900/10 group-hover:scale-110 transition-transform duration-300 ease-out">
                            <History className="size-16 text-violet-600 dark:text-violet-400" strokeWidth={1.5} />
                        </div>

                        {/* Text */}
                        <div className="relative z-10 space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                Activity Logs
                            </h2>
                            <p className="text-sm text-neutral-400 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                                Monitor system events & audit trails
                            </p>
                        </div>

                        {/* Button */}
                        <div className="relative z-10 mt-10 flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-neutral-600 shadow-sm transition-all dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 group-hover:border-violet-200 group-hover:bg-violet-50 group-hover:text-violet-600 dark:group-hover:border-violet-800 dark:group-hover:bg-violet-900/20 dark:group-hover:text-violet-300">
                            <History className="size-3.5" />
                            <span>VIEW LOGS</span>
                            <ArrowRight className="size-3.5 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                    </Link>

                    {/* Card 3: System Archives */}
                    <Link
                        href="/archives"
                        className="group relative flex flex-col items-center justify-center rounded-3xl border border-sidebar-border/60 bg-white dark:bg-sidebar p-12 text-center shadow-sm transition-all duration-300 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-50/30 dark:to-emerald-900/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-3xl" />

                        {/* Counter Pill */}
                        <div className="absolute top-6 right-6 z-10">
                            <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/80 dark:bg-black/20 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50 shadow-sm transition-transform group-hover:scale-105">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Archived</span>
                                <span className="text-sm font-mono font-bold text-neutral-700 dark:text-neutral-200">
                                    {String(archivesCount).padStart(2, '0')}
                                </span>
                            </div>
                        </div>

                        {/* Icon */}
                        <div className="relative z-10 mb-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 shadow-inner dark:from-emerald-900/20 dark:to-emerald-900/10 group-hover:scale-110 transition-transform duration-300 ease-out">
                            <Archive className="size-16 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
                        </div>

                        {/* Text */}
                        <div className="relative z-10 space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                System Archives
                            </h2>
                            <p className="text-sm text-neutral-400 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                                Restore soft-deleted entity records
                            </p>
                        </div>

                        {/* Button */}
                        <div className="relative z-10 mt-10 flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-neutral-600 shadow-sm transition-all dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 group-hover:border-emerald-200 group-hover:bg-emerald-50 group-hover:text-emerald-600 dark:group-hover:border-emerald-800 dark:group-hover:bg-emerald-900/20 dark:group-hover:text-emerald-300">
                            <Archive className="size-3.5" />
                            <span>ACCESS ARCHIVES</span>
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