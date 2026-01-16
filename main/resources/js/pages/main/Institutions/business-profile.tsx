import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft, Search, Plus, Trash2,
    Store, User, MapPin, FileText,
    Download, Edit3, X, SlidersHorizontal, Building
} from 'lucide-react';
import { useState, useMemo } from 'react';

// --- Types ---
interface Business {
    id: number;
    businessId: string;
    businessName: string;
    ownerName: string;
    businessType: string;
    status: 'Active' | 'Inactive' | 'Closed' | 'Suspended';
    address: string;
    sitio: string;
    description: string;
    dateRegistered: string;

    // Audit
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string;
    updatedBy: string;
}

// --- Mock Data ---
const mockBusinesses: Business[] = [
    {
        id: 1, businessId: 'BUS-2025-001', businessName: "Aling Nena's Sari-sari",
        ownerName: 'Alfredo Garcia', businessType: 'Sole Proprietorship', status: 'Active',
        address: 'Blk 5 Lot 2, Ylaya', sitio: 'Ylaya',
        description: 'Small retail store selling daily commodities and groceries.',
        dateRegistered: 'July 10, 2025',
        dateEncoded: 'July 10, 2025 | 7:06 PM', encodedBy: 'ADMIN', dateUpdated: 'N/A', updatedBy: 'N/A'
    },
    {
        id: 2, businessId: 'BUS-2025-002', businessName: 'Marigondon Auto Repair',
        ownerName: 'Corazon Ramos', businessType: 'Service', status: 'Active',
        address: 'Highway, Crossing', sitio: 'Crossing',
        description: 'Automotive repair shop specializing in motorcycles and tricycles.',
        dateRegistered: 'July 10, 2025',
        dateEncoded: 'July 10, 2025 | 7:06 PM', encodedBy: 'ADMIN', dateUpdated: 'Aug 01, 2025', updatedBy: 'STAFF_01'
    },
    {
        id: 3, businessId: 'BUS-2025-003', businessName: 'Cebuano Bakery',
        ownerName: 'Manuel Tinapay', businessType: 'Sole Proprietorship', status: 'Active',
        address: 'Sitio Bankal', sitio: 'Bankal',
        description: 'Local bakery serving fresh bread and pastries daily.',
        dateRegistered: 'July 12, 2025',
        dateEncoded: 'July 12, 2025 | 08:30 AM', encodedBy: 'STAFF_02', dateUpdated: 'N/A', updatedBy: 'N/A'
    },
    {
        id: 4, businessId: 'BUS-2025-004', businessName: 'Island Souvenirs Shop',
        ownerName: 'Teresa Magbanua', businessType: 'Partnership', status: 'Inactive',
        address: 'Mactan Shrine Area', sitio: 'Mactan',
        description: 'Souvenir shop selling t-shirts, keychains, and local handicrafts.',
        dateRegistered: 'June 01, 2025',
        dateEncoded: 'June 01, 2025 | 10:00 AM', encodedBy: 'ADMIN', dateUpdated: 'Sept 15, 2025', updatedBy: 'ADMIN'
    },
    {
        id: 5, businessId: 'BUS-2025-005', businessName: 'Blue Waters Water Station',
        ownerName: 'Pedro Penduko', businessType: 'Franchise', status: 'Active',
        address: 'Purok 3, Suba-Basbas', sitio: 'Suba-Basbas',
        description: 'Water refilling station offering purified and alkaline water.',
        dateRegistered: 'Aug 05, 2025',
        dateEncoded: 'Aug 05, 2025 | 01:15 PM', encodedBy: 'STAFF_01', dateUpdated: 'N/A', updatedBy: 'N/A'
    }
];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Institutions', href: '/institutions' },
    { title: 'Businesses', href: '/institutions/business-profile' },
];

