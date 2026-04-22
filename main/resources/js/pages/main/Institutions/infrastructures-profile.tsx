import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    ArrowLeft, Search, Plus, Trash2,
    Building, User, MapPin, FileText,
    Edit3, X, SlidersHorizontal, Construction
} from 'lucide-react';
import { useState, useMemo } from 'react';
import InfrastructureCreation from './popup/infrastructures-creation';

interface Infrastructure {
    id: number;
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
    const { infrastructures, sitios } = usePage<{ infrastructures: Infrastructure[]; sitios: Sitio[] }>().props;

    const [selectedInfra, setSelectedInfra] = useState<Infrastructure | null>(infrastructures[0] ?? null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterType, setFilterType] = useState('All');
    const [isCreateOpen, setIsCreateOpen] = useState(false);

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
            return matchesSearch && matchesType;
        });
    }, [infrastructures, searchQuery, filterType]);

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to archive this infrastructure record?')) {
            router.delete(`/institutions/infrastructure/${id}`, {
                onSuccess: () => {
                    if (selectedInfra?.id === id) setSelectedInfra(null);
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Infrastructure Profile" />

            <InfrastructureCreation
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                sitios={sitios}
            />

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
                                    className={`p-2 rounded-lg border border-sidebar-border transition-colors ${showFilters ? 'bg-sky-50 border-sky-200 text-sky-600' : 'bg-white hover:bg-neutral-50 text-neutral-500'}`}
                                >
                                    {showFilters ? <X className="size-4" /> : <SlidersHorizontal className="size-4" />}
                                </button>
                            </div>

                            {showFilters && (
                                <div className="pt-2 border-t border-sidebar-border/50 animate-in slide-in-from-top-2">
                                    <select
                                        className="w-full text-xs p-2 rounded-lg border border-sidebar-border bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-sky-500/20"
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                    >
                                        <option value="All">All Types</option>
                                        {infraTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            )}
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
                                            <td className="px-4 py-3 font-mono text-xs text-neutral-500">{item.id}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-neutral-900 dark:text-neutral-100">{item.name}</div>
                                                <div className="text-[10px] text-neutral-500">{item.infraId}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-xs text-neutral-600 truncate max-w-[100px]">{item.owner}</span>
                                                    <button
                                                        onClick={(e) => handleDelete(e, item.id)}
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
                                                    <User className="size-3.5" />
                                                    <span className="font-medium">Owner: {selectedInfra.owner}</span>
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold ml-2 bg-sky-100 text-sky-700">
                                                        {selectedInfra.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all hover:shadow-md">
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
        </AppLayout>
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
