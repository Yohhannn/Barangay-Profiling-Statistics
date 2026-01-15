import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft, Search, Plus, Trash2,
    FileClock, User, Calendar, FileText,
    Download, Edit3, X, SlidersHorizontal
} from 'lucide-react';
import { useState, useMemo } from 'react';

// --- Types ---
interface HistoryRecord {
    id: number;
    citizenId: string;
    firstName: string;
    lastName: string;
    type: 'Violation' | 'Complaint' | 'Commendation' | 'Other';
    title: string;
    description: string;
    status: 'Resolved' | 'Pending' | 'Active';
    dateRecorded: string;

    // Audit
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string;
    updatedBy: string;
}

// --- Mock Data ---
const mockHistory: HistoryRecord[] = [
    {
        id: 1, citizenId: 'CIT-2025-001', firstName: 'Roberto', lastName: 'Gonzales',
        type: 'Complaint', title: 'Noise Complaint',
        description: 'Resident reported loud videoke session past 10 PM on a weeknight. First warning issued.',
        status: 'Resolved', dateRecorded: '2025-06-15',
        dateEncoded: '2025-06-16 | 08:30 AM', encodedBy: 'STAFF_01', dateUpdated: '2025-06-17', updatedBy: 'ADMIN'
    },
    {
        id: 2, citizenId: 'CIT-2025-001', firstName: 'Roberto', lastName: 'Gonzales',
        type: 'Violation', title: 'Traffic Violation',
        description: 'Caught driving motorcycle without a helmet within barangay premises. Ticket issued.',
        status: 'Pending', dateRecorded: '2025-08-20',
        dateEncoded: '2025-08-20 | 09:15 AM', encodedBy: 'Tanod A', dateUpdated: 'N/A', updatedBy: 'N/A'
    },
    {
        id: 3, citizenId: 'CIT-2025-005', firstName: 'Pedro', lastName: 'Magtanggol',
        type: 'Commendation', title: 'Community Service',
        description: 'Volunteered for the coastal cleanup drive and donated cleaning materials.',
        status: 'Active', dateRecorded: '2025-09-01',
        dateEncoded: '2025-09-02 | 10:00 AM', encodedBy: 'ADMIN', dateUpdated: 'N/A', updatedBy: 'N/A'
    },
    {
        id: 4, citizenId: 'CIT-2025-014', firstName: 'Antonio', lastName: 'Luna',
        type: 'Other', title: 'Lost ID Affidavit',
        description: 'Filed an affidavit of loss for a government ID.',
        status: 'Resolved', dateRecorded: '2025-07-10',
        dateEncoded: '2025-07-10 | 02:00 PM', encodedBy: 'STAFF_02', dateUpdated: '2025-07-11', updatedBy: 'STAFF_02'
    },
    {
        id: 5, citizenId: 'CIT-2025-009', firstName: 'Datu', lastName: 'Silapulapu',
        type: 'Violation', title: 'Curfew Violation',
        description: 'Found loitering outside during curfew hours (minor). Parents notified.',
        status: 'Resolved', dateRecorded: '2025-05-05',
        dateEncoded: '2025-05-05 | 11:45 PM', encodedBy: 'Tanod B', dateUpdated: '2025-05-06', updatedBy: 'ADMIN'
    }
];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Citizen Records', href: '/citizen-records' },
    { title: 'Citizen History', href: '/citizen-records/citizen-history' },
];

