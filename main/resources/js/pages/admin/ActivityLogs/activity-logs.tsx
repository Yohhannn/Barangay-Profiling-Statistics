import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { RefreshCw, Clock, History, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Activity Logs',
        href: '/activity-logs',
    },
];

interface LogEntry {
    id: number;
    user_id: string;
    staff_name: string;
    action_made: string;
    timestamp: string;
}

// Mock Data to match your screenshot example
const mockLogs: LogEntry[] = [
    { id: 1, user_id: '1001', staff_name: 'Ian N. Majica', action_made: 'Action UPDATE on transaction_log ID = 3', timestamp: '2025-10-28 04:54:24.798584' },
    { id: 2, user_id: '1001', staff_name: 'Ian N. Majica', action_made: 'Action UPDATE on medical_history ID = 1', timestamp: '2025-10-19 16:33:08.466469' },
    { id: 3, user_id: '1001', staff_name: 'Ian N. Majica', action_made: 'Action UPDATE on medical_history ID = 1', timestamp: '2025-10-19 16:32:49.341955' },
    { id: 4, user_id: '1001', staff_name: 'Ian N. Majica', action_made: 'Action UPDATE on citizen ID = 2', timestamp: '2025-09-13 04:12:37.549146' },
    { id: 5, user_id: '1001', staff_name: 'Ian N. Majica', action_made: 'Action INSERT on citizen ID = 3', timestamp: '2025-08-15 03:04:08.181501' },
    { id: 6, user_id: '1001', staff_name: 'Ian N. Majica', action_made: 'Action INSERT on system_account ID = 1004', timestamp: '2025-08-15 03:01:14.580167' },
    { id: 7, user_id: '1001', staff_name: 'Ian N. Majica', action_made: 'Action UPDATE on business_info ID = 1', timestamp: '2025-08-15 03:00:01.002219' },
    { id: 8, user_id: '1001', staff_name: 'Ian N. Majica', action_made: 'Action UPDATE on household_info ID = 1', timestamp: '2025-08-15 02:58:14.785594' },
    { id: 9, user_id: '1001', staff_name: 'Ian N. Majica', action_made: 'Action INSERT on citizen_history ID = 2', timestamp: '2025-08-15 02:55:44.372603' },
    { id: 10, user_id: '1001', staff_name: 'Ian N. Majica', action_made: 'Action INSERT on transaction_log ID = 3', timestamp: '2025-08-07 23:09:13.974272' },
];

interface ActivityLogsProps {
    logs?: LogEntry[];
}

export default function ActivityLogs({ logs = mockLogs }: ActivityLogsProps) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Live Clock Logic
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            onFinish: () => setIsRefreshing(false),
        });
    };

    // Date Formatters
    const formattedDate = currentTime.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity Logs" />

            <div className="flex flex-col gap-6 p-6 lg:p-8 h-full min-h-[85vh] max-w-7xl mx-auto w-full">

                {/* --- Header Section with Clock Widget --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
                            <History className="size-8 text-neutral-400" />
                            Activity Logs
                        </h1>
                        <p className="text-sm text-neutral-500 mt-2 max-w-lg">
                            Monitor system events, user actions, and security audit trails in real-time.
                        </p>
                    </div>

                    {/* Clock Widget (Top Right) */}
                    <div className="bg-white dark:bg-sidebar border border-sidebar-border/60 rounded-xl p-4 shadow-sm min-w-[280px]">
                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                            Current Date & Time
                        </div>
                        <div className="flex items-baseline justify-between gap-4">
                            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                                {formattedTime}
                            </div>
                            <div className="text-xs font-medium text-neutral-500 text-right">
                                {formattedDate}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Main Content Area --- */}
                <div className="flex-1 flex flex-col rounded-2xl border border-sidebar-border/60 bg-white dark:bg-sidebar shadow-sm overflow-hidden">

                    {/* Toolbar / Header */}
                    <div className="p-4 border-b border-sidebar-border/60 bg-neutral-50/50 dark:bg-neutral-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                        {/* Refresh Button */}
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-all disabled:opacity-70"
                        >
                            <RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh Logs'}
                        </button>

                        <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-widest text-center sm:text-right flex-1">
                            Recent Activities
                        </h2>
                    </div>

                    {/* Table Container */}
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-neutral-500 font-bold uppercase bg-neutral-100/50 dark:bg-neutral-800/50 sticky top-0 z-10 backdrop-blur-sm">
                            <tr>
                                <th className="px-6 py-4 whitespace-nowrap w-24">User ID</th>
                                <th className="px-6 py-4 whitespace-nowrap w-48">Staff Name</th>
                                <th className="px-6 py-4 whitespace-nowrap">Action Made</th>
                                <th className="px-6 py-4 whitespace-nowrap w-64 text-right">Timestamp of Action</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/50">
                            {logs.length > 0 ? logs.map((log) => (
                                <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/30 transition-colors group">
                                    <td className="px-6 py-3.5 font-mono text-xs text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-neutral-100">
                                        {log.user_id}
                                    </td>
                                    <td className="px-6 py-3.5 font-medium text-neutral-900 dark:text-neutral-100">
                                        {log.staff_name}
                                    </td>
                                    <td className="px-6 py-3.5 text-neutral-600 dark:text-neutral-400">
                                        {/* Style "UPDATE" and "INSERT" differently */}
                                        {log.action_made.includes('UPDATE') ? (
                                            <span className="inline-flex items-center gap-1.5">
                                                    <span className="size-1.5 rounded-full bg-orange-500"></span>
                                                {log.action_made}
                                                </span>
                                        ) : log.action_made.includes('INSERT') ? (
                                            <span className="inline-flex items-center gap-1.5">
                                                    <span className="size-1.5 rounded-full bg-green-500"></span>
                                                {log.action_made}
                                                </span>
                                        ) : (
                                            log.action_made
                                        )}
                                    </td>
                                    <td className="px-6 py-3.5 text-right font-mono text-xs text-neutral-400">
                                        {log.timestamp}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-24 text-center text-neutral-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Search className="size-8 opacity-20" />
                                            <p>No activity logs found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Simple Pagination Footer (Static) */}
                    <div className="p-4 border-t border-sidebar-border/60 bg-neutral-50/30 dark:bg-neutral-900/10 flex justify-between items-center text-xs text-neutral-500">
                        <span>Showing recent 100 entries</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 rounded-md border border-sidebar-border hover:bg-white dark:hover:bg-sidebar disabled:opacity-50" disabled>Previous</button>
                            <button className="px-3 py-1 rounded-md border border-sidebar-border hover:bg-white dark:hover:bg-sidebar">Next</button>
                        </div>
                    </div>
                </div>

                {/* --- Footer --- */}
                <div className="mt-auto pt-6 border-t border-dashed border-sidebar-border/50 text-center">
                    <p className="text-xs font-semibold text-neutral-400/80 tracking-wide">
                        &copy; 2026 RavenLabs Development
                    </p>
                </div>

            </div>
        </AppLayout>
    );
}