export default function BusinessProfile() {
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(mockBusinesses[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');

    // Filter Logic
    const filteredBusinesses = useMemo(() => {
        return mockBusinesses.filter(biz => {
            const matchesSearch =
                biz.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                biz.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                biz.businessId.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = filterStatus === 'All' || biz.status === filterStatus;

            return matchesSearch && matchesStatus;
        });
    }, [searchQuery, filterStatus]);

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to remove this business record?')) {
            console.log('Deleted business:', id);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Business Profile" />

            <div className="flex flex-col h-[calc(100vh-4rem)] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">

                {/* --- Header Bar --- */}
                <div className="flex items-center justify-between pb-2 border-b border-sidebar-border/60">
                    <div className="flex items-center gap-4">
                        <Link href="/institutions" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                            <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                                Institution: <span className="text-indigo-600 dark:text-indigo-400">Businesses</span>
                            </h1>
                        </div>
                    </div>
                    {/*/!* Export Button *!/*/}
                    {/*<button className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">*/}
                    {/*    <Download className="size-4" /> Export*/}
                    {/*</button>*/}
                </div>

                {/* --- Main Content Split --- */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                    {/* === LEFT COLUMN: List (Spans 4) === */}
                    <div className="lg:col-span-4 flex flex-col gap-4 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm overflow-hidden">

                        {/* List Header */}
                        <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/20 border-b border-sidebar-border/60 space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xs font-bold text-white bg-neutral-900 dark:bg-indigo-600 py-1 px-3 rounded-md uppercase tracking-wider">
                                        Business List
                                    </h2>
                                    {/* REGISTER BUTTON */}
                                    <button className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white p-1 rounded-md transition-colors shadow-sm" title="Register New Business">
                                        <Plus className="size-4" />
                                    </button>
                                </div>
                                <span className="text-[10px] text-neutral-400 font-mono">
                                    TOTAL: {filteredBusinesses.length}
                                </span>
                            </div>

                            {/* Search & Filter */}
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

                            {/* Filter Dropdown */}
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

                        {/* List Content */}
                        <div className="flex-1 overflow-auto">
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
                                        className={`
                                                cursor-pointer transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/10
                                                ${selectedBusiness?.id === biz.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-l-indigo-500' : 'border-l-4 border-l-transparent'}
                                            `}
                                    >
                                        <td className="px-4 py-3 font-mono text-xs text-neutral-500">{biz.id}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-neutral-900 dark:text-neutral-100">{biz.businessName}</div>
                                            <div className="text-[10px] text-neutral-500">{biz.businessId}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-xs text-neutral-600">{biz.ownerName}</span>
                                                {/* TRASH ICON */}
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
                        </div>
                    </div>

                    {/* === RIGHT COLUMN: Details (Spans 8) === */}
                    <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">

                        {/* Detail Content */}
                        {selectedBusiness ? (
                            <div className="flex-1 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm flex flex-col overflow-hidden">

                                {/* 1. Details Header */}
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
                                                    <User className="size-3.5" />
                                                    <span className="font-medium">Owner: {selectedBusiness.ownerName}</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-2 ${getStatusColor(selectedBusiness.status)}`}>
                                                        {selectedBusiness.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* EDIT BUTTON (Blue) */}
                                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all hover:shadow-md">
                                            <Edit3 className="size-3.5" /> Edit Business
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                                    {/* Info Grid */}
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

                                    {/* Description Block */}
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                            <FileText className="size-3.5" /> Description / Business Nature
                                        </h3>
                                        <div className="bg-neutral-50/50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 min-h-[120px]">
                                            {selectedBusiness.description}
                                        </div>
                                    </div>

                                </div>

                                {/* Footer Audit */}
                                <div className="p-4 border-t border-sidebar-border/60 bg-neutral-50 dark:bg-neutral-900/50 flex flex-col md:flex-row justify-between items-start md:items-center text-[10px] text-neutral-400 font-mono gap-4">
                                    <div className="space-y-1">
                                        <div className="flex gap-2">
                                            <span className="font-bold w-20">DATE ENCODED:</span>
                                            <span>{selectedBusiness.dateEncoded}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="font-bold w-20">ENCODED BY:</span>
                                            <span>{selectedBusiness.encodedBy}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <span className="font-bold">DATE UPDATED:</span>
                                            <span>{selectedBusiness.dateUpdated}</span>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <span className="font-bold">UPDATED BY:</span>
                                            <span>{selectedBusiness.updatedBy}</span>
                                        </div>
                                    </div>
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

// --- Reusable ---

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