export default function CitizenHistory() {
    const [selectedHistory, setSelectedHistory] = useState<HistoryRecord | null>(mockHistory[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterType, setFilterType] = useState('All');

    // Filter Logic
    const filteredHistory = useMemo(() => {
        return mockHistory.filter(record => {
            const matchesSearch =
                record.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                record.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                record.title.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType = filterType === 'All' || record.type === filterType;

            return matchesSearch && matchesType;
        });
    }, [searchQuery, filterType]);

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this record?')) {
            console.log('Deleted history record:', id);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Citizen History" />

            <div className="flex flex-col h-[calc(100vh-4rem)] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">

                {/* --- Header Bar --- */}
                <div className="flex items-center justify-between pb-2 border-b border-sidebar-border/60">
                    <div className="flex items-center gap-4">
                        <Link href="/citizen-records" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                            <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                                Citizen Records: <span className="text-purple-600 dark:text-purple-400">Citizen History</span>
                            </h1>
                        </div>
                    </div>
                    {/*/!* Export Button (Top Right) *!/*/}
                    {/*<button className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">*/}
                    {/*    <Download className="size-4" /> Export Report*/}
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
                                    <h2 className="text-xs font-bold text-white bg-neutral-900 dark:bg-purple-600 py-1 px-3 rounded-md uppercase tracking-wider">
                                        Records List
                                    </h2>
                                    {/* RECORD (ADD) BUTTON */}
                                    <button className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white p-1 rounded-md transition-colors shadow-sm" title="Record New History">
                                        <Plus className="size-4" />
                                    </button>
                                </div>
                                <span className="text-[10px] text-neutral-400 font-mono">
                                    TOTAL: {filteredHistory.length}
                                </span>
                            </div>

                            {/* Search & Filter */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                                    <input
                                        type="text"
                                        placeholder="Search Name or Record Type..."
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`p-2 rounded-lg border border-sidebar-border transition-colors ${showFilters ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-white hover:bg-neutral-50 text-neutral-500'}`}
                                >
                                    {showFilters ? <X className="size-4" /> : <SlidersHorizontal className="size-4" />}
                                </button>
                            </div>

                            {/* Filter Dropdown */}
                            {showFilters && (
                                <div className="pt-2 border-t border-sidebar-border/50 animate-in slide-in-from-top-2">
                                    <select
                                        className="w-full text-xs p-2 rounded-lg border border-sidebar-border bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-purple-500/20"
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                    >
                                        <option value="All">All Types</option>
                                        <option value="Violation">Violation</option>
                                        <option value="Complaint">Complaint</option>
                                        <option value="Commendation">Commendation</option>
                                        <option value="Other">Other</option>
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
                                    <th className="px-4 py-3 font-semibold border-b border-sidebar-border">Citizen Name</th>
                                    <th className="px-4 py-3 font-semibold border-b border-sidebar-border text-right">Type</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/50">
                                {filteredHistory.map((rec) => (
                                    <tr
                                        key={rec.id}
                                        onClick={() => setSelectedHistory(rec)}
                                        className={`
                                                cursor-pointer transition-all hover:bg-purple-50 dark:hover:bg-purple-900/10
                                                ${selectedHistory?.id === rec.id ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-l-purple-500' : 'border-l-4 border-l-transparent'}
                                            `}
                                    >
                                        <td className="px-4 py-3 font-mono text-xs text-neutral-500">{rec.id}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-neutral-900 dark:text-neutral-100">{rec.firstName} {rec.lastName}</div>
                                            <div className="text-[10px] text-neutral-500">{rec.title}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getTypeColor(rec.type)}`}>
                                                        {rec.type}
                                                    </span>
                                                {/* TRASH ICON ADDED HERE */}
                                                <button
                                                    onClick={(e) => handleDelete(e, rec.id)}
                                                    className="text-neutral-300 hover:text-red-500 transition-colors p-1"
                                                    title="Delete Record"
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
                        {selectedHistory ? (
                            <div className="flex-1 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm flex flex-col overflow-hidden">

                                {/* 1. Details Header (New) */}
                                <div className="bg-neutral-50 dark:bg-neutral-900/20 border-b border-sidebar-border p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-xl ${getTypeBg(selectedHistory.type)}`}>
                                                <FileClock className={`size-8 ${getTypeText(selectedHistory.type)}`} />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                                    {selectedHistory.title}
                                                </h2>
                                                <div className="flex items-center gap-2 mt-1 text-sm text-neutral-500">
                                                    <User className="size-3.5" />
                                                    <span className="font-medium">{selectedHistory.firstName} {selectedHistory.lastName}</span>
                                                    <span className="font-mono bg-white dark:bg-black/20 border px-1.5 rounded text-xs ml-2">
                                                        {selectedHistory.citizenId}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* EDIT BUTTON MOVED HERE */}
                                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all hover:shadow-md">
                                            <Edit3 className="size-3.5" /> Edit History
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 bg-white dark:bg-sidebar border border-sidebar-border rounded-xl p-5 shadow-sm">
                                        <InfoRow label="History ID" value={String(selectedHistory.id).padStart(4, '0')} highlight />
                                        <InfoRow label="Date Recorded" value={selectedHistory.dateRecorded} />
                                        <InfoRow label="History Type" value={selectedHistory.type}
                                                 className={getTypeText(selectedHistory.type)}
                                        />
                                        <InfoRow label="Current Status" value={selectedHistory.status} />
                                    </div>

                                    {/* Description Block */}
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                            <FileText className="size-3.5" /> Full Description
                                        </h3>
                                        <div className="bg-neutral-50/50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 min-h-[150px]">
                                            {selectedHistory.description}
                                        </div>
                                    </div>

                                </div>

                                {/* Footer Audit */}
                                <div className="p-4 border-t border-sidebar-border/60 bg-neutral-50 dark:bg-neutral-900/50 flex flex-col md:flex-row justify-between items-start md:items-center text-[10px] text-neutral-400 font-mono gap-4">
                                    <div className="space-y-1">
                                        <div className="flex gap-2">
                                            <span className="font-bold w-20">DATE ENCODED:</span>
                                            <span>{selectedHistory.dateEncoded}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="font-bold w-20">ENCODED BY:</span>
                                            <span>{selectedHistory.encodedBy}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <span className="font-bold">DATE UPDATED:</span>
                                            <span>{selectedHistory.dateUpdated}</span>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <span className="font-bold">UPDATED BY:</span>
                                            <span>{selectedHistory.updatedBy}</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-sidebar-border rounded-2xl bg-neutral-50/50 text-neutral-400">
                                <FileClock className="size-12 mb-2 opacity-20" />
                                <p>Select a record to view details</p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

// --- Reusable ---

function InfoRow({ label, value, highlight = false, className = '' }: { label: string, value: string, highlight?: boolean, className?: string }) {
    return (
        <div className="flex justify-between border-b border-sidebar-border/50 pb-1">
            <span className="text-neutral-500 font-medium text-sm">{label}:</span>
            <span className={`font-semibold text-sm ${highlight ? 'text-purple-600 dark:text-purple-400 font-mono' : 'text-neutral-900 dark:text-neutral-100'} ${className}`}>
                {value}
            </span>
        </div>
    );
}

// Helper for Type Colors
function getTypeColor(type: string) {
    switch (type) {
        case 'Violation': return 'bg-red-100 text-red-700';
        case 'Complaint': return 'bg-orange-100 text-orange-700';
        case 'Commendation': return 'bg-green-100 text-green-700';
        default: return 'bg-neutral-100 text-neutral-600';
    }
}

function getTypeBg(type: string) {
    switch (type) {
        case 'Violation': return 'bg-red-100 dark:bg-red-900/20';
        case 'Complaint': return 'bg-orange-100 dark:bg-orange-900/20';
        case 'Commendation': return 'bg-green-100 dark:bg-green-900/20';
        default: return 'bg-neutral-100 dark:bg-neutral-800';
    }
}

function getTypeText(type: string) {
    switch (type) {
        case 'Violation': return 'text-red-600';
        case 'Complaint': return 'text-orange-600';
        case 'Commendation': return 'text-green-600';
        default: return 'text-neutral-600';
    }
}
