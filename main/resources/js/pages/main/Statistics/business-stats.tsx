import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft, Calendar, Filter, Search,
    Briefcase, Building, Store, BarChart3, Download
} from 'lucide-react';
import { useState, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Statistics', href: '/statistics' },
    { title: 'Business', href: '/statistics/business' },
];

export default function BusinessStats({ originalData, filteredData, filters }: any) {
    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState(filters?.startDate || '2025-01-01');
    const [endDate, setEndDate] = useState(filters?.endDate || new Date().toISOString().split('T')[0]);
    const [dateFilterType, setDateFilterType] = useState<'created' | 'updated'>(filters?.dateFilterType || 'created');

    // Use filteredData if it exists, otherwise use originalData for everything
    const currentData = filteredData || originalData;

    // Computed Data
    const processedData = useMemo(() => {
        if (!currentData?.businessData) return [];
        return currentData.businessData.filter((row: any) =>
            row.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).sort((a: any, b: any) => a.name.localeCompare(b.name));
    }, [searchQuery, currentData]);

    const handleFilter = () => {
        router.get('/statistics/business', {
            startDate,
            endDate,
            dateFilterType
        }, {
            preserveState: true,
            preserveScroll: true
        });
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

    // Helper to get original value for rows
    const getOriginalRow = (sitioName: string) => {
        if (!originalData?.businessData) return null;
        return originalData.businessData.find((r: any) => r.name === sitioName) || null;
    };

    const getOriginalType = (label: string) => {
        if (!originalData?.businessTypes) return null;
        return originalData.businessTypes.find((r: any) => r.label === label) || null;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Business Statistics" />

            <div className="flex flex-col h-full min-h-[90vh] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">

                {/* --- Header & Filter --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-sidebar-border/60">
                    <div className="flex items-center gap-4">
                        <Link href="/statistics" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                            <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                                Statistics: <span className="text-indigo-600 dark:text-indigo-400">Business</span>
                            </h1>
                            <p className="text-xs text-neutral-500">Commercial activity and registration data</p>
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
                    </div>
                </div>

                {/* --- Main Grid Layout --- */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

                    {/* === LEFT COLUMN: Detailed Table (Spans 2) === */}
                    <div className="xl:col-span-2 bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">

                        <div className="p-4 border-b border-sidebar-border bg-neutral-50/50 dark:bg-neutral-900/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 flex items-center gap-2">
                                <Store className="size-4" /> Business Status Per Street
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
                                    <th className="px-6 py-3 text-center text-green-600 dark:text-green-400 font-bold">Active</th>
                                    <th className="px-6 py-3 text-center text-neutral-500">Inactive</th>
                                    <th className="px-6 py-3 text-center text-rose-600 dark:text-rose-400 font-bold">Closed</th>
                                    <th className="px-6 py-3 text-center text-orange-600 dark:text-orange-400">Suspended</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/50">
                                {processedData.length > 0 ? (
                                    processedData.map((row: any, idx: number) => {
                                        const origRow = getOriginalRow(row.name);
                                        return (
                                            <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/20 transition-colors">
                                                <td className="px-6 py-3 font-medium text-neutral-900 dark:text-neutral-100">{row.name}</td>
                                                <td className="px-6 py-3 text-center">
                                                    <ValDisp original={origRow?.active || 0} filtered={filteredData ? row.active : undefined} mono colorClass="text-green-600 dark:text-green-400" />
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <ValDisp original={origRow?.inactive || 0} filtered={filteredData ? row.inactive : undefined} mono colorClass="text-neutral-500" />
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <ValDisp original={origRow?.closed || 0} filtered={filteredData ? row.closed : undefined} mono colorClass="text-neutral-500" />    
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <ValDisp original={origRow?.suspended || 0} filtered={filteredData ? row.suspended : undefined} mono colorClass="text-neutral-500" />    
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

                    {/* === RIGHT COLUMN: Summaries (Spans 1) === */}
                    <div className="flex flex-col gap-6">

                        {/* 1. Overview Card */}
                        <div className="bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
                            <PlaceholderPattern className="absolute top-0 right-0 w-32 h-32 text-indigo-500/5 -z-0" />
                            <div className="flex items-center gap-2 mb-4 relative z-10">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg text-indigo-600">
                                    <BarChart3 className="size-5" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Total Businesses</h3>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div className="text-center py-4">
                                    <span className="text-4xl font-black text-neutral-900 dark:text-neutral-100 flex justify-center">
                                        <ValDisp original={originalData?.totalActive || 0} filtered={filteredData ? currentData.totalActive : undefined} />
                                    </span>
                                    <span className="block text-xs text-neutral-500 mt-1 font-medium">Currently Active Businesses</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Business Type Distribution */}
                        <div className="bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600">
                                    <Briefcase className="size-5" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Business Types</h3>
                            </div>

                            <div className="space-y-3">
                                {currentData?.businessTypes?.map((type: any, idx: number) => {
                                    const origType = getOriginalType(type.label);
                                    return (
                                        <StatItem 
                                            key={idx} 
                                            label={type.label} 
                                            value={type.count} 
                                            color={type.color} 
                                            original={origType?.count || 0}
                                            filtered={filteredData ? type.count : undefined}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        {/* 3. Export Card */}
                        <div className="bg-neutral-50 dark:bg-neutral-900/20 border border-sidebar-border rounded-2xl p-6 text-center mt-auto">
                            <Building className="size-8 mx-auto text-neutral-400 mb-2" />
                            <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-1">Export Data</h3>
                            <p className="text-xs text-neutral-500 mb-4">Download comprehensive report for analysis.</p>
                            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-bold uppercase rounded-lg shadow-sm transition-all">
                                <Download className="size-4" /> Download CSV
                            </button>
                        </div>

                    </div>

                </div>
            </div>
        </AppLayout>
    );
}

// --- Reusable Component: Stat Bar ---
function StatItem({ label, value, color, original, filtered }: { label: string, value: number, color: string, original: number, filtered: number | undefined }) {
    // Max assumed 100 for bar width scaling (visual purposes)
    const maxVal = Math.max(original, 10);
    const widthPercent = Math.min((value / maxVal) * 100, 100);

    return (
        <div className="group">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">{label}</span>
                <span className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100 flex gap-2">
                    {filtered !== undefined && (
                        <span className="text-neutral-400 line-through text-xs font-normal">
                            {original.toLocaleString()}
                        </span>
                    )}
                    <span>{value.toLocaleString()}</span>
                </span>
            </div>
            <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${widthPercent}%` }} />
            </div>
        </div>
    );
}
