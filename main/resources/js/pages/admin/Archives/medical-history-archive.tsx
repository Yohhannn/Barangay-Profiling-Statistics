import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Search, Stethoscope, User, FileText, RotateCcw, AlertTriangle, Info, Activity } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import CitizenQuickView from '../../main/CitizenRecords/popup/citizen-quick-view';

interface ArchivedMedical {
    id: number;
    uuid: string;
    firstName: string;
    middleName: string;
    lastName: string;
    type: string;
    description: string;
    dateDiagnosed: string;
    citizenId: string | null;
    ctzId: number | null;
    deleteReason: string;
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string;
    updatedBy: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Archives', href: '/archives' },
    { title: 'Medical History', href: '/archives/medical-history' },
];

export default function MedicalHistoryArchive({ records = [], filters = {} }: { records?: ArchivedMedical[], filters?: any }) {
    const [selected, setSelected] = useState<ArchivedMedical | null>(records[0] ?? null);
    const [search, setSearch] = useState(filters?.search || '');
    const [isDebouncing, setIsDebouncing] = useState(false);
    const [citizenQuickViewOpen, setCitizenQuickViewOpen] = useState(false);
    const [selectedCitizenId, setSelectedCitizenId] = useState<number | null>(null);

    const handleSearch = (val: string) => {
        setSearch(val);
        setIsDebouncing(true);
        clearTimeout((window as any).__archiveSearchTimer);
        (window as any).__archiveSearchTimer = setTimeout(() => {
            router.get('/archives/medical-history', { search: val }, { preserveState: true, preserveScroll: true, replace: true, onFinish: () => setIsDebouncing(false) });
        }, 400);
    };

    const handleRestore = (e: React.MouseEvent, record: ArchivedMedical) => {
        e.stopPropagation();
        Swal.fire({ title: 'Restore Medical Record', text: `Restore record ${record.uuid}?`, icon: 'question', showCancelButton: true, confirmButtonColor: '#16a34a', cancelButtonColor: '#6b7280', confirmButtonText: 'Yes, restore!' })
            .then((result) => {
                if (result.isConfirmed) {
                    router.post(`/archives/medical-history/${record.id}/restore`, {}, {
                        preserveScroll: true,
                        onSuccess: () => { if (selected?.id === record.id) setSelected(null); Swal.fire('Restored!', 'Medical record has been restored.', 'success'); },
                        onError: () => Swal.fire('Error', 'Failed to restore.', 'error'),
                    });
                }
            });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Archived Medical History" />
            <CitizenQuickView isOpen={citizenQuickViewOpen} onClose={() => setCitizenQuickViewOpen(false)} citizenId={selectedCitizenId} />
            <div className="flex flex-col h-[calc(100vh-4rem)] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">
                <div className="flex items-center gap-4 pb-2 border-b border-sidebar-border/60">
                    <Link href="/archives" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                            Archives: <span className="text-rose-600 dark:text-rose-400">Medical History</span>
                        </h1>
                        <p className="text-xs text-neutral-500 mt-0.5">Soft-deleted health records — restore to reinstate</p>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                    {/* LEFT */}
                    <div className="lg:col-span-4 flex flex-col bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm overflow-hidden">
                        <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/20 border-b border-sidebar-border/60 space-y-3">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xs font-bold text-white bg-rose-600 py-1 px-3 rounded-md uppercase tracking-wider">Archived Records</h2>
                                <span className="text-[10px] text-neutral-400 font-mono">TOTAL: {records.length}</span>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                                <input type="text" placeholder="Search patient name or ID..." className="w-full pl-10 pr-4 py-2 text-sm border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all" value={search} onChange={(e) => handleSearch(e.target.value)} />
                                {isDebouncing && <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin rounded-full h-3 w-3 border-b-2 border-rose-500"></div>}
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                            {records.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-neutral-400 gap-2"><Stethoscope className="size-8 opacity-20" /><p className="text-xs">No archived medical records found.</p></div>
                            ) : (
                                <div className="flex flex-col">
                                    {records.map((m) => (
                                        <div key={m.id} onClick={() => setSelected(m)} className={`group cursor-pointer p-4 border-b border-sidebar-border/50 border-l-4 transition-all duration-200 ${selected?.id === m.id ? 'bg-rose-50 dark:bg-rose-900/20 border-l-rose-500' : 'border-l-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:border-l-rose-200'}`}>
                                            <div>
                                                <h3 className={`font-bold text-sm ${selected?.id === m.id ? 'text-rose-700 dark:text-rose-300' : 'text-neutral-900 dark:text-neutral-100'}`}>
                                                    {m.lastName}, {m.firstName}
                                                </h3>
                                                <p className="text-xs text-neutral-500 font-mono mt-0.5">{m.uuid}</p>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-medium">{m.type}</span>
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
                                            <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/20"><Stethoscope className="size-8 text-rose-600 dark:text-rose-400" /></div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{selected.type}</h2>
                                                <div className="flex items-center gap-2 mt-1 text-sm text-neutral-500">
                                                    <User className="size-3.5" />
                                                    <span className="font-medium">{selected.firstName} {selected.lastName}</span>
                                                    {selected.ctzId && (
                                                        <button onClick={(e) => { e.stopPropagation(); setSelectedCitizenId(selected.ctzId); setCitizenQuickViewOpen(true); }} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all shadow-sm border border-neutral-200 dark:border-neutral-700 group ml-2">
                                                            <Info className="size-3" />
                                                            <span className="text-[9px] font-bold uppercase tracking-tight">Quick View</span>
                                                        </button>
                                                    )}
                                                    <span className="font-mono bg-white dark:bg-black/20 border px-1.5 rounded text-xs ml-2">{selected.citizenId}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
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
                                        <InfoRow label="Record ID" value={selected.uuid} highlight />
                                        <InfoRow label="Date Diagnosed" value={selected.dateDiagnosed} />
                                        <InfoRow label="Medical Type" value={selected.type} className="text-rose-600 dark:text-rose-400 font-bold" />
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2"><Activity className="size-3.5" /> Medical Details / Observations</h3>
                                        <div className="bg-neutral-50/50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 min-h-[150px]">
                                            {selected.description || <span className="text-neutral-400 italic">No description provided.</span>}
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
                                <Stethoscope className="size-12 mb-2 opacity-20" /><p>Select an archived record to view details</p>
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
            <span className={`font-semibold text-sm ${highlight ? 'text-rose-600 dark:text-rose-400 font-mono' : 'text-neutral-900 dark:text-neutral-100'} ${className}`}>{value || '—'}</span>
        </div>
    );
}
