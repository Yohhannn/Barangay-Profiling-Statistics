import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    ArrowLeft, Search, Plus, Trash2,
    Building, User, MapPin, FileText, Users, Info, BadgeCheck,
    Edit3, X, SlidersHorizontal, Construction,
    BarChart2, TrendingUp, RotateCcw, Check,
} from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import InfrastructureCreation from './popup/infrastructures-creation';
import InfrastructureEdit from './popup/infrastructures-edit';
import CitizenQuickView from '../CitizenRecords/popup/citizen-quick-view';

interface Infrastructure {
    id: number;
    infUuid: string;
    infraId: string;
    name: string;
    owner: string;
    ownerFname: string;
    ownerMname: string;
    ownerLname: string;
    ownerSuffix: string;
    type: string;
    address: string;
    sitio: string;
    sitioId: number;
    description: string;
    ctzId: number | null;
    ownerCtzUuid: string | null;
    dateRegistered: string;
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string;
    updatedBy: string;
}

interface Sitio {
    sitio_id: number;
    sitio_name: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Institutions', href: '/institutions' },
    { title: 'Infrastructures', href: '/institutions/infrastructure-profile' },
];

export default function InfrastructureProfile() {
    const { infrastructures, sitios, systemAccounts = [] } = usePage<{ infrastructures: Infrastructure[]; sitios: Sitio[]; systemAccounts?: {id: number, name: string}[] }>().props;

    const [selectedInfra, setSelectedInfra] = useState<Infrastructure | null>(infrastructures[0] ?? null);
    const [searchQuery, setSearchQuery] = useState('');
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
            if (encodedByRef.current && !encodedByRef.current.contains(event.target as Node)) setShowEncodedByDropdown(false);
            if (updatedByRef.current && !updatedByRef.current.contains(event.target as Node)) setShowUpdatedByDropdown(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
        setDateEncodedStart(''); setDateEncodedEnd('');
        setDateUpdatedStart(''); setDateUpdatedEnd('');
        setEncodedByFilter([]); setUpdatedByFilter([]);
    };

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    
    const [citizenQuickViewOpen, setCitizenQuickViewOpen] = useState(false);
    const [selectedCitizenId, setSelectedCitizenId] = useState<number | null>(null);

    const handleOpenCitizenQuickView = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setSelectedCitizenId(id);
        setCitizenQuickViewOpen(true);
    };

    const infraTypes = useMemo(() => {
        const types = Array.from(new Set(infrastructures.map(i => i.type)));
        return types;
    }, [infrastructures]);

    const filteredInfra = useMemo(() => {
        return infrastructures.filter(item => {
            const matchesSearch =
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.infraId.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = filterType === 'All' || item.type === filterType;

            const encodedDate = item.dateEncoded ? new Date(item.dateEncoded) : null;
            const matchesEncodedStart = !dateEncodedStart || (encodedDate && encodedDate >= new Date(dateEncodedStart));
            const matchesEncodedEnd   = !dateEncodedEnd   || (encodedDate && encodedDate <= new Date(dateEncodedEnd));

            const updatedDate = item.dateUpdated ? new Date(item.dateUpdated) : null;
            const matchesUpdatedStart = !dateUpdatedStart || (updatedDate && updatedDate >= new Date(dateUpdatedStart));
            const matchesUpdatedEnd   = !dateUpdatedEnd   || (updatedDate && updatedDate <= new Date(dateUpdatedEnd));

            const matchesEncodedBy = encodedByFilter.length === 0 || encodedByFilter.includes(item.encodedBy);
            const matchesUpdatedBy = updatedByFilter.length === 0 || updatedByFilter.includes(item.updatedBy);

            return matchesSearch && matchesType
                && matchesEncodedStart && matchesEncodedEnd
                && matchesUpdatedStart && matchesUpdatedEnd
                && matchesEncodedBy && matchesUpdatedBy;
        });
    }, [infrastructures, searchQuery, filterType, dateEncodedStart, dateEncodedEnd, dateUpdatedStart, dateUpdatedEnd, encodedByFilter, updatedByFilter]);

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
        router.delete(`/institutions/infrastructure/${archiveTarget.id}`, {
            data: { deleted_reason: archiveReason },
            preserveScroll: true,
            onSuccess: () => { setArchiveTarget(null); setSelectedInfra(null); },
            onError: (errors: any) => { setArchiveError(errors?.error || 'Failed to archive. Please try again.'); },
            onFinish: () => setArchiveLoading(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Infrastructure Profile" />

            <CitizenQuickView 
                isOpen={citizenQuickViewOpen} 
                onClose={() => setCitizenQuickViewOpen(false)} 
                citizenId={selectedCitizenId} 
            />

            <InfrastructureCreation
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                sitios={sitios}
            />

            <InfrastructureEdit
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                sitios={sitios}
                infrastructure={selectedInfra}
            />

            {archiveTarget !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#0f172a] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                        <div className="bg-red-950 text-white p-5 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold flex items-center gap-2"><Trash2 className="size-5 text-red-400" /> Archive Infrastructure</h2>
                                <p className="text-[10px] text-red-300 mt-1 uppercase tracking-wider">{archiveTarget.label}</p>
                            </div>
                            <button onClick={() => setArchiveTarget(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"><X className="size-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Are you sure you want to move this infrastructure to archives?</p>
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
                        <Link href="/institutions" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                            <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                        </Link>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                            Institution: <span className="text-sky-600 dark:text-sky-400">Infrastructures</span>
                        </h1>
                    </div>
                </div>

                {/* Mini Statistics Panel */}
                <InfrastructureMiniStats infrastructures={infrastructures} />

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                    {/* LEFT: List */}
                    <div className="lg:col-span-4 flex flex-col gap-4 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm overflow-hidden">
                        <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/20 border-b border-sidebar-border/60 space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xs font-bold text-white bg-neutral-900 dark:bg-sky-600 py-1 px-3 rounded-md uppercase tracking-wider">
                                        Infra List
                                    </h2>
                                    <button
                                        onClick={() => setIsCreateOpen(true)}
                                        className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white p-1 rounded-md transition-colors shadow-sm active:scale-95"
                                        title="Register New Infrastructure"
                                    >
                                        <Plus className="size-4" />
                                    </button>
                                </div>
                                <span className="text-[10px] text-neutral-400 font-mono">TOTAL: {filteredInfra.length}</span>
                            </div>

                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                                    <input
                                        type="text"
                                        placeholder="Search Name, Owner..."
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`relative p-2 rounded-lg border transition-colors ${showFilters || activeFilterCount > 0 ? 'bg-sky-50 border-sky-200 text-sky-600 dark:bg-sky-900/20 dark:border-sky-800' : 'bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 border-sidebar-border text-neutral-500'}`}
                                    title={activeFilterCount > 0 ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active` : 'Filters'}
                                >
                                    {showFilters ? <X className="size-4" /> : <SlidersHorizontal className="size-4" />}
                                    {!showFilters && activeFilterCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-sky-600 text-[9px] font-bold text-white leading-none">{activeFilterCount}</span>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto">
                            {filteredInfra.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-neutral-400 gap-2">
                                    <Construction className="size-8 opacity-20" />
                                    <p className="text-xs">No infrastructures found.</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-[10px] text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-800/50 sticky top-0 z-10 backdrop-blur-sm">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold border-b border-sidebar-border w-16">ID</th>
                                        <th className="px-4 py-3 font-semibold border-b border-sidebar-border">Name</th>
                                        <th className="px-4 py-3 font-semibold border-b border-sidebar-border text-right">Owner</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-sidebar-border/50">
                                    {filteredInfra.map((item) => (
                                        <tr
                                            key={item.id}
                                            onClick={() => setSelectedInfra(item)}
                                            className={`cursor-pointer transition-all hover:bg-sky-50 dark:hover:bg-sky-900/10 ${selectedInfra?.id === item.id ? 'bg-sky-50 dark:bg-sky-900/20 border-l-4 border-l-sky-500' : 'border-l-4 border-l-transparent'}`}
                                        >
                                            <td className="px-4 py-3 font-mono text-xs text-neutral-500">{item.infUuid}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-neutral-900 dark:text-neutral-100">{item.name}</div>

                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-xs text-neutral-600 truncate max-w-[100px]">{item.owner}</span>
                                                    <button
                                                        onClick={(e) => handleDelete(e, item.id, item.name)}
                                                        className="text-neutral-300 hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <Trash2 className="size-3" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Details */}
                    <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
                        {selectedInfra ? (
                            <div className="flex-1 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm flex flex-col overflow-hidden">

                                <div className="bg-neutral-50 dark:bg-neutral-900/20 border-b border-sidebar-border p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-xl bg-sky-100 dark:bg-sky-900/20">
                                                <Building className="size-8 text-sky-600 dark:text-sky-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                                    {selectedInfra.name}
                                                </h2>
                                                <div className="flex items-center gap-2 mt-1 text-sm text-neutral-500">
                                                    <Users className="size-3.5" />
                                                    <span className="font-medium">1 Owner</span>
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold ml-2 bg-sky-100 text-sky-700">
                                                        {selectedInfra.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => setIsEditOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all hover:shadow-md">
                                            <Edit3 className="size-3.5" /> Edit Infra
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 bg-white dark:bg-sidebar border border-sidebar-border rounded-xl p-5 shadow-sm">
                                        <InfoRow label="Infrastructure ID" value={selectedInfra.infraId} highlight />
                                        <InfoRow label="Type" value={selectedInfra.type} />
                                        <InfoRow label="Date Registered" value={selectedInfra.dateRegistered} />
                                        <InfoRow label="Sitio / Location" value={selectedInfra.sitio} />
                                        <div className="col-span-2 pt-2 border-t border-dashed border-sidebar-border">
                                            <div className="flex gap-2">
                                                <MapPin className="size-4 text-neutral-400 mt-0.5" />
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-neutral-500 uppercase">Full Address</span>
                                                    <span className="text-sm text-neutral-800 dark:text-neutral-200">{selectedInfra.address || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Owners Section */}
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                            <Users className="size-3.5" /> Infrastructure Owner (1)
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900/30 border border-sidebar-border rounded-xl">
                                                <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold text-xs shrink-0">
                                                    1
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 truncate">
                                                            {selectedInfra.owner}
                                                        </p>
                                                        {selectedInfra.ctzId && (
                                                            <button 
                                                                onClick={(e) => handleOpenCitizenQuickView(e, selectedInfra.ctzId as number)}
                                                                className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-300 hover:bg-sky-200 transition-all shadow-sm border border-sky-200 dark:border-sky-800 shrink-0"
                                                                title="Quick View Owner Profile"
                                                            >
                                                                <Info className="size-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    {selectedInfra.ownerCtzUuid ? (
                                                        <p className="text-[10px] text-sky-500 font-mono flex items-center gap-1 mt-0.5">
                                                            <BadgeCheck className="size-3" />
                                                            {selectedInfra.ownerCtzUuid}
                                                        </p>
                                                    ) : (
                                                        <p className="text-[10px] text-neutral-400 italic mt-0.5">No citizen record linked</p>
                                                    )}
                                                </div>
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-600 uppercase shrink-0">Primary</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                            <FileText className="size-3.5" /> Description / Notes
                                        </h3>
                                        <div className="bg-neutral-50/50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 min-h-[120px]">
                                            {selectedInfra.description || <span className="text-neutral-400 italic">No description provided.</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border-t border-sidebar-border/60 bg-neutral-50 dark:bg-neutral-900/50 flex flex-col md:flex-row justify-between items-start md:items-center text-[10px] text-neutral-400 font-mono gap-4">
                                    <div className="space-y-1">
                                        <div className="flex gap-2"><span className="font-bold w-20">DATE ENCODED:</span><span>{selectedInfra.dateEncoded}</span></div>
                                        <div className="flex gap-2"><span className="font-bold w-20">ENCODED BY:</span><span>{selectedInfra.encodedBy}</span></div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <div className="flex gap-2 justify-end"><span className="font-bold">DATE UPDATED:</span><span>{selectedInfra.dateUpdated}</span></div>
                                        <div className="flex gap-2 justify-end"><span className="font-bold">UPDATED BY:</span><span>{selectedInfra.updatedBy}</span></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-sidebar-border rounded-2xl bg-neutral-50/50 text-neutral-400">
                                <Construction className="size-12 mb-2 opacity-20" />
                                <p>Select an infrastructure to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Filter Drawer */}
            {showFilters && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={() => setShowFilters(false)} />
                    <div className="fixed right-0 top-0 bottom-0 z-50 flex flex-col w-[380px] bg-white dark:bg-neutral-900 border-l border-sidebar-border shadow-2xl animate-in slide-in-from-right duration-200">
                        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-sidebar-border bg-sky-50 dark:bg-sky-900/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-900/40"><SlidersHorizontal className="size-4 text-sky-600 dark:text-sky-400" /></div>
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Filter Infrastructures</h3>
                                    <p className="text-xs text-neutral-500 mt-0.5">{activeFilterCount > 0 ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active` : 'No filters applied'}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowFilters(false)} className="p-2 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/30 text-neutral-500 transition-colors"><X className="size-5" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
                            {/* Type */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 shrink-0">Infrastructure</span>
                                    <div className="flex-1 h-px bg-sidebar-border/60" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">Type</label>
                                    <select className="w-full text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 focus:outline-none transition-colors" value={filterType} onChange={e => setFilterType(e.target.value)}>
                                        <option value="All">All Types</option>
                                        {infraTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
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
                                            <input type="date" className="flex-1 text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 min-w-0 transition-colors" value={dateEncodedStart} onChange={e => setDateEncodedStart(e.target.value)} />
                                            <span className="text-sm text-neutral-400 font-medium shrink-0">→</span>
                                            <input type="date" className="flex-1 text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 min-w-0 transition-colors" value={dateEncodedEnd} onChange={e => setDateEncodedEnd(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">Date Updated</label>
                                        <div className="flex items-center gap-2">
                                            <input type="date" className="flex-1 text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 min-w-0 transition-colors" value={dateUpdatedStart} onChange={e => setDateUpdatedStart(e.target.value)} />
                                            <span className="text-sm text-neutral-400 font-medium shrink-0">→</span>
                                            <input type="date" className="flex-1 text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 min-w-0 transition-colors" value={dateUpdatedEnd} onChange={e => setDateUpdatedEnd(e.target.value)} />
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
                                            <button onClick={() => setShowEncodedByDropdown(!showEncodedByDropdown)} className="w-full text-left text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex justify-between items-center gap-2 hover:border-sky-400 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/20">
                                                <span className="truncate">{encodedByFilter.length === 0 ? 'All Users' : `${encodedByFilter.length} user${encodedByFilter.length > 1 ? 's' : ''} selected`}</span>
                                                <Search className="size-4 text-neutral-400 shrink-0" />
                                            </button>
                                            {showEncodedByDropdown && (
                                                <div className="absolute z-[60] top-full mt-1 left-0 right-0 bg-white dark:bg-neutral-800 border border-sidebar-border rounded-xl shadow-2xl py-1 max-h-56 flex flex-col">
                                                    <div className="px-3 py-2 border-b border-sidebar-border/50"><input type="text" className="w-full text-sm p-2 bg-neutral-50 dark:bg-neutral-900 border border-sidebar-border rounded-lg focus:outline-none" placeholder="Search users..." value={encodedBySearch} onChange={e => setEncodedBySearch(e.target.value)} onClick={e => e.stopPropagation()} /></div>
                                                    <div className="overflow-y-auto flex-1 p-1.5">
                                                        <div className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer rounded-lg" onClick={() => setEncodedByFilter([])}>
                                                            <div className={`size-4 rounded border shrink-0 flex items-center justify-center ${encodedByFilter.length === 0 ? 'bg-sky-600 border-sky-600' : 'border-neutral-300 dark:border-neutral-600'}`}>{encodedByFilter.length === 0 && <Check className="size-3 text-white" />}</div>
                                                            <span className="font-medium">All Users</span>
                                                        </div>
                                                        {systemAccounts.filter(acc => acc.name.toLowerCase().includes(encodedBySearch.toLowerCase())).map(acc => {
                                                            const isSel = encodedByFilter.includes(acc.name);
                                                            return (
                                                                <div key={acc.id} className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer rounded-lg" onClick={() => setEncodedByFilter(isSel ? encodedByFilter.filter(n => n !== acc.name) : [...encodedByFilter, acc.name])}>
                                                                    <div className={`size-4 rounded border shrink-0 flex items-center justify-center ${isSel ? 'bg-sky-600 border-sky-600' : 'border-neutral-300 dark:border-neutral-600'}`}>{isSel && <Check className="size-3 text-white" />}</div>
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
                                            <button onClick={() => setShowUpdatedByDropdown(!showUpdatedByDropdown)} className="w-full text-left text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex justify-between items-center gap-2 hover:border-sky-400 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/20">
                                                <span className="truncate">{updatedByFilter.length === 0 ? 'All Users' : `${updatedByFilter.length} user${updatedByFilter.length > 1 ? 's' : ''} selected`}</span>
                                                <Search className="size-4 text-neutral-400 shrink-0" />
                                            </button>
                                            {showUpdatedByDropdown && (
                                                <div className="absolute z-[60] top-full mt-1 left-0 right-0 bg-white dark:bg-neutral-800 border border-sidebar-border rounded-xl shadow-2xl py-1 max-h-56 flex flex-col">
                                                    <div className="px-3 py-2 border-b border-sidebar-border/50"><input type="text" className="w-full text-sm p-2 bg-neutral-50 dark:bg-neutral-900 border border-sidebar-border rounded-lg focus:outline-none" placeholder="Search users..." value={updatedBySearch} onChange={e => setUpdatedBySearch(e.target.value)} onClick={e => e.stopPropagation()} /></div>
                                                    <div className="overflow-y-auto flex-1 p-1.5">
                                                        <div className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer rounded-lg" onClick={() => setUpdatedByFilter([])}>
                                                            <div className={`size-4 rounded border shrink-0 flex items-center justify-center ${updatedByFilter.length === 0 ? 'bg-sky-600 border-sky-600' : 'border-neutral-300 dark:border-neutral-600'}`}>{updatedByFilter.length === 0 && <Check className="size-3 text-white" />}</div>
                                                            <span className="font-medium">All Users</span>
                                                        </div>
                                                        {systemAccounts.filter(acc => acc.name.toLowerCase().includes(updatedBySearch.toLowerCase())).map(acc => {
                                                            const isSel = updatedByFilter.includes(acc.name);
                                                            return (
                                                                <div key={acc.id} className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer rounded-lg" onClick={() => setUpdatedByFilter(isSel ? updatedByFilter.filter(n => n !== acc.name) : [...updatedByFilter, acc.name])}>
                                                                    <div className={`size-4 rounded border shrink-0 flex items-center justify-center ${isSel ? 'bg-sky-600 border-sky-600' : 'border-neutral-300 dark:border-neutral-600'}`}>{isSel && <Check className="size-3 text-white" />}</div>
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

                        <div className="shrink-0 flex items-center gap-3 px-6 py-4 border-t border-sidebar-border bg-neutral-50 dark:bg-neutral-800/60">
                            <button onClick={resetFilters} className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors">
                                <RotateCcw className="size-4" /> Reset All
                            </button>
                            <button onClick={() => setShowFilters(false)} className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-colors shadow-sm">
                                <Check className="size-4" /> Done
                            </button>
                        </div>
                    </div>
                </>
            )}
        </AppLayout>
    );
}

// --- Mini Statistics ---

function InfrastructureMiniStats({ infrastructures }: { infrastructures: Infrastructure[] }) {
    const total = infrastructures.length;

    // Type distribution
    const topTypes = useMemo(() => {
        const map: Record<string, number> = {};
        infrastructures.forEach(i => { map[i.type] = (map[i.type] || 0) + 1; });
        return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
    }, [infrastructures]);

    const maxType = topTypes[0]?.[1] ?? 1;

    // Top sitios
    const topSitios = useMemo(() => {
        const map: Record<string, number> = {};
        infrastructures.forEach(i => { if (i.sitio) map[i.sitio] = (map[i.sitio] || 0) + 1; });
        return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 4);
    }, [infrastructures]);

    const maxSitio = topSitios[0]?.[1] ?? 1;

    const linkedCount = useMemo(() => infrastructures.filter(i => i.ctzId !== null).length, [infrastructures]);
    const uniqueTypes = topTypes.length;

    if (total === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">

            {/* 1. Infrastructure Types */}
            <div className="bg-white dark:bg-sidebar border border-sidebar-border/60 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                    <BarChart2 className="size-4 text-sky-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Infra Types</span>
                    <span className="ml-auto text-[10px] font-mono text-neutral-400">{total} total</span>
                </div>
                <div className="space-y-2">
                    {topTypes.map(([type, count]) => (
                        <div key={type} className="space-y-0.5">
                            <div className="flex justify-between text-[10px]">
                                <span className="truncate max-w-[70%] font-medium text-neutral-700 dark:text-neutral-300">{type}</span>
                                <span className="font-mono font-bold text-sky-600">{count}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                                <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${(count / maxType) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                    {topTypes.length === 0 && <p className="text-xs text-neutral-400 italic">No data.</p>}
                </div>
            </div>

            {/* 2. Top Sitios */}
            <div className="bg-white dark:bg-sidebar border border-sidebar-border/60 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-sky-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Top Sitios</span>
                </div>
                <div className="space-y-2">
                    {topSitios.map(([sitio, count]) => (
                        <div key={sitio} className="space-y-0.5">
                            <div className="flex justify-between text-[10px]">
                                <span className="truncate max-w-[70%] font-medium text-neutral-700 dark:text-neutral-300">{sitio}</span>
                                <span className="font-mono font-bold text-sky-600">{count}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                                <div className="h-full bg-sky-400 rounded-full transition-all" style={{ width: `${(count / maxSitio) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                    {topSitios.length === 0 && <p className="text-xs text-neutral-400 italic">No data.</p>}
                </div>
            </div>

            {/* 3. Summary Tiles */}
            <div className="bg-white dark:bg-sidebar border border-sidebar-border/60 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                    <TrendingUp className="size-4 text-sky-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Summary</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-sky-50 dark:bg-sky-900/20 p-3 text-center">
                        <div className="text-2xl font-black font-mono text-sky-600">{total}</div>
                        <div className="text-[9px] uppercase font-bold text-neutral-400 mt-0.5">Total</div>
                    </div>
                    <div className="rounded-xl bg-indigo-50 dark:bg-indigo-900/20 p-3 text-center">
                        <div className="text-2xl font-black font-mono text-indigo-600">{uniqueTypes}</div>
                        <div className="text-[9px] uppercase font-bold text-neutral-400 mt-0.5">Types</div>
                    </div>
                    <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-3 text-center col-span-2">
                        <div className="text-2xl font-black font-mono text-green-600">{linkedCount}</div>
                        <div className="text-[9px] uppercase font-bold text-neutral-400 mt-0.5">Linked to Citizens</div>
                    </div>
                </div>
            </div>

        </div>
    );
}

function InfoRow({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) {
    return (
        <div className="flex justify-between border-b border-sidebar-border/50 pb-1">
            <span className="text-neutral-500 font-medium text-sm">{label}:</span>
            <span className={`font-semibold text-sm ${highlight ? 'text-sky-600 dark:text-sky-400 font-mono' : 'text-neutral-900 dark:text-neutral-100'}`}>
                {value}
            </span>
        </div>
    );
}
