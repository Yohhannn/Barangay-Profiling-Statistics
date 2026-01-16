import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft, Calendar, Filter, Search, Home,
    TrendingUp, TrendingDown, Key, Droplets,
    PieChart, ChevronDown, Download
} from 'lucide-react';
import { useState, useMemo } from 'react';

// --- Mock Data ---
const householdData = [
    { name: 'Cadulang 1', total: 45, avgMale: 2.1, avgFemale: 2.0, avgMembers: 4.1 },
    { name: 'Cadulang 2', total: 52, avgMale: 2.3, avgFemale: 2.1, avgMembers: 4.4 },
    { name: 'Cambiohan', total: 30, avgMale: 1.8, avgFemale: 1.9, avgMembers: 3.7 },
    { name: 'Chocolate Hills', total: 110, avgMale: 2.5, avgFemale: 2.4, avgMembers: 4.9 },
    { name: 'Hawaiian 1', total: 25, avgMale: 1.5, avgFemale: 1.6, avgMembers: 3.1 },
    { name: 'Hawaiian 2', total: 20, avgMale: 1.4, avgFemale: 1.5, avgMembers: 2.9 },
    { name: 'Ibabao', total: 85, avgMale: 2.2, avgFemale: 2.2, avgMembers: 4.4 },
    { name: 'Ikaseg', total: 40, avgMale: 2.0, avgFemale: 2.0, avgMembers: 4.0 },
    { name: 'Kaisid', total: 60, avgMale: 2.1, avgFemale: 2.1, avgMembers: 4.2 },
    { name: 'Kalubihan', total: 75, avgMale: 2.3, avgFemale: 2.2, avgMembers: 4.5 },
    { name: 'Kolo', total: 35, avgMale: 1.9, avgFemale: 1.8, avgMembers: 3.7 },
    { name: 'Likoan', total: 15, avgMale: 1.2, avgFemale: 1.3, avgMembers: 2.5 },
    { name: 'Marigondon Proper', total: 200, avgMale: 2.6, avgFemale: 2.5, avgMembers: 5.1 }, // Highest
    { name: 'Suba-Basbas', total: 95, avgMale: 2.4, avgFemale: 2.3, avgMembers: 4.7 },
    { name: 'Sangi', total: 120, avgMale: 2.5, avgFemale: 2.4, avgMembers: 4.9 },
];

const ownershipData = {
    owned: 850,
    rented: 240,
    leased: 45,
    informal: 112
};

const utilitiesData = {
    level1: 150, // Point Source
    level2: 320, // Communal Faucet
    level3: 750, // Individual Connection
    others: 27
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Statistics', href: '/statistics' },
    { title: 'Household', href: '/statistics/household' },
];

