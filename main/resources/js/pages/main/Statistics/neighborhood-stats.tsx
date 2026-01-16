import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft, Calendar, Filter, Search, Map,
    TrendingUp, TrendingDown, Users, Download
} from 'lucide-react';
import { useState, useMemo } from 'react';

// --- Mock Data based on your image ---
const sitioData = [
    { name: 'Cadulang 1', male: 45, female: 40, seniors: 10, pwd: 2, voters: 60 },
    { name: 'Cadulang 2', male: 50, female: 55, seniors: 12, pwd: 1, voters: 80 },
    { name: 'Cambiohan', male: 30, female: 28, seniors: 5, pwd: 0, voters: 45 },
    { name: 'Chocolate Hills', male: 110, female: 105, seniors: 25, pwd: 4, voters: 180 },
    { name: 'Hawaiian 1', male: 25, female: 30, seniors: 8, pwd: 1, voters: 40 },
    { name: 'Hawaiian 2', male: 20, female: 22, seniors: 4, pwd: 0, voters: 35 },
    { name: 'Ibabao', male: 85, female: 90, seniors: 15, pwd: 3, voters: 150 },
    { name: 'Ikaseg', male: 40, female: 35, seniors: 9, pwd: 1, voters: 55 },
    { name: 'Kaisid', male: 60, female: 58, seniors: 11, pwd: 2, voters: 95 },
    { name: 'Kalubihan', male: 75, female: 80, seniors: 18, pwd: 3, voters: 130 },
    { name: 'Kolo', male: 35, female: 32, seniors: 6, pwd: 0, voters: 50 },
    { name: 'Likoan', male: 15, female: 12, seniors: 2, pwd: 0, voters: 20 },
    { name: 'Marigondon Proper', male: 200, female: 210, seniors: 45, pwd: 8, voters: 350 }, // Highest example
    { name: 'Suba-Basbas', male: 95, female: 92, seniors: 20, pwd: 5, voters: 160 },
    { name: 'Sangi', male: 120, female: 115, seniors: 30, pwd: 6, voters: 200 },
];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Statistics', href: '/statistics' },
    { title: 'Neighborhood', href: '/statistics/neighborhood' },
];

