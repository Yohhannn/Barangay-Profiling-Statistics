import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft, Search, Plus, Trash2,
    Handshake, User, Calendar, FileText,
    Download, Edit3, X, SlidersHorizontal, Scale, MessageSquare
} from 'lucide-react';
import { useState, useMemo } from 'react';
import SettlementHistoryCreation from './popup/settlement-history-creation'; // Ensure correct path

// --- Types ---
interface SettlementRecord {
    id: number;
    settlementId: string;

    // Parties Involved
    complaineeCitizenId: string;
    complaineeName: string;
    complainantName: string;

    // Details
    status: 'Resolved' | 'Pending' | 'Escalated';
    complaintDescription: string;
    settlementDescription: string;
    dateOfSettlement: string;

    // Audit
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string;
    updatedBy: string;
}

// --- Mock Data ---
const mockSettlements: SettlementRecord[] = [
    {
        id: 1, settlementId: 'SET-2025-001',
        complaineeCitizenId: 'CIT-2025-001', complaineeName: 'Roberto Gonzales',
        complainantName: 'Lourdes Santos',
        status: 'Resolved',
        complaintDescription: 'Dispute regarding property boundary lines. Complainant claims the new fence encroaches 1 meter into her lot.',
        settlementDescription: 'Both parties agreed to hire a licensed geodetic engineer to resurvey the land. Fence will be moved if proven encroaching.',
        dateOfSettlement: 'July 15, 2025',
        dateEncoded: 'July 10, 2025 | 10:00 AM', encodedBy: 'ADMIN', dateUpdated: 'July 15, 2025', updatedBy: 'ADMIN'
    },
    {
        id: 2, settlementId: 'SET-2025-002',
        complaineeCitizenId: 'CIT-2025-005', complaineeName: 'Pedro Magtanggol',
        complainantName: 'Maria Clara',
        status: 'Pending',
        complaintDescription: 'Unpaid personal loan of P5,000 borrowed last May 2025. Complainee promised to pay but has not responded.',
        settlementDescription: 'Initial hearing scheduled. Complainee agreed to attend next week.',
        dateOfSettlement: 'N/A',
        dateEncoded: 'Aug 05, 2025 | 02:00 PM', encodedBy: 'STAFF_01', dateUpdated: 'N/A', updatedBy: 'N/A'
    },
    {
        id: 3, settlementId: 'SET-2025-003',
        complaineeCitizenId: 'CIT-2025-016', complaineeName: 'Chris Bacon',
        complainantName: 'Barangay Tanod Team',
        status: 'Resolved',
        complaintDescription: 'Public disturbance due to loud videoke session past curfew hours (11:30 PM).',
        settlementDescription: 'Complainee apologized and signed an agreement to observe quiet hours strictly. First warning issued.',
        dateOfSettlement: 'Aug 20, 2025',
        dateEncoded: 'Aug 20, 2025 | 08:30 AM', encodedBy: 'STAFF_02', dateUpdated: 'Aug 20, 2025', updatedBy: 'ADMIN'
    },
    {
        id: 4, settlementId: 'SET-2025-004',
        complaineeCitizenId: 'CIT-2025-009', complaineeName: 'Datu Silapulapu',
        complainantName: 'Fisherfolk Association',
        status: 'Escalated',
        complaintDescription: 'Alleged use of illegal fishing nets within the sanctuary area.',
        settlementDescription: 'No settlement reached at Barangay level. Case escalated to local police / BFAR.',
        dateOfSettlement: 'Sept 01, 2025',
        dateEncoded: 'Sept 01, 2025 | 09:00 AM', encodedBy: 'ADMIN', dateUpdated: 'Sept 05, 2025', updatedBy: 'ADMIN'
    },
    {
        id: 5, settlementId: 'SET-2025-005',
        complaineeCitizenId: 'CIT-2025-014', complaineeName: 'Antonio Luna',
        complainantName: 'Emilio Aguinaldo',
        status: 'Resolved',
        complaintDescription: 'Minor vehicular accident (sideswiped side mirror) in Purok 3.',
        settlementDescription: 'Complainee agreed to pay P2,000 for damages. Case closed.',
        dateOfSettlement: 'Oct 12, 2025',
        dateEncoded: 'Oct 12, 2025 | 04:00 PM', encodedBy: 'STAFF_01', dateUpdated: 'Oct 12, 2025', updatedBy: 'STAFF_01'
    }
];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Citizen Records', href: '/citizen-records' },
    { title: 'Settlement History', href: '/citizen-records/settlement-history' },
];

