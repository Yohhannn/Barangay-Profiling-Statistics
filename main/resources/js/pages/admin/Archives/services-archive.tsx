import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Search, FolderOpen, User, FileText, RotateCcw, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

interface ArchivedService {
    id: number;
    transactionId: string;
    transactionType: string;
    status: string;
    purpose: string;
    citizenName: string;
    citizenId: string | null;
    deleteReason: string;
    dateRequested: string;
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string;
    updatedBy: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Archives', href: '/archives' },
    { title: 'Services', href: '/archives/services' },
];

const statusColor = (status: string) => {
    switch (status) {
        case 'Completed': return 'bg-green-100 text-green-700';
        case 'Pending': return 'bg-yellow-100 text-yellow-700';
        case 'Rejected': return 'bg-red-100 text-red-700';
        default: return 'bg-neutral-100 text-neutral-600';
    }
};

export default function ServicesArchive({ records = [], filters = {} }: { records?: ArchivedService[], filters?: any }) {
    const [selected, setSelected] = useState<ArchivedService | null>(records[0] ?? null);
    const [search, setSearch] = useState(filters?.search || '');
    const [isDebouncing, setIsDebouncing] = useState(false);

    const handleSearch = (val: string) => {
        setSearch(val);
        setIsDebouncing(true);
        clearTimeout((window as any).__archiveSearchTimer);
        (window as any).__archiveSearchTimer = setTimeout(() => {
            router.get('/archives/services', { search: val }, { preserveState: true, preserveScroll: true, replace: true, onFinish: () => setIsDebouncing(false) });
        }, 400);
    };

    const handleRestore = (e: React.MouseEvent, record: ArchivedService) => {
        e.stopPropagation();
        Swal.fire({ title: 'Restore Transaction', text: `Restore transaction ${record.transactionId}?`, icon: 'question', showCancelButton: true, confirmButtonColor: '#16a34a', cancelButtonColor: '#6b7280', confirmButtonText: 'Yes, restore!' })
            .then((result) => {
                if (result.isConfirmed) {
                    router.post(`/archives/services/${record.id}/restore`, {}, {
                        preserveScroll: true,
                        onSuccess: () => { if (selected?.id === record.id) setSelected(null); Swal.fire('Restored!', 'Transaction has been restored.', 'success'); },
                        onError: () => Swal.fire('Error', 'Failed to restore.', 'error'),
                    });
                }
            });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Archived Services" />
            <div className="flex flex-col h-[calc(100vh-4rem)] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">
                <div className="flex items-center gap-4 pb-2 border-b border-sidebar-border/60">
                    <Link href="/archives" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                            Archives: <span className="text-yellow-600 dark:text-yellow-400">Services</span>
                        </h1>
                        <p className="text-xs text-neutral-500 mt-0.5">Soft-deleted transaction records — restore to reinstate</p>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                    {/* LEFT */}
                    <div className="lg:col-span-4 flex flex-col bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm overflow-hidden">
                        <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/20 border-b border-sidebar-border/60 space-y-3">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xs font-bold text-white bg-yellow-600 py-1 px-3 rounded-md uppercase tracking-wider">Archived Transactions</h2>
                                <span className="text-[10px] text-neutral-400 font-mono">TOTAL: {records.length}</span>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                                <input type="text" placeholder="Search transaction ID or type..." className="w-full pl-10 pr-4 py-2 text-sm border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 transition-all" value={search} onChange={(e) => handleSearch(e.target.value)} />
                                {isDebouncing && <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-500"></div>}
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                            {records.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-neutral-400 gap-2"><FolderOpen className="size-8 opacity-20" /><p className="text-xs">No archived transactions found.</p></div>
                            ) : (
                                <div className="flex flex-col">
                                    {records.map((t) => (
                                        <div key={t.id} onClick={() => setSelected(t)} className={`group cursor-pointer p-4 border-b border-sidebar-border/50 border-l-4 transition-all duration-200 ${selected?.id === t.id ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-yellow-500' : 'border-l-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:border-l-yellow-200'}`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className={`font-bold text-sm ${selected?.id === t.id ? 'text-yellow-700 dark:text-yellow-300' : 'text-neutral-900 dark:text-neutral-100'}`}>{t.transactionType}</h3>
                                                    <p className="text-xs text-neutral-500 font-mono mt-0.5">{t.transactionId}</p>
                                                    <p className="text-xs text-neutral-500 mt-0.5">{t.citizenName}</p>
                                                </div>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor(t.status)}`}>{t.status}</span>
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
                                            <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/20"><FolderOpen className="size-8 text-yellow-600 dark:text-yellow-400" /></div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{selected.transactionType}</h2>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="font-mono text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-0.5 rounded">{selected.transactionId}</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusColor(selected.status)}`}>{selected.status}</span>
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

                                    <div className="flex items-start gap-3 p-4 bg-neutral-50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl">
                                        <User className="size-4 text-neutral-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Requesting Citizen</p>
                                            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{selected.citizenName}</p>
                                            {selected.citizenId && <p className="text-xs text-neutral-500 font-mono">{selected.citizenId}</p>}
                                        </div>
                                    </div>

                                    {selected.purpose && (
                                        <div className="space-y-2">
                                            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2"><FileText className="size-3.5" /> Purpose / Remarks</h3>
                                            <div className="bg-neutral-50/50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{selected.purpose}</div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <InfoCard label="Transaction Type" value={selected.transactionType} />
                                        <InfoCard label="Status" value={selected.status} />
                                        <InfoCard label="Date Requested" value={selected.dateRequested} />
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
                                <FolderOpen className="size-12 mb-2 opacity-20" /><p>Select an archived transaction to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function InfoCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-neutral-50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-4">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{value || '—'}</p>
        </div>
    );
}
