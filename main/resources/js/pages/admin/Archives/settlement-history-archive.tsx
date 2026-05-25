import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Search, ScrollText, User, RotateCcw, AlertTriangle, Scale, Info, FileClock, ShieldAlert, Handshake, FileText } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import CitizenQuickView from '../../main/CitizenRecords/popup/citizen-quick-view';
import HistoryQuickView from '../../main/CitizenRecords/popup/history-quick-view';

interface Complainant {
    id: number;
    name: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    ctzId: number | null;
    citizenId: string | null;
    compDescription: string | null;
}
interface Respondent {
    id: number;
    name: string;
    firstName: string;
    lastName: string;
    ctzId: number | null;
    cihi_uuid: string;
    citizenId: string | null;
    type: string;
    status: string;
    title: string;
}
interface ArchivedSettlement {
    id: number;
    uuid: string;
    complainantFirstName: string;
    complainantLastName: string;
    complainantCount: number;
    complainantDescription: string;
    complaintDescription: string;
    settlementDescription: string;
    dateOfSettlement: string;
    mediator: string;
    complainants: Complainant[];
    respondents: Respondent[];
    deleteReason: string;
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string;
    updatedBy: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Archives', href: '/archives' },
    { title: 'Settlement History', href: '/archives/settlement-history' },
];

