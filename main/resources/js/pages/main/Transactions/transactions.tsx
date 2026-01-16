import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { FileStack, ArrowRight, ScrollText, FolderOpen } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transactions',
        href: '/transactions',
    },
];

interface TransactionsProps {
    pendingCount?: number;
}

export default function Transactions({ pendingCount = 0 }: TransactionsProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transactions" />

            <div className="flex flex-col gap-8 p-6 lg:p-8 h-full min-h-[85vh] max-w-7xl mx-auto w-full">

                {/* --- Header Section --- */}
                <div className="relative overflow-hidden rounded-2xl border border-sidebar-border/60 bg-gradient-to-br from-sidebar via-sidebar to-neutral-50/50 dark:to-neutral-900/20 p-8 shadow-sm">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                Transactions
                            </h1>
                            <div className="flex items-center gap-3 text-sm font-medium text-neutral-500">
                                <span className="flex h-6 items-center rounded-full bg-neutral-100 px-3 text-xs font-bold uppercase tracking-wider text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                                    Administrative Services
                                </span>
                                <span className="text-neutral-400">Overview of Barangay Service Requests</span>
                            </div>
                            <p className="max-w-xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 pt-2">
                                Interact with the cards to explore detailed insights. Manage incoming document requests, clearances, and other administrative services.
                            </p>
                        </div>
                        {/* Decorative Icon */}
                        <div className="hidden md:block opacity-10 rotate-12 transform">
                            <ScrollText className="size-32" />
                        </div>
                    </div>
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/5 dark:stroke-neutral-100/5 -z-0" />
                </div>

                {/* --- Main Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 items-start">

                    {/* Card 1: Services (Yellow/Amber Theme) */}
                    <Link
                        href="/transactions/services-profile" // UPDATED ROUTE
                        className="group relative flex flex-col items-center justify-center rounded-3xl border border-sidebar-border/60 bg-white dark:bg-sidebar p-12 text-center shadow-sm transition-all duration-300 hover:border-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/5 hover:-translate-y-1"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-yellow-50/30 dark:to-yellow-900/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-3xl" />

                        {/* Floating Counter Pill (Pending Status) */}
                        <div className="absolute top-6 right-6 z-10">
                            <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/80 dark:bg-black/20 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50 shadow-sm transition-transform group-hover:scale-105">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                                </span>
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Pending</span>
                                <span className="text-sm font-mono font-bold text-neutral-700 dark:text-neutral-200">
                                    {String(pendingCount).padStart(2, '0')}
                                </span>
                            </div>
                        </div>

                        {/* Icon */}
                        <div className="relative z-10 mb-8 rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 shadow-inner dark:from-yellow-900/20 dark:to-yellow-900/10 group-hover:scale-110 transition-transform duration-300 ease-out">
                            <FolderOpen className="size-16 text-yellow-600 dark:text-yellow-400" strokeWidth={1.5} />
                        </div>

                        {/* Text Content */}
                        <div className="relative z-10 space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                                Services
                            </h2>
                            <p className="text-sm text-neutral-400 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                                Document Processing & Clearances
                            </p>
                        </div>

                        {/* Action Button */}
                        <div className="relative z-10 mt-10 flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-neutral-600 shadow-sm transition-all dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 group-hover:border-yellow-200 group-hover:bg-yellow-50 group-hover:text-yellow-600 dark:group-hover:border-yellow-800 dark:group-hover:bg-yellow-900/20 dark:group-hover:text-yellow-300">
                            <FileStack className="size-3.5" />
                            <span>MANAGE REQUESTS</span>
                            <ArrowRight className="size-3.5 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                    </Link>

                    {/* Placeholder for future cards to maintain grid structure if needed */}
                    <div className="hidden md:block"></div>

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