export default function NeighborhoodStats() {
    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('2025-01-01');
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    // Computed Data
    const processedData = useMemo(() => {
        // 1. Filter by search
        const filtered = sitioData.filter(sitio =>
            sitio.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // 2. Calculate Totals per row
        const withTotals = filtered.map(sitio => ({
            ...sitio,
            totalPopulation: sitio.male + sitio.female
        }));

        // 3. Sort (Optional: by name)
        return withTotals.sort((a, b) => a.name.localeCompare(b.name));
    }, [searchQuery]);

    // Overview Metrics (Calculated from ALL data, not just filtered)
    const metrics = useMemo(() => {
        const fullData = sitioData.map(s => ({ ...s, total: s.male + s.female }));

        const highest = fullData.reduce((prev, current) => (prev.total > current.total) ? prev : current);
        const lowest = fullData.reduce((prev, current) => (prev.total < current.total) ? prev : current);

        return {
            totalStreets: fullData.length,
            highestName: highest.name,
            highestCount: highest.total,
            lowestName: lowest.name,
            lowestCount: lowest.total
        };
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Neighborhood Statistics" />

            <div className="flex flex-col h-full min-h-[90vh] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">

                {/* --- Header & Filter --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-sidebar-border/60">
                    <div className="flex items-center gap-4">
                        <Link href="/statistics" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                            <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                                Statistics: <span className="text-purple-600 dark:text-purple-400">Neighborhood</span>
                            </h1>
                            <p className="text-xs text-neutral-500">Population breakdown per street/sitio</p>
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
                        <button
                            className="flex items-center gap-2 px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase rounded transition-all active:scale-95"
                        >
                            <Filter className="size-3.5" /> Filter
                        </button>
                    </div>
                </div>

                {/* --- Overview Cards (Moved to Top) --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Card 1: Total Streets */}
                    <div className="relative overflow-hidden bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm flex items-center justify-between">
                        <div className="relative z-10">
                            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Sitios / Streets</span>
                            <div className="text-4xl font-black text-neutral-900 dark:text-neutral-100 mt-1">{metrics.totalStreets}</div>
                            <div className="text-[10px] text-neutral-400 mt-1">Recorded in system</div>
                        </div>
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl text-purple-600">
                            <Map className="size-8" />
                        </div>
                        <PlaceholderPattern className="absolute inset-0 size-full text-purple-600/5 -z-0" />
                    </div>

                    {/* Card 2: Highest Pop */}
                    <div className="bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Highest Population</span>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1 truncate max-w-[150px]" title={metrics.highestName}>
                                {metrics.highestName}
                            </div>
                            <div className="flex items-center gap-1 text-xs font-mono text-neutral-500 mt-1">
                                <Users className="size-3" /> {metrics.highestCount} Residents
                            </div>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl text-green-600">
                            <TrendingUp className="size-8" />
                        </div>
                    </div>

                    {/* Card 3: Lowest Pop */}
                    <div className="bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Lowest Population</span>
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1 truncate max-w-[150px]" title={metrics.lowestName}>
                                {metrics.lowestName}
                            </div>
                            <div className="flex items-center gap-1 text-xs font-mono text-neutral-500 mt-1">
                                <Users className="size-3" /> {metrics.lowestCount} Residents
                            </div>
                        </div>
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl text-orange-600">
                            <TrendingDown className="size-8" />
                        </div>
                    </div>
                </div>

                {/* --- Main Table Section --- */}
                <div className="flex-1 bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl shadow-sm overflow-hidden flex flex-col">

                    {/* Table Toolbar */}
                    <div className="p-4 border-b border-sidebar-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-neutral-50/50 dark:bg-neutral-900/20">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search Sitio..."
                                className="w-full pl-10 pr-4 py-2 text-sm border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-sidebar-border text-neutral-600 dark:text-neutral-300 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                            <Download className="size-4" /> Export Data
                        </button>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[10px] uppercase text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50 sticky top-0 z-10 backdrop-blur-sm border-b border-sidebar-border">
                            <tr>
                                <th className="px-6 py-3 font-bold tracking-wider">Sitio Name</th>
                                <th className="px-6 py-3 text-center text-blue-600 dark:text-blue-400 font-bold">No. of Male</th>
                                <th className="px-6 py-3 text-center text-pink-600 dark:text-pink-400 font-bold">No. of Female</th>
                                <th className="px-6 py-3 text-center">No. of Seniors</th>
                                <th className="px-6 py-3 text-center">No. of PWD</th>
                                <th className="px-6 py-3 text-center text-purple-600 dark:text-purple-400 font-bold">No. of Voters</th>
                                <th className="px-6 py-3 text-center bg-neutral-100 dark:bg-neutral-800 font-black text-neutral-900 dark:text-white border-l border-sidebar-border">Total Pop.</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/50">
                            {processedData.length > 0 ? (
                                processedData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/20 transition-colors">
                                        <td className="px-6 py-3 font-medium text-neutral-900 dark:text-neutral-100">{row.name}</td>
                                        <td className="px-6 py-3 text-center font-mono text-neutral-600 dark:text-neutral-400">{row.male}</td>
                                        <td className="px-6 py-3 text-center font-mono text-neutral-600 dark:text-neutral-400">{row.female}</td>
                                        <td className="px-6 py-3 text-center font-mono text-neutral-600 dark:text-neutral-400">{row.seniors}</td>
                                        <td className="px-6 py-3 text-center font-mono text-neutral-600 dark:text-neutral-400">{row.pwd}</td>
                                        <td className="px-6 py-3 text-center font-mono font-bold text-purple-600 dark:text-purple-400">{row.voters}</td>
                                        <td className="px-6 py-3 text-center font-mono font-black text-neutral-900 dark:text-white bg-neutral-50/50 dark:bg-neutral-800/20 border-l border-sidebar-border">
                                            {row.totalPopulation}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-neutral-400 text-xs">
                                        No records found for "{searchQuery}"
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
