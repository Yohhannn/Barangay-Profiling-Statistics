import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft, Calendar, Filter, Search,
    Building, Construction, Warehouse, Download
} from 'lucide-react';
import { useState, useMemo } from 'react';

// --- Mock Data ---
const infrastructureData = [
    { name: 'Cadulang 1', public: 1, private: 0, total: 1 },
    { name: 'Cadulang 2', public: 0, private: 0, total: 0 },
    { name: 'Cambiohan', public: 0, private: 0, total: 0 },
    { name: 'Chocolate Hills', public: 0, private: 0, total: 0 },
    { name: 'Hawaiian 1', public: 0, private: 0, total: 0 },
    { name: 'Hawaiian 2', public: 0, private: 0, total: 0 },
    { name: 'Ibabao', public: 0, private: 0, total: 0 },
    { name: 'Ikaseg', public: 0, private: 0, total: 0 },
    { name: 'Kaisid', public: 0, private: 0, total: 0 },
    { name: 'Kalubihan', public: 0, private: 0, total: 0 },
    { name: 'Kolo', public: 0, private: 0, total: 0 },
    { name: 'Likoan', public: 0, private: 1, total: 1 },
    { name: 'Limogmog', public: 0, private: 0, total: 0 },
    { name: 'Mahayahay', public: 0, private: 0, total: 0 },
    { name: 'Marbeach', public: 0, private: 0, total: 0 },
    { name: 'Marigondon Proper', public: 1, private: 0, total: 1 },
    { name: 'Masiwa', public: 0, private: 0, total: 0 },
    { name: 'Matab-ang', public: 0, private: 0, total: 0 },
];

const infraTypes = [
    { label: 'Barangay Hall', public: 1, private: 1, total: 2 },
    { label: 'Basketball Court', public: 0, private: 0, total: 0 },
    { label: 'Health Center', public: 0, private: 0, total: 0 },
    { label: 'Daycare Center', public: 0, private: 0, total: 0 },
    { label: 'Multi-purpose Hall', public: 0, private: 0, total: 0 },
    { label: 'Chapel / Church', public: 0, private: 0, total: 0 },
];

const distribution = {
    public: 1,
    private: 1,
    total: 2
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Statistics', href: '/statistics' },
    { title: 'Infrastructure', href: '/statistics/infrastructure' },
];

export default function InfrastructureStats() {
    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('2025-01-01');
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    // Computed Data
    const processedData = useMemo(() => {
        return infrastructureData.filter(row =>
            row.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).sort((a, b) => a.name.localeCompare(b.name));
    }, [searchQuery]);

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
                                Statistics: <span className="text-sky-600 dark:text-sky-400">Infrastructure</span>
                            </h1>
                            <p className="text-xs text-neutral-500">Public and private facility mapping</p>
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
                                <Construction className="size-4" /> Infrastructure Per Sitio
                            </h3>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search Sitio..."
                                    className="w-full pl-9 pr-4 py-1.5 text-xs border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
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
                                    <th className="px-6 py-3 text-center text-blue-600 dark:text-blue-400 font-bold">Public</th>
                                    <th className="px-6 py-3 text-center text-purple-600 dark:text-purple-400 font-bold">Private</th>
                                    <th className="px-6 py-3 text-center text-neutral-900 dark:text-neutral-100 font-black bg-neutral-100/50 dark:bg-neutral-800/50">Total</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/50">
                                {processedData.length > 0 ? (
                                    processedData.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/20 transition-colors">
                                            <td className="px-6 py-3 font-medium text-neutral-900 dark:text-neutral-100">{row.name}</td>
                                            <td className="px-6 py-3 text-center font-mono text-neutral-600 dark:text-neutral-300">{row.public}</td>
                                            <td className="px-6 py-3 text-center font-mono text-neutral-600 dark:text-neutral-300">{row.private}</td>
                                            <td className="px-6 py-3 text-center font-mono font-bold bg-neutral-50/50 dark:bg-neutral-800/20">{row.total}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-neutral-400 text-xs">
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
                            <PlaceholderPattern className="absolute top-0 right-0 w-32 h-32 text-sky-500/5 -z-0" />
                            <div className="flex items-center gap-2 mb-4 relative z-10">
                                <div className="p-2 bg-sky-100 dark:bg-sky-900/20 rounded-lg text-sky-600">
                                    <Building className="size-5" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Total Infrastructures</h3>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-center pb-4 border-b border-dashed border-sidebar-border">
                                    <span className="text-xs text-neutral-500 font-medium">Public & Private Combined</span>
                                    <span className="text-2xl font-black text-neutral-900 dark:text-neutral-100">{distribution.total}</span>
                                </div>

                                <div className="space-y-3">
                                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl p-3 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Building className="size-4 text-blue-600" />
                                            <span className="text-xs font-bold text-blue-700 dark:text-blue-400">Public</span>
                                        </div>
                                        <span className="text-sm font-bold text-blue-800 dark:text-blue-200">{distribution.public}</span>
                                    </div>

                                    <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20 rounded-xl p-3 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Warehouse className="size-4 text-purple-600" />
                                            <span className="text-xs font-bold text-purple-700 dark:text-purple-400">Private</span>
                                        </div>
                                        <span className="text-sm font-bold text-purple-800 dark:text-purple-200">{distribution.private}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Type Breakdown */}
                        <div className="bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-600">
                                    <Construction className="size-5" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Type Breakdown</h3>
                            </div>

                            <div className="space-y-2">
                                {infraTypes.map((type, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-2 border-b border-sidebar-border/50 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-900/20 rounded transition-colors">
                                        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{type.label}</span>
                                        <div className="flex gap-3 text-xs font-mono">
                                            <span className="text-blue-600 dark:text-blue-400" title="Public">{type.public}</span>
                                            <span className="text-neutral-300">/</span>
                                            <span className="text-purple-600 dark:text-purple-400" title="Private">{type.private}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Export Card */}
                        <div className="bg-neutral-50 dark:bg-neutral-900/20 border border-sidebar-border rounded-2xl p-6 text-center">
                            <Download className="size-8 mx-auto text-neutral-400 mb-2" />
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
