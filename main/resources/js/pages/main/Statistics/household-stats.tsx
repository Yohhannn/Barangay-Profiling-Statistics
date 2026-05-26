import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft, Calendar, Filter, Search, X,
    Home, Users, Droplets
} from 'lucide-react';
import { useState, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Statistics', href: '/statistics' },
    { title: 'Household', href: '/statistics/household' },
];

export default function HouseholdStats({ originalData, filteredData, filters }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState(filters?.startDate || '2025-01-01');
    const [endDate, setEndDate] = useState(filters?.endDate || new Date().toISOString().split('T')[0]);
    const [dateFilterType, setDateFilterType] = useState<'created' | 'updated'>(filters?.dateFilterType || 'created');

    const handleFilter = () => {
        router.get('/statistics/household', { startDate, endDate, dateFilterType }, { preserveState: true, preserveScroll: true });
    };

    const handleClearFilter = () => {
        setStartDate('2025-01-01');
        setEndDate(new Date().toISOString().split('T')[0]);
        setDateFilterType('created');
        router.get('/statistics/household', {}, { preserveState: false });
    };

    const currentData = filteredData || originalData;
    const ownershipData = currentData?.ownershipData || [];
    const waterData = currentData?.waterData || [];
    const toiletData = currentData?.toiletData || [];
    const totalHouseholds = currentData?.totalHouseholds || 0;

    const origOwnership = originalData?.ownershipData || [];
    const origWater = originalData?.waterData || [];
    const origToilet = originalData?.toiletData || [];
    const origTotalHouseholds = originalData?.totalHouseholds || 0;

    const processedData = useMemo(() => {
        if (!currentData?.householdData) return [];
        return currentData.householdData.filter((row: any) =>
            row.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).sort((a: any, b: any) => a.name.localeCompare(b.name));
    }, [searchQuery, currentData]);

    const getOrigOwnership = (label: string) => origOwnership.find((o: any) => o.label === label)?.count || 0;
    const getOrigWater = (label: string) => origWater.find((u: any) => u.label === label)?.count || 0;
    const getOrigToilet = (label: string) => origToilet.find((t: any) => t.label === label)?.count || 0;
    const getOrigRow = (sitioName: string) => {
        if (!originalData?.householdData) return null;
        return originalData.householdData.find((r: any) => r.name === sitioName) || null;
    };

    const ValDisp = ({ original, filtered, mono = false, colorClass = "" }: { original: number, filtered: number | undefined, mono?: boolean, colorClass?: string }) => {
        if (filtered !== undefined) {
            return (
                <div className="flex items-center gap-1.5 justify-center sm:justify-start flex-wrap">
                    <span className="text-neutral-400 line-through text-[10px] sm:text-xs">{original.toLocaleString()}</span>
                    <span className={`${mono ? 'font-mono' : ''} ${colorClass} text-sm sm:text-base font-bold`}>{filtered.toLocaleString()}</span>
                </div>
            );
        }
        return <span className={`${mono ? 'font-mono' : ''} ${colorClass} font-bold`}>{original.toLocaleString()}</span>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Household Statistics" />

            <div className="flex flex-col h-full min-h-[90vh] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">

                {/* Header & Filter */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-sidebar-border/60">
                    <div className="flex items-center gap-4">
                        <Link href="/statistics" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                            <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                                Statistics: <span className="text-indigo-600 dark:text-indigo-400">Household</span>
                            </h1>
                            <p className="text-xs text-neutral-500">Housing details and family composition by sitio</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-sidebar border border-sidebar-border p-1.5 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                                <input type="radio" name="dateFilterType" value="created" checked={dateFilterType === 'created'} onChange={() => setDateFilterType('created')} className="size-3 text-neutral-900 border-neutral-300 focus:ring-neutral-900 dark:border-neutral-600 dark:bg-neutral-700" />
                                <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 uppercase">Created</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                                <input type="radio" name="dateFilterType" value="updated" checked={dateFilterType === 'updated'} onChange={() => setDateFilterType('updated')} className="size-3 text-neutral-900 border-neutral-300 focus:ring-neutral-900 dark:border-neutral-600 dark:bg-neutral-700" />
                                <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 uppercase">Updated</span>
                            </label>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded">
                            <Calendar className="size-3.5 text-neutral-500" />
                            <div className="flex items-center gap-2">
                                <input type="date" className="bg-transparent border-none text-xs font-mono text-neutral-600 dark:text-neutral-300 p-0 focus:ring-0 cursor-pointer" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                <span className="text-neutral-400 text-xs">to</span>
                                <input type="date" className="bg-transparent border-none text-xs font-mono text-neutral-600 dark:text-neutral-300 p-0 focus:ring-0 cursor-pointer" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                        </div>
                        <button onClick={handleFilter} className="flex items-center gap-2 px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase rounded transition-all active:scale-95">
                            <Filter className="size-3.5" /> Filter
                        </button>
                        {filteredData && (
                            <button onClick={handleClearFilter} className="flex items-center gap-2 px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase rounded transition-all active:scale-95">
                                <X className="size-3.5" /> Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

                    {/* LEFT: Per-Sitio Table */}
                    <div className="xl:col-span-2 bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">

                        <div className="p-4 border-b border-sidebar-border bg-neutral-50/50 dark:bg-neutral-900/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 flex items-center gap-2">
                                <Users className="size-4" /> Household Counts Per Sitio
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
                                    <th className="px-6 py-3 text-center text-indigo-600 dark:text-indigo-400 font-bold">Households</th>
                                    <th className="px-6 py-3 text-center text-neutral-500">Total Members</th>
                                    <th className="px-6 py-3 text-center text-blue-500">Male</th>
                                    <th className="px-6 py-3 text-center text-pink-500">Female</th>
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
                                                    <ValDisp mono colorClass="text-indigo-600 dark:text-indigo-400" original={origRow?.totalHouseholds || 0} filtered={filteredData ? row.totalHouseholds : undefined} />
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <ValDisp mono colorClass="text-neutral-700 dark:text-neutral-300" original={origRow?.totalMembers || 0} filtered={filteredData ? row.totalMembers : undefined} />
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <ValDisp mono colorClass="text-blue-600 dark:text-blue-400" original={origRow?.totalMale || 0} filtered={filteredData ? row.totalMale : undefined} />
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <ValDisp mono colorClass="text-pink-600 dark:text-pink-400" original={origRow?.totalFemale || 0} filtered={filteredData ? row.totalFemale : undefined} />
                                                </td>
                                            </tr>
                                        );
                                    })
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

                    {/* RIGHT: Summary Cards */}
                    <div className="flex flex-col gap-6">

                        {/* Overview */}
                        <div className="bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
                            <PlaceholderPattern className="absolute top-0 right-0 w-32 h-32 text-indigo-500/5 -z-0" />
                            <div className="flex items-center gap-2 mb-4 relative z-10">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg text-indigo-600">
                                    <Home className="size-5" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Total Encoded</h3>
                            </div>
                            <div className="space-y-4 relative z-10">
                                <div className="text-center py-4">
                                    <span className="text-4xl font-black text-neutral-900 dark:text-neutral-100 flex justify-center">
                                        <ValDisp mono original={origTotalHouseholds} filtered={filteredData ? totalHouseholds : undefined} />
                                    </span>
                                    <span className="block text-xs text-neutral-500 mt-1 font-medium">Valid Households</span>
                                </div>
                            </div>
                        </div>

                        {/* Ownership */}
                        <div className="bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">House Ownership</h3>
                            </div>
                            <div className="space-y-3">
                                {ownershipData.map((stat: any, idx: number) => {
                                    const origStat = getOrigOwnership(stat.label);
                                    return (
                                        <StatItem key={idx} label={stat.label} value={stat.count} original={origStat} filtered={filteredData ? stat.count : undefined} color={stat.color} />
                                    );
                                })}
                            </div>
                        </div>

                        {/* Water Source */}
                        <div className="bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm">
                            <div className="flex flex-col mb-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 flex items-center gap-2">
                                    <Droplets className="size-4" /> Water Source
                                </h3>
                                <p className="text-[10px] text-neutral-400 mt-1">Level classification across households</p>
                            </div>
                            <div className="space-y-3">
                                {waterData.map((s: any, idx: number) => {
                                    const origVal = getOrigWater(s.label);
                                    return (
                                        <div key={idx} className="flex justify-between items-center py-2 border-b border-dashed border-sidebar-border">
                                            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{s.label}</span>
                                            <span className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">
                                                <ValDisp mono original={origVal} filtered={filteredData ? s.count : undefined} />
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Toilet Type */}
                        <div className="bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm">
                            <div className="flex flex-col mb-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 flex items-center gap-2">
                                    Toilet / Sanitation
                                </h3>
                                <p className="text-[10px] text-neutral-400 mt-1">Sanitation facility type across households</p>
                            </div>
                            <div className="space-y-3">
                                {toiletData.map((s: any, idx: number) => {
                                    const origVal = getOrigToilet(s.label);
                                    return (
                                        <div key={idx} className="flex justify-between items-center py-2 border-b border-dashed border-sidebar-border">
                                            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 max-w-[70%]">{s.label}</span>
                                            <span className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">
                                                <ValDisp mono original={origVal} filtered={filteredData ? s.count : undefined} />
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function StatItem({ label, value, original, filtered, color }: { label: string, value: number, original: number, filtered: number | undefined, color: string }) {
    const maxVal = Math.max(original, 10);
    const widthPercent = Math.min((value / maxVal) * 100, 100);
    const origWidthPercent = Math.min((original / maxVal) * 100, 100);

    return (
        <div className="group">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">{label}</span>
                <span className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    {filtered !== undefined && (
                        <span className="text-neutral-400 line-through text-xs font-normal">{original.toLocaleString()}</span>
                    )}
                    <span>{value.toLocaleString()}</span>
                </span>
            </div>
            <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden relative">
                <div className={`absolute top-0 left-0 h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${widthPercent}%`, zIndex: 10 }} />
                {filtered !== undefined && (
                    <div className="absolute top-0 left-0 h-full bg-neutral-300 dark:bg-neutral-600 rounded-full transition-all duration-500" style={{ width: `${origWidthPercent}%`, zIndex: 5 }} />
                )}
            </div>
        </div>
    );
}
