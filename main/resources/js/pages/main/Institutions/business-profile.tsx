import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    ArrowLeft, Search, Plus, Trash2,
    Store, User, Users, MapPin, FileText,
    Edit3, X, SlidersHorizontal, BadgeCheck
} from 'lucide-react';
import { useState, useMemo } from 'react';
import BusinessCreation from './popup/business-creation';
import BusinessEdit from './popup/business-edit';
import CitizenQuickView from '../CitizenRecords/popup/citizen-quick-view';
import { Info } from 'lucide-react';

interface Owner {
    id: number;
    fname: string;
    lname: string;
    mname: string;
    fullName: string;
    ctzId: number | null;
    ctzUuid: string | null;
}

interface Business {
    id: number;
    businessId: string;
    businessName: string;
    owners: Owner[];
    primaryOwner: string;
    businessType: string;
    status: 'Active' | 'Inactive' | 'Closed' | 'Suspended';
    address: string;
    sitio: string;
    sitioId: number;
    description: string;
    isDti: boolean;
    dtiPhoto: string | null;
    dateRegistered: string;
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string | null;
    updatedBy: string | null;
}

interface Sitio {
    sitio_id: number;
    sitio_name: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Institutions', href: '/institutions' },
    { title: 'Businesses', href: '/institutions/business-profile' },
];

