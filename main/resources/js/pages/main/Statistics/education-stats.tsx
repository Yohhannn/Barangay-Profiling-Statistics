import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft, Calendar, Filter, GraduationCap, X,
    BookOpen, School, TrendingUp, BarChart3,
    Briefcase, Award
} from 'lucide-react';
import { useState, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Statistics', href: '/statistics' },
    { title: 'Education', href: '/statistics/education' },
];

export default function EducationStats({ originalData, filteredData, filters }: any) {
    // State
    const [startDate, setStartDate] = useState(filters?.startDate || '2025-01-01');
    const [endDate, setEndDate] = useState(filters?.endDate || new Date().toISOString().split('T')[0]);
    const [dateFilterType, setDateFilterType] = useState<'created' | 'updated'>(filters?.dateFilterType || 'created');

    const currentData = filteredData || originalData;
    const educationStatus = currentData?.educationStatus || { studying: 0, notStudying: 0, total: 0 };
    const originalStatus = originalData?.educationStatus || { studying: 0, notStudying: 0, total: 0 };
    const educationAttainment = currentData?.educationAttainment || [];
    const originalAttainment = originalData?.educationAttainment || [];

    const handleFilter = () => {
        router.get('/statistics/education', {
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
        router.get('/statistics/education', {}, { preserveState: false });
    };

    // Helper to render strike-out for values
    const ValDisp = ({ original, filtered, mono = false, colorClass = "" }: { original: number, filtered: number | undefined, mono?: boolean, colorClass?: string }) => {
        if (filtered !== undefined) {
            return (
                <div className="flex items-center gap-1.5 justify-center sm:justify-start flex-wrap">
                    <span className="text-neutral-400 line-through text-[10px] sm:text-xs font-normal">
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

    const getOriginalAttainmentItem = (label: string) => {
        return originalAttainment.find((a: any) => a.label === label);
    };

    // Calculate max count for bars based on original data so scaling remains consistent
    const maxCount = Math.max(...originalAttainment.map((i: any) => i.count), 10);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Education Statistics" />

            <div className="flex flex-col h-full min-h-[90vh] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">

                {/* --- Header & Filter --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-sidebar-border/60">
                    <div className="flex items-center gap-4">
                        <Link href="/statistics" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                            <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                                Statistics: <span className="text-indigo-600 dark:text-indigo-400">Education</span>
                            </h1>
                            <p className="text-xs text-neutral-500">Academic status and attainment analysis</p>
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

                {/* --- Top Metrics Cards (Status) --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Card 1: Currently Studying */}
                    <div className="relative overflow-hidden bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm flex items-center justify-between">
                        <div className="relative z-10">
                            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Currently Studying</span>
                            <div className="flex items-baseline gap-2 mt-1">
                                <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-3">
                                    <ValDisp original={originalStatus.studying} filtered={filteredData ? educationStatus.studying : undefined} />
                                </div>
                                <span className="text-xs font-medium text-neutral-500">
                                    ({originalStatus.total ? Math.round((educationStatus.studying / educationStatus.total) * 100) : 0}%)
                                </span>
                            </div>
                            <div className="text-[10px] text-neutral-400 mt-1">Enrolled in Government Programs</div>
                        </div>
                        <div className="p-4 bg-indigo-100 dark:bg-indigo-900/20 rounded-full text-indigo-600">
                            <BookOpen className="size-8" />
                        </div>
                        <PlaceholderPattern className="absolute inset-0 size-full text-indigo-600/5 -z-0" />
                    </div>

                    {/* Card 2: Not Studying */}
                    <div className="relative overflow-hidden bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm flex items-center justify-between">
                        <div className="relative z-10">
                            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Not Currently Studying</span>
                            <div className="flex items-baseline gap-2 mt-1">
                                <div className="text-4xl font-black text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
                                    <ValDisp original={originalStatus.notStudying} filtered={filteredData ? educationStatus.notStudying : undefined} />
                                </div>
                                <span className="text-xs font-medium text-neutral-500">
                                    ({originalStatus.total ? Math.round((educationStatus.notStudying / educationStatus.total) * 100) : 0}%)
                                </span>
                            </div>
                            <div className="text-[10px] text-neutral-400 mt-1">Out of School Youth / Adults</div>
                        </div>
                        <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-full text-neutral-600">
                            <Briefcase className="size-8" />
                        </div>
                    </div>
                </div>

                {/* --- Main Content: Attainment Breakdown --- */}
                <div className="flex-1 bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm flex flex-col">

                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-sidebar-border/60">
                        <div className="p-2 bg-teal-100 dark:bg-teal-900/20 rounded-lg text-teal-600">
                            <GraduationCap className="size-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Educational Attainment</h3>
                            <p className="text-[10px] text-neutral-400">Distribution by highest level completed</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-6">

                        {/* Left Column: List View */}
                        <div className="space-y-1">
                            {educationAttainment.map((item: any, idx: number) => {
                                const origItem = getOriginalAttainmentItem(item.label) || { count: 0 };
                                return (
                                    <div key={idx} className="group flex justify-between items-center p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900/20 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${item.color}`} />
                                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {item.label}
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">
                                            <ValDisp 
                                                original={origItem.count} 
                                                filtered={filteredData ? item.count : undefined} 
                                                mono 
                                                colorClass="text-neutral-900 dark:text-neutral-100" 
                                            />
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right Column: Visual Distribution */}
                        <div className="bg-neutral-50 dark:bg-neutral-900/20 rounded-xl p-6 border border-sidebar-border/50 flex flex-col justify-center">
                            <h4 className="text-xs font-bold text-neutral-400 uppercase mb-6 flex items-center gap-2">
                                <BarChart3 className="size-3.5" /> Data Distribution
                            </h4>
                            <div className="space-y-5">
                                {educationAttainment.map((item: any, idx: number) => {
                                    const percent = (item.count / maxCount) * 100;
                                    const origItem = getOriginalAttainmentItem(item.label) || { count: 0 };
                                    const origPercent = (origItem.count / maxCount) * 100;
                                    return (
                                        <div key={idx} className="flex flex-col gap-1.5">
                                            <div className="flex justify-between items-end text-[10px] font-bold text-neutral-500 uppercase">
                                                <span>{item.label}</span>
                                                <span className="text-neutral-400">
                                                    {educationStatus.total ? Math.round((item.count / educationStatus.total) * 100) : 0}%
                                                </span>
                                            </div>
                                            <div className="w-full h-2 bg-white dark:bg-neutral-800 rounded-full overflow-hidden border border-sidebar-border/50 relative">
                                                <div
                                                    className={`absolute top-0 left-0 h-full ${item.color} rounded-full transition-all duration-700 ease-out`}
                                                    style={{ width: `${percent}%`, opacity: filteredData ? 1 : 1, zIndex: 10 }}
                                                />
                                                {filteredData && (
                                                     <div
                                                        className={`absolute top-0 left-0 h-full bg-neutral-300 dark:bg-neutral-600 rounded-full transition-all duration-700 ease-out`}
                                                        style={{ width: `${origPercent}%`, zIndex: 5 }}
                                                     />
                                                )}
                                            </div>
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

