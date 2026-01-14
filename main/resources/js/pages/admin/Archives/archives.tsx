import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Archive,
    RotateCcw,
    UserSquare2,
    Home,
    Store,
    Landmark,
    FolderOpen,
    FileClock,
    Stethoscope,
    Handshake,
    ArrowRight
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Archives',
        href: '/archives',
    },
];

// Configuration for the 8 Archive Categories
const archiveCategories = [
    {
        title: 'Citizens',
        desc: 'Deleted resident profiles',
        icon: UserSquare2,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-900/10',
        border: 'group-hover:border-blue-200 dark:group-hover:border-blue-800',
        hoverBg: 'group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20',
        gradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10',
        href: '/archives/citizens'
    },
    {
        title: 'Household',
        desc: 'Removed family groupings',
        icon: Home,
        color: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-50 dark:bg-orange-900/10',
        border: 'group-hover:border-orange-200 dark:group-hover:border-orange-800',
        hoverBg: 'group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20',
        gradient: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10',
        href: '/archives/household'
    },
    {
        title: 'Business',
        desc: 'Closed/Deleted permits',
        icon: Store,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-900/10',
        border: 'group-hover:border-emerald-200 dark:group-hover:border-emerald-800',
        hoverBg: 'group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20',
        gradient: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/10',
        href: '/archives/business'
    },
    {
        title: 'Infrastructures',
        desc: 'Deleted public works data',
        icon: Landmark,
        color: 'text-cyan-600 dark:text-cyan-400',
        bg: 'bg-cyan-50 dark:bg-cyan-900/10',
        border: 'group-hover:border-cyan-200 dark:group-hover:border-cyan-800',
        hoverBg: 'group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/20',
        gradient: 'from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-900/10',
        href: '/archives/infrastructures'
    },
    {
        title: 'Services',
        desc: 'Voided transactions',
        icon: FolderOpen,
        color: 'text-yellow-600 dark:text-yellow-400',
        bg: 'bg-yellow-50 dark:bg-yellow-900/10',
        border: 'group-hover:border-yellow-200 dark:group-hover:border-yellow-800',
        hoverBg: 'group-hover:bg-yellow-50 dark:group-hover:bg-yellow-900/20',
        gradient: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10',
        href: '/archives/services'
    },
    {
        title: 'Citizen Hist.',
        desc: 'Archived profile logs',
        icon: FileClock,
        color: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-50 dark:bg-indigo-900/10',
        border: 'group-hover:border-indigo-200 dark:group-hover:border-indigo-800',
        hoverBg: 'group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20',
        gradient: 'from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/10',
        href: '/archives/citizen-history'
    },
    {
        title: 'Medical Hist.',
        desc: 'Deleted health records',
        icon: Stethoscope,
        color: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-50 dark:bg-rose-900/10',
        border: 'group-hover:border-rose-200 dark:group-hover:border-rose-800',
        hoverBg: 'group-hover:bg-rose-50 dark:group-hover:bg-rose-900/20',
        gradient: 'from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-900/10',
        href: '/archives/medical-history'
    },
    {
        title: 'Settlement Hist.',
        desc: 'Removed case files',
        icon: Handshake,
        color: 'text-stone-600 dark:text-stone-400',
        bg: 'bg-stone-50 dark:bg-stone-900/10',
        border: 'group-hover:border-stone-200 dark:group-hover:border-stone-800',
        hoverBg: 'group-hover:bg-stone-50 dark:group-hover:bg-stone-900/20',
        gradient: 'from-stone-50 to-stone-100 dark:from-stone-900/20 dark:to-stone-900/10',
        href: '/archives/settlement-history'
    },
];

export default function Archives() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Archives" />

            <div className="flex flex-col gap-6 p-6 lg:p-8 h-full min-h-[85vh] max-w-7xl mx-auto w-full">

                {/* --- Header Section --- */}
                <div className="relative overflow-hidden rounded-2xl border border-sidebar-border/60 bg-gradient-to-br from-sidebar via-sidebar to-neutral-50/50 dark:to-neutral-900/20 p-8 shadow-sm">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                Archives
                            </h1>
                            <div className="flex items-center gap-3 text-sm font-medium text-neutral-500">
                                <span className="flex h-6 items-center rounded-full bg-neutral-100 px-3 text-xs font-bold uppercase tracking-wider text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                                    Data Recovery
                                </span>
                                <span className="text-neutral-400">Soft-deleted data repository</span>
                            </div>
                            <p className="max-w-xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 pt-2">
                                Access and restore data that has been soft-deleted. Items here are kept for safety before permanent deletion.
                            </p>
                        </div>
                        {/* Decorative Icon */}
                        <div className="hidden md:block opacity-10 rotate-12 transform">
                            <Archive className="size-32 text-neutral-200 dark:text-neutral-800" />
                        </div>
                    </div>
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/5 dark:stroke-neutral-100/5 -z-0" />
                </div>

                {/* --- Main 8-Card Grid --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 flex-1 items-start">

                    {archiveCategories.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={`group relative flex flex-col items-center justify-center rounded-3xl border border-sidebar-border/60 bg-white dark:bg-sidebar p-6 py-8 text-center shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${item.border}`}
                        >
                            {/* Hover Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-b opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-3xl ${item.gradient}`} />

                            {/* Floating "Deleted" Counter (Mock) */}
                            <div className="absolute top-4 right-4 z-10 opacity-50 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] font-mono font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">
                                    DEL: 00
                                </span>
                            </div>

                            {/* Icon */}
                            <div className={`relative z-10 mb-5 rounded-2xl p-5 shadow-inner transition-transform duration-300 ease-out group-hover:scale-110 bg-gradient-to-br ${item.gradient}`}>
                                <item.icon className={`size-10 ${item.color}`} strokeWidth={1.5} />
                            </div>

                            {/* Text Info */}
                            <div className="relative z-10 space-y-1 mb-5">
                                <h2 className={`text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 transition-colors ${item.color.replace('text-', 'group-hover:text-')}`}>
                                    {item.title}
                                </h2>
                                <p className="text-[11px] text-neutral-400 font-medium opacity-80 group-hover:opacity-100 transition-opacity px-2">
                                    {item.desc}
                                </p>
                            </div>

                            {/* Action Button Pill */}
                            <div className={`relative z-10 mt-auto flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-600 shadow-sm transition-all dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 ${item.border} ${item.hoverBg} ${item.color.replace('text-', 'group-hover:text-')}`}>
                                <RotateCcw className="size-3" />
                                <span>RESTORE DATA</span>
                            </div>
                        </Link>
                    ))}

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
