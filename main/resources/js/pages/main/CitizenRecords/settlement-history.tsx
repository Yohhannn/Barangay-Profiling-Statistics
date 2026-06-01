import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft, Search, Plus, Trash2,
    Scale, User, Calendar, FileText,
    Edit3, X, SlidersHorizontal, Activity, ShieldAlert, Handshake,
    Filter, ChevronDown, CheckCircle, Info, UserCheck, AlertCircle, AlertTriangle,
    Landmark, LayoutGrid, List, Users, Clock, FileClock,
    BarChart2, TrendingUp,
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import SettlementHistoryCreation from './popup/settlement-history-creation';
import SettlementHistoryEdit from './popup/settlement-history-edit'; 
import CitizenQuickView from './popup/citizen-quick-view';
import HistoryQuickView from './popup/history-quick-view';
import { useForm } from '@inertiajs/react';

// --- Types ---
export interface SettlementRecord {
    id: number;
    sett_uuid: string;
    // Primary Displays (for the table lists)
    complainantFirstName: string;
    complainantLastName: string;
    subjectFirstName: string;
    subjectLastName: string;
    ctz_id: number | null;
    mediator: string;
    complaint_description: string;
    citizenId: string;

    // Full Arrays
    complainants: Array<{
        id: number;
        first_name: string;
        middle_name: string | null;
        last_name: string;
        ctz_id: number | null;
        citizen_id: string | null;
        comp_description: string | null;
    }>;
    linked_histories: Array<{
        id: number;
        first_name: string;
        middle_name: string | null;
        last_name: string;
        ctz_id: number | null;
        cihi_uuid: string;
        status: string;
        title: string;
        type: string;
        citizen_id: string | null;
    }>;

    description: string;
    dateOfSettlement: string;
    
    // Audit
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string;
    updatedBy: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Citizen Records', href: '/citizen-records' },
    { title: 'Settlement History', href: '/citizen-records/settlement-history' },
];

