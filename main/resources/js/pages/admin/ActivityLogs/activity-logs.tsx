import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { RefreshCw, Clock, History, Search, Filter } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import debounce from 'lodash/debounce';

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

interface PaginatedLogs {
    data: LogEntry[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    from: number;
    to: number;
    total: number;
    links: { url: string | null, label: string, active: boolean }[];
}

interface ActivityLogsProps {
    logs: PaginatedLogs;
    filters: {
        search?: string;
        staff?: string;
        action?: string;
        entity?: string;
        start_date?: string;
        end_date?: string;
    };
    staffOptions: { id: number; name: string }[];
    actionOptions: string[];
    entityOptions: string[];
}

export default function ActivityLogs({ logs, filters, staffOptions, actionOptions, entityOptions }: ActivityLogsProps) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [search, setSearch] = useState(filters?.search || '');
    const [staff, setStaff] = useState(filters?.staff || '');
    const [action, setAction] = useState(filters?.action || '');
    const [entity, setEntity] = useState(filters?.entity || '');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');

    // Live Clock Logic
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchFilteredLogs = useCallback(
        debounce((query: string, staffFilter: string, actionFilter: string, entityFilter: string, start: string, end: string) => {
            router.get('/activity-logs', { 
                search: query, 
                staff: staffFilter, 
                action: actionFilter, 
                entity: entityFilter,
                start_date: start, 
                end_date: end 
            }, { preserveState: true, preserveScroll: true });
        }, 500),
        []
    );

    useEffect(() => {
        // Skip initial render if all filters match props
        if (search !== (filters?.search || '') || 
            staff !== (filters?.staff || '') || 
            action !== (filters?.action || '') || 
            entity !== (filters?.entity || '') ||
            startDate !== (filters?.start_date || '') || 
            endDate !== (filters?.end_date || '')) {
            fetchFilteredLogs(search, staff, action, entity, startDate, endDate);
        }
    }, [search, staff, action, entity, startDate, endDate, fetchFilteredLogs, filters]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setSearch('');
        setStaff('');
        setAction('');
        setEntity('');
        setStartDate('');
        setEndDate('');
        router.get('/activity-logs', {}, {
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

                    {/* Toolbar / Header & Filters */}
                    <div className="p-4 border-b border-sidebar-border/60 bg-neutral-50/50 dark:bg-neutral-900/20 flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-all disabled:opacity-70"
                            >
                                <RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                                {isRefreshing ? 'Refreshing...' : 'Reset & Refresh'}
                            </button>
                            <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-widest text-center sm:text-right flex-1">
                                Filtered Activities
                            </h2>
                        </div>

                        {/* Filters Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mt-2">
                            <div className="relative lg:col-span-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search details..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 text-xs border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                />
                            </div>
                            <select
                                value={staff}
                                onChange={e => setStaff(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                            >
                                <option value="">All Staff</option>
                                {staffOptions?.map(option => (
                                    <option key={option.id} value={option.id}>{option.name}</option>
                                ))}
                            </select>
                            <select
                                value={action}
                                onChange={e => setAction(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                            >
                                <option value="">All Actions</option>
                                {actionOptions?.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <select
                                value={entity}
                                onChange={e => setEntity(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                            >
                                <option value="">All Entities</option>
                                {entityOptions?.map(ent => (
                                    <option key={ent} value={ent}>{ent}</option>
                                ))}
                            </select>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                placeholder="Start Date"
                            />
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                placeholder="End Date"
                            />
                        </div>
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
                            {logs.data && logs.data.length > 0 ? logs.data.map((log) => (
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
                                        ) : log.action_made.includes('DELETE') ? (
                                            <span className="inline-flex items-center gap-1.5">
                                                    <span className="size-1.5 rounded-full bg-red-500"></span>
                                                {log.action_made}
                                                </span>
                                        ) : log.action_made.includes('VIEW') ? (
                                            <span className="inline-flex items-center gap-1.5">
                                                    <span className="size-1.5 rounded-full bg-blue-500"></span>
                                                {log.action_made}
                                                </span>
                                        ) : log.action_made.includes('EXPORT') ? (
                                            <span className="inline-flex items-center gap-1.5">
                                                    <span className="size-1.5 rounded-full bg-violet-500"></span>
                                                {log.action_made}
                                                </span>
                                        ) : log.action_made.includes('RESTORE') ? (
                                            <span className="inline-flex items-center gap-1.5">
                                                    <span className="size-1.5 rounded-full bg-cyan-500"></span>
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

                    {/* Dynamic Pagination Footer */}
                    <div className="p-4 border-t border-sidebar-border/60 bg-neutral-50/30 dark:bg-neutral-900/10 flex justify-between items-center text-xs text-neutral-500">
                        <span>
                            Showing {logs.from || 0} to {logs.to || 0} of {logs.total || 0} entries
                        </span>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => logs.prev_page_url && router.get(logs.prev_page_url, { search, staff, action, start_date: startDate, end_date: endDate }, { preserveState: true, preserveScroll: true })}
                                disabled={!logs.prev_page_url}
                                className="px-3 py-1 rounded-md border border-sidebar-border hover:bg-white dark:hover:bg-sidebar disabled:opacity-50 transition-colors"
                            >
                                Previous
                            </button>
                            <button 
                                onClick={() => logs.next_page_url && router.get(logs.next_page_url, { search, staff, action, start_date: startDate, end_date: endDate }, { preserveState: true, preserveScroll: true })}
                                disabled={!logs.next_page_url}
                                className="px-3 py-1 rounded-md border border-sidebar-border hover:bg-white dark:hover:bg-sidebar disabled:opacity-50 transition-colors"
                            >
                                Next
                            </button>
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
