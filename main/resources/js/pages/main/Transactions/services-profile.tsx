import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft, Search, Plus, Trash2,
    FileText, User, Calendar, CheckCircle,
    Download, Edit3, X, SlidersHorizontal, ClipboardList
} from 'lucide-react';
import { useState, useMemo } from 'react';

// --- Types ---
interface Transaction {
    id: number;
    transactionId: string;
    firstName: string;
    lastName: string;
    dateRequested: string;
    type: string; // e.g., "Barangay Clearance", "Complaint"
    status: 'Pending' | 'Processing' | 'Completed' | 'Rejected';
    purpose: string;

    // Audit
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string;
    updatedBy: string;
}

// --- Mock Data ---
const mockTransactions: Transaction[] = [
    {
        id: 1, transactionId: 'TRX-2025-001', firstName: 'Roberto', lastName: 'Gonzales',
        dateRequested: 'July 10, 2025', type: 'Barangay Clearance', status: 'Completed',
        purpose: 'For employment application requirements.',
        dateEncoded: 'July 10, 2025 | 09:30 AM', encodedBy: 'ADMIN', dateUpdated: 'July 10, 2025', updatedBy: 'ADMIN'
    },
    {
        id: 2, transactionId: 'TRX-2025-002', firstName: 'Alfredo', lastName: 'Garcia',
        dateRequested: 'July 10, 2025', type: 'Barangay Clearance', status: 'Processing',
        purpose: 'For business permit renewal.',
        dateEncoded: 'July 10, 2025 | 10:15 AM', encodedBy: 'STAFF_01', dateUpdated: 'N/A', updatedBy: 'N/A'
    },
    {
        id: 3, transactionId: 'TRX-2025-003', firstName: 'Maria', lastName: 'Santos',
        dateRequested: 'August 7, 2025', type: 'Complaint', status: 'Pending',
        purpose: 'Filing a complaint against a neighbor for noise disturbance.',
        dateEncoded: 'Aug 07, 2025 | 02:45 PM', encodedBy: 'STAFF_02', dateUpdated: 'N/A', updatedBy: 'N/A'
    },
    {
        id: 4, transactionId: 'TRX-2025-004', firstName: 'Juan', lastName: 'Dela Cruz',
        dateRequested: 'August 8, 2025', type: 'Indigency', status: 'Completed',
        purpose: 'Requirement for scholarship application.',
        dateEncoded: 'Aug 08, 2025 | 08:00 AM', encodedBy: 'ADMIN', dateUpdated: 'Aug 08, 2025', updatedBy: 'ADMIN'
    },
    {
        id: 5, transactionId: 'TRX-2025-005', firstName: 'Elena', lastName: 'Bautista',
        dateRequested: 'Sept 01, 2025', type: 'Business Permit', status: 'Rejected',
        purpose: 'New Sari-sari store application (Lacking documents).',
        dateEncoded: 'Sept 01, 2025 | 11:30 AM', encodedBy: 'STAFF_01', dateUpdated: 'Sept 02, 2025', updatedBy: 'ADMIN'
    }
];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Transactions', href: '/transactions' },
    { title: 'Services', href: '/transactions/services-profile' },
];

