import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Search, Store, Users, MapPin, FileText, RotateCcw, AlertTriangle, BadgeCheck, Info } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import CitizenQuickView from '../../main/CitizenRecords/popup/citizen-quick-view';

interface Owner { id: number; fullName: string; ctzId: number | null; ctzUuid: string | null; }
interface ArchivedBusiness {
    id: number;
    businessId: string;
    businessName: string;
    businessType: string;
    status: string;
    sitio: string;
    address: string;
    description: string;
    primaryOwner: string;
    owners: Owner[];
    deleteReason: string;
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string;
    updatedBy: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Archives', href: '/archives' },
    { title: 'Business', href: '/archives/business' },
];

export default function BusinessArchive({ records = [], filters = {} }: { records?: ArchivedBusiness[], filters?: any }) {
    const [selected, setSelected] = useState<ArchivedBusiness | null>(records[0] ?? null);
    const [search, setSearch] = useState(filters?.search || '');
    const [isDebouncing, setIsDebouncing] = useState(false);
    const [citizenQuickViewOpen, setCitizenQuickViewOpen] = useState(false);
    const [selectedCitizenId, setSelectedCitizenId] = useState<number | null>(null);

    const handleSearch = (val: string) => {
        setSearch(val);
        setIsDebouncing(true);
        clearTimeout((window as any).__archiveSearchTimer);
        (window as any).__archiveSearchTimer = setTimeout(() => {
            router.get('/archives/business', { search: val }, { preserveState: true, preserveScroll: true, replace: true, onFinish: () => setIsDebouncing(false) });
        }, 400);
    };

    const handleRestore = (e: React.MouseEvent, record: ArchivedBusiness) => {
        e.stopPropagation();
        Swal.fire({ title: 'Restore Business', text: `Restore "${record.businessName}"?`, icon: 'question', showCancelButton: true, confirmButtonColor: '#16a34a', cancelButtonColor: '#6b7280', confirmButtonText: 'Yes, restore!' })
            .then((result) => {
                if (result.isConfirmed) {
                    router.post(`/archives/business/${record.id}/restore`, {}, {
                        preserveScroll: true,
                        onSuccess: () => { if (selected?.id === record.id) setSelected(null); Swal.fire('Restored!', 'Business has been restored.', 'success'); },
                        onError: () => Swal.fire('Error', 'Failed to restore.', 'error'),
                    });
                }
            });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Archived Businesses" />
            <CitizenQuickView isOpen={citizenQuickViewOpen} onClose={() => setCitizenQuickViewOpen(false)} citizenId={selectedCitizenId} />

            <div className="flex flex-col h-[calc(100vh-4rem)] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">
                <div className="flex items-center gap-4 pb-2 border-b border-sidebar-border/60">
                    <Link href="/archives" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                            Archives: <span className="text-emerald-600 dark:text-emerald-400">Business</span>
                        </h1>
                        <p className="text-xs text-neutral-500 mt-0.5">Soft-deleted business records — restore to reinstate</p>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                    {/* LEFT */}
                    <div className="lg:col-span-4 flex flex-col bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm overflow-hidden">
                        <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/20 border-b border-sidebar-border/60 space-y-3">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xs font-bold text-white bg-emerald-600 py-1 px-3 rounded-md uppercase tracking-wider">Archived Businesses</h2>
                                <span className="text-[10px] text-neutral-400 font-mono">TOTAL: {records.length}</span>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                                <input type="text" placeholder="Search business name or ID..." className="w-full pl-10 pr-4 py-2 text-sm border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" value={search} onChange={(e) => handleSearch(e.target.value)} />
                                {isDebouncing && <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin rounded-full h-3 w-3 border-b-2 border-emerald-500"></div>}
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                            {records.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-neutral-400 gap-2"><Store className="size-8 opacity-20" /><p className="text-xs">No archived businesses found.</p></div>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-[10px] text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-800/50 sticky top-0 z-10 backdrop-blur-sm">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold border-b border-sidebar-border">ID</th>
                                            <th className="px-4 py-3 font-semibold border-b border-sidebar-border">Business Name</th>
                                            <th className="px-4 py-3 font-semibold border-b border-sidebar-border text-right">Owner</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-sidebar-border/50">
                                        {records.map((b) => (
                                            <tr key={b.id} onClick={() => setSelected(b)} className={`cursor-pointer transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/10 ${selected?.id === b.id ? 'bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-l-emerald-500' : 'border-l-4 border-l-transparent'}`}>
                                                <td className="px-4 py-3 font-mono text-xs text-neutral-500">{b.businessId}</td>
                                                <td className="px-4 py-3"><div className="font-bold text-neutral-900 dark:text-neutral-100 truncate max-w-[120px]">{b.businessName}</div></td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="text-xs text-neutral-600 truncate max-w-[80px]">{b.primaryOwner}</span>
                                                        <button onClick={(e) => handleRestore(e, b)} className="text-neutral-400 hover:text-green-600 transition-colors p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"><RotateCcw className="size-3" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                                            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/20"><Store className="size-8 text-emerald-600 dark:text-emerald-400" /></div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{selected.businessName}</h2>
                                                <div className="flex items-center gap-2 mt-1 text-sm text-neutral-500">
                                                    <Users className="size-3.5" />
                                                    <span className="font-medium">{selected.owners.length} Owner{selected.owners.length !== 1 ? 's' : ''}</span>
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold ml-2 bg-red-100 text-red-700">ARCHIVED</span>
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
                                        <InfoRow label="Business ID" value={selected.businessId} highlight />
                                        <InfoRow label="Business Type" value={selected.businessType} />
                                        <InfoRow label="Status" value={selected.status} />
                                        <InfoRow label="Sitio / Location" value={selected.sitio} />
                                        <div className="col-span-2 pt-2 border-t border-dashed border-sidebar-border">
                                            <div className="flex gap-2">
                                                <MapPin className="size-4 text-neutral-400 mt-0.5" />
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-neutral-500 uppercase">Full Address</span>
                                                    <span className="text-sm text-neutral-800 dark:text-neutral-200">{selected.address}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2"><Users className="size-3.5" /> Business Owners ({selected.owners.length})</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {selected.owners.map((owner, idx) => (
                                                <div key={owner.id} className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900/30 border border-sidebar-border rounded-xl">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold text-xs shrink-0">{idx + 1}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-semibold text-sm truncate">{owner.fullName}</p>
                                                            {owner.ctzId && (
                                                                <button onClick={() => { setSelectedCitizenId(owner.ctzId); setCitizenQuickViewOpen(true); }} className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 hover:bg-emerald-200 transition-all shadow-sm border border-emerald-200 shrink-0">
                                                                    <Info className="size-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        {owner.ctzUuid ? <p className="text-[10px] text-emerald-500 font-mono flex items-center gap-1 mt-0.5"><BadgeCheck className="size-3" />{owner.ctzUuid}</p> : <p className="text-[10px] text-neutral-400 italic mt-0.5">No citizen record linked</p>}
                                                    </div>
                                                    {idx === 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-600 uppercase shrink-0">Primary</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {selected.description && (
                                        <div className="space-y-2">
                                            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2"><FileText className="size-3.5" /> Description</h3>
                                            <div className="bg-neutral-50/50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{selected.description}</div>
                                        </div>
                                    )}
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
                                <Store className="size-12 mb-2 opacity-20" /><p>Select an archived business to view details</p>
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
            <span className={`font-semibold text-sm ${highlight ? 'text-emerald-600 dark:text-emerald-400 font-mono' : 'text-neutral-900 dark:text-neutral-100'}`}>{value}</span>
        </div>
    );
}
