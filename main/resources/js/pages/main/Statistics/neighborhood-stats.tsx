import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft, Calendar, Filter, Search, X,
    MapPin, Users, UserPlus, HeartHandshake, FileCheck2, TrendingUp, TrendingDown,
} from 'lucide-react';
import { useState, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Statistics', href: '/statistics' },
    { title: 'Neighborhood', href: '/statistics/neighborhood' },
];

export default function NeighborhoodStats({ originalData, filteredData, filters }: any) {
    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState(filters?.startDate || '2025-01-01');
    const [endDate, setEndDate] = useState(filters?.endDate || new Date().toISOString().split('T')[0]);
    const [dateFilterType, setDateFilterType] = useState<'created' | 'updated'>(filters?.dateFilterType || 'created');

    const handleFilter = () => {
        router.get('/statistics/neighborhood', {
            startDate,
            endDate,
            dateFilterType
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleClearFilter = () => {
        setStartDate('2025-01-01');
        setEndDate(new Date().toISOString().split('T')[0]);
        setDateFilterType('created');
        router.get('/statistics/neighborhood', {}, { preserveState: false });
    };

    const currentData = filteredData || originalData;

    // Computed Data
    const processedData = useMemo(() => {
        if (!currentData?.neighborhoodData) return [];
        return currentData.neighborhoodData.filter((row: any) =>
            row.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).sort((a: any, b: any) => a.name.localeCompare(b.name));
    }, [searchQuery, currentData]);

    const getOrigRow = (sitioName: string) => {
        if (!originalData?.neighborhoodData) return null;
        return originalData.neighborhoodData.find((r: any) => r.name === sitioName) || null;
    };

    // Helper to render strike-out for values
    const ValDisp = ({ original, filtered, mono = false, colorClass = "" }: { original: number, filtered: number | undefined, mono?: boolean, colorClass?: string }) => {
        if (filtered !== undefined) {
            return (
                <div className="flex items-center gap-1.5 justify-center sm:justify-start flex-wrap">
                    <span className="text-neutral-400 line-through text-[10px] sm:text-xs">
                        {original.toLocaleString()}
                    </span>
                    <span className={`${mono ? 'font-mono' : ''} ${colorClass} text-sm sm:text-base font-bold`}>
                        {filtered.toLocaleString()}
                    </span>
                </div>
            );
        }
        return <span className={`${mono ? 'font-mono' : ''} ${colorClass} font-bold`}>{original.toLocaleString()}</span>;
    };


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
                                Statistics: <span className="text-indigo-600 dark:text-indigo-400">Neighborhood</span>
                            </h1>
                            <p className="text-xs text-neutral-500">Distribution of residents across Sitios</p>
                        </div>
                    </div>

                    {/* Date Filter Bar */}
                    <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-sidebar border border-sidebar-border p-1.5 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="dateFilterType" 
                                    value="created" 
                                    checked={dateFilterType === 'created'} 
                                    onChange={() => setDateFilterType('created')} 
                                    className="size-3 text-neutral-900 border-neutral-300 focus:ring-neutral-900 dark:border-neutral-600 dark:bg-neutral-700"
                                />
                                <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 uppercase">Created</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="dateFilterType" 
                                    value="updated" 
                                    checked={dateFilterType === 'updated'} 
                                    onChange={() => setDateFilterType('updated')} 
                                    className="size-3 text-neutral-900 border-neutral-300 focus:ring-neutral-900 dark:border-neutral-600 dark:bg-neutral-700"
                                />
                                <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 uppercase">Updated</span>
                            </label>
                        </div>
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
                            onClick={handleFilter}
                            className="flex items-center gap-2 px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase rounded transition-all active:scale-95">
                            <Filter className="size-3.5" /> Filter
                        </button>
                        {filteredData && (
                            <button
                                onClick={handleClearFilter}
                                className="flex items-center gap-2 px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase rounded transition-all active:scale-95">
                                <X className="size-3.5" /> Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* --- Main Dashboard --- */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

                    {/* === LEFT COLUMN: Detailed Table (Spans 2) === */}
                    <div className="xl:col-span-2 bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">

                        <div className="p-4 border-b border-sidebar-border bg-neutral-50/50 dark:bg-neutral-900/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 flex items-center gap-2">
                                <MapPin className="size-4" /> Population Breakdown Per Sitio
                            </h3>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search Sitio..."
                                    className="w-full pl-9 pr-4 py-1.5 text-xs border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
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
                                    <th className="px-6 py-3 text-center text-indigo-600 dark:text-indigo-400 font-bold">Total</th>
                                    <th className="px-6 py-3 text-center text-blue-600 dark:text-blue-400 font-bold">M</th>
                                    <th className="px-6 py-3 text-center text-pink-600 dark:text-pink-400 font-bold">F</th>
                                    <th className="px-6 py-3 text-center text-amber-600 dark:text-amber-400 font-bold">Seniors</th>
                                    <th className="px-6 py-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">PWDs</th>
                                    <th className="px-6 py-3 text-center text-neutral-500 font-bold">Voters</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/50">
                                {processedData.length > 0 ? (
                                    processedData.map((row: any, idx: number) => {
                                        const origRow = getOrigRow(row.name);
                                        return (
                                            <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/20 transition-colors">
                                                <td className="px-6 py-3 font-medium text-neutral-900 dark:text-neutral-100">{row.name}</td>
                                                <td className="px-6 py-3 text-center">
                                                    <ValDisp mono colorClass="text-indigo-600 dark:text-indigo-400" original={origRow?.total || 0} filtered={filteredData ? row.total : undefined} />
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <ValDisp mono colorClass="text-blue-600 dark:text-blue-400" original={origRow?.male || 0} filtered={filteredData ? row.male : undefined} />
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <ValDisp mono colorClass="text-pink-600 dark:text-pink-400" original={origRow?.female || 0} filtered={filteredData ? row.female : undefined} />
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <ValDisp mono colorClass="text-amber-600 dark:text-amber-400" original={origRow?.seniors || 0} filtered={filteredData ? row.seniors : undefined} />
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <ValDisp mono colorClass="text-emerald-600 dark:text-emerald-400" original={origRow?.pwd || 0} filtered={filteredData ? row.pwd : undefined} />
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <ValDisp mono colorClass="text-neutral-500" original={origRow?.voters || 0} filtered={filteredData ? row.voters : undefined} />
                                                </td>
                                            </tr>
                                        );
                                    })
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

                    {/* === RIGHT COLUMN: Summaries (Spans 1) === */}
                    <div className="flex flex-col gap-6">

                        {/* 1. Global Overview */}
                        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 dark:from-indigo-900 dark:to-blue-900 border border-sidebar-border rounded-2xl p-6 shadow-sm relative overflow-hidden text-white">
                            <PlaceholderPattern className="absolute top-0 right-0 w-32 h-32 text-white/5 -z-0" />
                            <div className="flex items-center gap-2 mb-4 relative z-10">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-100 flex items-center gap-2">
                                    <Users className="size-5" /> Total Population
                                </h3>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div className="text-center py-2">
                                    <span className="text-5xl font-black flex justify-center">
                                        <ValDisp mono original={originalData?.totalPopulation || 0} filtered={filteredData ? currentData.totalPopulation : undefined} />
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                                        <span className="text-[10px] uppercase font-bold text-indigo-200 block mb-1">Total Male</span>
                                        <span className="font-bold text-lg">
                                            <ValDisp mono original={originalData?.totalMale || 0} filtered={filteredData ? currentData.totalMale : undefined} />
                                        </span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                                        <span className="text-[10px] uppercase font-bold text-indigo-200 block mb-1">Total Female</span>
                                        <span className="font-bold text-lg">
                                            <ValDisp mono original={originalData?.totalFemale || 0} filtered={filteredData ? currentData.totalFemale : undefined} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Key Insights */}
                        <div className="bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Neighborhood Insights</h3>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-900/10">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-full text-emerald-600 flex-shrink-0">
                                    <TrendingUp className="size-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-neutral-500">Highest Populated Sitio</span>
                                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                                        {currentData?.highestPopulation?.name || 'N/A'} 
                                        <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-emerald-200/50 dark:bg-emerald-800/50 font-mono">
                                            {currentData?.highestPopulation?.count?.toLocaleString() || 0} pax
                                        </span>
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-xl border border-rose-500/20 bg-rose-50/50 dark:bg-rose-900/10">
                                <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-full text-rose-600 flex-shrink-0">
                                    <TrendingDown className="size-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-neutral-500">Lowest Populated Sitio</span>
                                    <span className="text-sm font-bold text-rose-700 dark:text-rose-400">
                                        {currentData?.lowestPopulation?.name || 'N/A'}
                                        <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-rose-200/50 dark:bg-rose-800/50 font-mono">
                                            {currentData?.lowestPopulation?.count?.toLocaleString() || 0} pax
                                        </span>
                                    </span>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

