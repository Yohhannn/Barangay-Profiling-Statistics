import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft, Calendar, Filter, Search, Briefcase,
    Building2, Users, PieChart, TrendingUp, Download
} from 'lucide-react';
import { useState, useMemo } from 'react';

// --- Mock Data ---
const employmentData = [
    { name: 'Cadulang 1', employed: 45, unemployed: 5, selfEmployed: 10, notInLabor: 20 },
    { name: 'Cadulang 2', employed: 50, unemployed: 8, selfEmployed: 12, notInLabor: 15 },
    { name: 'Cambiohan', employed: 30, unemployed: 4, selfEmployed: 5, notInLabor: 10 },
    { name: 'Chocolate Hills', employed: 110, unemployed: 12, selfEmployed: 25, notInLabor: 30 },
    { name: 'Hawaiian 1', employed: 25, unemployed: 3, selfEmployed: 8, notInLabor: 12 },
    { name: 'Hawaiian 2', employed: 20, unemployed: 2, selfEmployed: 4, notInLabor: 8 },
    { name: 'Ibabao', employed: 85, unemployed: 10, selfEmployed: 20, notInLabor: 25 },
    { name: 'Ikaseg', employed: 40, unemployed: 5, selfEmployed: 10, notInLabor: 15 },
    { name: 'Kaisid', employed: 60, unemployed: 7, selfEmployed: 15, notInLabor: 18 },
    { name: 'Kalubihan', employed: 75, unemployed: 9, selfEmployed: 18, notInLabor: 22 },
    { name: 'Kolo', employed: 35, unemployed: 4, selfEmployed: 8, notInLabor: 10 },
    { name: 'Likoan', employed: 15, unemployed: 2, selfEmployed: 3, notInLabor: 5 },
    { name: 'Marigondon Proper', employed: 200, unemployed: 25, selfEmployed: 45, notInLabor: 50 },
    { name: 'Suba-Basbas', employed: 95, unemployed: 11, selfEmployed: 22, notInLabor: 28 },
    { name: 'Sangi', employed: 120, unemployed: 15, selfEmployed: 30, notInLabor: 35 },
];

const governmentData = {
    govWorkers: 150,
    nonGovWorkers: 1850
};

const overallStatus = {
    employed: 1200,
    unemployed: 200,
    selfEmployed: 450,
    notInLabor: 600,
    total: 2450 // sum of above
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Statistics', href: '/statistics' },
    { title: 'Employment', href: '/statistics/employment' },
];

