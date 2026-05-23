import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft, Search, FileClock, User, FileText, RotateCcw, AlertTriangle, Info, Handshake
} from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import CitizenQuickView from '../../main/CitizenRecords/popup/citizen-quick-view';
import SettlementQuickView from '../../main/CitizenRecords/popup/settlement-quick-view';

interface ArchivedCitizenHistory {
    id: number;
    uuid: string;
    firstName: string;
    middleName: string;
    lastName: string;
    title: string;
    type: string;
    status: string;
    involvementType: string;
    caseClassification: string;
    description: string;
    dateRecorded: string;
    citizenId: string | null;
    ctzId: number | null;
    settlement: { id: number; uuid: string } | null;
    deleteReason: string;
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string;
    updatedBy: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Archives', href: '/archives' },
    { title: 'Citizen History', href: '/archives/citizen-history' },
];

export default function CitizenHistoryArchive({ records = [], filters = {} }: { records?: ArchivedCitizenHistory[], filters?: any }) {
    const [selected, setSelected] = useState<ArchivedCitizenHistory | null>(records[0] ?? null);
    const [search, setSearch] = useState(filters?.search || '');
    const [isDebouncing, setIsDebouncing] = useState(false);
    const [quickViewOpen, setQuickViewOpen] = useState(false);
    const [quickViewCitizenId, setQuickViewCitizenId] = useState<number | null>(null);
    const [settlementQuickViewOpen, setSettlementQuickViewOpen] = useState(false);
    const [settlementUuid, setSettlementUuid] = useState<string | null>(null);

    const handleSearch = (val: string) => {
        setSearch(val);
        setIsDebouncing(true);
        clearTimeout((window as any).__archiveSearchTimer);
        (window as any).__archiveSearchTimer = setTimeout(() => {
            router.get('/archives/citizen-history', { search: val }, { preserveState: true, preserveScroll: true, replace: true, onFinish: () => setIsDebouncing(false) });
        }, 400);
    };

    const handleRestore = (e: React.MouseEvent, record: ArchivedCitizenHistory) => {
        e.stopPropagation();
        Swal.fire({
            title: 'Restore History Record',
            text: `Restore record for "${record.firstName} ${record.lastName}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, restore!',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/archives/citizen-history/${record.id}/restore`, {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        if (selected?.id === record.id) setSelected(null);
                        Swal.fire('Restored!', 'Record has been restored successfully.', 'success');
                    },
                    onError: () => Swal.fire('Error', 'Failed to restore record.', 'error'),
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Archived Citizen History" />
            <CitizenQuickView isOpen={quickViewOpen} onClose={() => setQuickViewOpen(false)} citizenId={quickViewCitizenId} />
            <SettlementQuickView isOpen={settlementQuickViewOpen} onClose={() => setSettlementQuickViewOpen(false)} settlementUuid={settlementUuid} />

            <div className="flex flex-col h-[calc(100vh-4rem)] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">
                <div className="flex items-center gap-4 pb-2 border-b border-sidebar-border/60">
                    <Link href="/archives" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                            Archives: <span className="text-indigo-600 dark:text-indigo-400">Citizen History</span>
                        </h1>
                        <p className="text-xs text-neutral-500 mt-0.5">Soft-deleted history records — restore to reinstate</p>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                    {/* LEFT */}
                    <div className="lg:col-span-4 flex flex-col gap-4 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm overflow-hidden">
                        <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/20 border-b border-sidebar-border/60 space-y-3">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xs font-bold text-white bg-indigo-600 py-1 px-3 rounded-md uppercase tracking-wider">Archived List</h2>
                                <span className="text-[10px] text-neutral-400 font-mono">TOTAL: {records.length}</span>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                                <input type="text" placeholder="Search name..." className="w-full pl-10 pr-4 py-2 text-sm border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" value={search} onChange={(e) => handleSearch(e.target.value)} />
                                {isDebouncing && <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600"></div>}
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                            {records.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-neutral-400 gap-2">
                                    <FileClock className="size-8 opacity-20" />
                                    <p className="text-xs">No archived history records found.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {records.map((h) => (
                                        <div key={h.id} onClick={() => setSelected(h)} className={`group cursor-pointer p-4 border-b border-sidebar-border/50 border-l-4 transition-all duration-200 ${selected?.id === h.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-indigo-500' : 'border-l-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:border-l-indigo-200'}`}>
                                            <div>
                                                <h3 className={`font-bold text-sm ${selected?.id === h.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-neutral-900 dark:text-neutral-100'}`}>
                                                    {h.lastName}, {h.firstName}
                                                </h3>
                                                <p className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium inline-block mt-1">{h.type}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
                        {selected ? (
                            <div className="flex-1 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm flex flex-col overflow-hidden">

                                {/* Header */}
                                <div className="bg-neutral-50 dark:bg-neutral-900/20 border-b border-sidebar-border p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-xl ${getTypeBg(selected.type)}`}>
                                                <FileClock className={`size-8 ${getTypeText(selected.type)}`} />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{selected.title || `${selected.firstName} ${selected.lastName}`}</h2>
                                                <div className="flex items-center gap-2 mt-1 text-sm text-neutral-500">
                                                    <User className="size-3.5" />
                                                    <span className="font-medium">{selected.firstName} {selected.lastName}</span>
                                                    {selected.ctzId && (
                                                        <button onClick={(e) => { e.stopPropagation(); setQuickViewCitizenId(selected.ctzId); setQuickViewOpen(true); }} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all shadow-sm border border-neutral-200 dark:border-neutral-700 group ml-2">
                                                            <Info className="size-3" />
                                                            <span className="text-[9px] font-bold uppercase tracking-tight">Quick View</span>
                                                        </button>
                                                    )}
                                                    <span className="font-mono bg-white dark:bg-black/20 border px-1.5 rounded text-xs ml-2">{selected.citizenId}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getTypeColor(selected.type)}`}>{selected.type}</span>
                                                    <span className="text-xs font-bold px-2 py-0.5 rounded border bg-red-50 text-red-600 border-red-100">ARCHIVED</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={(e) => handleRestore(e, selected)} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all hover:shadow-md">
                                            <RotateCcw className="size-3.5" /> Restore
                                        </button>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {/* Archive Reason Banner */}
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                                        <AlertTriangle className="size-5 text-red-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-1">Archive Reason</p>
                                            <p className="text-sm text-red-700 dark:text-red-300">{selected.deleteReason}</p>
                                        </div>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 bg-white dark:bg-sidebar border border-sidebar-border rounded-xl p-5 shadow-sm">
                                        <InfoRow label="History ID" value={selected.uuid} highlight />
                                        <InfoRow label="Date Recorded" value={selected.dateRecorded} />
                                        <InfoRow label="History Type" value={selected.type} className={getTypeText(selected.type)} />
                                        <InfoRow label="Current Status" value={selected.status} />
                                        <InfoRow label="Involvement" value={selected.involvementType || 'N/A'} />
                                        <InfoRow label="Classification" value={selected.caseClassification || 'N/A'} />
                                        {selected.settlement && (
                                            <div className="col-span-2 flex justify-between border-b border-sidebar-border/50 pb-1 mt-2">
                                                <span className="text-neutral-500 font-medium text-sm">Linked Settlement:</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-mono bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-100 dark:border-amber-800 font-bold shadow-sm">
                                                        {selected.settlement.uuid}
                                                    </span>
                                                    <button onClick={(e) => { e.stopPropagation(); setSettlementUuid(selected.settlement!.uuid); setSettlementQuickViewOpen(true); }} className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-all shadow-sm group">
                                                        <Handshake className="size-3" />
                                                        <span className="text-[9px] font-bold uppercase tracking-tight">Quick View</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                            <FileText className="size-3.5" /> Full Description
                                        </h3>
                                        <div className="bg-neutral-50/50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 min-h-[150px]">
                                            {selected.description}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="p-4 border-t border-sidebar-border/60 bg-neutral-50 dark:bg-neutral-900/50 flex flex-col md:flex-row justify-between items-start md:items-center text-[10px] text-neutral-400 font-mono gap-4">
                                    <div className="space-y-1">
                                        <div className="flex gap-2"><span className="font-bold w-28">DATE ENCODED:</span><span>{selected.dateEncoded}</span></div>
                                        <div className="flex gap-2"><span className="font-bold w-28">ENCODED BY:</span><span>{selected.encodedBy}</span></div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <div className="flex gap-2 justify-end"><span className="font-bold">DATE ARCHIVED:</span><span>{selected.dateUpdated}</span></div>
                                        <div className="flex gap-2 justify-end"><span className="font-bold">ARCHIVED BY:</span><span>{selected.updatedBy}</span></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-sidebar-border rounded-2xl bg-neutral-50/50 text-neutral-400">
                                <FileClock className="size-12 mb-2 opacity-20" />
                                <p>Select an archived record to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function InfoRow({ label, value, highlight = false, className = '' }: { label: string; value: string; highlight?: boolean; className?: string }) {
    return (
        <div className="flex justify-between border-b border-sidebar-border/50 pb-1">
            <span className="text-neutral-500 font-medium text-sm">{label}:</span>
            <span className={`font-semibold text-sm ${highlight ? 'text-indigo-600 dark:text-indigo-400 font-mono' : 'text-neutral-900 dark:text-neutral-100'} ${className}`}>
                {value || '—'}
            </span>
        </div>
    );
}

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