export default function ServicesProfile() {
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(mockTransactions[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');

    // Filter Logic
    const filteredTransactions = useMemo(() => {
        return mockTransactions.filter(trx => {
            const fullName = `${trx.firstName} ${trx.lastName}`.toLowerCase();
            const matchesSearch =
                fullName.includes(searchQuery.toLowerCase()) ||
                trx.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                trx.type.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = filterStatus === 'All' || trx.status === filterStatus;

            return matchesSearch && matchesStatus;
        });
    }, [searchQuery, filterStatus]);

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to remove this transaction record?')) {
            console.log('Deleted transaction:', id);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Service Transactions" />

            <div className="flex flex-col h-[calc(100vh-4rem)] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">

                {/* --- Header Bar --- */}
                <div className="flex items-center justify-between pb-2 border-b border-sidebar-border/60">
                    <div className="flex items-center gap-4">
                        <Link href="/transactions" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                            <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                                Transactions: <span className="text-violet-600 dark:text-violet-400">Services</span>
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
                                    <h2 className="text-xs font-bold text-white bg-neutral-900 dark:bg-violet-600 py-1 px-3 rounded-md uppercase tracking-wider">
                                        Transact. List
                                    </h2>
                                    {/* CREATE BUTTON */}
                                    <button className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white p-1 rounded-md transition-colors shadow-sm" title="Create New Transaction">
                                        <Plus className="size-4" />
                                    </button>
                                </div>
                                <span className="text-[10px] text-neutral-400 font-mono">
                                    TOTAL: {filteredTransactions.length}
                                </span>
                            </div>

                            {/* Search & Filter */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                                    <input
                                        type="text"
                                        placeholder="Search ID, Name, Type..."
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`p-2 rounded-lg border border-sidebar-border transition-colors ${showFilters ? 'bg-violet-50 border-violet-200 text-violet-600' : 'bg-white hover:bg-neutral-50 text-neutral-500'}`}
                                >
                                    {showFilters ? <X className="size-4" /> : <SlidersHorizontal className="size-4" />}
                                </button>
                            </div>

                            {/* Filter Dropdown */}
                            {showFilters && (
                                <div className="pt-2 border-t border-sidebar-border/50 animate-in slide-in-from-top-2">
                                    <select
                                        className="w-full text-xs p-2 rounded-lg border border-sidebar-border bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-violet-500/20"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="All">All Status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Rejected">Rejected</option>
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
                                    <th className="px-4 py-3 font-semibold border-b border-sidebar-border">Details</th>
                                    <th className="px-4 py-3 font-semibold border-b border-sidebar-border text-right">Type</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/50">
                                {filteredTransactions.map((trx) => (
                                    <tr
                                        key={trx.id}
                                        onClick={() => setSelectedTransaction(trx)}
                                        className={`
                                                cursor-pointer transition-all hover:bg-violet-50 dark:hover:bg-violet-900/10
                                                ${selectedTransaction?.id === trx.id ? 'bg-violet-50 dark:bg-violet-900/20 border-l-4 border-l-violet-500' : 'border-l-4 border-l-transparent'}
                                            `}
                                    >
                                        <td className="px-4 py-3 font-mono text-xs text-neutral-500">{trx.id}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-neutral-900 dark:text-neutral-100">{trx.firstName} {trx.lastName}</div>
                                            <div className="text-[10px] text-neutral-500">{trx.dateRequested}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-xs text-neutral-600 truncate max-w-[100px]">{trx.type}</span>
                                                {/* TRASH ICON */}
                                                <button
                                                    onClick={(e) => handleDelete(e, trx.id)}
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
                        {selectedTransaction ? (
                            <div className="flex-1 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm flex flex-col overflow-hidden">

                                {/* 1. Details Header */}
                                <div className="bg-neutral-50 dark:bg-neutral-900/20 border-b border-sidebar-border p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/20">
                                                <ClipboardList className="size-8 text-violet-600 dark:text-violet-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                                    {selectedTransaction.type}
                                                </h2>
                                                <div className="flex items-center gap-2 mt-1 text-sm text-neutral-500">
                                                    <span className="font-mono bg-white dark:bg-black/20 border px-1.5 rounded text-xs">
                                                        {selectedTransaction.transactionId}
                                                    </span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-2 ${getStatusColor(selectedTransaction.status)}`}>
                                                        {selectedTransaction.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* EDIT BUTTON (Blue) */}
                                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all hover:shadow-md">
                                            <Edit3 className="size-3.5" /> Update Transaction
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 bg-white dark:bg-sidebar border border-sidebar-border rounded-xl p-5 shadow-sm">
                                        <InfoRow label="Requestor First Name" value={selectedTransaction.firstName} />
                                        <InfoRow label="Requestor Last Name" value={selectedTransaction.lastName} />
                                        <InfoRow label="Date Requested" value={selectedTransaction.dateRequested} />
                                        <InfoRow label="Transaction Type" value={selectedTransaction.type} highlight />
                                    </div>

                                    {/* Purpose Block */}
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                            <FileText className="size-3.5" /> Purpose / Description
                                        </h3>
                                        <div className="bg-neutral-50/50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 min-h-[120px]">
                                            {selectedTransaction.purpose}
                                        </div>
                                    </div>

                                </div>

                                {/* Footer Audit */}
                                <div className="p-4 border-t border-sidebar-border/60 bg-neutral-50 dark:bg-neutral-900/50 flex flex-col md:flex-row justify-between items-start md:items-center text-[10px] text-neutral-400 font-mono gap-4">
                                    <div className="space-y-1">
                                        <div className="flex gap-2">
                                            <span className="font-bold w-20">DATE ENCODED:</span>
                                            <span>{selectedTransaction.dateEncoded}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="font-bold w-20">ENCODED BY:</span>
                                            <span>{selectedTransaction.encodedBy}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <span className="font-bold">DATE UPDATED:</span>
                                            <span>{selectedTransaction.dateUpdated}</span>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <span className="font-bold">UPDATED BY:</span>
                                            <span>{selectedTransaction.updatedBy}</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-sidebar-border rounded-2xl bg-neutral-50/50 text-neutral-400">
                                <ClipboardList className="size-12 mb-2 opacity-20" />
                                <p>Select a transaction to view details</p>
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
            <span className={`font-semibold text-sm ${highlight ? 'text-violet-600 dark:text-violet-400 font-mono' : 'text-neutral-900 dark:text-neutral-100'}`}>
                {value}
            </span>
        </div>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'Completed': return 'bg-green-100 text-green-700';
        case 'Pending': return 'bg-orange-100 text-orange-700';
        case 'Processing': return 'bg-blue-100 text-blue-700';
        case 'Rejected': return 'bg-red-100 text-red-700';
        default: return 'bg-neutral-100 text-neutral-600';
    }
}
