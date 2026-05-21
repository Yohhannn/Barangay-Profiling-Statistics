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
    SlidersHorizontal,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Panel', href: '/admin-panel' },
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

            <div className="flex flex-col h-[calc(100vh-4rem)] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">

                {/* Header Bar */}
                <div className="flex items-center gap-4 pb-2 border-b border-sidebar-border/60">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <ShieldCheck className="size-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                            Admin Panel: <span className="text-blue-600 dark:text-blue-400">System Administration</span>
                        </h1>
                        <p className="text-xs text-neutral-500 mt-0.5">
                            Manage staff accounts, monitor activity logs, and access system archives
                        </p>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 content-start">

                    {/* Card 1: Manage Accounts */}
                    <Link
                        href="/admin-panel/manage-accounts"
                        className="group bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm p-6 flex flex-col gap-4 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30 group-hover:scale-105 transition-transform duration-200">
                                <UsersRound className="size-7 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className="text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/30">
                                {String(staffCount).padStart(2, '0')} active
                            </span>
                        </div>
                        <div>
                            <h2 className="font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                Manage Accounts
                            </h2>
                            <p className="text-xs text-neutral-500 mt-0.5">Register, update & remove staff access</p>
                        </div>
                        <div className="mt-auto flex items-center gap-1.5 text-xs font-bold text-neutral-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-wider pt-2 border-t border-sidebar-border/40">
                            <UserCog className="size-3.5" />
                            <span>Manage Staff</span>
                            <ArrowRight className="size-3.5 ml-auto transition-transform duration-200 group-hover:translate-x-1" />
                        </div>
                    </Link>

                    {/* Card 2: Activity Logs */}
                    <Link
                        href="/activity-logs"
                        className="group bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm p-6 flex flex-col gap-4 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-900/30 group-hover:scale-105 transition-transform duration-200">
                                <History className="size-7 text-violet-600 dark:text-violet-400" />
                            </div>
                            <span className="text-xs font-mono font-bold bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 px-2.5 py-1 rounded-full border border-violet-100 dark:border-violet-900/30">
                                {String(logsCount).padStart(2, '0')} logs
                            </span>
                        </div>
                        <div>
                            <h2 className="font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                Activity Logs
                            </h2>
                            <p className="text-xs text-neutral-500 mt-0.5">Monitor system events & audit trails</p>
                        </div>
                        <div className="mt-auto flex items-center gap-1.5 text-xs font-bold text-neutral-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors uppercase tracking-wider pt-2 border-t border-sidebar-border/40">
                            <History className="size-3.5" />
                            <span>View Logs</span>
                            <ArrowRight className="size-3.5 ml-auto transition-transform duration-200 group-hover:translate-x-1" />
                        </div>
                    </Link>

                    {/* Card 3: System Archives */}
                    <Link
                        href="/archives"
                        className="group bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm p-6 flex flex-col gap-4 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30 group-hover:scale-105 transition-transform duration-200">
                                <Archive className="size-7 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                                {String(archivesCount).padStart(2, '0')} archived
                            </span>
                        </div>
                        <div>
                            <h2 className="font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                System Archives
                            </h2>
                            <p className="text-xs text-neutral-500 mt-0.5">Restore soft-deleted entity records</p>
                        </div>
                        <div className="mt-auto flex items-center gap-1.5 text-xs font-bold text-neutral-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase tracking-wider pt-2 border-t border-sidebar-border/40">
                            <Archive className="size-3.5" />
                            <span>Access Archives</span>
                            <ArrowRight className="size-3.5 ml-auto transition-transform duration-200 group-hover:translate-x-1" />
                        </div>
                    </Link>

                    {/* Card 4: Admin Controls */}
                    <Link
                        href="/admin-panel/admin-control"
                        className="group bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm p-6 flex flex-col gap-4 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30 group-hover:scale-105 transition-transform duration-200">
                                <SlidersHorizontal className="size-7 text-amber-600 dark:text-amber-400" />
                            </div>
                            <span className="text-xs font-mono font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full border border-amber-100 dark:border-amber-900/30">
                                config
                            </span>
                        </div>
                        <div>
                            <h2 className="font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                Admin Controls
                            </h2>
                            <p className="text-xs text-neutral-500 mt-0.5">Configure drop-downs & system categories</p>
                        </div>
                        <div className="mt-auto flex items-center gap-1.5 text-xs font-bold text-neutral-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors uppercase tracking-wider pt-2 border-t border-sidebar-border/40">
                            <SlidersHorizontal className="size-3.5" />
                            <span>System Controls</span>
                            <ArrowRight className="size-3.5 ml-auto transition-transform duration-200 group-hover:translate-x-1" />
                        </div>
                    </Link>

                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-dashed border-sidebar-border/50 text-center">
                    <p className="text-xs font-semibold text-neutral-400/80 tracking-wide">
                        &copy; 2026 RavenLabs Development
                    </p>
                </div>

            </div>
        </AppLayout>
    );
}
