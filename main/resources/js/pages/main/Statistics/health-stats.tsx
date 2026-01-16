import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft, Calendar, Filter, HeartPulse,
    Stethoscope, Activity, FilePlus, Baby, Droplets
} from 'lucide-react';
import { useState } from 'react';

// --- Mock Data ---
const riskGroups = [
    { label: 'Pregnant', count: 12, color: 'bg-pink-500' },
    { label: 'Adolescent Pregnant', count: 3, color: 'bg-rose-500' },
    { label: 'Postpartum', count: 8, color: 'bg-fuchsia-500' },
    { label: 'Infants (0-11 mos)', count: 45, color: 'bg-blue-400' },
    { label: 'Under 5 y/o', count: 120, color: 'bg-cyan-500' },
    { label: 'PWDs', count: 35, color: 'bg-amber-500' },
];

const bloodTypes = [
    { type: 'A+', count: 150 }, { type: 'A-', count: 12 },
    { type: 'B+', count: 180 }, { type: 'B-', count: 8 },
    { type: 'O+', count: 450 }, { type: 'O-', count: 45 },
    { type: 'AB+', count: 60 }, { type: 'AB-', count: 5 },
    { type: 'Unknown', count: 500 },
];

const medicalCases = [
    { rank: 1, name: 'Hypertension', count: 450 },
    { rank: 2, name: 'Diabetes', count: 320 },
    { rank: 3, name: 'Asthma', count: 180 },
    { rank: 4, name: 'Tuberculosis', count: 45 },
    { rank: 5, name: 'Dengue', count: 22 },
];

const philhealthData = [
    { label: 'Formal Economy Private', count: 850 },
    { label: 'Formal Economy Government', count: 150 },
    { label: 'Informal Economy', count: 420 },
    { label: 'NHTS (Indigent)', count: 350 },
    { label: 'Senior Citizen', count: 437 },
    { label: 'Indigenous Person', count: 45 },
    { label: 'Unknown / None', count: 1200 },
];

const recordSummary = {
    male: 1500,
    female: 1700,
    total: 3200
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Statistics', href: '/statistics' },
    { title: 'Health', href: '/statistics/health' },
];

export default function HealthStats() {
    // State
    const [startDate, setStartDate] = useState('2025-01-01');
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Health Statistics" />

            <div className="flex flex-col h-full min-h-[90vh] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">

                {/* --- Header & Filter --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-sidebar-border/60">
                    <div className="flex items-center gap-4">
                        <Link href="/statistics" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                            <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                                Statistics: <span className="text-rose-600 dark:text-rose-400">Health</span>
                            </h1>
                            <p className="text-xs text-neutral-500">Public health monitoring & medical records</p>
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

                {/* --- Main Dashboard Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                    {/* 1. Health Risk Groups */}
                    <div className="bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-rose-100 dark:bg-rose-900/20 rounded-lg text-rose-600">
                                <HeartPulse className="size-5" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Health Risk Groups</h3>
                        </div>

                        <div className="space-y-4">
                            {riskGroups.map((group, idx) => (
                                <div key={idx} className="flex flex-col gap-1.5">
                                    <div className="flex justify-between items-end text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                        <span>{group.label}</span>
                                        <span className="font-bold font-mono text-neutral-900 dark:text-neutral-100">{group.count}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${group.color} rounded-full`} style={{ width: `${Math.min((group.count / 200) * 100, 100)}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. Blood Type Distribution */}
                    <div className="bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg text-red-600">
                                <Droplets className="size-5" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Blood Type Distribution</h3>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {bloodTypes.map((bt, idx) => (
                                <div key={idx} className="flex flex-col items-center justify-center p-3 border border-sidebar-border rounded-xl bg-neutral-50/50 dark:bg-neutral-900/20">
                                    <span className="text-lg font-black text-rose-600 dark:text-rose-400">{bt.type}</span>
                                    <span className="text-[10px] font-mono text-neutral-500">{bt.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. Top Medical Cases (Rankings) */}
                    <div className="bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600">
                                <Activity className="size-5" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Top 5 Medical Cases</h3>
                        </div>

                        <div className="space-y-3">
                            {medicalCases.map((c, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-sidebar-border/60 hover:bg-neutral-50 dark:hover:bg-neutral-900/20 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${idx < 3 ? 'bg-rose-500 text-white' : 'bg-neutral-200 text-neutral-600'}`}>
                                            {c.rank}
                                        </div>
                                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{c.name}</span>
                                    </div>
                                    <span className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">{c.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. PhilHealth Membership */}
                    <div className="xl:col-span-2 bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg text-green-600">
                                <FilePlus className="size-5" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">PhilHealth Membership</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            {philhealthData.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2 border-b border-dashed border-sidebar-border">
                                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{item.label}</span>
                                    <span className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">{item.count.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 5. Medical Records Summary */}
                    <div className="bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg text-purple-600">
                                <Stethoscope className="size-5" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Records Overview</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                                <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase">Male w/ Record</span>
                                <span className="text-xl font-black text-blue-800 dark:text-blue-200">{recordSummary.male.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-pink-50 dark:bg-pink-900/10 rounded-xl">
                                <span className="text-xs font-bold text-pink-700 dark:text-pink-400 uppercase">Female w/ Record</span>
                                <span className="text-xl font-black text-pink-800 dark:text-pink-200">{recordSummary.female.toLocaleString()}</span>
                            </div>
                            <div className="pt-4 border-t border-sidebar-border text-center">
                                <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total Citizens with Records</span>
                                <span className="text-3xl font-black text-neutral-900 dark:text-neutral-100 mt-1">{recordSummary.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