export default function SettlementHistoryArchive({ records = [], filters = {} }: { records?: ArchivedSettlement[], filters?: any }) {
    const [selected, setSelected] = useState<ArchivedSettlement | null>(records[0] ?? null);
    const [search, setSearch] = useState(filters?.search || '');
    const [isDebouncing, setIsDebouncing] = useState(false);
    const [citizenQuickViewOpen, setCitizenQuickViewOpen] = useState(false);
    const [selectedCitizenId, setSelectedCitizenId] = useState<number | null>(null);
    const [historyQuickViewOpen, setHistoryQuickViewOpen] = useState(false);
    const [historyQuickViewUuid, setHistoryQuickViewUuid] = useState<string | null>(null);

    const handleSearch = (val: string) => {
        setSearch(val);
        setIsDebouncing(true);
        clearTimeout((window as any).__archiveSearchTimer);
        (window as any).__archiveSearchTimer = setTimeout(() => {
            router.get('/archives/settlement-history', { search: val }, { preserveState: true, preserveScroll: true, replace: true, onFinish: () => setIsDebouncing(false) });
        }, 400);
    };

    const handleRestore = (e: React.MouseEvent, record: ArchivedSettlement) => {
        e.stopPropagation();
        Swal.fire({ title: 'Restore Settlement Record', text: `Restore settlement ${record.uuid}?`, icon: 'question', showCancelButton: true, confirmButtonColor: '#16a34a', cancelButtonColor: '#6b7280', confirmButtonText: 'Yes, restore!' })
            .then((result) => {
                if (result.isConfirmed) {
                    router.post(`/archives/settlement-history/${record.id}/restore`, {}, {
                        preserveScroll: true,
                        onSuccess: () => { if (selected?.id === record.id) setSelected(null); Swal.fire('Restored!', 'Settlement record has been restored.', 'success'); },
                        onError: () => Swal.fire('Error', 'Failed to restore.', 'error'),
                    });
                }
            });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Archived Settlement History" />
            <CitizenQuickView isOpen={citizenQuickViewOpen} onClose={() => setCitizenQuickViewOpen(false)} citizenId={selectedCitizenId} />
            <HistoryQuickView isOpen={historyQuickViewOpen} onClose={() => setHistoryQuickViewOpen(false)} historyUuid={historyQuickViewUuid} rawHistory={null} />
            <div className="flex flex-col h-[calc(100vh-4rem)] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">
                <div className="flex items-center gap-4 pb-2 border-b border-sidebar-border/60">
                    <Link href="/archives" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                            Archives: <span className="text-purple-600 dark:text-purple-400">Settlement History</span>
                        </h1>
                        <p className="text-xs text-neutral-500 mt-0.5">Soft-deleted settlement records — restore to reinstate</p>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                    {/* LEFT */}
                    <div className="lg:col-span-4 flex flex-col bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm overflow-hidden">
                        <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/20 border-b border-sidebar-border/60 space-y-3">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xs font-bold text-white bg-purple-600 py-1 px-3 rounded-md uppercase tracking-wider">Archived Settlements</h2>
                                <span className="text-[10px] text-neutral-400 font-mono">TOTAL: {records.length}</span>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                                <input type="text" placeholder="Search UUID or complainant..." className="w-full pl-10 pr-4 py-2 text-sm border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all" value={search} onChange={(e) => handleSearch(e.target.value)} />
                                {isDebouncing && <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin rounded-full h-3 w-3 border-b-2 border-purple-500"></div>}
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                            {records.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-neutral-400 gap-2"><Scale className="size-8 opacity-20" /><p className="text-xs">No archived settlements found.</p></div>
                            ) : (
                                <div className="flex flex-col">
                                    {records.map((s) => (
                                        <div key={s.id} onClick={() => setSelected(s)} className={`group cursor-pointer p-4 border-b border-sidebar-border/50 border-l-4 transition-all duration-200 ${selected?.id === s.id ? 'bg-purple-50 dark:bg-purple-900/20 border-l-purple-500' : 'border-l-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:border-l-purple-200'}`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className={`font-bold text-sm ${selected?.id === s.id ? 'text-purple-700 dark:text-purple-300' : 'text-neutral-900 dark:text-neutral-100'}`}>
                                                        {s.complainantFirstName} {s.complainantLastName}
                                                        {s.complainantCount > 1 && <span className="text-[10px] text-purple-400 font-medium ml-1">+{s.complainantCount - 1} more</span>}
                                                    </h3>
                                                    <p className="text-xs text-neutral-500 font-mono mt-0.5">{s.uuid}</p>
                                                </div>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">{s.dateOfSettlement}</span>
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
                                <div className="bg-neutral-50 dark:bg-neutral-900/20 border-b border-sidebar-border p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/20"><Handshake className="size-8 text-purple-600 dark:text-purple-400" /></div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Settlement Details</h2>
                                                <div className="flex items-center gap-2 mt-1 text-sm text-neutral-500">
                                                    <Scale className="size-3.5" />
                                                    <span className="font-medium">#{selected.id} • {selected.dateOfSettlement}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="font-mono text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded">{selected.uuid}</span>
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-100 text-red-700">ARCHIVED</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={(e) => handleRestore(e, selected)} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all hover:shadow-md">
                                            <RotateCcw className="size-3.5" /> Restore
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                                        <AlertTriangle className="size-5 text-red-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-1">Archive Reason</p>
                                            <p className="text-sm text-red-700 dark:text-red-300">{selected.deleteReason}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 bg-white dark:bg-sidebar border border-sidebar-border rounded-xl p-5 shadow-sm">
                                        <InfoRow label="Settlement UUID" value={selected.uuid} highlight />
                                        <InfoRow label="Record Number" value={`#${selected.id}`} />
                                        <InfoRow label="Date of Settlement" value={selected.dateOfSettlement} />
                                        <InfoRow label="Mediator / Lupon" value={selected.mediator} />
                                        <InfoRow label="Complainants" value={`${selected.complainantCount} Person(s)`} />
                                        <InfoRow label="Respondents" value={`${selected.respondents.length} Linked Record(s)`} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Complainants */}
                                        <div className="bg-white dark:bg-sidebar border border-sidebar-border rounded-xl p-5 shadow-sm space-y-4">
                                            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 border-b border-sidebar-border/50 pb-2">
                                                <ShieldAlert className="size-4" />
                                                <span className="text-sm font-bold uppercase tracking-wider">Complainants ({selected.complainantCount})</span>
                                            </div>
                                            <div className="space-y-3">
                                                {selected.complainants.map((c) => (
                                                    <div key={c.id} className="flex flex-col bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg border border-sidebar-border/50 gap-2">
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                                                                    {c.firstName} {c.middleName ? `${c.middleName} ` : ''}{c.lastName}
                                                                </span>
                                                                {c.ctzId && (
                                                                    <button onClick={() => { setSelectedCitizenId(c.ctzId); setCitizenQuickViewOpen(true); }} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 hover:bg-rose-100 transition-all shadow-sm border border-rose-100 dark:border-rose-900/30">
                                                                        <Info className="size-3" />
                                                                        <span className="text-[9px] font-bold uppercase tracking-tight">Quick View</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {c.citizenId ? (
                                                                <span className="text-[10px] font-mono bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded border border-rose-100 dark:border-rose-900/50 font-bold">{c.citizenId}</span>
                                                            ) : (
                                                                <span className="text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">Manual Entry</span>
                                                            )}
                                                        </div>
                                                        {c.compDescription && (
                                                            <p className="text-[10px] text-neutral-500 italic border-l-2 border-rose-200 pl-2 py-0.5">"{c.compDescription}"</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Respondents */}
                                        <div className="bg-white dark:bg-sidebar border border-sidebar-border rounded-xl p-5 shadow-sm space-y-4">
                                            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 border-b border-sidebar-border/50 pb-2">
                                                <FileText className="size-4" />
                                                <span className="text-sm font-bold uppercase tracking-wider">Respondents / Complainees ({selected.respondents.length})</span>
                                            </div>
                                            <div className="space-y-3">
                                                {selected.respondents.length === 0 ? (
                                                    <p className="text-xs text-neutral-400 italic py-2">No history records linked.</p>
                                                ) : selected.respondents.map((r) => (
                                                    <div key={r.id} className="flex flex-col gap-1.5 bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg border border-sidebar-border/50 hover:border-purple-200 transition-colors">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                    <span className="font-bold text-neutral-900 dark:text-neutral-100 truncate">{r.firstName} {r.lastName}</span>
                                                                    {r.ctzId && (
                                                                        <button onClick={() => { setSelectedCitizenId(r.ctzId); setCitizenQuickViewOpen(true); }} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 transition-all shadow-sm border border-blue-100 dark:border-blue-900/30">
                                                                            <User className="size-3" />
                                                                            <span className="text-[9px] font-bold uppercase tracking-tight">Profile View</span>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                                    {r.citizenId ? (
                                                                        <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-100 font-bold">{r.citizenId}</span>
                                                                    ) : (
                                                                        <span className="text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">Manual Entry</span>
                                                                    )}
                                                                    <button onClick={() => { setHistoryQuickViewUuid(r.cihi_uuid); setHistoryQuickViewOpen(true); }} className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 hover:bg-purple-100 transition-all border border-purple-100 dark:border-purple-800/50">
                                                                        <FileClock className="size-3" />
                                                                        <span className="text-[9px] font-bold uppercase tracking-tight">History View</span>
                                                                    </button>
                                                                    <span className="text-[10px] font-mono text-neutral-500 truncate">{r.cihi_uuid}</span>
                                                                    <span className="text-[9px] px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-400 rounded uppercase font-bold">{r.type}</span>
                                                                </div>
                                                            </div>
                                                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ml-2 ${r.status === 'Pending' ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'}`}>{r.status || 'Resolved'}</span>
                                                        </div>
                                                        <div className="text-[10px] text-neutral-400 border-t border-sidebar-border/50 pt-1.5 mt-0.5">Related to: {r.firstName} {r.lastName}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                                        <div className="space-y-3">
                                            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2"><ShieldAlert className="size-3.5" /> Incident / Complaint</h3>
                                            <div className="bg-neutral-50/50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 min-h-[120px] whitespace-pre-wrap font-mono shadow-inner">{selected.complaintDescription || <span className="text-neutral-400 italic font-sans">No description provided.</span>}</div>
                                        </div>
                                        <div className="space-y-3">
                                            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2"><Handshake className="size-3.5" /> Resolution / Settlement</h3>
                                            <div className="bg-neutral-50/50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 min-h-[120px] whitespace-pre-wrap font-mono shadow-inner">{selected.settlementDescription || <span className="text-neutral-400 italic font-sans">Pending resolution.</span>}</div>
                                        </div>
                                    </div>
                                </div>

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
                                <Scale className="size-12 mb-2 opacity-20" /><p>Select an archived settlement to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function InfoRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className="flex justify-between border-b border-sidebar-border/50 pb-1">
            <span className="text-neutral-500 font-medium text-sm">{label}:</span>
            <span className={`font-semibold text-sm ${highlight ? 'text-purple-600 dark:text-purple-400 font-mono' : 'text-neutral-900 dark:text-neutral-100'}`}>{value || '—'}</span>
        </div>
    );
}