export default function HouseholdStats() {
    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('2025-01-01');
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    // Computed Data
    const processedData = useMemo(() => {
        return householdData.filter(hh =>
            hh.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).sort((a, b) => a.name.localeCompare(b.name));
    }, [searchQuery]);

    // Metrics Overview
    const metrics = useMemo(() => {
        const highest = householdData.reduce((prev, current) => (prev.total > current.total) ? prev : current);
        const lowest = householdData.reduce((prev, current) => (prev.total < current.total) ? prev : current);
        const totalHouseholds = householdData.reduce((acc, curr) => acc + curr.total, 0);

        return { highest, lowest, totalHouseholds };
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Household Statistics" />

            <div className="flex flex-col h-full min-h-[90vh] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">

                {/* --- Header & Filter --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-sidebar-border/60">
                    <div className="flex items-center gap-4">
                        <Link href="/statistics" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                            <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                                Statistics: <span className="text-orange-600 dark:text-orange-400">Household</span>
                            </h1>
                            <p className="text-xs text-neutral-500">Analysis of household distribution and amenities</p>
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
                                <Home className="size-4" /> Household Per Street
                            </h3>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search Sitio..."
                                    className="w-full pl-9 pr-4 py-1.5 text-xs border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
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
                                    <th className="px-6 py-3 text-center text-orange-600 dark:text-orange-400 font-bold">Total HH</th>
                                    <th className="px-6 py-3 text-center text-neutral-500">Avg Male/HH</th>
                                    <th className="px-6 py-3 text-center text-neutral-500">Avg Female/HH</th>
                                    <th className="px-6 py-3 text-center text-neutral-900 dark:text-neutral-100 font-bold bg-neutral-100/50 dark:bg-neutral-800/50">Avg Members</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/50">
                                {processedData.length > 0 ? (
                                    processedData.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/20 transition-colors">
                                            <td className="px-6 py-3 font-medium text-neutral-900 dark:text-neutral-100">{row.name}</td>
                                            <td className="px-6 py-3 text-center font-mono font-bold text-orange-600 dark:text-orange-400">{row.total}</td>
                                            <td className="px-6 py-3 text-center font-mono text-neutral-600 dark:text-neutral-400">{row.avgMale}</td>
                                            <td className="px-6 py-3 text-center font-mono text-neutral-600 dark:text-neutral-400">{row.avgFemale}</td>
                                            <td className="px-6 py-3 text-center font-mono font-bold bg-neutral-50/50 dark:bg-neutral-800/20">{row.avgMembers}</td>
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

                        {/* 1. Overview Card */}
                        <div className="bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
                            <PlaceholderPattern className="absolute top-0 right-0 w-32 h-32 text-orange-500/5 -z-0" />
                            <div className="flex items-center gap-2 mb-4 relative z-10">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg text-orange-600">
                                    <PieChart className="size-5" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Household Overview</h3>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-center pb-4 border-b border-dashed border-sidebar-border">
                                    <span className="text-xs text-neutral-500 font-medium">Total Number of Households</span>
                                    <span className="text-2xl font-black text-neutral-900 dark:text-neutral-100">{metrics.totalHouseholds.toLocaleString()}</span>
                                </div>

                                <div className="space-y-3">
                                    <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 rounded-xl p-3 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="size-4 text-green-600" />
                                            <span className="text-xs font-bold text-green-700 dark:text-green-400">Highest</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-green-800 dark:text-green-200">{metrics.highest.name}</div>
                                            <div className="text-[10px] text-green-600 dark:text-green-400 font-mono">{metrics.highest.total} HH</div>
                                        </div>
                                    </div>

                                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl p-3 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <TrendingDown className="size-4 text-red-600" />
                                            <span className="text-xs font-bold text-red-700 dark:text-red-400">Lowest</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-red-800 dark:text-red-200">{metrics.lowest.name}</div>
                                            <div className="text-[10px] text-red-600 dark:text-red-400 font-mono">{metrics.lowest.total} HH</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Ownership Status */}
                        <div className="bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600">
                                    <Key className="size-5" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Ownership Status</h3>
                            </div>

                            <div className="space-y-3">
                                <StatItem label="Owned" value={ownershipData.owned} color="bg-blue-500" />
                                <StatItem label="Rented" value={ownershipData.rented} color="bg-cyan-500" />
                                <StatItem label="Leased" value={ownershipData.leased} color="bg-purple-500" />
                                <StatItem label="Informal Settlers" value={ownershipData.informal} color="bg-rose-500" />
                            </div>
                        </div>

                        {/* 3. Water Sources (Utilities) */}
                        <div className="bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-teal-100 dark:bg-teal-900/20 rounded-lg text-teal-600">
                                    <Droplets className="size-5" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Water Source Data</h3>
                            </div>

                            <div className="space-y-3">
                                <StatItem label="Point Source (Level 1)" value={utilitiesData.level1} color="bg-teal-500" />
                                <StatItem label="Communal Faucet (Level 2)" value={utilitiesData.level2} color="bg-emerald-500" />
                                <StatItem label="Individual Connection (Level 3)" value={utilitiesData.level3} color="bg-sky-500" />
                                <StatItem label="Others" value={utilitiesData.others} color="bg-neutral-400" />
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </AppLayout>
    );
}

// --- Reusable Component: Stat Bar ---
function StatItem({ label, value, color }: { label: string, value: number, color: string }) {
    // Just a visual representation, max assumed 1000 for bar width scaling
    const maxVal = 1000;
    const widthPercent = Math.min((value / maxVal) * 100, 100);

    return (
        <div className="group">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">{label}</span>
                <span className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">{value}</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${widthPercent}%` }} />
            </div>
        </div>
    );
}
