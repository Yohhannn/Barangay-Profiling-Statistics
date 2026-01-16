import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft, Calendar, Filter, Users, Baby,
    UserCheck, HeartHandshake, Cross, Flag, Activity,
    BookOpen
} from 'lucide-react';
import { useState } from 'react';

// --- Mock Data ---
const demographicData = {
    totalPopulation: 3542,
    gender: { male: 1800, female: 1742 },
    ageGroups: [
        { label: 'Infant (0-2)', count: 45, color: 'bg-blue-500' },
        { label: 'Child (3-12)', count: 320, color: 'bg-green-500' },
        { label: 'Minor (13-17)', count: 210, color: 'bg-teal-500' },
        { label: 'Young Adult (18-24)', count: 450, color: 'bg-purple-500' },
        { label: 'Adult (25-39)', count: 980, color: 'bg-indigo-500' },
        { label: 'Middle Aged (40-59)', count: 1100, color: 'bg-orange-500' },
        { label: 'Senior (60+)', count: 437, color: 'bg-red-500' },
    ],
    voters: {
        registered: 2100,
        unregistered: 1442,
        maleVoters: 1050,
        femaleVoters: 1050,
        byAge: [
            { label: '15-17 (SK)', count: 210 },
            { label: '18-25', count: 450 },
            { label: '26-35', count: 600 },
            { label: '36-59', count: 1100 },
            { label: '60+', count: 437 },
        ]
    },
    religion: [
        { name: 'Roman Catholic', count: 2800 },
        { name: 'Christian', count: 300 },
        { name: 'Iglesia ni Cristo', count: 150 },
        { name: 'Islam', count: 100 },
        { name: 'Others', count: 192 },
    ],
    civilStatus: [
        { status: 'Single', male: 800, female: 750 },
        { status: 'Married', male: 900, female: 900 },
        { status: 'Widowed', male: 50, female: 70 },
        { status: 'Divorced', male: 50, female: 22 },
    ],
    beneficiaries: {
        nhts4ps: 150,
        nhtsNon4ps: 200,
        nonNhts: 3192
    },
    others: {
        deceased: 12,
        indigenous: 45
    }
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Statistics', href: '/statistics' },
    { title: 'Demographics', href: '/statistics/demographic' },
];

