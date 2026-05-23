import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft, Search, Home, MapPin, RotateCcw, AlertTriangle, Users, Info,
    Hash, UserCheck, Droplets, FileText, Link as LinkIcon
} from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import CitizenQuickView from '../../main/CitizenRecords/popup/citizen-quick-view';

interface HouseholdMember { id: number; firstName: string; lastName: string; relationship: string; }
interface ArchivedHousehold {
    id: number;
    householdId: string;
    householdNumber: string;
    sitio: string;
    ownershipStatus: string;
    waterSource: string;
    toiletType: string;
    homeAddress: string;
    homeLink: string;
    coordinates: string;
    interviewedBy: string;
    reviewedBy: string;
    dateOfVisit: string;
    members: HouseholdMember[];
    deleteReason: string;
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string;
    updatedBy: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Archives', href: '/archives' },
    { title: 'Household', href: '/archives/household' },
];

export default function HouseholdArchive({ records = [], filters = {} }: { records?: ArchivedHousehold[], filters?: any }) {
    const [selected, setSelected] = useState<ArchivedHousehold | null>(records[0] ?? null);
    const [search, setSearch] = useState(filters?.search || '');
    const [isDebouncing, setIsDebouncing] = useState(false);
    const [citizenQuickViewOpen, setCitizenQuickViewOpen] = useState(false);
    const [selectedCitizenId, setSelectedCitizenId] = useState<number | null>(null);

    const handleSearch = (val: string) => {
        setSearch(val);
        setIsDebouncing(true);
        clearTimeout((window as any).__archiveSearchTimer);
        (window as any).__archiveSearchTimer = setTimeout(() => {
            router.get('/archives/household', { search: val }, { preserveState: true, preserveScroll: true, replace: true, onFinish: () => setIsDebouncing(false) });
        }, 400);
    };

    const handleRestore = (e: React.MouseEvent, record: ArchivedHousehold) => {
        e.stopPropagation();
        Swal.fire({
            title: 'Restore Household',
            text: `Restore household ${record.householdId}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, restore!',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/archives/household/${record.id}/restore`, {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        if (selected?.id === record.id) setSelected(null);
                        Swal.fire('Restored!', 'Household has been restored.', 'success');
                    },
                    onError: () => Swal.fire('Error', 'Failed to restore household.', 'error'),
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Archived Households" />
            <CitizenQuickView isOpen={citizenQuickViewOpen} onClose={() => setCitizenQuickViewOpen(false)} citizenId={selectedCitizenId} />

            <div className="flex flex-col h-[calc(100vh-4rem)] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">
                <div className="flex items-center gap-4 pb-2 border-b border-sidebar-border/60">
                    <Link href="/archives" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                            Archives: <span className="text-orange-600 dark:text-orange-400">Household</span>
                        </h1>
                        <p className="text-xs text-neutral-500 mt-0.5">Soft-deleted household records — restore to reinstate</p>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                    {/* LEFT */}
                    <div className="lg:col-span-4 flex flex-col bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm overflow-hidden">
                        <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/20 border-b border-sidebar-border/60 space-y-3">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xs font-bold text-white bg-orange-600 py-1 px-3 rounded-md uppercase tracking-wider">Archived Households</h2>
                                <span className="text-[10px] text-neutral-400 font-mono">TOTAL: {records.length}</span>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                                <input type="text" placeholder="Search Household ID..." className="w-full pl-10 pr-4 py-2 text-sm border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all" value={search} onChange={(e) => handleSearch(e.target.value)} />
                                {isDebouncing && <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin rounded-full h-3 w-3 border-b-2 border-orange-500"></div>}
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                            {records.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-neutral-400 gap-2">
                                    <Home className="size-8 opacity-20" />
                                    <p className="text-xs">No archived households found.</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-[10px] text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-800/50 sticky top-0 z-10 backdrop-blur-sm">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold border-b border-sidebar-border w-16">ID</th>
                                            <th className="px-4 py-3 font-semibold border-b border-sidebar-border">Members</th>
                                            <th className="px-4 py-3 font-semibold border-b border-sidebar-border text-right">Sitio</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-sidebar-border/50">
                                        {records.map((hh) => (
                                            <tr key={hh.id} onClick={() => setSelected(hh)} className={`cursor-pointer transition-all hover:bg-orange-50 dark:hover:bg-orange-900/10 ${selected?.id === hh.id ? 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-l-orange-500' : 'border-l-4 border-l-transparent'}`}>
                                                <td className="px-4 py-3 font-mono text-xs text-neutral-500">{hh.householdId}</td>
                                                <td className="px-4 py-3 font-bold">{hh.members.length}</td>
                                                <td className="px-4 py-3 text-right text-xs text-neutral-600">{hh.sitio}</td>
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
                                <div className="p-6 border-b border-sidebar-border/60 bg-neutral-50/50 dark:bg-neutral-900/30">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                                                <Home className="size-8 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            <div>
                                                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{selected.householdId}</h1>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <MapPin className="size-3 text-neutral-400" />
                                                    <span className="text-sm text-neutral-500 font-medium">{selected.sitio}</span>
                                                    <span className="text-xs font-bold px-2 py-0.5 rounded border bg-red-50 text-red-600 border-red-100 ml-2">ARCHIVED</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={(e) => handleRestore(e, selected)} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all hover:shadow-md">
                                            <RotateCcw className="size-3.5" /> Restore
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {/* Archive Reason Banner */}
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                                        <AlertTriangle className="size-5 text-red-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-1">Archive Reason</p>
                                            <p className="text-sm text-red-700 dark:text-red-300">{selected.deleteReason}</p>
                                        </div>
                                    </div>

                                    {/* Household Info + Interview Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-neutral-50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-5 space-y-3">
                                            <div className="flex items-center gap-2 pb-2 border-b border-sidebar-border/50 text-orange-600">
                                                <Hash className="size-4" />
                                                <h3 className="text-xs font-bold uppercase tracking-wider">Household Info</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <InfoItem label="Household Number" value={selected.householdNumber} highlight />
                                                <InfoItem label="Ownership Status" value={selected.ownershipStatus} />
                                            </div>
                                        </div>
                                        <div className="bg-neutral-50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-5 space-y-3">
                                            <div className="flex items-center gap-2 pb-2 border-b border-sidebar-border/50 text-blue-600">
                                                <UserCheck className="size-4" />
                                                <h3 className="text-xs font-bold uppercase tracking-wider">Interview Details</h3>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-xs text-neutral-500">Interviewed By:</span>
                                                    <span className="text-sm font-medium">{selected.interviewedBy}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-xs text-neutral-500">Reviewed By:</span>
                                                    <span className="text-sm font-medium">{selected.reviewedBy}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-xs text-neutral-500">Date of Visit:</span>
                                                    <span className="text-sm font-medium">{selected.dateOfVisit}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Water + Location */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-neutral-50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-5 flex flex-col justify-center">
                                            <div className="grid grid-cols-2 text-center divide-x divide-sidebar-border">
                                                <div className="px-2">
                                                    <div className="flex flex-col items-center gap-1 mb-2">
                                                        <Droplets className="size-4 text-cyan-500" />
                                                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Water Source</span>
                                                    </div>
                                                    <span className="text-sm font-medium">{selected.waterSource}</span>
                                                </div>
                                                <div className="px-2">
                                                    <div className="flex flex-col items-center gap-1 mb-2">
                                                        <FileText className="size-4 text-purple-500" />
                                                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Toilet Type</span>
                                                    </div>
                                                    <span className="text-sm font-medium">{selected.toiletType}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-neutral-50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-5 flex flex-col items-center justify-center text-center overflow-hidden">
                                            <div className="flex items-center gap-2 mb-3 text-neutral-500">
                                                <MapPin className="size-4 text-red-500" />
                                                <span className="text-xs font-bold uppercase">Household Location</span>
                                            </div>
                                            {selected.homeLink && selected.homeLink !== 'N/A' ? (
                                                <div className="w-full flex flex-col gap-3">
                                                    {(selected.homeLink.includes('<iframe') || selected.homeLink.includes('/embed')) && (
                                                        <div className="w-full h-32 rounded-lg overflow-hidden border border-sidebar-border bg-neutral-200">
                                                            {selected.homeLink.startsWith('http') ? (
                                                                <iframe src={selected.homeLink} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                                                            ) : (
                                                                <div dangerouslySetInnerHTML={{ __html: selected.homeLink }} className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" />
                                                            )}
                                                        </div>
                                                    )}
                                                    <a href={selected.homeLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 px-4 py-2 rounded-lg border border-sidebar-border text-xs font-bold uppercase tracking-wider text-blue-600 transition-colors cursor-pointer w-full">
                                                        <LinkIcon className="size-3.5" />
                                                        Open in Google Maps
                                                    </a>
                                                </div>
                                            ) : (
                                                <div className="bg-white dark:bg-neutral-800 px-4 py-3 rounded border border-sidebar-border font-mono text-xs text-neutral-400 w-full">
                                                    No Location Data Provided
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Address + Coordinates */}
                                    <div className="bg-neutral-50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-4 flex flex-col md:flex-row gap-4">
                                        <div className="flex-1 flex items-center gap-4">
                                            <span className="text-xs font-bold text-neutral-500 uppercase whitespace-nowrap">Home Address:</span>
                                            <span className="text-sm font-medium truncate">{selected.homeAddress}</span>
                                        </div>
                                        <div className="flex-1 flex items-center gap-4 border-t md:border-t-0 md:border-l border-sidebar-border pt-3 md:pt-0 md:pl-4">
                                            <span className="text-xs font-bold text-neutral-500 uppercase whitespace-nowrap">Coordinates:</span>
                                            <span className="text-sm font-mono text-neutral-600 dark:text-neutral-400">{selected.coordinates || 'N/A'}</span>
                                        </div>
                                    </div>

                                    {/* Members Table */}
                                    <div>
                                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Users className="size-3.5" /> Members ({selected.members.length})
                                        </h3>
                                        <div className="border border-sidebar-border rounded-xl overflow-hidden">
                                            <table className="w-full text-sm bg-white dark:bg-sidebar">
                                                <thead className="bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-500 uppercase">
                                                    <tr>
                                                        <th className="px-4 py-3 text-center border-r border-sidebar-border w-16">View</th>
                                                        <th className="px-4 py-3 text-center border-r border-sidebar-border">First Name</th>
                                                        <th className="px-4 py-3 text-center border-r border-sidebar-border">Last Name</th>
                                                        <th className="px-4 py-3 text-center">Relationship</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-sidebar-border">
                                                    {selected.members.map((m) => (
                                                        <tr key={m.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                                                            <td className="px-4 py-3 text-center border-r border-sidebar-border">
                                                                <button onClick={() => { setSelectedCitizenId(m.id); setCitizenQuickViewOpen(true); }} className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-600 hover:bg-blue-200 transition-all border border-blue-200 dark:border-blue-800 inline-flex items-center justify-center">
                                                                    <Info className="size-3.5" />
                                                                </button>
                                                            </td>
                                                            <td className="px-4 py-3 text-center border-r border-sidebar-border">{m.firstName}</td>
                                                            <td className="px-4 py-3 text-center border-r border-sidebar-border">{m.lastName}</td>
                                                            <td className="px-4 py-3 text-center text-neutral-500">{m.relationship}</td>
                                                        </tr>
                                                    ))}
                                                    {selected.members.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-neutral-400 italic">No members listed</td></tr>}
                                                </tbody>
                                            </table>
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
                                <Home className="size-12 mb-2 opacity-20" />
                                <p>Select an archived household to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function InfoItem({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide mb-0.5">{label}</span>
            <span className={`text-sm truncate font-medium ${highlight ? 'text-orange-600 dark:text-orange-400 font-bold' : 'text-neutral-800 dark:text-neutral-200'}`}>
                {value || '—'}
            </span>
        </div>
    );
}
