import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft, Calendar, Filter, Search,
    Briefcase, Building, Store, BarChart3, Download
} from 'lucide-react';
import { useState, useMemo } from 'react';

// --- Mock Data ---
const businessData = [
    { name: 'Cadulang 1', active: 1, inactive: 0, closed: 0, suspended: 0 },
    { name: 'Cadulang 2', active: 1, inactive: 0, closed: 0, suspended: 0 },
    { name: 'Cambiohan', active: 0, inactive: 0, closed: 0, suspended: 0 },
    { name: 'Chocolate Hills', active: 0, inactive: 0, closed: 0, suspended: 0 },
    { name: 'Hawaiian 1', active: 0, inactive: 0, closed: 0, suspended: 0 },
    { name: 'Hawaiian 2', active: 0, inactive: 0, closed: 0, suspended: 0 },
    { name: 'Ibabao', active: 0, inactive: 0, closed: 0, suspended: 0 },
    { name: 'Ikaseg', active: 0, inactive: 0, closed: 0, suspended: 0 },
    { name: 'Kaisid', active: 0, inactive: 0, closed: 0, suspended: 0 },
    { name: 'Kalubihan', active: 0, inactive: 0, closed: 0, suspended: 0 },
    { name: 'Kolo', active: 0, inactive: 0, closed: 0, suspended: 0 },
    { name: 'Likoan', active: 0, inactive: 0, closed: 0, suspended: 0 },
    { name: 'Limogmog', active: 0, inactive: 0, closed: 0, suspended: 0 },
    { name: 'Mahayahay', active: 0, inactive: 0, closed: 0, suspended: 0 },
    { name: 'Marbeach', active: 0, inactive: 0, closed: 0, suspended: 0 },
    { name: 'Marigondon Proper', active: 0, inactive: 0, closed: 0, suspended: 0 },
    { name: 'Masiwa', active: 0, inactive: 0, closed: 0, suspended: 0 },
    { name: 'Matab-ang', active: 0, inactive: 0, closed: 0, suspended: 0 },
    { name: 'Osflor', active: 0, inactive: 0, closed: 0, suspended: 0 },
];

const businessTypes = [
    { label: 'Sole Proprietorship', count: 2, color: 'bg-blue-500' },
    { label: 'Partnership', count: 0, color: 'bg-green-500' },
    { label: 'Corporation', count: 0, color: 'bg-purple-500' },
    { label: 'Cooperative', count: 0, color: 'bg-orange-500' },
    { label: 'Franchise', count: 0, color: 'bg-rose-500' },
    { label: 'Others', count: 0, color: 'bg-neutral-400' },
];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Statistics', href: '/statistics' },
    { title: 'Business', href: '/statistics/business' },
];

export default function BusinessStats() {
    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('2025-01-01');
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    // Computed Data
    const processedData = useMemo(() => {
        return businessData.filter(row =>
            row.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).sort((a, b) => a.name.localeCompare(b.name));
    }, [searchQuery]);

    // Summary Metrics
    const totalActive = processedData.reduce((acc, curr) => acc + curr.active, 0);

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
                                    processedData.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/20 transition-colors">
                                            <td className="px-6 py-3 font-medium text-neutral-900 dark:text-neutral-100">{row.name}</td>
                                            <td className="px-6 py-3 text-center font-mono font-bold text-green-600 dark:text-green-400">{row.active}</td>
                                            <td className="px-6 py-3 text-center font-mono text-neutral-500">{row.inactive}</td>
                                            <td className="px-6 py-3 text-center font-mono text-neutral-500">{row.closed}</td>
                                            <td className="px-6 py-3 text-center font-mono text-neutral-500">{row.suspended}</td>
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
                            <PlaceholderPattern className="absolute top-0 right-0 w-32 h-32 text-indigo-500/5 -z-0" />
                            <div className="flex items-center gap-2 mb-4 relative z-10">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg text-indigo-600">
                                    <BarChart3 className="size-5" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Total Businesses</h3>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div className="text-center py-4">
                                    <span className="text-4xl font-black text-neutral-900 dark:text-neutral-100">{totalActive.toLocaleString()}</span>
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
                                {businessTypes.map((type, idx) => (
                                    <StatItem key={idx} label={type.label} value={type.count} color={type.color} />
                                ))}
                            </div>
                        </div>

                        {/* 3. Export Card */}
                        <div className="bg-neutral-50 dark:bg-neutral-900/20 border border-sidebar-border rounded-2xl p-6 text-center">
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
function StatItem({ label, value, color }: { label: string, value: number, color: string }) {
    // Max assumed 100 for bar width scaling (visual purposes)
    const maxVal = 10;
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