export default function DemographicStats() {
    // Date State
    const [startDate, setStartDate] = useState('2025-01-01');
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const handleFilter = () => {
        console.log(`Filtering from ${startDate} to ${endDate}`);
        // Add your filter logic here
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Demographics" />

            <div className="flex flex-col h-full min-h-[90vh] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">

                {/* --- Header & Filter --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-sidebar-border/60">
                    <div className="flex items-center gap-4">
                        <Link href="/statistics" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                            <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                                Statistics: <span className="text-blue-600 dark:text-blue-400">Demographics</span>
                            </h1>
                            <p className="text-xs text-neutral-500">Real-time population data analysis</p>
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
                            onClick={handleFilter}
                            className="flex items-center gap-2 px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase rounded transition-all active:scale-95"
                        >
                            <Filter className="size-3.5" /> Filter
                        </button>
                    </div>
                </div>

                {/* --- Main Dashboard Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                    {/* 1. Population Overview (Spans 2 Columns) */}
                    <div className="md:col-span-2 bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden">
                        <PlaceholderPattern className="absolute top-0 right-0 w-64 h-64 text-neutral-50/50 dark:text-neutral-900/20 -z-0 pointer-events-none" />

                        <div className="flex items-center gap-2 mb-6 z-10">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600">
                                <Users className="size-5" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Population Overview</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-8 z-10">
                            {/* Total Stats */}
                            <div className="flex flex-col justify-center">
                                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Total Population</span>
                                <div className="text-5xl font-black text-neutral-900 dark:text-neutral-100 mb-4 tracking-tighter">
                                    {demographicData.totalPopulation.toLocaleString()}
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <span className="text-xs text-neutral-500 font-medium">Male: {demographicData.gender.male.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-pink-500" />
                                        <span className="text-xs text-neutral-500 font-medium">Female: {demographicData.gender.female.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Age Distribution Bars */}
                            <div className="space-y-3">
                                {demographicData.ageGroups.map((group, idx) => (
                                    <div key={idx} className="flex flex-col gap-1">
                                        <div className="flex justify-between text-[10px] font-bold text-neutral-500 uppercase">
                                            <span>{group.label}</span>
                                            <span>{group.count}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${group.color} rounded-full`}
                                                style={{ width: `${(group.count / demographicData.totalPopulation) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 2. Voter Registration Status */}
                    <div className="bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm flex flex-col">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg text-purple-600">
                                <UserCheck className="size-5" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Voter Status</h3>
                        </div>

                        <div className="flex-1 flex flex-col gap-4">
                            <StatRow label="Registered Voters" value={demographicData.voters.registered} total={demographicData.totalPopulation} color="bg-purple-500" />
                            <StatRow label="Unregistered (18+)" value={demographicData.voters.unregistered} total={demographicData.totalPopulation} color="bg-neutral-300" />

                            <div className="grid grid-cols-2 gap-2 mt-2 pt-4 border-t border-dashed border-sidebar-border">
                                <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-900/20 rounded-lg">
                                    <span className="block text-[10px] uppercase font-bold text-neutral-400">Male</span>
                                    <span className="text-lg font-bold text-neutral-800 dark:text-neutral-200">{demographicData.voters.maleVoters}</span>
                                </div>
                                <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-900/20 rounded-lg">
                                    <span className="block text-[10px] uppercase font-bold text-neutral-400">Female</span>
                                    <span className="text-lg font-bold text-neutral-800 dark:text-neutral-200">{demographicData.voters.femaleVoters}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Beneficiaries & Others */}
                    <div className="bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm flex flex-col">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg text-orange-600">
                                <HeartHandshake className="size-5" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Beneficiaries</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 flex justify-between items-center">
                                <span className="text-xs font-bold text-orange-700 dark:text-orange-400">NHTS 4Ps Members</span>
                                <span className="text-lg font-black text-orange-800 dark:text-orange-200">{demographicData.beneficiaries.nhts4ps}</span>
                            </div>
                            <div className="flex justify-between items-center px-2">
                                <span className="text-xs font-medium text-neutral-500">NHTS Non-4Ps</span>
                                <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{demographicData.beneficiaries.nhtsNon4ps}</span>
                            </div>
                            <div className="flex justify-between items-center px-2">
                                <span className="text-xs font-medium text-neutral-500">Non-NHTS</span>
                                <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{demographicData.beneficiaries.nonNhts}</span>
                            </div>

                            <div className="pt-4 border-t border-sidebar-border mt-4 space-y-2">
                                <div className="flex items-center gap-2 text-xs text-neutral-500">
                                    <Cross className="size-3 text-neutral-400" />
                                    <span>Deceased: <b>{demographicData.others.deceased}</b></span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-neutral-500">
                                    <Flag className="size-3 text-neutral-400" />
                                    <span>Indigenous People: <b>{demographicData.others.indigenous}</b></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Civil Status Distribution (Spans 2) */}
                    <div className="md:col-span-2 bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-teal-100 dark:bg-teal-900/20 rounded-lg text-teal-600">
                                <Activity className="size-5" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Civil Status Distribution</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-[10px] uppercase text-neutral-400 font-bold border-b border-sidebar-border/60">
                                <tr>
                                    <th className="px-4 py-2 text-left">Status</th>
                                    <th className="px-4 py-2 text-center text-blue-500">Male</th>
                                    <th className="px-4 py-2 text-center text-pink-500">Female</th>
                                    <th className="px-4 py-2 text-right">Total</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/40">
                                {demographicData.civilStatus.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/20">
                                        <td className="px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">{item.status}</td>
                                        <td className="px-4 py-3 text-center font-mono text-neutral-500">{item.male}</td>
                                        <td className="px-4 py-3 text-center font-mono text-neutral-500">{item.female}</td>
                                        <td className="px-4 py-3 text-right font-bold text-neutral-900 dark:text-neutral-100">{item.male + item.female}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 5. Classification By Religion (Spans 2) */}
                    <div className="md:col-span-2 bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg text-indigo-600">
                                <BookOpen className="size-5" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Religion Demographics</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {demographicData.religion.map((rel, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 rounded-lg border border-sidebar-border/60 hover:bg-neutral-50 dark:hover:bg-neutral-900/20 transition-colors">
                                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{rel.name}</span>
                                    <span className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">{rel.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}

// --- Reusable Component: Stat Row with Progress ---
function StatRow({ label, value, total, color }: { label: string, value: number, total: number, color: string }) {
    const percentage = Math.round((value / total) * 100);

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-end">
                <span className="text-xs font-medium text-neutral-500">{label}</span>
                <div className="text-right">
                    <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mr-1">{value.toLocaleString()}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">({percentage}%)</span>
                </div>
            </div>
            <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}
