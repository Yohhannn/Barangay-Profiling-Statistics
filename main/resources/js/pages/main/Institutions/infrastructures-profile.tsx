import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft, Search, Plus, Trash2,
    Building, User, MapPin, FileText,
    Download, Edit3, X, SlidersHorizontal, Construction
} from 'lucide-react';
import { useState, useMemo } from 'react';

// --- Types ---
interface Infrastructure {
    id: number;
    infraId: string;
    name: string;
    owner: string; // 'No Owner' means Public/Gov
    type: string;
    address: string;
    sitio: string;
    classification: 'Public' | 'Private';
    description: string;
    dateRegistered: string;

    // Audit
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string;
    updatedBy: string;
}

// --- Mock Data ---
const mockInfrastructures: Infrastructure[] = [
    {
        id: 1, infraId: 'INF-2025-001', name: 'Marigondon Barangay Hall',
        owner: 'Barangay Government', type: 'Government Building', classification: 'Public',
        address: 'Marigondon Proper', sitio: 'Marigondon Proper',
        description: 'Main administrative building of the Barangay.',
        dateRegistered: 'July 10, 2025',
        dateEncoded: 'July 10, 2025 | 7:06 PM', encodedBy: 'ADMIN', dateUpdated: 'N/A', updatedBy: 'N/A'
    },
    {
        id: 2, infraId: 'INF-2025-002', name: 'Tan Residence',
        owner: 'Michael C. Tan', type: 'Residential', classification: 'Private',
        address: 'Sitio Likoan', sitio: 'Likoan',
        description: 'Two-storey residential concrete house.',
        dateRegistered: 'July 10, 2025',
        dateEncoded: 'July 10, 2025 | 7:06 PM', encodedBy: 'ADMIN', dateUpdated: 'N/A', updatedBy: 'N/A'
    },
    {
        id: 3, infraId: 'INF-2025-003', name: 'Marigondon Covered Court',
        owner: 'Barangay Government', type: 'Sports Facility', classification: 'Public',
        address: 'Near Elementary School', sitio: 'Marigondon Proper',
        description: 'Multi-purpose sports complex for basketball and community events.',
        dateRegistered: 'Aug 05, 2025',
        dateEncoded: 'Aug 05, 2025 | 09:30 AM', encodedBy: 'STAFF_01', dateUpdated: 'N/A', updatedBy: 'N/A'
    },
    {
        id: 4, infraId: 'INF-2025-004', name: 'San Roque Chapel',
        owner: 'Catholic Church', type: 'Religious', classification: 'Private',
        address: 'Purok 2, Sangi', sitio: 'Sangi',
        description: 'Community chapel for weekly masses.',
        dateRegistered: 'June 20, 2025',
        dateEncoded: 'June 20, 2025 | 02:15 PM', encodedBy: 'ADMIN', dateUpdated: 'N/A', updatedBy: 'N/A'
    },
    {
        id: 5, infraId: 'INF-2025-005', name: 'Cadulang Health Center',
        owner: 'Barangay Government', type: 'Health Facility', classification: 'Public',
        address: 'Cadulang 1 Main Road', sitio: 'Cadulang 1',
        description: 'Satellite health station providing basic medical services.',
        dateRegistered: 'Sept 01, 2025',
        dateEncoded: 'Sept 01, 2025 | 10:00 AM', encodedBy: 'STAFF_02', dateUpdated: 'N/A', updatedBy: 'N/A'
    }
];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Institutions', href: '/institutions' },
    { title: 'Infrastructures', href: '/institutions/infrastructure-profile' },
];