export default function SettlementHistory() {
    const [selectedRecord, setSelectedRecord] = useState<SettlementRecord | null>(mockSettlements[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');

    // --- Modal State ---
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Filter Logic
    const filteredHistory = useMemo(() => {
        return mockSettlements.filter(record => {
            const matchesSearch =
                record.complaineeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                record.complainantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                record.settlementId.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = filterStatus === 'All' || record.status === filterStatus;

            return matchesSearch && matchesStatus;
        });
    }, [searchQuery, filterStatus]);

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this settlement record?')) {
            console.log('Deleted settlement record:', id);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Settlement History" />

            {/* --- MOUNT THE MODAL HERE --- */}
            <SettlementHistoryCreation
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />

            <div className="flex flex-col h-[calc(100vh-4rem)] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">

                {/* --- Header Bar --- */}
                <div className="flex items-center justify-between pb-2 border-b border-sidebar-border/60">
                    <div className="flex items-center gap-4">
                        <Link href="/citizen-records" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                            <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                                History Records: <span className="text-amber-600 dark:text-amber-400">Settlement History</span>
                            </h1>
                        </div>
                    </div>
                </div>

                {/* --- Main Content Split --- */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                    {/* === LEFT COLUMN: List (Spans 4) === */}
                    <div className="lg:col-span-4 flex flex-col gap-4 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm overflow-hidden">

                        {/* List Header */}
                        <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/20 border-b border-sidebar-border/60 space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xs font-bold text-white bg-neutral-900 dark:bg-amber-600 py-1 px-3 rounded-md uppercase tracking-wider">
                                        Settlement List
                                    </h2>
                                    {/* REGISTER BUTTON (Green) - NOW CONNECTED */}
                                    <button
                                        onClick={() => setIsCreateOpen(true)}
                                        className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white p-1 rounded-md transition-colors shadow-sm active:scale-95"
                                        title="Record New Settlement"
                                    >
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
                                        placeholder="Search ID, Complainee..."
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`p-2 rounded-lg border border-sidebar-border transition-colors ${showFilters ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-white hover:bg-neutral-50 text-neutral-500'}`}
                                >
                                    {showFilters ? <X className="size-4" /> : <SlidersHorizontal className="size-4" />}
                                </button>
                            </div>

                            {/* Filter Dropdown */}
                            {showFilters && (
                                <div className="pt-2 border-t border-sidebar-border/50 animate-in slide-in-from-top-2">
                                    <select
                                        className="w-full text-xs p-2 rounded-lg border border-sidebar-border bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-amber-500/20"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="All">All Status</option>
                                        <option value="Resolved">Resolved</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Escalated">Escalated</option>
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
                                    <th className="px-4 py-3 font-semibold border-b border-sidebar-border">Complainee</th>
                                    <th className="px-4 py-3 font-semibold border-b border-sidebar-border text-right">Status</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/50">
                                {filteredHistory.map((rec) => (
                                    <tr
                                        key={rec.id}
                                        onClick={() => setSelectedRecord(rec)}
                                        className={`
                                                cursor-pointer transition-all hover:bg-amber-50 dark:hover:bg-amber-900/10
                                                ${selectedRecord?.id === rec.id ? 'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-l-amber-500' : 'border-l-4 border-l-transparent'}
                                            `}
                                    >
                                        <td className="px-4 py-3 font-mono text-xs text-neutral-500">{rec.settlementId}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-neutral-900 dark:text-neutral-100">{rec.complaineeName}</div>
                                            <div className="text-[10px] text-neutral-500">vs. {rec.complainantName}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getStatusColor(rec.status)}`}>
                                                        {rec.status}
                                                    </span>
                                                {/* TRASH ICON */}
                                                <button
                                                    onClick={(e) => handleDelete(e, rec.id)}
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
                        {selectedRecord ? (
                            <div className="flex-1 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm flex flex-col overflow-hidden">

                                {/* 1. Details Header */}
                                <div className="bg-neutral-50 dark:bg-neutral-900/20 border-b border-sidebar-border p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/20">
                                                <Handshake className="size-8 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                                    {selectedRecord.settlementId}
                                                </h2>
                                                <div className="flex items-center gap-2 mt-1 text-sm text-neutral-500">
                                                    <Scale className="size-3.5" />
                                                    <span className="font-medium">Case Status:</span>
                                                    <span className={`font-bold ${getStatusText(selectedRecord.status)}`}>{selectedRecord.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* EDIT BUTTON (Blue) */}
                                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all hover:shadow-md">
                                            <Edit3 className="size-3.5" /> Edit Settlement
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                                    {/* Info Grid: Parties Involved */}
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 bg-white dark:bg-sidebar border border-sidebar-border rounded-xl p-5 shadow-sm">
                                        <InfoRow label="Settlement ID" value={selectedRecord.settlementId} highlight />
                                        <InfoRow label="Complainee Citizen ID" value={selectedRecord.complaineeCitizenId} />
                                        <InfoRow label="Complainee Name" value={selectedRecord.complaineeName} />
                                        <InfoRow label="Complainant Name" value={selectedRecord.complainantName} />
                                    </div>

                                    {/* Descriptions */}
                                    <div className="grid grid-cols-1 gap-6">

                                        {/* Complaint Desc */}
                                        <div className="space-y-2">
                                            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                                <MessageSquare className="size-3.5 text-red-500" /> Complaint Description
                                            </h3>
                                            <div className="bg-red-50/30 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 min-h-[100px]">
                                                {selectedRecord.complaintDescription}
                                            </div>
                                        </div>

                                        {/* Settlement Desc */}
                                        <div className="space-y-2">
                                            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                                <Handshake className="size-3.5 text-green-500" /> Settlement Description
                                            </h3>
                                            <div className="bg-green-50/30 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-xl p-5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 min-h-[100px]">
                                                {selectedRecord.settlementDescription}
                                            </div>
                                        </div>

                                        {/* Date of Settlement */}
                                        <div className="flex justify-end pt-2 border-t border-sidebar-border/50">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="font-bold text-neutral-500 uppercase">Date of Settlement:</span>
                                                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                                                    {selectedRecord.dateOfSettlement}
                                                </span>
                                            </div>
                                        </div>

                                    </div>

                                </div>

                                {/* Footer Audit */}
                                <div className="p-4 border-t border-sidebar-border/60 bg-neutral-50 dark:bg-neutral-900/50 flex flex-col md:flex-row justify-between items-start md:items-center text-[10px] text-neutral-400 font-mono gap-4">
                                    <div className="space-y-1">
                                        <div className="flex gap-2">
                                            <span className="font-bold w-20">DATE ENCODED:</span>
                                            <span>{selectedRecord.dateEncoded}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="font-bold w-20">ENCODED BY:</span>
                                            <span>{selectedRecord.encodedBy}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <span className="font-bold">DATE UPDATED:</span>
                                            <span>{selectedRecord.dateUpdated}</span>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <span className="font-bold">UPDATED BY:</span>
                                            <span>{selectedRecord.updatedBy}</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-sidebar-border rounded-2xl bg-neutral-50/50 text-neutral-400">
                                <Handshake className="size-12 mb-2 opacity-20" />
                                <p>Select a settlement record to view details</p>
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
            <span className={`font-semibold text-sm ${highlight ? 'text-amber-600 dark:text-amber-400 font-mono' : 'text-neutral-900 dark:text-neutral-100'} ${className}`}>
                {value}
            </span>
        </div>
    );
}

// Helper for Status Colors
function getStatusColor(status: string) {
    switch (status) {
        case 'Resolved': return 'bg-green-100 text-green-700';
        case 'Pending': return 'bg-orange-100 text-orange-700';
        case 'Escalated': return 'bg-red-100 text-red-700';
        default: return 'bg-neutral-100 text-neutral-600';
    }
}

function getStatusText(status: string) {
    switch (status) {
        case 'Resolved': return 'text-green-600';
        case 'Pending': return 'text-orange-600';
        case 'Escalated': return 'text-red-600';
        default: return 'text-neutral-600';
    }
}
