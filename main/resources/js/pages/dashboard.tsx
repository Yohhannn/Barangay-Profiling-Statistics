import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import {
    Building2, Users, Home, MapPin,
    Clock, Activity,
    FileText, CheckCircle, Search, Database, UserCircle, ShieldCheck
} from 'lucide-react';
import { useEffect, useState } from 'react';

// --- Interfaces ---
interface DashboardStats {
    totalCitizens: number;
    totalHouseholds: number;
    totalBusinesses: number;
    totalInfrastructures: number;
}

interface Citizen {
    id: number;
    name: string;
    barangay_id: string;
    created_at: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    [key: string]: any;
}

interface DashboardProps {
    stats?: DashboardStats;
    recentCitizens?: Citizen[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

export default function Dashboard({ stats, recentCitizens }: DashboardProps) {
    // We cast user as 'User' or 'any' to avoid TS strict errors if type definitions are missing
    const user = usePage().props.auth.user as User;

    const [currentTime, setCurrentTime] = useState(new Date());

    // Live Clock Logic
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fallback data
    const safeStats = stats || { totalCitizens: 0, totalHouseholds: 0, totalBusinesses: 0, totalInfrastructures: 0 };
    const safeRecent = recentCitizens || [];

    // Date Formatters
    const formattedDate = currentTime.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = currentTime.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-6 overflow-x-hidden min-h-screen">

                {/* --- TOP ROW: Welcome & Time --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* 1. Welcome Card (Spans 2 columns) */}
                    <div className="md:col-span-2 relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-sidebar p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border-2 border-white dark:border-neutral-700 shadow-sm">
                                <UserCircle className="size-8 text-neutral-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">Welcome Back</span>
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{user?.name || 'User'}</h2>
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-500">
                                    <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-md dark:bg-green-900/30 dark:text-green-400 font-medium">
                                        <ShieldCheck className="size-3" /> Administrator
                                    </span>
                                    {/* FIX: Added String() and fallback to prevent crash if user.id is undefined */}
                                    <span className="font-mono opacity-70">
                                        SysID: {String(user?.id || '0').padStart(6, '0')}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/5 dark:stroke-neutral-100/5 -z-10" />
                    </div>

                    {/* 2. Compact Time Card (Spans 1 column) */}
                    <div className="md:col-span-1 relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-sidebar p-6 shadow-sm flex flex-col justify-center items-center text-center">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="size-4 text-blue-500" />
                            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Local Time</span>
                        </div>
                        <h3 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums tracking-tight">{formattedTime}</h3>
                        <p className="text-xs font-medium text-neutral-500 mt-1">{formattedDate}</p>
                    </div>
                </div>

                {/* --- MAIN GRID SPLIT --- */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

                    {/* --- LEFT SIDE (Content - Spans 3 Cols) --- */}
                    <div className="lg:col-span-3 flex flex-col gap-6">

                        {/* 3. About System (MaPro) */}
                        <div className="relative rounded-xl border border-sidebar-border/70 bg-gradient-to-br from-sidebar to-neutral-50/50 dark:to-neutral-900/20 p-6 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <Database className="size-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100">MaPro 🏘️</h3>
                                        <p className="text-xs text-neutral-500">Barangay Records and Statistics System</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                                    <Activity className="size-3" />
                                    <span>System Healthy</span>
                                </div>
                            </div>

                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
                                Designed to streamline barangay operations, offering a user-friendly interface to manage citizen data,
                                statistical reports, and document transaction logs efficiently. This project modernizes operations
                                to ensure accurate, fast, and secure data handling.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FeatureItem icon={<Search className="size-4 text-blue-500" />} title="Citizen Records" desc="Add, update & search details." />
                                <FeatureItem icon={<Activity className="size-4 text-purple-500" />} title="Barangay Statistics" desc="Monitor population & demographics." />
                                <FeatureItem icon={<FileText className="size-4 text-orange-500" />} title="Transaction Logs" desc="Track document request history." />
                                <FeatureItem icon={<ShieldCheck className="size-4 text-green-500" />} title="Secure Access" desc="Role-based data integrity." />
                            </div>
                        </div>

                        {/* 4. Recent Citizens Table */}
                        <div className="rounded-xl border border-sidebar-border/70 bg-sidebar shadow-sm overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between p-5 border-b border-sidebar-border/70 bg-neutral-50/50 dark:bg-neutral-900/20">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                                    <Users className="size-4 text-neutral-500" /> Recently Added Citizens
                                </h3>
                                <button className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors">
                                    View Full List &rarr;
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-neutral-500 bg-neutral-50/30 dark:bg-neutral-900/10 uppercase">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">Name</th>
                                        <th className="px-5 py-3 font-medium">Location</th>
                                        <th className="px-5 py-3 font-medium">Status</th>
                                        <th className="px-5 py-3 font-medium text-right">Date</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-sidebar-border/70">
                                    {safeRecent.length > 0 ? safeRecent.map((citizen) => (
                                        <tr key={citizen.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors">
                                            <td className="px-5 py-3.5 font-medium text-neutral-900 dark:text-neutral-100">{citizen.name}</td>
                                            <td className="px-5 py-3.5 text-neutral-500">{citizen.barangay_id}</td>
                                            <td className="px-5 py-3.5">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                                                        <CheckCircle className="size-2.5" /> VERIFIED
                                                    </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right text-neutral-500 tabular-nums">{new Date(citizen.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-neutral-400">No records found.</td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT SIDE (Stats Sidebar - Spans 1 Col) --- */}
                    <div className="lg:col-span-1 flex flex-col gap-4">
                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1 px-1">Statistics Overview</div>

                        <StatCardVertical
                            title="Total Citizens"
                            value={safeStats.totalCitizens}
                            icon={<Users className="size-5 text-blue-600" />}
                            bgClass="bg-blue-50 dark:bg-blue-900/10"
                        />
                        <StatCardVertical
                            title="Total Households"
                            value={safeStats.totalHouseholds}
                            icon={<Home className="size-5 text-emerald-600" />}
                            bgClass="bg-emerald-50 dark:bg-emerald-900/10"
                        />
                        <StatCardVertical
                            title="Total Businesses"
                            value={safeStats.totalBusinesses}
                            icon={<Building2 className="size-5 text-violet-600" />}
                            bgClass="bg-violet-50 dark:bg-violet-900/10"
                        />
                        <StatCardVertical
                            title="Infrastructures"
                            value={safeStats.totalInfrastructures}
                            icon={<MapPin className="size-5 text-amber-600" />}
                            bgClass="bg-amber-50 dark:bg-amber-900/10"
                        />

                        {/* Footer Info */}
                        <div className="mt-4 rounded-xl border border-dashed border-sidebar-border p-4 text-center">
                            <p className="text-[10px] text-neutral-400">System Version 1.0.1</p>
                            <p className="text-[10px] text-neutral-500 font-medium">© 2026 RavenLabs Development</p>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}

// --- Subcomponents ---

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-sidebar/50 border border-sidebar-border/50">
            <div className="mt-0.5">{icon}</div>
            <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{title}</h4>
                <p className="text-[11px] text-neutral-500 leading-tight">{desc}</p>
            </div>
        </div>
    );
}

function StatCardVertical({ title, value, icon, bgClass }: { title: string, value: number, icon: React.ReactNode, bgClass: string }) {
    return (
        <div className="group relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-sidebar p-5 shadow-sm transition-all hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${bgClass} transition-transform group-hover:scale-110`}>
                    {icon}
                </div>
                <div>
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">{title}</p>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">{value.toLocaleString()}</h3>
                </div>
            </div>
        </div>
    );
}