export default function InfrastructureProfile() {
    const [selectedInfra, setSelectedInfra] = useState<Infrastructure | null>(mockInfrastructures[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterClass, setFilterClass] = useState('All');

    // Filter Logic
    const filteredInfra = useMemo(() => {
        return mockInfrastructures.filter(item => {
            const matchesSearch =
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.infraId.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesClass = filterClass === 'All' || item.classification === filterClass;

            return matchesSearch && matchesClass;
        });
    }, [searchQuery, filterClass]);

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to remove this infrastructure record?')) {
            console.log('Deleted infrastructure:', id);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Infrastructure Profile" />

            <div className="flex flex-col h-[calc(100vh-4rem)] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">

                {/* --- Header Bar --- */}
                <div className="flex items-center justify-between pb-2 border-b border-sidebar-border/60">
                    <div className="flex items-center gap-4">
                        <Link href="/institutions" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                            <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                                Institution: <span className="text-sky-600 dark:text-sky-400">Infrastructures</span>
                            </h1>
                        </div>
                    </div>
                    {/* Export Button */}
                    <button className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">
                        <Download className="size-4" /> Export
                    </button>
                </div>

                {/* --- Main Content Split --- */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                    {/* === LEFT COLUMN: List (Spans 4) === */}
                    <div className="lg:col-span-4 flex flex-col gap-4 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm overflow-hidden">

                        {/* List Header */}
                        <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/20 border-b border-sidebar-border/60 space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xs font-bold text-white bg-neutral-900 dark:bg-sky-600 py-1 px-3 rounded-md uppercase tracking-wider">
                                        Infra List
                                    </h2>
                                    {/* REGISTER BUTTON */}
                                    <button className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white p-1 rounded-md transition-colors shadow-sm" title="Register New Infrastructure">
                                        <Plus className="size-4" />
                                    </button>
                                </div>
                                <span className="text-[10px] text-neutral-400 font-mono">
                                    TOTAL: {filteredInfra.length}
                                </span>
                            </div>

                            {/* Search & Filter */}
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

                            {/* Filter Dropdown */}
                            {showFilters && (
                                <div className="pt-2 border-t border-sidebar-border/50 animate-in slide-in-from-top-2">
                                    <select
                                        className="w-full text-xs p-2 rounded-lg border border-sidebar-border bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-sky-500/20"
                                        value={filterClass}
                                        onChange={(e) => setFilterClass(e.target.value)}
                                    >
                                        <option value="All">All Classifications</option>
                                        <option value="Public">Public</option>
                                        <option value="Private">Private</option>
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
                                    <th className="px-4 py-3 font-semibold border-b border-sidebar-border">Name</th>
                                    <th className="px-4 py-3 font-semibold border-b border-sidebar-border text-right">Owner</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/50">
                                {filteredInfra.map((item) => (
                                    <tr
                                        key={item.id}
                                        onClick={() => setSelectedInfra(item)}
                                        className={`
                                                cursor-pointer transition-all hover:bg-sky-50 dark:hover:bg-sky-900/10
                                                ${selectedInfra?.id === item.id ? 'bg-sky-50 dark:bg-sky-900/20 border-l-4 border-l-sky-500' : 'border-l-4 border-l-transparent'}
                                            `}
                                    >
                                        <td className="px-4 py-3 font-mono text-xs text-neutral-500">{item.id}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-neutral-900 dark:text-neutral-100">{item.name}</div>
                                            <div className="text-[10px] text-neutral-500">{item.infraId}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-xs text-neutral-600 truncate max-w-[100px]">{item.owner}</span>
                                                {/* TRASH ICON */}
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
                        </div>
                    </div>

                    {/* === RIGHT COLUMN: Details (Spans 8) === */}
                    <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">

                        {/* Detail Content */}
                        {selectedInfra ? (
                            <div className="flex-1 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm flex flex-col overflow-hidden">

                                {/* 1. Details Header */}
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
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-2 ${getClassColor(selectedInfra.classification)}`}>
                                                        {selectedInfra.classification}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* EDIT BUTTON (Blue) */}
                                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all hover:shadow-md">
                                            <Edit3 className="size-3.5" /> Edit Infra
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                                    {/* Info Grid */}
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
                                                    <span className="text-sm text-neutral-800 dark:text-neutral-200">{selectedInfra.address}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description Block */}
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                            <FileText className="size-3.5" /> Description / Notes
                                        </h3>
                                        <div className="bg-neutral-50/50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 min-h-[120px]">
                                            {selectedInfra.description}
                                        </div>
                                    </div>

                                </div>

                                {/* Footer Audit */}
                                <div className="p-4 border-t border-sidebar-border/60 bg-neutral-50 dark:bg-neutral-900/50 flex flex-col md:flex-row justify-between items-start md:items-center text-[10px] text-neutral-400 font-mono gap-4">
                                    <div className="space-y-1">
                                        <div className="flex gap-2">
                                            <span className="font-bold w-20">DATE ENCODED:</span>
                                            <span>{selectedInfra.dateEncoded}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="font-bold w-20">ENCODED BY:</span>
                                            <span>{selectedInfra.encodedBy}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <span className="font-bold">DATE UPDATED:</span>
                                            <span>{selectedInfra.dateUpdated}</span>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <span className="font-bold">UPDATED BY:</span>
                                            <span>{selectedInfra.updatedBy}</span>
                                        </div>
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

// --- Reusable ---

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

function getClassColor(classification: string) {
    switch (classification) {
        case 'Public': return 'bg-blue-100 text-blue-700';
        case 'Private': return 'bg-purple-100 text-purple-700';
        default: return 'bg-neutral-100 text-neutral-600';
    }
}