export default function SettlementHistory({ histories = [], filters = {} as any }: { histories?: SettlementRecord[], filters?: any }) {
    const [selectedRecord, setSelectedRecord] = useState<SettlementRecord | null>(histories.length > 0 ? histories[0] : null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);
    
    // Quick View State
    const [quickViewOpen, setQuickViewOpen] = useState(false);
    const [quickViewCitizenId, setQuickViewCitizenId] = useState<number | null>(null);

    // History Quick View state
    const [historyQuickViewOpen, setHistoryQuickViewOpen] = useState(false);
    const [historyQuickViewUuid, setHistoryQuickViewUuid] = useState<string | null>(null);
    const [rawHistoryData, setRawHistoryData] = useState<any | null>(null);

    const handleOpenQuickView = (e: React.MouseEvent, id: number | null) => {
        e.stopPropagation();
        setQuickViewCitizenId(id);
        setQuickViewOpen(true);
    };

    const handleOpenHistoryQuickView = (e: React.MouseEvent, uuid: string | null, raw: any = null) => {
        e.stopPropagation();
        setHistoryQuickViewUuid(uuid);
        setRawHistoryData(raw);
        setHistoryQuickViewOpen(true);
    };
    
    // We can filter by subject or complainant by text, but we don't have strictly categorized fixed string types like medical yet.
    // For now we'll just implement simple string search over names.

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    // Keep selectedRecord synced with prop updates
    useEffect(() => {
        setSelectedRecord(prev => {
            // Priority 1: If searching, and histories changed, pick histories[0] (which matches search)
            if (filters.search && histories.length > 0) {
                // If the current prev already matches search, we could keep it, but histories[0] is safer
                return histories[0];
            }
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

    // Filtering
    const filteredHistory = useMemo(() => {
        return histories.filter(record => {
            const query = searchQuery.toLowerCase();
            const matchesUuid = (record.sett_uuid || '').toLowerCase().includes(query);
            const matchesSubject = (record.subjectFirstName || '').toLowerCase().includes(query) || (record.subjectLastName || '').toLowerCase().includes(query);
            const matchesComplainant = (record.complainantFirstName || '').toLowerCase().includes(query) || (record.complainantLastName || '').toLowerCase().includes(query);
            
            return matchesUuid || matchesSubject || matchesComplainant;
        });
    }, [searchQuery, histories]);

    // Flat sorting by SETT-UUID
    const sortedHistory = useMemo(() => {
        return [...filteredHistory].sort((a, b) => a.sett_uuid.localeCompare(b.sett_uuid));
    }, [filteredHistory]);

    const toggleGroup = (key: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
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
        router.delete(`/citizen-records/settlement-history/${archiveTarget.id}`, {
            data: { delete_reason: archiveReason },
            preserveScroll: true,
            onSuccess: () => { setArchiveTarget(null); setSelectedRecord(null); },
            onError: (errors: any) => { setArchiveError(errors?.error || 'Failed to archive. Please try again.'); },
            onFinish: () => setArchiveLoading(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Settlement History" />

            <SettlementHistoryCreation isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
            <SettlementHistoryEdit isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} history={selectedRecord} />

            {archiveTarget !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#0f172a] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                        <div className="bg-red-950 text-white p-5 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold flex items-center gap-2"><Trash2 className="size-5 text-red-400" /> Archive Settlement Record</h2>
                                <p className="text-[10px] text-red-300 mt-1 uppercase tracking-wider">{archiveTarget.label}</p>
                            </div>
                            <button onClick={() => setArchiveTarget(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"><X className="size-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Are you sure you want to move this settlement record to archives?</p>
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

                <div className="flex items-center justify-between pb-2 border-b border-sidebar-border/60">
                    <div className="flex items-center gap-4">
                        <Link href="/citizen-records" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                            <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                                Citizen Records: <span className="text-amber-600 dark:text-amber-500">Settlement History</span>
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Mini Statistics Panel */}
                <SettlementMiniStats histories={histories} />

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                    {/* === LEFT COLUMN: List === */}
                    <div className="lg:col-span-4 flex flex-col gap-4 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm overflow-hidden">
                        <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/20 border-b border-sidebar-border/60 space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xs font-bold text-white bg-neutral-900 dark:bg-amber-600 py-1 px-3 rounded-md uppercase tracking-wider">
                                        Settlement List
                                    </h2>
                                    <button
                                        onClick={() => setIsCreateOpen(true)}
                                        className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white p-1 rounded-md transition-colors shadow-sm"
                                        title="Record New Settlement"
                                    >
                                        <Plus className="size-4" />
                                    </button>
                                </div>
                                <span className="text-[10px] text-neutral-400 font-mono">
                                    TOTAL: {filteredHistory.length}
                                </span>
                            </div>

                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by respondent, complainant, or SETT-UUID..."
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-800/50 sticky top-0 z-10 backdrop-blur-sm">
                                <tr>
                                    <th className="px-4 py-3 font-semibold border-b border-sidebar-border">Settlement ID</th>
                                    <th className="px-4 py-3 font-semibold border-b border-sidebar-border">Involved Parties / Case</th>
                                    <th className="px-4 py-3 font-semibold border-b border-sidebar-border text-right">Date & Act.</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/50">
                                {sortedHistory.map((rec) => (
                                    <tr
                                        key={rec.id}
                                        onClick={() => setSelectedRecord(rec)}
                                        className={`
                                                cursor-pointer transition-all hover:bg-amber-50 dark:hover:bg-amber-900/10
                                                ${selectedRecord?.id === rec.id ? 'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-l-amber-500' : 'border-l-4 border-transparent'}
                                            `}
                                    >
                                        <td className="px-4 py-3 text-xs font-mono font-bold text-amber-600 dark:text-amber-500">
                                            {rec.sett_uuid}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-xs text-neutral-700 dark:text-neutral-200 font-bold truncate max-w-[120px]">
                                                {rec.subjectFirstName} {rec.subjectLastName}
                                            </div>
                                            <div className="text-[10px] text-neutral-400">
                                                vs. {rec.complainantFirstName} {rec.complainantLastName}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex flex-col items-end gap-1.5">
                                                <span className="text-[10px] text-neutral-500">{rec.dateOfSettlement}</span>
                                                <button
                                                    onClick={(e) => handleDelete(e, rec.id, `${rec.complainantFirstName} ${rec.complainantLastName}`)}
                                                    className="text-neutral-300 hover:text-red-500 transition-colors p-1 bg-white dark:bg-neutral-800 rounded border border-transparent hover:border-red-200 dark:hover:border-red-900"
                                                    title="Archive Record"
                                                >
                                                    <Trash2 className="size-3" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* === RIGHT COLUMN: Details === */}
                    <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">

                        {selectedRecord ? (
                            <div className="flex-1 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm flex flex-col overflow-hidden">

                                <div className="bg-neutral-50 dark:bg-neutral-900/20 border-b border-sidebar-border p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-xl text-amber-600 dark:text-amber-400">
                                                <Handshake className="size-8" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                                                    Settlement Details
                                                </h2>
                                                <div className="flex items-center gap-2 mt-1 text-sm text-neutral-500">
                                                    <Scale className="size-3.5" />
                                                    <span className="font-medium">#{selectedRecord.id} • {selectedRecord.dateOfSettlement}</span>
                                                    <span className="font-mono bg-white dark:bg-black/20 border px-1.5 rounded text-xs ml-2 text-amber-600 dark:text-amber-500 border-amber-200 dark:border-amber-800 font-bold">
                                                        {selectedRecord.sett_uuid}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <button onClick={() => setIsEditOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all hover:shadow-md">
                                            <Edit3 className="size-3.5" /> Edit Record
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                                    {/* Info Grid (Synced with citizen-history) */}
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 bg-white dark:bg-sidebar border border-sidebar-border rounded-xl p-5 shadow-sm">
                                        <InfoRow label="Settlement UUID" value={selectedRecord.sett_uuid} highlight />
                                        <InfoRow label="Record Number" value={`#${selectedRecord.id}`} />
                                        <InfoRow label="Date of Settlement" value={selectedRecord.dateOfSettlement} />
                                        <InfoRow label="Mediator / Lupon" value={selectedRecord.mediator || 'N/A'} />
                                        <InfoRow label="Complainants" value={`${selectedRecord.complainants?.length || 0} Person(s)`} />
                                        <InfoRow label="Respondents" value={`${selectedRecord.linked_histories?.length || 0} Linked Record(s)`} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Complainants List */}
                                        <div className="bg-white dark:bg-sidebar border border-sidebar-border rounded-xl p-5 shadow-sm space-y-4">
                                            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 border-b border-sidebar-border/50 pb-2">
                                                <ShieldAlert className="size-4.5" /> 
                                                <span className="text-sm font-bold uppercase tracking-wider">Complainants ({selectedRecord.complainants?.length || 0})</span>
                                            </div>
                                            <div className="space-y-3">
                                                {selectedRecord.complainants?.map(comp => (
                                                    <div key={comp.id} className="flex flex-col bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg border border-sidebar-border/50 gap-2">
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                                                                    {comp.first_name} {comp.middle_name ? `${comp.middle_name} ` : ''}{comp.last_name}
                                                                </span>
                                                                {comp.ctz_id && (
                                                                    <button 
                                                                        onClick={(e) => handleOpenQuickView(e, comp.ctz_id)}
                                                                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all shadow-sm border border-rose-100 dark:border-rose-900/30 group"
                                                                        title="Quick View Record"
                                                                    >
                                                                        <Info className="size-3 group-hover:scale-110 transition-transform" />
                                                                        <span className="text-[9px] font-bold uppercase tracking-tight">Quick View</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {comp.citizen_id ? (
                                                                <span className="text-[10px] font-mono bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded border border-rose-100 dark:border-rose-900/50 shadow-sm font-bold">
                                                                    {comp.citizen_id}
                                                                </span>
                                                            ) : (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 font-medium">
                                                                        Manual Entry
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {comp.comp_description && (
                                                            <p className="text-[10px] text-neutral-500 italic border-l-2 border-rose-200 pl-2 py-0.5">
                                                                "{comp.comp_description}"
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Linked Histories / Complainees List */}
                                        <div className="bg-white dark:bg-sidebar border border-sidebar-border rounded-xl p-5 shadow-sm space-y-4">
                                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 border-b border-sidebar-border/50 pb-2">
                                                <FileText className="size-4.5" /> 
                                                <span className="text-sm font-bold uppercase tracking-wider">Respondents / Complainees ({selectedRecord.linked_histories?.length || 0})</span>
                                            </div>
                                            <div className="space-y-3">
                                                {selectedRecord.linked_histories?.length === 0 ? (
                                                    <p className="text-xs text-neutral-400 italic py-2">No history records linked.</p>
                                                ) : selectedRecord.linked_histories?.map(sub => (
                                                    <div key={sub.id} className="flex flex-col gap-1.5 bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg border border-sidebar-border/50 hover:border-amber-200 transition-colors">
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                    <span className="font-bold text-neutral-900 dark:text-neutral-100 lowercase first-letter:uppercase truncate block">
                                                                        {sub.first_name} {sub.last_name}
                                                                    </span>
                                                                    {sub.ctz_id && (
                                                                        <button 
                                                                            onClick={(e) => handleOpenQuickView(e, sub.ctz_id)}
                                                                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all shadow-sm border border-blue-100 dark:border-blue-900/30 group"
                                                                            title="Quick View Profile"
                                                                        >
                                                                            <User className="size-3 group-hover:scale-110 transition-transform" />
                                                                            <span className="text-[9px] font-bold uppercase tracking-tight">Profile View</span>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    {sub.citizen_id ? (
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900/50 shadow-sm font-bold">
                                                                                {sub.citizen_id}
                                                                            </span>
                                                                            <button 
                                                                                onClick={(e) => handleOpenHistoryQuickView(e, sub.cihi_uuid)}
                                                                                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all border border-purple-100 dark:border-purple-800/50 group"
                                                                                title="View History Details"
                                                                            >
                                                                                <FileClock className="size-3 group-hover:scale-110 transition-transform" />
                                                                                <span className="text-[9px] font-bold uppercase tracking-tight">History View</span>
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 font-medium">
                                                                                Manual Entry
                                                                            </span>
                                                                            <button 
                                                                                onClick={(e) => handleOpenHistoryQuickView(e, sub.cihi_uuid)}
                                                                                className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all border border-purple-100 dark:border-purple-800/50 group"
                                                                                title="Quick View Details"
                                                                            >
                                                                                <Info className="size-3 group-hover:scale-110 transition-transform" />
                                                                                <span className="text-[9px] font-bold uppercase tracking-tight">Record View</span>
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex items-center gap-1.5 ml-1">
                                                                        <span className="text-[10px] font-mono text-neutral-500 truncate">{sub.cihi_uuid}</span>
                                                                        <span className="text-[9px] px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 rounded uppercase font-bold">{sub.type}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${sub.status === 'Pending' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                                                    {sub.status || 'Resolved'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-[10px] text-neutral-400 border-t border-neutral-100 dark:border-neutral-700/50 pt-1 mt-1">
                                                            Related to: {sub.first_name} {sub.last_name}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                                        <div className="space-y-3">
                                            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                                <ShieldAlert className="size-3.5" /> Incident / Complaint
                                            </h3>
                                            <div className="bg-neutral-50/50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 min-h-[120px] whitespace-pre-wrap font-mono relative shadow-inner">
                                                {selectedRecord.complaint_description || 'No description provided.'}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                                <Handshake className="size-3.5" /> Resolution / Settlement
                                            </h3>
                                            <div className="bg-neutral-50/50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 min-h-[120px] whitespace-pre-wrap font-mono relative shadow-inner">
                                                {selectedRecord.description || 'Pending resolution.'}
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                <div className="p-4 border-t border-sidebar-border/60 bg-neutral-50 dark:bg-neutral-900/50 flex flex-col md:flex-row justify-between items-start md:items-center text-[10px] text-neutral-400 font-mono gap-4">
                                    <div className="space-y-1">
                                        <div className="flex gap-2">
                                            <span className="font-bold w-20">DATE ENCODED:</span>
                                            <span>{selectedRecord.dateEncoded}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="font-bold w-20">ENCODED BY:</span>
                                            <span>{selectedRecord.encodedBy}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <span className="font-bold">DATE UPDATED:</span>
                                            <span>{selectedRecord.dateUpdated}</span>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <span className="font-bold">UPDATED BY:</span>
                                            <span>{selectedRecord.updatedBy}</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-sidebar-border rounded-2xl bg-neutral-50/50 text-neutral-400">
                                <Scale className="size-12 mb-2 opacity-20" />
                                <p>Select a settlement record to view details</p>
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

            <HistoryQuickView
                isOpen={historyQuickViewOpen}
                onClose={() => setHistoryQuickViewOpen(false)}
                historyUuid={historyQuickViewUuid}
                rawHistory={rawHistoryData}
            />
        </AppLayout>
    );
}

// --- Mini Statistics ---

function SettlementMiniStats({ histories }: { histories: SettlementRecord[] }) {
    const total = histories.length;

    // Summary counts
    const totalComplainants  = useMemo(() => histories.reduce((s, h) => s + (h.complainants?.length  || 0), 0), [histories]);
    const totalRespondents   = useMemo(() => histories.reduce((s, h) => s + (h.linked_histories?.length || 0), 0), [histories]);

    // Top mediators
    const topMediators = useMemo(() => {
        const map: Record<string, number> = {};
        histories.forEach(h => {
            const m = h.mediator?.trim() || 'Unknown';
            map[m] = (map[m] || 0) + 1;
        });
        return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
    }, [histories]);

    const maxMediator = topMediators[0]?.[1] ?? 1;

    // Monthly volume using dateOfSettlement
    const monthlyData = useMemo(() => {
        const map: Record<string, number> = {};
        histories.forEach(h => {
            if (!h.dateOfSettlement) return;
            const d = new Date(h.dateOfSettlement);
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

            {/* 1. Settlement Summary */}
            <div className="bg-white dark:bg-sidebar border border-sidebar-border/60 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                    <BarChart2 className="size-4 text-amber-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Summary</span>
                    <span className="ml-auto text-[10px] font-mono text-neutral-400">{total} total</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center">
                    <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-2">
                        <div className="text-xl font-black font-mono text-amber-600">{total}</div>
                        <div className="text-[9px] uppercase font-bold text-neutral-400">Cases</div>
                    </div>
                    <div className="rounded-xl bg-rose-50 dark:bg-rose-900/20 p-2">
                        <div className="text-xl font-black font-mono text-rose-600">{totalComplainants}</div>
                        <div className="text-[9px] uppercase font-bold text-neutral-400">Complainants</div>
                    </div>
                    <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-2">
                        <div className="text-xl font-black font-mono text-blue-600">{totalRespondents}</div>
                        <div className="text-[9px] uppercase font-bold text-neutral-400">Respondents</div>
                    </div>
                </div>
            </div>

            {/* 2. Top Mediators */}
            <div className="bg-white dark:bg-sidebar border border-sidebar-border/60 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                    <Handshake className="size-4 text-amber-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Top Mediators</span>
                </div>
                <div className="space-y-2">
                    {topMediators.map(([mediator, count]) => (
                        <div key={mediator} className="space-y-0.5">
                            <div className="flex justify-between text-[10px]">
                                <span className="truncate max-w-[70%] font-medium text-neutral-700 dark:text-neutral-300">{mediator}</span>
                                <span className="font-mono font-bold text-amber-600">{count}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${(count / maxMediator) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                    {topMediators.length === 0 && <p className="text-xs text-neutral-400 italic">No data.</p>}
                </div>
            </div>

            {/* 3. Monthly Volume */}
            <div className="bg-white dark:bg-sidebar border border-sidebar-border/60 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                    <TrendingUp className="size-4 text-amber-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Monthly Volume</span>
                    <span className="ml-auto text-[10px] font-mono text-neutral-400">6 mo.</span>
                </div>
                <div className="flex items-end gap-1 h-16">
                    {monthlyData.map((m) => (
                        <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full flex items-end justify-center" style={{ height: '40px' }}>
                                <div
                                    className="w-full rounded-t bg-amber-500 dark:bg-amber-600 transition-all min-h-[2px]"
                                    style={{ height: `${(m.count / maxMonthly) * 40}px` }}
                                    title={`${m.label}: ${m.count}`}
                                />
                            </div>
                            <span className="text-[9px] font-mono text-neutral-400">{m.label}</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-[9px] font-mono text-neutral-400 border-t border-sidebar-border/40 pt-1">
                    <span>0</span><span>{maxMonthly}</span>
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
            <span className={`font-semibold text-sm ${highlight ? 'text-amber-600 dark:text-amber-500 font-mono' : 'text-neutral-900 dark:text-neutral-100'} ${className}`}>
                {value}
            </span>
        </div>
    );
}