export default function EmploymentStats() {
    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('2025-01-01');
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    // Computed Data
    const processedData = useMemo(() => {
        return employmentData.filter(row =>
            row.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).sort((a, b) => a.name.localeCompare(b.name));
    }, [searchQuery]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employment Statistics" />

            <div className="flex flex-col h-full min-h-[90vh] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">

                {/* --- Header & Filter --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-sidebar-border/60">
                    <div className="flex items-center gap-4">
                        <Link href="/statistics" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                            <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                                Statistics: <span className="text-teal-600 dark:text-teal-400">Employment</span>
                            </h1>
                            <p className="text-xs text-neutral-500">Labor force and occupation analysis</p>
                        </div>
                    </div>

                    {/* Date Filter Bar */}
                    <div className="flex items-center gap-2 bg-white dark:bg-sidebar border border-sidebar-border p-1.5 rounded-lg shadow-sm">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded">
                            <Calendar className="size-3.5 text-neutral-500" />
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    className="bg-transparent border-none text-xs font-mono text-neutral-600 dark:text-neutral-300 p-0 focus:ring-0 cursor-pointer"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                                <span className="text-neutral-400 text-xs">to</span>
                                <input
                                    type="date"
                                    className="bg-transparent border-none text-xs font-mono text-neutral-600 dark:text-neutral-300 p-0 focus:ring-0 cursor-pointer"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase rounded transition-all active:scale-95">
                            <Filter className="size-3.5" /> Filter
                        </button>
                    </div>
                </div>

                {/* --- Main Grid Layout --- */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

                    {/* === LEFT COLUMN: Detailed Table (Spans 2) === */}
                    <div className="xl:col-span-2 bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">

                        <div className="p-4 border-b border-sidebar-border bg-neutral-50/50 dark:bg-neutral-900/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 flex items-center gap-2">
                                <Briefcase className="size-4" /> Employment Data Per Sitio
                            </h3>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search Sitio..."
                                    className="w-full pl-9 pr-4 py-1.5 text-xs border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] uppercase text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50 sticky top-0 z-10 backdrop-blur-sm border-b border-sidebar-border">
                                <tr>
                                    <th className="px-6 py-3 font-bold tracking-wider">Sitio Name</th>
                                    <th className="px-6 py-3 text-center text-teal-600 dark:text-teal-400 font-bold">Employed</th>
                                    <th className="px-6 py-3 text-center text-rose-600 dark:text-rose-400 font-bold">Unemployed</th>
                                    <th className="px-6 py-3 text-center text-blue-600 dark:text-blue-400 font-bold">Self-Employed</th>
                                    <th className="px-6 py-3 text-center text-neutral-400">Not in Labor Force</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/50">
                                {processedData.length > 0 ? (
                                    processedData.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/20 transition-colors">
                                            <td className="px-6 py-3 font-medium text-neutral-900 dark:text-neutral-100">{row.name}</td>
                                            <td className="px-6 py-3 text-center font-mono text-neutral-600 dark:text-neutral-300">{row.employed}</td>
                                            <td className="px-6 py-3 text-center font-mono text-neutral-600 dark:text-neutral-300">{row.unemployed}</td>
                                            <td className="px-6 py-3 text-center font-mono text-neutral-600 dark:text-neutral-300">{row.selfEmployed}</td>
                                            <td className="px-6 py-3 text-center font-mono text-neutral-400">{row.notInLabor}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-neutral-400 text-xs">
                                            No records found for "{searchQuery}"
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* === RIGHT COLUMN: Summaries (Spans 1) === */}
                    <div className="flex flex-col gap-6">

                        {/* 1. Government Comparison */}
                        <div className="bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600">
                                    <Building2 className="size-5" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Gov't Related Comparison</h3>
                            </div>

                            <div className="space-y-4">
                                <StatItem label="Government Workers" value={governmentData.govWorkers} color="bg-blue-500" />
                                <StatItem label="Non-Government Workers" value={governmentData.nonGovWorkers} color="bg-neutral-400" />

                                <div className="p-3 bg-neutral-50 dark:bg-neutral-900/20 rounded-xl flex justify-between items-center text-xs text-neutral-500">
                                    <span>Total Workforce:</span>
                                    <span className="font-bold text-neutral-900 dark:text-neutral-100">{governmentData.govWorkers + governmentData.nonGovWorkers}</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Overall Employment Status */}
                        <div className="bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-teal-100 dark:bg-teal-900/20 rounded-lg text-teal-600">
                                    <PieChart className="size-5" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Overall Employment Status</h3>
                            </div>

                            <div className="space-y-3">
                                <StatItem label="Employed" value={overallStatus.employed} color="bg-teal-500" total={overallStatus.total} />
                                <StatItem label="Unemployed" value={overallStatus.unemployed} color="bg-rose-500" total={overallStatus.total} />
                                <StatItem label="Self-Employed" value={overallStatus.selfEmployed} color="bg-blue-500" total={overallStatus.total} />
                                <StatItem label="Not in Labor Force" value={overallStatus.notInLabor} color="bg-neutral-300" total={overallStatus.total} />
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </AppLayout>
    );
}

// --- Reusable Component: Stat Bar ---
function StatItem({ label, value, color, total }: { label: string, value: number, color: string, total?: number }) {
    // If total is provided, calculate percentage, otherwise assume simplified scaling
    const maxVal = total || 2000;
    const widthPercent = Math.min((value / maxVal) * 100, 100);
    const percentage = total ? Math.round((value / total) * 100) : null;

    return (
        <div className="group">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">{label}</span>
                <div className="flex gap-1.5 items-center">
                    <span className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">{value.toLocaleString()}</span>
                    {percentage !== null && <span className="text-[10px] text-neutral-400 font-mono">({percentage}%)</span>}
                </div>
            </div>
            <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${widthPercent}%` }} />
            </div>
        </div>
    );
}