export default function BusinessProfile() {
    const { businesses, sitios } = usePage<{ businesses: Business[]; sitios: Sitio[] }>().props;

    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(businesses[0] ?? null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Citizen Quick View State
    const [citizenQuickViewOpen, setCitizenQuickViewOpen] = useState(false);
    const [selectedCitizenId, setSelectedCitizenId] = useState<number | null>(null);

    const handleOpenCitizenQuickView = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setSelectedCitizenId(id);
        setCitizenQuickViewOpen(true);
    };

    const filteredBusinesses = useMemo(() => {
        return businesses.filter(biz => {
            const ownerText = biz.owners.map(o => o.fullName).join(' ');
            const matchesSearch =
                biz.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ownerText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                biz.businessId.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = filterStatus === 'All' || biz.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [businesses, searchQuery, filterStatus]);

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to archive this business record?')) {
            router.delete(`/institutions/business/${id}`, {
                onSuccess: () => { if (selectedBusiness?.id === id) setSelectedBusiness(null); },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Business Profile" />

            <BusinessCreation
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                sitios={sitios}
            />

            <BusinessEdit
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                sitios={sitios}
                business={selectedBusiness}
            />

            <CitizenQuickView 
                isOpen={citizenQuickViewOpen} 
                onClose={() => setCitizenQuickViewOpen(false)} 
                citizenId={selectedCitizenId} 
            />

            <div className="flex flex-col h-[calc(100vh-4rem)] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">

                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-sidebar-border/60">
                    <div className="flex items-center gap-4">
                        <Link href="/institutions" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                            <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                        </Link>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                            Institution: <span className="text-indigo-600 dark:text-indigo-400">Businesses</span>
                        </h1>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                    {/* LEFT: List */}
                    <div className="lg:col-span-4 flex flex-col gap-4 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm overflow-hidden">
                        <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/20 border-b border-sidebar-border/60 space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xs font-bold text-white bg-neutral-900 dark:bg-indigo-600 py-1 px-3 rounded-md uppercase tracking-wider">
                                        Business List
                                    </h2>
                                    <button
                                        onClick={() => setIsCreateOpen(true)}
                                        className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white p-1 rounded-md transition-colors shadow-sm"
                                        title="Register New Business"
                                    >
                                        <Plus className="size-4" />
                                    </button>
                                </div>
                                <span className="text-[10px] text-neutral-400 font-mono">TOTAL: {filteredBusinesses.length}</span>
                            </div>

                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                                    <input
                                        type="text"
                                        placeholder="Search Business Name, Owner..."
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`p-2 rounded-lg border border-sidebar-border transition-colors ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white hover:bg-neutral-50 text-neutral-500'}`}
                                >
                                    {showFilters ? <X className="size-4" /> : <SlidersHorizontal className="size-4" />}
                                </button>
                            </div>

                            {showFilters && (
                                <div className="pt-2 border-t border-sidebar-border/50 animate-in slide-in-from-top-2">
                                    <select
                                        className="w-full text-xs p-2 rounded-lg border border-sidebar-border bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-indigo-500/20"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="All">All Status</option>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Closed">Closed</option>
                                        <option value="Suspended">Suspended</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-auto">
                            {filteredBusinesses.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-neutral-400 gap-2">
                                    <Store className="size-8 opacity-20" />
                                    <p className="text-xs">No businesses found.</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-[10px] text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-800/50 sticky top-0 z-10 backdrop-blur-sm">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold border-b border-sidebar-border w-16">ID</th>
                                        <th className="px-4 py-3 font-semibold border-b border-sidebar-border">Business Name</th>
                                        <th className="px-4 py-3 font-semibold border-b border-sidebar-border text-right">Owner</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-sidebar-border/50">
                                    {filteredBusinesses.map((biz) => (
                                        <tr
                                            key={biz.id}
                                            onClick={() => setSelectedBusiness(biz)}
                                            className={`cursor-pointer transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/10 ${selectedBusiness?.id === biz.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-l-indigo-500' : 'border-l-4 border-l-transparent'}`}
                                        >
                                            <td className="px-4 py-3 font-mono text-xs text-neutral-500">{biz.id}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-neutral-900 dark:text-neutral-100">{biz.businessName}</div>
                                                <div className="text-[10px] text-neutral-500">{biz.businessId}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-xs text-neutral-600">{biz.primaryOwner}</span>
                                                    {biz.owners.length > 1 && (
                                                        <span className="text-[10px] text-indigo-400 font-medium">+{biz.owners.length - 1} more</span>
                                                    )}
                                                    <button
                                                        onClick={(e) => handleDelete(e, biz.id)}
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
                        {selectedBusiness ? (
                            <div className="flex-1 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm flex flex-col overflow-hidden">

                                {/* Detail Header */}
                                <div className="bg-neutral-50 dark:bg-neutral-900/20 border-b border-sidebar-border p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/20">
                                                <Store className="size-8 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                                    {selectedBusiness.businessName}
                                                </h2>
                                                <div className="flex items-center gap-2 mt-1 text-sm text-neutral-500">
                                                    <Users className="size-3.5" />
                                                    <span className="font-medium">
                                                        {selectedBusiness.owners.length} Owner{selectedBusiness.owners.length !== 1 ? 's' : ''}
                                                    </span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-2 ${getStatusColor(selectedBusiness.status)}`}>
                                                        {selectedBusiness.status}
                                                    </span>
                                                    {selectedBusiness.isDti && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700 flex items-center gap-1">
                                                            <BadgeCheck className="size-3" /> DTI
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => setIsEditOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all hover:shadow-md">
                                            <Edit3 className="size-3.5" /> Edit Business
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                                    {/* Business Info Grid */}
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 bg-white dark:bg-sidebar border border-sidebar-border rounded-xl p-5 shadow-sm">
                                        <InfoRow label="Business ID" value={selectedBusiness.businessId} highlight />
                                        <InfoRow label="Business Type" value={selectedBusiness.businessType} />
                                        <InfoRow label="Date Registered" value={selectedBusiness.dateRegistered} />
                                        <InfoRow label="Sitio / Location" value={selectedBusiness.sitio} />
                                        <div className="col-span-2 pt-2 border-t border-dashed border-sidebar-border">
                                            <div className="flex gap-2">
                                                <MapPin className="size-4 text-neutral-400 mt-0.5" />
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-neutral-500 uppercase">Full Address</span>
                                                    <span className="text-sm text-neutral-800 dark:text-neutral-200">{selectedBusiness.address}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Owners Section */}
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                            <Users className="size-3.5" /> Business Owners ({selectedBusiness.owners.length})
                                        </h3>
                                        {selectedBusiness.owners.length === 0 ? (
                                            <div className="text-xs text-neutral-400 italic p-4 border border-dashed border-sidebar-border rounded-xl text-center">
                                                No owners registered.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {selectedBusiness.owners.map((owner, idx) => (
                                                    <div
                                                        key={owner.id}
                                                        className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900/30 border border-sidebar-border rounded-xl"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs shrink-0">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 truncate">
                                                                    {owner.fullName}
                                                                </p>
                                                                {owner.ctzId && (
                                                                    <button 
                                                                        onClick={(e) => handleOpenCitizenQuickView(e, owner.ctzId as number)}
                                                                        className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 transition-all shadow-sm border border-indigo-200 dark:border-indigo-800 shrink-0"
                                                                        title="Quick View Owner Profile"
                                                                    >
                                                                        <Info className="size-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {owner.ctzUuid && (
                                                                <p className="text-[10px] text-indigo-500 font-mono flex items-center gap-1 mt-0.5">
                                                                    <BadgeCheck className="size-3" />
                                                                    {owner.ctzUuid}
                                                                </p>
                                                            )}
                                                            {!owner.ctzUuid && (
                                                                <p className="text-[10px] text-neutral-400 italic mt-0.5">No citizen record linked</p>
                                                            )}
                                                        </div>
                                                        {idx === 0 && (
                                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-600 uppercase shrink-0">Primary</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                            <FileText className="size-3.5" /> Description / Business Nature
                                        </h3>
                                        <div className="bg-neutral-50/50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 min-h-[100px]">
                                            {selectedBusiness.description || <span className="text-neutral-400 italic">No description provided.</span>}
                                        </div>
                                    </div>

                                    {/* DTI Certificate Photo */}
                                    {selectedBusiness.isDti && (
                                        <div className="space-y-2">
                                            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                                <BadgeCheck className="size-3.5" /> DTI Certificate
                                            </h3>
                                            {selectedBusiness.dtiPhoto ? (
                                                <div className="rounded-xl overflow-hidden border border-blue-200 dark:border-blue-800">
                                                    <img src={selectedBusiness.dtiPhoto} alt="DTI Certificate" className="w-full max-h-64 object-contain bg-neutral-50 dark:bg-neutral-900" />
                                                </div>
                                            ) : (
                                                <div className="p-4 border border-dashed border-blue-200 rounded-xl text-center text-xs text-blue-400 italic">
                                                    No DTI certificate photo uploaded.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Footer Audit */}
                                <div className="p-4 border-t border-sidebar-border/60 bg-neutral-50 dark:bg-neutral-900/50 flex flex-col md:flex-row justify-between items-start md:items-center text-[10px] text-neutral-400 font-mono gap-4">
                                    <div className="space-y-1">
                                        <div className="flex gap-2"><span className="font-bold w-20">DATE ENCODED:</span><span>{selectedBusiness.dateEncoded}</span></div>
                                        <div className="flex gap-2"><span className="font-bold w-20">ENCODED BY:</span><span>{selectedBusiness.encodedBy}</span></div>
                                    </div>
                                    {selectedBusiness.dateUpdated && (
                                        <div className="space-y-1 text-right">
                                            <div className="flex gap-2 justify-end"><span className="font-bold">DATE UPDATED:</span><span>{selectedBusiness.dateUpdated}</span></div>
                                            <div className="flex gap-2 justify-end"><span className="font-bold">UPDATED BY:</span><span>{selectedBusiness.updatedBy}</span></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-sidebar-border rounded-2xl bg-neutral-50/50 text-neutral-400">
                                <Store className="size-12 mb-2 opacity-20" />
                                <p>Select a business to view details</p>
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
            <span className={`font-semibold text-sm ${highlight ? 'text-indigo-600 dark:text-indigo-400 font-mono' : 'text-neutral-900 dark:text-neutral-100'}`}>
                {value}
            </span>
        </div>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'Active': return 'bg-green-100 text-green-700';
        case 'Inactive': return 'bg-neutral-200 text-neutral-600';
        case 'Closed': return 'bg-red-100 text-red-700';
        case 'Suspended': return 'bg-orange-100 text-orange-700';
        default: return 'bg-blue-100 text-blue-700';
    }
}
