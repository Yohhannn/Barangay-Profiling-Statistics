import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft, Search, Plus, Trash2,
    FileClock, User, Calendar, FileText,
    Download, Edit3, X, SlidersHorizontal, Activity, Tag, Info,
    Handshake, Check, RotateCcw,
    BarChart2, TrendingUp,
} from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import CitizenHistoryCreation from './popup/citizen-history-creation'; // IMPORTED
import CitizenHistoryEdit from './popup/citizen-history-edit'; // IMPORTED
import CitizenQuickView from './popup/citizen-quick-view';
import SettlementQuickView from './popup/settlement-quick-view';
import { router } from '@inertiajs/react';

// --- Types ---
export interface HistoryRecord {
    id: number;
    cihi_uuid: string;
    citizenId: string;
    ctz_id: number | null;
    firstName: string;
    middleName: string;
    lastName: string;
    type: string;
    title: string;
    description: string;
    status: string;
    involvementType: string;
    caseClassification: string;
    dateRecorded: string;

    // Audit
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string;
    updatedBy: string;
    settlement?: {
        id: number;
        uuid: string;
    } | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Citizen Records', href: '/citizen-records' },
    { title: 'Citizen History', href: '/citizen-records/citizen-history' },
];

export default function CitizenHistory({ histories = [], filters = {} as any, systemAccounts = [] }: { histories?: HistoryRecord[], filters?: any, systemAccounts?: {id: number, name: string}[] }) {
    const [selectedHistory, setSelectedHistory] = useState<HistoryRecord | null>(histories.length > 0 ? histories[0] : null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [filterType, setFilterType] = useState('All');

    const [dateEncodedStart, setDateEncodedStart] = useState('');
    const [dateEncodedEnd, setDateEncodedEnd] = useState('');
    const [dateUpdatedStart, setDateUpdatedStart] = useState('');
    const [dateUpdatedEnd, setDateUpdatedEnd] = useState('');
    const [encodedByFilter, setEncodedByFilter] = useState<string[]>([]);
    const [updatedByFilter, setUpdatedByFilter] = useState<string[]>([]);
    const [showEncodedByDropdown, setShowEncodedByDropdown] = useState(false);
    const [showUpdatedByDropdown, setShowUpdatedByDropdown] = useState(false);
    const [encodedBySearch, setEncodedBySearch] = useState('');
    const [updatedBySearch, setUpdatedBySearch] = useState('');

    const encodedByRef = useRef<HTMLDivElement>(null);
    const updatedByRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (encodedByRef.current && !encodedByRef.current.contains(event.target as Node)) {
                setShowEncodedByDropdown(false);
            }
            if (updatedByRef.current && !updatedByRef.current.contains(event.target as Node)) {
                setShowUpdatedByDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- NEW: Modal State ---
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    // --- QUICK VIEW STATE ---
    const [quickViewOpen, setQuickViewOpen] = useState(false);
    const [quickViewCitizenId, setQuickViewCitizenId] = useState<number | null>(null);

    const [settlementQuickViewOpen, setSettlementQuickViewOpen] = useState(false);
    const [settlementUuid, setSettlementUuid] = useState<string | null>(null);

    const handleOpenQuickView = (e: React.MouseEvent, id: number | null) => {
        e.stopPropagation();
        if (id) {
            setQuickViewCitizenId(id);
            setQuickViewOpen(true);
        }
    };

    const handleOpenSettlementQuickView = (e: React.MouseEvent, uuid: string | null) => {
        e.stopPropagation();
        if (uuid) {
            setSettlementUuid(uuid);
            setSettlementQuickViewOpen(true);
        }
    };

    // Filter Logic
    const filteredHistory = useMemo(() => {
        return histories.filter(record => {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                (record.cihi_uuid || '').toLowerCase().includes(query) ||
                (record.lastName || '').toLowerCase().includes(query) ||
                (record.firstName || '').toLowerCase().includes(query) ||
                (record.title || '').toLowerCase().includes(query);

            const matchesType = filterType === 'All' || record.type === filterType;

            const encodedDate = record.dateEncoded ? new Date(record.dateEncoded) : null;
            const matchesEncodedStart = !dateEncodedStart || (encodedDate && encodedDate >= new Date(dateEncodedStart));
            const matchesEncodedEnd   = !dateEncodedEnd   || (encodedDate && encodedDate <= new Date(dateEncodedEnd));

            const updatedDate = record.dateUpdated ? new Date(record.dateUpdated) : null;
            const matchesUpdatedStart = !dateUpdatedStart || (updatedDate && updatedDate >= new Date(dateUpdatedStart));
            const matchesUpdatedEnd   = !dateUpdatedEnd   || (updatedDate && updatedDate <= new Date(dateUpdatedEnd));

            const matchesEncodedBy = encodedByFilter.length === 0 || encodedByFilter.includes(record.encodedBy);
            const matchesUpdatedBy = updatedByFilter.length === 0 || updatedByFilter.includes(record.updatedBy);

            return matchesSearch && matchesType
                && matchesEncodedStart && matchesEncodedEnd
                && matchesUpdatedStart && matchesUpdatedEnd
                && matchesEncodedBy && matchesUpdatedBy;
        });
    }, [searchQuery, filterType, histories, dateEncodedStart, dateEncodedEnd, dateUpdatedStart, dateUpdatedEnd, encodedByFilter, updatedByFilter]);

    // Grouping Logic
    const groupedHistory = useMemo(() => {
        const groups: Record<string, HistoryRecord[]> = {};
        filteredHistory.forEach(rec => {
            const key = rec.ctz_id ? `CTZ-${rec.ctz_id}` : `EXT-${rec.firstName.trim().toLowerCase()}-${rec.lastName.trim().toLowerCase()}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(rec);
        });
        
        return Object.entries(groups).map(([key, records]) => ({
            key,
            ctz_id: records[0].ctz_id,
            firstName: records[0].firstName,
            lastName: records[0].lastName,
            records,
        })).sort((a, b) => a.lastName.localeCompare(b.lastName));
    }, [filteredHistory]);

    // Keep selectedHistory synced with prop updates
    useEffect(() => {
        setSelectedHistory(prev => {
            if (filters.search && histories.length > 0) return histories[0];
            if (!prev) return histories.length > 0 ? histories[0] : null;
            const updated = histories.find(h => h.id === prev.id);
            return updated || (histories.length > 0 ? histories[0] : null);
        });
    }, [histories, filters.search]);

    // Sync searchQuery with filters prop
    useEffect(() => {
        if (filters.search !== undefined) {
            setSearchQuery(filters.search || '');
        }
    }, [filters.search]);

    // Auto-expand groups on search match
    useEffect(() => {
        if (searchQuery.trim() && groupedHistory.length > 0) {
            setExpandedGroups(new Set(groupedHistory.map(g => g.key)));
        }
    }, [searchQuery, groupedHistory]);

    const toggleGroup = (key: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filterType !== 'All') count++;
        if (dateEncodedStart || dateEncodedEnd) count++;
        if (dateUpdatedStart || dateUpdatedEnd) count++;
        if (encodedByFilter.length > 0) count++;
        if (updatedByFilter.length > 0) count++;
        return count;
    }, [filterType, dateEncodedStart, dateEncodedEnd, dateUpdatedStart, dateUpdatedEnd, encodedByFilter, updatedByFilter]);

    const resetFilters = () => {
        setFilterType('All');
        setDateEncodedStart('');
        setDateEncodedEnd('');
        setDateUpdatedStart('');
        setDateUpdatedEnd('');
        setEncodedByFilter([]);
        setUpdatedByFilter([]);
    };

    const [archiveTarget, setArchiveTarget] = useState<{ id: number; label: string } | null>(null);
    const [archiveReason, setArchiveReason] = useState('');
    const [archiveError, setArchiveError] = useState('');
    const [archiveLoading, setArchiveLoading] = useState(false);

    const handleDelete = (e: React.MouseEvent, id: number, label: string) => {
        e.stopPropagation();
        setArchiveTarget({ id, label });
        setArchiveReason('');
        setArchiveError('');
    };

    const handleArchiveSubmit = () => {
        if (!archiveTarget) return;
        if (!archiveReason.trim()) { setArchiveError('A reason is required.'); return; }
        setArchiveLoading(true);
        router.delete(`/citizen-records/citizen-history/${archiveTarget.id}`, {
            data: { delete_reason: archiveReason },
            preserveScroll: true,
            onSuccess: () => { setArchiveTarget(null); setSelectedHistory(null); },
            onError: (errors: any) => { setArchiveError(errors?.error || 'Failed to archive. Please try again.'); },
            onFinish: () => setArchiveLoading(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Citizen History" />

            <CitizenHistoryCreation isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
            <CitizenHistoryEdit isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} historyData={selectedHistory} />

            {archiveTarget !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#0f172a] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                        <div className="bg-red-950 text-white p-5 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold flex items-center gap-2"><Trash2 className="size-5 text-red-400" /> Archive History Record</h2>
                                <p className="text-[10px] text-red-300 mt-1 uppercase tracking-wider">{archiveTarget.label}</p>
                            </div>
                            <button onClick={() => setArchiveTarget(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"><X className="size-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Are you sure you want to move this history record to archives?</p>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">Reason for Archiving <span className="text-red-500">*</span></label>
                                <textarea rows={3} value={archiveReason} onChange={e => { setArchiveReason(e.target.value); setArchiveError(''); }} placeholder="State the reason..." className={`w-full text-xs p-2.5 rounded-lg border resize-none ${archiveError ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'} bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none`} />
                                {archiveError && <p className="text-[10px] text-red-500">{archiveError}</p>}
                            </div>
                            <div className="pt-2 flex gap-2 justify-end">
                                <button type="button" onClick={() => setArchiveTarget(null)} className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">Cancel</button>
                                <button onClick={handleArchiveSubmit} disabled={archiveLoading} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-all">{archiveLoading ? 'Archiving...' : 'Archive'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col h-[calc(100vh-4rem)] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">

                {/* --- Header Bar --- */}
                <div className="flex items-center justify-between pb-2 border-b border-sidebar-border/60">
                    <div className="flex items-center gap-4">
                        <Link href="/citizen-records" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                            <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                                Citizen Records: <span className="text-purple-600 dark:text-purple-400">Citizen History</span>
                            </h1>
                        </div>
                    </div>
                    {/* Export Button (Optional) */}
                    {/*<button className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">*/}
                    {/* <Download className="size-4" /> Export Report*/}
                    {/*</button>*/}
                </div>

                {/* Mini Statistics Panel */}
                <HistoryMiniStats histories={histories} />

                {/* --- Main Content Split --- */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                    {/* === LEFT COLUMN: List (Spans 4) === */}
                    <div className="lg:col-span-4 flex flex-col gap-4 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm overflow-hidden">

                        {/* List Header */}
                        <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/20 border-b border-sidebar-border/60 space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xs font-bold text-white bg-neutral-900 dark:bg-purple-600 py-1 px-3 rounded-md uppercase tracking-wider">
                                        Records List
                                    </h2>
                                    {/* RECORD (ADD) BUTTON CONNECTED */}
                                    <button
                                        onClick={() => setIsCreateOpen(true)}
                                        className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white p-1 rounded-md transition-colors shadow-sm"
                                        title="Record New History"
                                    >
                                        <Plus className="size-4" />
                                    </button>
                                </div>
                                <span className="text-[10px] text-neutral-400 font-mono">
                                    TOTAL: {filteredHistory.length}
                                </span>
                            </div>

                            {/* Search & Filter */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                                    <input
                                        type="text"
                                        placeholder="Search Name or Record Type..."
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`relative p-2 rounded-lg border transition-colors ${showFilters ? 'bg-purple-50 border-purple-200 text-purple-600 dark:bg-purple-900/20 dark:border-purple-800' : 'bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 border-sidebar-border text-neutral-500'}`}
                                    title={showFilters ? 'Close Filters' : `Filters${activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ''}`}
                                >
                                    {showFilters ? <X className="size-4" /> : <SlidersHorizontal className="size-4" />}
                                    {!showFilters && activeFilterCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[9px] font-bold text-white leading-none">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </button>
                            </div>

                        </div>

                        {/* List Content */}
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-800/50 sticky top-0 z-10 backdrop-blur-sm">
                                <tr>
                                    <th className="px-4 py-3 font-semibold border-b border-sidebar-border">Citizen / Record ID</th>
                                    <th className="px-4 py-3 font-semibold border-b border-sidebar-border">Title & Description</th>
                                    <th className="px-4 py-3 font-semibold border-b border-sidebar-border text-right">Type & Actions</th>
                                </tr>
                                </thead>
                                {groupedHistory.map(group => (
                                    <tbody key={group.key} className="divide-y divide-sidebar-border/50">
                                        <tr 
                                            onClick={() => toggleGroup(group.key)}
                                            className="bg-neutral-100/50 dark:bg-neutral-800/80 cursor-pointer hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 transition-colors"
                                        >
                                            <td colSpan={3} className="px-4 py-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <User className="size-4 text-purple-600 dark:text-purple-400" />
                                                        <span className="font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
                                                            {group.firstName} {group.lastName}
                                                        </span>
                                                        {group.ctz_id && (
                                                            <div className="flex items-center gap-1.5 ml-1">
                                                                <button 
                                                                    onClick={(e) => handleOpenQuickView(e, group.ctz_id)}
                                                                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all shadow-sm border border-purple-100 dark:border-purple-900/30 group"
                                                                    title="Quick View Record"
                                                                >
                                                                    <Info className="size-3 group-hover:scale-110 transition-transform" />
                                                                    <span className="text-[9px] font-bold uppercase tracking-tight">Quick View</span>
                                                                </button>
                                                                <span className="text-[10px] font-mono bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded shadow-sm border border-purple-200 dark:border-purple-800">
                                                                    ID: {group.records[0].citizenId}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 bg-white dark:bg-black/20 px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-700 shadow-sm">
                                                            {group.records.length} Record{group.records.length !== 1 ? 's' : ''}
                                                        </span>
                                                        <div className={`p-1 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm text-neutral-500 transition-transform duration-200 ${expandedGroups.has(group.key) ? 'rotate-180' : ''}`}>
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedGroups.has(group.key) && group.records.map((rec) => (
                                            <tr
                                                key={rec.id}
                                                onClick={() => setSelectedHistory(rec)}
                                                className={`
                                                        cursor-pointer transition-all hover:bg-purple-50 dark:hover:bg-purple-900/10
                                                        ${selectedHistory?.id === rec.id ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-l-purple-500' : 'border-l-4 border-transparent'}
                                                    `}
                                            >
                                                <td className="px-4 py-3 font-mono text-xs text-neutral-500 pl-8 relative border-l-[3px] border-l-purple-300/30 dark:border-l-purple-700/30">
                                                    #{rec.cihi_uuid || rec.id}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-bold text-neutral-900 dark:text-neutral-100">{rec.title}</div>
                                                    <div className="text-[10px] text-neutral-500 truncate max-w-xs">{rec.description}</div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getTypeColor(rec.type)}`}>
                                                            {rec.type}
                                                        </span>
                                                        <button
                                                            onClick={(e) => handleDelete(e, rec.id, `${rec.firstName} ${rec.lastName}`)}
                                                            className="text-neutral-300 hover:text-red-500 transition-colors p-1 bg-white dark:bg-neutral-800 rounded border border-transparent hover:border-red-200 dark:hover:border-red-900"
                                                            title="Delete Record"
                                                        >
                                                            <Trash2 className="size-3" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                ))}
                            </table>
                        </div>
                    </div>

                    {/* === RIGHT COLUMN: Details (Spans 8) === */}
                    <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">

                        {/* Detail Content */}
                        {selectedHistory ? (
                            <div className="flex-1 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm flex flex-col overflow-hidden">

                                {/* 1. Details Header (New) */}
                                <div className="bg-neutral-50 dark:bg-neutral-900/20 border-b border-sidebar-border p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-xl ${getTypeBg(selectedHistory.type)}`}>
                                                <FileClock className={`size-8 ${getTypeText(selectedHistory.type)}`} />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                                    {selectedHistory.title}
                                                </h2>
                                                <div className="flex items-center gap-2 mt-1 text-sm text-neutral-500">
                                                    <User className="size-3.5" />
                                                    <span className="font-medium">
                                                        {selectedHistory.firstName} {selectedHistory.lastName}
                                                    </span>
                                                    {selectedHistory.ctz_id && (
                                                        <button 
                                                            onClick={(e) => handleOpenQuickView(e, selectedHistory.ctz_id)}
                                                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all shadow-sm border border-neutral-200 dark:border-neutral-700 group ml-2"
                                                            title="Quick View Record"
                                                        >
                                                            <Info className="size-3 group-hover:scale-110 transition-transform" />
                                                            <span className="text-[9px] font-bold uppercase tracking-tight">Quick View</span>
                                                        </button>
                                                    )}
                                                    <span className="font-mono bg-white dark:bg-black/20 border px-1.5 rounded text-xs ml-2">
                                                        {selectedHistory.citizenId}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* EDIT BUTTON MOVED HERE */}
                                        <button onClick={() => setIsEditOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all hover:shadow-md">
                                            <Edit3 className="size-3.5" /> Edit History
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 bg-white dark:bg-sidebar border border-sidebar-border rounded-xl p-5 shadow-sm">
                                        <InfoRow label="History ID" value={selectedHistory.cihi_uuid || String(selectedHistory.id).padStart(4, '0')} highlight />
                                        <InfoRow label="Date Recorded" value={selectedHistory.dateRecorded} />
                                        <InfoRow label="History Type" value={selectedHistory.type}
                                                 className={getTypeText(selectedHistory.type)}
                                        />
                                        <InfoRow label="Current Status" value={selectedHistory.status} />
                                        <InfoRow label="Involvement" value={selectedHistory.involvementType || 'N/A'} />
                                        <InfoRow label="Classification" value={selectedHistory.caseClassification || 'N/A'} />
                                        {selectedHistory.settlement && (
                                            <div className="col-span-2 flex justify-between border-b border-sidebar-border/50 pb-1 mt-2">
                                                <span className="text-neutral-500 font-medium text-sm">Linked Settlement:</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-mono bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-100 dark:border-amber-800 font-bold shadow-sm">
                                                        {selectedHistory.settlement.uuid}
                                                    </span>
                                                    <button 
                                                        onClick={(e) => handleOpenSettlementQuickView(e, selectedHistory.settlement?.uuid || null)}
                                                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-all shadow-sm group"
                                                        title="Quick View Settlement"
                                                    >
                                                        <Handshake className="size-3 group-hover:scale-110 transition-transform" />
                                                        <span className="text-[9px] font-bold uppercase tracking-tight">Quick View</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Description Block */}
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                            <FileText className="size-3.5" /> Full Description
                                        </h3>
                                        <div className="bg-neutral-50/50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 min-h-[150px]">
                                            {selectedHistory.description}
                                        </div>
                                    </div>

                                </div>

                                {/* Footer Audit */}
                                <div className="p-4 border-t border-sidebar-border/60 bg-neutral-50 dark:bg-neutral-900/50 flex flex-col md:flex-row justify-between items-start md:items-center text-[10px] text-neutral-400 font-mono gap-4">
                                    <div className="space-y-1">
                                        <div className="flex gap-2">
                                            <span className="font-bold w-20">DATE ENCODED:</span>
                                            <span>{selectedHistory.dateEncoded}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="font-bold w-20">ENCODED BY:</span>
                                            <span>{selectedHistory.encodedBy}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <span className="font-bold">DATE UPDATED:</span>
                                            <span>{selectedHistory.dateUpdated}</span>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <span className="font-bold">UPDATED BY:</span>
                                            <span>{selectedHistory.updatedBy}</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-sidebar-border rounded-2xl bg-neutral-50/50 text-neutral-400">
                                <FileClock className="size-12 mb-2 opacity-20" />
                                <p>Select a record to view details</p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
            {/* Quick View Modal */}
            <CitizenQuickView 
                isOpen={quickViewOpen} 
                onClose={() => setQuickViewOpen(false)} 
                citizenId={quickViewCitizenId} 
            />
            {/* Settlement Quick View Modal */}
            <SettlementQuickView
                isOpen={settlementQuickViewOpen}
                onClose={() => setSettlementQuickViewOpen(false)}
                settlementUuid={settlementUuid}
            />

            {/* Filter Drawer */}
            {showFilters && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
                        onClick={() => setShowFilters(false)}
                    />
                    <div className="fixed right-0 top-0 bottom-0 z-50 flex flex-col w-[380px] bg-white dark:bg-neutral-900 border-l border-sidebar-border shadow-2xl animate-in slide-in-from-right duration-200">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between p-5 border-b border-sidebar-border bg-purple-50 dark:bg-purple-900/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                    <SlidersHorizontal className="size-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">Filter Records</h3>
                                    {activeFilterCount > 0 && (
                                        <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                                            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            {/* Record Type Section */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                                    <FileClock className="size-3" /> Record Type
                                </h4>
                                <div className="space-y-2">
                                    {['All', 'Violation', 'Complaint', 'Commendation', 'Other'].map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => setFilterType(opt)}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm border transition-all ${
                                                filterType === opt
                                                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-semibold'
                                                    : 'bg-white dark:bg-neutral-800 border-sidebar-border text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                                            }`}
                                        >
                                            <span>{opt === 'All' ? 'All Types' : opt}</span>
                                            {filterType === opt && <Check className="size-3.5 text-purple-600 dark:text-purple-400" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date Filters */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 shrink-0">Date Filters</span>
                                    <div className="flex-1 h-px bg-sidebar-border/60" />
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">Date Encoded</label>
                                        <div className="flex items-center gap-2">
                                            <input type="date" className="flex-1 text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 min-w-0 transition-colors" value={dateEncodedStart} onChange={e => setDateEncodedStart(e.target.value)} />
                                            <span className="text-sm text-neutral-400 font-medium shrink-0">→</span>
                                            <input type="date" className="flex-1 text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 min-w-0 transition-colors" value={dateEncodedEnd} onChange={e => setDateEncodedEnd(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">Date Updated</label>
                                        <div className="flex items-center gap-2">
                                            <input type="date" className="flex-1 text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 min-w-0 transition-colors" value={dateUpdatedStart} onChange={e => setDateUpdatedStart(e.target.value)} />
                                            <span className="text-sm text-neutral-400 font-medium shrink-0">→</span>
                                            <input type="date" className="flex-1 text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 min-w-0 transition-colors" value={dateUpdatedEnd} onChange={e => setDateUpdatedEnd(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Audit Trail */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 shrink-0">Audit Trail</span>
                                    <div className="flex-1 h-px bg-sidebar-border/60" />
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5" ref={encodedByRef}>
                                        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">Encoded By</label>
                                        <div className="relative">
                                            <button onClick={() => setShowEncodedByDropdown(!showEncodedByDropdown)} className="w-full text-left text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex justify-between items-center gap-2 hover:border-purple-400 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/20">
                                                <span className="truncate">{encodedByFilter.length === 0 ? 'All Users' : `${encodedByFilter.length} user${encodedByFilter.length > 1 ? 's' : ''} selected`}</span>
                                                <Search className="size-4 text-neutral-400 shrink-0" />
                                            </button>
                                            {showEncodedByDropdown && (
                                                <div className="absolute z-[60] top-full mt-1 left-0 right-0 bg-white dark:bg-neutral-800 border border-sidebar-border rounded-xl shadow-2xl py-1 max-h-56 flex flex-col">
                                                    <div className="px-3 py-2 border-b border-sidebar-border/50">
                                                        <input type="text" className="w-full text-sm p-2 bg-neutral-50 dark:bg-neutral-900 border border-sidebar-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20" placeholder="Search users..." value={encodedBySearch} onChange={e => setEncodedBySearch(e.target.value)} onClick={e => e.stopPropagation()} />
                                                    </div>
                                                    <div className="overflow-y-auto flex-1 p-1.5">
                                                        <div className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer rounded-lg" onClick={() => setEncodedByFilter([])}>
                                                            <div className={`size-4 rounded border shrink-0 flex items-center justify-center ${encodedByFilter.length === 0 ? 'bg-purple-600 border-purple-600' : 'border-neutral-300 dark:border-neutral-600'}`}>{encodedByFilter.length === 0 && <Check className="size-3 text-white" />}</div>
                                                            <span className="font-medium">All Users</span>
                                                        </div>
                                                        {systemAccounts.filter(acc => acc.name.toLowerCase().includes(encodedBySearch.toLowerCase())).map(acc => {
                                                            const isSelected = encodedByFilter.includes(acc.name);
                                                            return (
                                                                <div key={acc.id} className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer rounded-lg" onClick={() => setEncodedByFilter(isSelected ? encodedByFilter.filter(n => n !== acc.name) : [...encodedByFilter, acc.name])}>
                                                                    <div className={`size-4 rounded border shrink-0 flex items-center justify-center ${isSelected ? 'bg-purple-600 border-purple-600' : 'border-neutral-300 dark:border-neutral-600'}`}>{isSelected && <Check className="size-3 text-white" />}</div>
                                                                    <span className="truncate">{acc.name}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5" ref={updatedByRef}>
                                        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">Updated By</label>
                                        <div className="relative">
                                            <button onClick={() => setShowUpdatedByDropdown(!showUpdatedByDropdown)} className="w-full text-left text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex justify-between items-center gap-2 hover:border-purple-400 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/20">
                                                <span className="truncate">{updatedByFilter.length === 0 ? 'All Users' : `${updatedByFilter.length} user${updatedByFilter.length > 1 ? 's' : ''} selected`}</span>
                                                <Search className="size-4 text-neutral-400 shrink-0" />
                                            </button>
                                            {showUpdatedByDropdown && (
                                                <div className="absolute z-[60] top-full mt-1 left-0 right-0 bg-white dark:bg-neutral-800 border border-sidebar-border rounded-xl shadow-2xl py-1 max-h-56 flex flex-col">
                                                    <div className="px-3 py-2 border-b border-sidebar-border/50">
                                                        <input type="text" className="w-full text-sm p-2 bg-neutral-50 dark:bg-neutral-900 border border-sidebar-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20" placeholder="Search users..." value={updatedBySearch} onChange={e => setUpdatedBySearch(e.target.value)} onClick={e => e.stopPropagation()} />
                                                    </div>
                                                    <div className="overflow-y-auto flex-1 p-1.5">
                                                        <div className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer rounded-lg" onClick={() => setUpdatedByFilter([])}>
                                                            <div className={`size-4 rounded border shrink-0 flex items-center justify-center ${updatedByFilter.length === 0 ? 'bg-purple-600 border-purple-600' : 'border-neutral-300 dark:border-neutral-600'}`}>{updatedByFilter.length === 0 && <Check className="size-3 text-white" />}</div>
                                                            <span className="font-medium">All Users</span>
                                                        </div>
                                                        {systemAccounts.filter(acc => acc.name.toLowerCase().includes(updatedBySearch.toLowerCase())).map(acc => {
                                                            const isSelected = updatedByFilter.includes(acc.name);
                                                            return (
                                                                <div key={acc.id} className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer rounded-lg" onClick={() => setUpdatedByFilter(isSelected ? updatedByFilter.filter(n => n !== acc.name) : [...updatedByFilter, acc.name])}>
                                                                    <div className={`size-4 rounded border shrink-0 flex items-center justify-center ${isSelected ? 'bg-purple-600 border-purple-600' : 'border-neutral-300 dark:border-neutral-600'}`}>{isSelected && <Check className="size-3 text-white" />}</div>
                                                                    <span className="truncate">{acc.name}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Drawer Footer */}
                        <div className="p-5 border-t border-sidebar-border bg-neutral-50 dark:bg-neutral-900/50 flex gap-3">
                            <button
                                onClick={resetFilters}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/10 dark:hover:border-red-800 dark:hover:text-red-400 transition-all"
                            >
                                <RotateCcw className="size-3.5" /> Reset All
                            </button>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-all shadow-sm hover:shadow-md"
                            >
                                <Check className="size-3.5" /> Done
                            </button>
                        </div>
                    </div>
                </>
            )}
        </AppLayout>
    );
}

// --- Mini Statistics ---

function HistoryMiniStats({ histories }: { histories: HistoryRecord[] }) {
    const total = histories.length;

    // Type counts
    const typeCounts = useMemo(() => ({
        Violation:    histories.filter(h => h.type === 'Violation').length,
        Complaint:    histories.filter(h => h.type === 'Complaint').length,
        Commendation: histories.filter(h => h.type === 'Commendation').length,
        Other:        histories.filter(h => !['Violation', 'Complaint', 'Commendation'].includes(h.type)).length,
    }), [histories]);

    // Top 5 case classifications
    const topClassifications = useMemo(() => {
        const map: Record<string, number> = {};
        histories.forEach(h => {
            const key = h.caseClassification || 'Unclassified';
            map[key] = (map[key] || 0) + 1;
        });
        return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
    }, [histories]);

    const maxClass = topClassifications[0]?.[1] ?? 1;

    // Monthly volume (last 6 months)
    const monthlyData = useMemo(() => {
        const map: Record<string, number> = {};
        histories.forEach(h => {
            if (!h.dateRecorded) return;
            const d = new Date(h.dateRecorded);
            if (isNaN(d.getTime())) return;
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            map[key] = (map[key] || 0) + 1;
        });
        const now = new Date();
        return Array.from({ length: 6 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            return { label: d.toLocaleString('default', { month: 'short' }), count: map[key] || 0 };
        });
    }, [histories]);

    const maxMonthly = Math.max(...monthlyData.map(m => m.count), 1);

    if (total === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">

            {/* 1. Record Type Breakdown */}
            <div className="bg-white dark:bg-sidebar border border-sidebar-border/60 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                    <BarChart2 className="size-4 text-purple-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Record Types</span>
                    <span className="ml-auto text-[10px] font-mono text-neutral-400">{total} total</span>
                </div>
                {/* Stacked bar */}
                <div className="flex h-3 rounded-full overflow-hidden gap-px">
                    {typeCounts.Violation > 0 && (
                        <div className="bg-red-400 transition-all" style={{ width: `${(typeCounts.Violation / total) * 100}%` }} title={`Violation: ${typeCounts.Violation}`} />
                    )}
                    {typeCounts.Complaint > 0 && (
                        <div className="bg-orange-400 transition-all" style={{ width: `${(typeCounts.Complaint / total) * 100}%` }} title={`Complaint: ${typeCounts.Complaint}`} />
                    )}
                    {typeCounts.Commendation > 0 && (
                        <div className="bg-green-500 transition-all" style={{ width: `${(typeCounts.Commendation / total) * 100}%` }} title={`Commendation: ${typeCounts.Commendation}`} />
                    )}
                    {typeCounts.Other > 0 && (
                        <div className="bg-neutral-300 transition-all" style={{ width: `${(typeCounts.Other / total) * 100}%` }} title={`Other: ${typeCounts.Other}`} />
                    )}
                </div>
                <div className="grid grid-cols-2 gap-1">
                    {([
                        { label: 'Violation',    count: typeCounts.Violation,    color: 'text-red-600',     bg: 'bg-red-50 dark:bg-red-900/20' },
                        { label: 'Complaint',    count: typeCounts.Complaint,    color: 'text-orange-500',  bg: 'bg-orange-50 dark:bg-orange-900/20' },
                        { label: 'Commendation', count: typeCounts.Commendation, color: 'text-green-600',   bg: 'bg-green-50 dark:bg-green-900/20' },
                        { label: 'Other',        count: typeCounts.Other,        color: 'text-neutral-500', bg: 'bg-neutral-50 dark:bg-neutral-900/20' },
                    ] as const).map(s => (
                        <div key={s.label} className={`rounded-lg p-2 text-center ${s.bg}`}>
                            <div className={`text-lg font-black font-mono ${s.color}`}>{s.count}</div>
                            <div className="text-[9px] uppercase font-bold text-neutral-400">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Case Classifications */}
            <div className="bg-white dark:bg-sidebar border border-sidebar-border/60 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                    <FileClock className="size-4 text-purple-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Classifications</span>
                </div>
                <div className="space-y-2">
                    {topClassifications.map(([cls, count]) => (
                        <div key={cls} className="space-y-0.5">
                            <div className="flex justify-between text-[10px]">
                                <span className="truncate max-w-[70%] font-medium text-neutral-700 dark:text-neutral-300">{cls}</span>
                                <span className="font-mono font-bold text-purple-600">{count}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${(count / maxClass) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                    {topClassifications.length === 0 && <p className="text-xs text-neutral-400 italic">No data.</p>}
                </div>
            </div>

            {/* 3. Monthly Volume */}
            <div className="bg-white dark:bg-sidebar border border-sidebar-border/60 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                    <TrendingUp className="size-4 text-purple-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Monthly Volume</span>
                    <span className="ml-auto text-[10px] font-mono text-neutral-400">6 mo.</span>
                </div>
                <div className="flex items-end gap-1 h-16">
                    {monthlyData.map((m) => (
                        <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full flex items-end justify-center" style={{ height: '40px' }}>
                                <div
                                    className="w-full rounded-t bg-purple-500 dark:bg-purple-600 transition-all min-h-[2px]"
                                    style={{ height: `${(m.count / maxMonthly) * 40}px` }}
                                    title={`${m.label}: ${m.count}`}
                                />
                            </div>
                            <span className="text-[9px] font-mono text-neutral-400">{m.label}</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-[9px] font-mono text-neutral-400 border-t border-sidebar-border/40 pt-1">
                    <span>0</span>
                    <span>{maxMonthly}</span>
                </div>
            </div>

        </div>
    );
}

// --- Reusable ---

function InfoRow({ label, value, highlight = false, className = '' }: { label: string, value: string, highlight?: boolean, className?: string }) {
    return (
        <div className="flex justify-between border-b border-sidebar-border/50 pb-1">
            <span className="text-neutral-500 font-medium text-sm">{label}:</span>
            <span className={`font-semibold text-sm ${highlight ? 'text-purple-600 dark:text-purple-400 font-mono' : 'text-neutral-900 dark:text-neutral-100'} ${className}`}>
                {value}
            </span>
        </div>
    );
}

// Helper for Type Colors
function getTypeColor(type: string) {
    switch (type) {
        case 'Violation': return 'bg-red-100 text-red-700';
        case 'Complaint': return 'bg-orange-100 text-orange-700';
        case 'Commendation': return 'bg-green-100 text-green-700';
        default: return 'bg-neutral-100 text-neutral-600';
    }
}

function getTypeBg(type: string) {
    switch (type) {
        case 'Violation': return 'bg-red-100 dark:bg-red-900/20';
        case 'Complaint': return 'bg-orange-100 dark:bg-orange-900/20';
        case 'Commendation': return 'bg-green-100 dark:bg-green-900/20';
        default: return 'bg-neutral-100 dark:bg-neutral-800';
    }
}

function getTypeText(type: string) {
    switch (type) {
        case 'Violation': return 'text-red-600';
        case 'Complaint': return 'text-orange-600';
        case 'Commendation': return 'text-green-600';
        default: return 'text-neutral-600';
    }
}
