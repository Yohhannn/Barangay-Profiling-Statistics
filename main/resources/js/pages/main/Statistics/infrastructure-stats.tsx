import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft, Calendar, Filter, Search, X,
    Building, MapPin, Grid, Layers, Download
} from 'lucide-react';
import { useState, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Statistics', href: '/statistics' },
    { title: 'Infrastructure', href: '/statistics/infrastructure' },
];

export default function InfrastructureStats({ originalData, filteredData, filters }: any) {
    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState(filters?.startDate || '2025-01-01');
    const [endDate, setEndDate] = useState(filters?.endDate || new Date().toISOString().split('T')[0]);
    const [dateFilterType, setDateFilterType] = useState<'created' | 'updated'>(filters?.dateFilterType || 'created');

    const handleFilter = () => {
        router.get('/statistics/infrastructure', {
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
        router.get('/statistics/infrastructure', {}, { preserveState: false });
    };

    const currentData = filteredData || originalData;

    // Computed Data
    const processedData = useMemo(() => {
        if (!currentData?.infrastructureData) return [];
        return currentData.infrastructureData.filter((row: any) =>
            row.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).sort((a: any, b: any) => a.name.localeCompare(b.name));
    }, [searchQuery, currentData]);

    const infrastructureTypes = currentData?.infrastructureTypes || [];
    const ownershipData = currentData?.ownershipData || { public: 0, private: 0 };
    const totalInfra = currentData?.totalInfra || 0;

    // Original data for comparisons
    const origTypes = originalData?.infrastructureTypes || [];
    const origOwnership = originalData?.ownershipData || { public: 0, private: 0 };
    const origTotalInfra = originalData?.totalInfra || 0;

    const getOrigType = (label: string) => origTypes.find((t: any) => t.label === label)?.count || 0;
    const getOrigRow = (sitioName: string) => {
        if (!originalData?.infrastructureData) return null;
        return originalData.infrastructureData.find((r: any) => r.name === sitioName) || null;
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
            <Head title="Infrastructure Statistics" />

            <div className="flex flex-col h-full min-h-[90vh] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">

                {/* --- Header & Filter --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-sidebar-border/60">
                    <div className="flex items-center gap-4">
                        <Link href="/statistics" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                            <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                                Statistics: <span className="text-amber-600 dark:text-amber-500">Infrastructure</span>
                            </h1>
                            <p className="text-xs text-neutral-500">Public facilities and community structures</p>
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

                {/* --- Main Grid Layout --- */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

                    {/* === LEFT COLUMN: Detailed Table (Spans 2) === */}
                    <div className="xl:col-span-2 bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">

                        <div className="p-4 border-b border-sidebar-border bg-neutral-50/50 dark:bg-neutral-900/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 flex items-center gap-2">
                                <MapPin className="size-4" /> Infrastructure Per Sitio
                            </h3>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search Sitio..."
                                    className="w-full pl-9 pr-4 py-1.5 text-xs border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
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
                                    <th className="px-6 py-3 text-center text-indigo-600 dark:text-indigo-400 font-bold">LGU/Brgy</th>
                                    <th className="px-6 py-3 text-center text-cyan-600 dark:text-cyan-400 font-bold">School</th>
                                    <th className="px-6 py-3 text-center text-rose-600 dark:text-rose-400 font-bold">Health</th>
                                    <th className="px-6 py-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">Sports</th>
                                    <th className="px-6 py-3 text-center text-neutral-400 font-bold">Others</th>
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
                                                    <ValDisp mono colorClass="text-indigo-600 dark:text-indigo-400" original={origRow?.barangay || 0} filtered={filteredData ? row.barangay : undefined} />
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <ValDisp mono colorClass="text-cyan-600 dark:text-cyan-400" original={origRow?.school || 0} filtered={filteredData ? row.school : undefined} />
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <ValDisp mono colorClass="text-rose-600 dark:text-rose-400" original={origRow?.health || 0} filtered={filteredData ? row.health : undefined} />
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <ValDisp mono colorClass="text-emerald-600 dark:text-emerald-400" original={origRow?.sports || 0} filtered={filteredData ? row.sports : undefined} />
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <ValDisp mono colorClass="text-neutral-400" original={(origRow?.chapel || 0) + (origRow?.other || 0)} filtered={filteredData ? (row.chapel + row.other) : undefined} />
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-neutral-400 text-xs">
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
                            <PlaceholderPattern className="absolute top-0 right-0 w-32 h-32 text-amber-500/5 -z-0" />
                            <div className="flex items-center gap-2 mb-4 relative z-10">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg text-amber-600">
                                    <Building className="size-5" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Total Infrastructure</h3>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div className="text-center py-4">
                                    <span className="text-5xl font-black text-neutral-900 dark:text-neutral-100 flex justify-center">
                                        <ValDisp mono original={origTotalInfra} filtered={filteredData ? totalInfra : undefined} />
                                    </span>
                                    <span className="block text-xs text-neutral-500 mt-2 font-medium">Mapped Facilities</span>
                                </div>
                                
                                {/* Public vs Private Split */}
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-sidebar-border">
                                        <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Public</span>
                                        <span className="font-bold text-amber-600 dark:text-amber-500">
                                            <ValDisp mono colorClass="text-amber-600 dark:text-amber-500" original={origOwnership.public} filtered={filteredData ? ownershipData.public : undefined} />
                                        </span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-sidebar-border">
                                        <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Private</span>
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                            <ValDisp mono colorClass="text-indigo-600 dark:text-indigo-400" original={origOwnership.private} filtered={filteredData ? ownershipData.private : undefined} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Infrastructure Type Distribution */}
                        <div className="bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm flex-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg text-emerald-600">
                                    <Layers className="size-5" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Classification Types</h3>
                            </div>

                            <div className="space-y-3">
                                {infrastructureTypes.map((type: any, idx: number) => {
                                    const origVal = getOrigType(type.label);
                                    return (
                                        <StatItem 
                                            key={idx} 
                                            label={type.label} 
                                            value={type.count} 
                                            original={origVal} 
                                            filtered={filteredData ? type.count : undefined}
                                            color={type.color} 
                                        />
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

// --- Reusable Component: Stat Bar ---
function StatItem({ label, value, original, filtered, color }: { label: string, value: number, original: number, filtered: number | undefined, color: string }) {
    const maxVal = Math.max(original, 5);
    const widthPercent = Math.min((value / maxVal) * 100, 100);
    const origWidthPercent = Math.min((original / maxVal) * 100, 100);

    return (
        <div className="group">
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{label}</span>
                <span className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                    {filtered !== undefined && (
                        <span className="text-neutral-400 line-through text-[10px] font-normal">
                            {original.toLocaleString()}
                        </span>
                    )}
                    <span>{value.toLocaleString()}</span>
                </span>
            </div>
            <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden relative">
                <div className={`absolute top-0 left-0 h-full ${color} transition-all duration-500 rounded-full`} style={{ width: `${widthPercent}%`, zIndex: 10 }} />
                {filtered !== undefined && (
                    <div className={`absolute top-0 left-0 h-full bg-neutral-300 dark:bg-neutral-600 rounded-full transition-all duration-500`} style={{ width: `${origWidthPercent}%`, zIndex: 5 }} />
                )}
            </div>
        </div>
    );
}
