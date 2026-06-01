import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft, Search, Plus, Trash2,
    FileText, User,
    Download, Edit3, X, SlidersHorizontal, ClipboardList,
    BarChart2, TrendingUp, RotateCcw, Check,
} from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import ServicesCreation from './popup/services-creation';
import ServicesEdit from './popup/services-edit';
import ServicesQuickView from './popup/services-quick-view';
import CitizenQuickView from '../CitizenRecords/popup/citizen-quick-view';
import Swal from 'sweetalert2';

interface Transaction {
    id: number;
    tlUuid: string;
    transactionId: string;
    firstName: string;
    lastName: string;
    middleName: string;
    suffix: string;
    fullName: string;
    dateRequested: string;
    dateRequestedRaw: string;
    type: string;
    status: 'Pending' | 'Approved' | 'Declined';
    purpose: string;
    ctzId: number | null;
    ctzUuid: string | null;

    // Audit
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string;
    updatedBy: string;

    exportLogs?: {
        id: number;
        dateExported: string;
        exportedBy: string;
    }[];
}

interface ServicesProfileProps {
    transactions: Transaction[];
    systemAccounts?: {id: number, name: string}[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Transactions', href: '/transactions' },
    { title: 'Services', href: '/transactions/services-profile' },
];

export default function ServicesProfile({ transactions = [], systemAccounts = [] }: ServicesProfileProps) {
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');

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
        if (filterStatus !== 'All') count++;
        if (dateEncodedStart || dateEncodedEnd) count++;
        if (dateUpdatedStart || dateUpdatedEnd) count++;
        if (encodedByFilter.length > 0) count++;
        if (updatedByFilter.length > 0) count++;
        return count;
    }, [filterStatus, dateEncodedStart, dateEncodedEnd, dateUpdatedStart, dateUpdatedEnd, encodedByFilter, updatedByFilter]);

    const resetFilters = () => {
        setFilterStatus('All');
        setDateEncodedStart(''); setDateEncodedEnd('');
        setDateUpdatedStart(''); setDateUpdatedEnd('');
        setEncodedByFilter([]); setUpdatedByFilter([]);
    };

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [quickViewId, setQuickViewId] = useState<number | null>(null);
    const [citizenQuickViewId, setCitizenQuickViewId] = useState<number | null>(null);

    // Update selected transaction when prop updates
    useEffect(() => {
        if (selectedTransaction) {
            const updated = transactions.find(t => t.id === selectedTransaction.id);
            if (updated) setSelectedTransaction(updated);
            else setSelectedTransaction(null);
        } else if (transactions.length > 0) {
            setSelectedTransaction(transactions[0]);
        }
    }, [transactions]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(trx => {
            const fullName = trx.fullName.toLowerCase();
            const matchesSearch =
                fullName.includes(searchQuery.toLowerCase()) ||
                trx.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                trx.type.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = filterStatus === 'All' || trx.status === filterStatus;

            const encodedDate = trx.dateEncoded ? new Date(trx.dateEncoded) : null;
            const matchesEncodedStart = !dateEncodedStart || (encodedDate && encodedDate >= new Date(dateEncodedStart));
            const matchesEncodedEnd   = !dateEncodedEnd   || (encodedDate && encodedDate <= new Date(dateEncodedEnd));

            const updatedDate = trx.dateUpdated ? new Date(trx.dateUpdated) : null;
            const matchesUpdatedStart = !dateUpdatedStart || (updatedDate && updatedDate >= new Date(dateUpdatedStart));
            const matchesUpdatedEnd   = !dateUpdatedEnd   || (updatedDate && updatedDate <= new Date(dateUpdatedEnd));

            const matchesEncodedBy = encodedByFilter.length === 0 || encodedByFilter.includes(trx.encodedBy);
            const matchesUpdatedBy = updatedByFilter.length === 0 || updatedByFilter.includes(trx.updatedBy);

            return matchesSearch && matchesStatus
                && matchesEncodedStart && matchesEncodedEnd
                && matchesUpdatedStart && matchesUpdatedEnd
                && matchesEncodedBy && matchesUpdatedBy;
        });
    }, [searchQuery, filterStatus, transactions, dateEncodedStart, dateEncodedEnd, dateUpdatedStart, dateUpdatedEnd, encodedByFilter, updatedByFilter]);

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
        router.delete(`/transactions/services/${archiveTarget.id}`, {
            data: { deleted_reason: archiveReason },
            preserveScroll: true,
            onSuccess: () => { setArchiveTarget(null); setSelectedTransaction(null); },
            onError: (errors: any) => { setArchiveError(errors?.error || 'Failed to archive. Please try again.'); },
            onFinish: () => setArchiveLoading(false),
        });
    };

    const handleExportPdf = () => {
        if (!selectedTransaction) {
            Swal.fire({
                icon: 'warning',
                title: 'No Transaction Selected',
                text: 'Please select a transaction to export.',
            });
            return;
        }

        const printWindow = window.open('', '_blank');
        
        // Log the export
        fetch(`/transactions/services/${selectedTransaction.id}/export-log`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then(res => res.json()).then(data => {
            if(data.success) {
                router.reload({ only: ['transactions'] });
            }
        }).catch(err => console.error("Failed to log export", err));

        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Export - ${selectedTransaction.transactionId}</title>
                        <style>
                            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #111; }
                            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #111; padding-bottom: 20px; }
                            .header h1 { margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px; }
                            .header p { margin: 8px 0 0; color: #555; font-size: 14px; }
                            .content { line-height: 1.8; font-size: 16px; margin-top: 30px; }
                            .row { display: flex; justify-content: space-between; margin-bottom: 18px; border-bottom: 1px solid #ddd; padding-bottom: 8px; }
                            .label { font-weight: bold; color: #444; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; }
                            .value { font-weight: bold; font-size: 16px; }
                            .purpose-block { margin-top: 30px; }
                            .purpose-content { padding: 20px; background: #fafafa; border: 1px solid #ccc; min-height: 80px; margin-top: 10px; font-style: italic; }
                            .footer { margin-top: 60px; font-size: 12px; color: #777; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
                            
                            @media print {
                                body { padding: 0; margin: 20px; }
                                .purpose-content { border: 1px solid #000; background: transparent; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>Barangay Service Request</h1>
                            <p>Official Transaction Record - ${selectedTransaction.transactionId}</p>
                        </div>
                        <div class="content">
                            <div class="row"><span class="label">Requestor Name:</span> <span class="value">${selectedTransaction.fullName}</span></div>
                            <div class="row"><span class="label">Date Requested:</span> <span class="value">${selectedTransaction.dateRequested}</span></div>
                            <div class="row"><span class="label">Transaction Type:</span> <span class="value">${selectedTransaction.type}</span></div>
                            <div class="row"><span class="label">Status:</span> <span class="value" style="color: ${selectedTransaction.status === 'Approved' ? 'green' : selectedTransaction.status === 'Declined' ? 'red' : 'orange'}">${selectedTransaction.status}</span></div>
                            <div class="purpose-block">
                                <span class="label">Purpose / Description:</span> 
                                <div class="purpose-content">
                                    ${selectedTransaction.purpose || 'No description provided.'}
                                </div>
                            </div>
                        </div>
                        <div class="footer">
                            <p>This is a system generated document. Generated on ${new Date().toLocaleString()}</p>
                            <p>Encoded by: ${selectedTransaction.encodedBy}</p>
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
            }, 500);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Service Transactions" />

            <ServicesCreation isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
            <ServicesEdit isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} transaction={selectedTransaction} />
            <ServicesQuickView isOpen={quickViewId !== null} onClose={() => setQuickViewId(null)} transactionId={quickViewId} />
            <CitizenQuickView isOpen={citizenQuickViewId !== null} onClose={() => setCitizenQuickViewId(null)} citizenId={citizenQuickViewId} />

            {archiveTarget !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#0f172a] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                        <div className="bg-red-950 text-white p-5 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold flex items-center gap-2"><Trash2 className="size-5 text-red-400" /> Archive Transaction</h2>
                                <p className="text-[10px] text-red-300 mt-1 uppercase tracking-wider">{archiveTarget.label}</p>
                            </div>
                            <button onClick={() => setArchiveTarget(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"><X className="size-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Are you sure you want to move this transaction to archives?</p>
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

                {/* Header Bar */}
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
                    <button onClick={handleExportPdf} className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">
                        <Download className="size-4" /> Export
                    </button>
                </div>

                {/* Mini Statistics Panel */}
                <MiniStats transactions={transactions} />

                {/* Main Content Split */}
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
                                    <button
                                        onClick={() => setIsCreateOpen(true)}
                                        className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white p-1 rounded-md transition-colors shadow-sm active:scale-95"
                                        title="Create New Transaction"
                                    >
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
                                    className={`relative p-2 rounded-lg border transition-colors ${showFilters || activeFilterCount > 0 ? 'bg-violet-50 border-violet-200 text-violet-600 dark:bg-violet-900/20 dark:border-violet-800' : 'bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 border-sidebar-border text-neutral-500'}`}
                                    title={activeFilterCount > 0 ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active` : 'Filters'}
                                >
                                    {showFilters ? <X className="size-4" /> : <SlidersHorizontal className="size-4" />}
                                    {!showFilters && activeFilterCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[9px] font-bold text-white leading-none">{activeFilterCount}</span>
                                    )}
                                </button>
                            </div>
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
                                        <td className="px-4 py-3 font-mono text-xs text-neutral-500">{trx.tlUuid}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-neutral-900 dark:text-neutral-100">{trx.fullName}</div>
                                            <div className="text-[10px] text-neutral-500">{trx.dateRequested}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-xs text-neutral-600 truncate max-w-[100px]">{trx.type}</span>
                                                {/* TRASH ICON */}
                                                <button
                                                    onClick={(e) => handleDelete(e, trx.id, trx.transactionId)}
                                                    className="text-neutral-300 hover:text-red-500 transition-colors p-1"
                                                >
                                                    <Trash2 className="size-3" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredTransactions.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="text-center py-10 text-neutral-400 text-xs">
                                            No transactions found.
                                        </td>
                                    </tr>
                                )}
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
                                        <div className="flex items-start gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setQuickViewId(selectedTransaction.id)}>
                                            <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/20">
                                                <ClipboardList className="size-8 text-violet-600 dark:text-violet-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
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
                                        <button 
                                            onClick={() => setIsEditOpen(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all hover:shadow-md">
                                            <Edit3 className="size-3.5" /> Update Transaction
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 bg-white dark:bg-sidebar border border-sidebar-border rounded-xl p-5 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                            <User className="w-32 h-32" />
                                        </div>
                                        <div className="col-span-1 md:col-span-2 pb-2 border-b border-sidebar-border flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <User className="size-4 text-violet-600" />
                                                <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-200 uppercase tracking-wider">Requestor Profile</h3>
                                            </div>
                                            {selectedTransaction.ctzUuid ? (
                                                <button
                                                    onClick={() => setCitizenQuickViewId(selectedTransaction.ctzId!)}
                                                    className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-violet-600 bg-violet-50 dark:bg-violet-900/20 px-2 py-1 rounded hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-all border border-violet-200 dark:border-violet-800"
                                                >
                                                    <User className="size-3" /> {selectedTransaction.ctzUuid} — View Citizen
                                                </button>
                                            ) : (
                                                <span className="text-[10px] font-mono font-medium text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                                                    Unlinked Requestor
                                                </span>
                                            )}
                                        </div>
                                        <InfoRow label="First Name" value={selectedTransaction.firstName} />
                                        <InfoRow label="Last Name" value={selectedTransaction.lastName} />
                                        <InfoRow label="Middle Name" value={selectedTransaction.middleName || 'N/A'} />
                                        <InfoRow label="Suffix" value={selectedTransaction.suffix || 'N/A'} />
                                        <InfoRow label="Date Requested" value={selectedTransaction.dateRequested} highlight />
                                        <InfoRow label="Transaction Type" value={selectedTransaction.type} highlight />
                                    </div>

                                    {/* Purpose Block */}
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                            <FileText className="size-3.5" /> Purpose / Description
                                        </h3>
                                        <div className="bg-neutral-50/50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 min-h-[120px]">
                                            {selectedTransaction.purpose || <span className="italic text-neutral-400">No purpose or description provided.</span>}
                                        </div>
                                    </div>

                                    {/* Export Logs Block */}
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                            <Download className="size-3.5" /> Export Logs
                                        </h3>
                                        <div className="bg-white dark:bg-sidebar border border-sidebar-border rounded-xl shadow-sm overflow-hidden">
                                            <table className="w-full text-sm text-left">
                                                <thead className="text-[10px] text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-900/50">
                                                    <tr>
                                                        <th className="px-4 py-2 font-semibold border-b border-sidebar-border">Date & Time Exported</th>
                                                        <th className="px-4 py-2 font-semibold border-b border-sidebar-border">Exported By</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-sidebar-border/50">
                                                    {selectedTransaction.exportLogs && selectedTransaction.exportLogs.length > 0 ? (
                                                        selectedTransaction.exportLogs.map((log) => (
                                                            <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/20 transition-colors">
                                                                <td className="px-4 py-2 font-mono text-xs text-neutral-600 dark:text-neutral-400">{log.dateExported}</td>
                                                                <td className="px-4 py-2 text-xs font-medium text-neutral-900 dark:text-neutral-100">{log.exportedBy}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={2} className="px-4 py-6 text-center text-xs text-neutral-400 italic">
                                                                No export logs available for this transaction.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
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
            {/* Filter Drawer */}
            {showFilters && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={() => setShowFilters(false)} />
                    <div className="fixed right-0 top-0 bottom-0 z-50 flex flex-col w-[380px] bg-white dark:bg-neutral-900 border-l border-sidebar-border shadow-2xl animate-in slide-in-from-right duration-200">
                        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-sidebar-border bg-violet-50 dark:bg-violet-900/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/40"><SlidersHorizontal className="size-4 text-violet-600 dark:text-violet-400" /></div>
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Filter Transactions</h3>
                                    <p className="text-xs text-neutral-500 mt-0.5">{activeFilterCount > 0 ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active` : 'No filters applied'}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowFilters(false)} className="p-2 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 text-neutral-500 transition-colors"><X className="size-5" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
                            {/* Status */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 shrink-0">Transaction</span>
                                    <div className="flex-1 h-px bg-sidebar-border/60" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">Status</label>
                                    <select className="w-full text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 focus:outline-none transition-colors" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                        <option value="All">All Status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Declined">Declined</option>
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
                                            <input type="date" className="flex-1 text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 min-w-0 transition-colors" value={dateEncodedStart} onChange={e => setDateEncodedStart(e.target.value)} />
                                            <span className="text-sm text-neutral-400 font-medium shrink-0">→</span>
                                            <input type="date" className="flex-1 text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 min-w-0 transition-colors" value={dateEncodedEnd} onChange={e => setDateEncodedEnd(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">Date Updated</label>
                                        <div className="flex items-center gap-2">
                                            <input type="date" className="flex-1 text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 min-w-0 transition-colors" value={dateUpdatedStart} onChange={e => setDateUpdatedStart(e.target.value)} />
                                            <span className="text-sm text-neutral-400 font-medium shrink-0">→</span>
                                            <input type="date" className="flex-1 text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 min-w-0 transition-colors" value={dateUpdatedEnd} onChange={e => setDateUpdatedEnd(e.target.value)} />
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
                                            <button onClick={() => setShowEncodedByDropdown(!showEncodedByDropdown)} className="w-full text-left text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex justify-between items-center gap-2 hover:border-violet-400 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/20">
                                                <span className="truncate">{encodedByFilter.length === 0 ? 'All Users' : `${encodedByFilter.length} user${encodedByFilter.length > 1 ? 's' : ''} selected`}</span>
                                                <Search className="size-4 text-neutral-400 shrink-0" />
                                            </button>
                                            {showEncodedByDropdown && (
                                                <div className="absolute z-[60] top-full mt-1 left-0 right-0 bg-white dark:bg-neutral-800 border border-sidebar-border rounded-xl shadow-2xl py-1 max-h-56 flex flex-col">
                                                    <div className="px-3 py-2 border-b border-sidebar-border/50"><input type="text" className="w-full text-sm p-2 bg-neutral-50 dark:bg-neutral-900 border border-sidebar-border rounded-lg focus:outline-none" placeholder="Search users..." value={encodedBySearch} onChange={e => setEncodedBySearch(e.target.value)} onClick={e => e.stopPropagation()} /></div>
                                                    <div className="overflow-y-auto flex-1 p-1.5">
                                                        <div className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer rounded-lg" onClick={() => setEncodedByFilter([])}>
                                                            <div className={`size-4 rounded border shrink-0 flex items-center justify-center ${encodedByFilter.length === 0 ? 'bg-violet-600 border-violet-600' : 'border-neutral-300 dark:border-neutral-600'}`}>{encodedByFilter.length === 0 && <Check className="size-3 text-white" />}</div>
                                                            <span className="font-medium">All Users</span>
                                                        </div>
                                                        {systemAccounts.filter(acc => acc.name.toLowerCase().includes(encodedBySearch.toLowerCase())).map(acc => {
                                                            const isSel = encodedByFilter.includes(acc.name);
                                                            return (
                                                                <div key={acc.id} className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer rounded-lg" onClick={() => setEncodedByFilter(isSel ? encodedByFilter.filter(n => n !== acc.name) : [...encodedByFilter, acc.name])}>
                                                                    <div className={`size-4 rounded border shrink-0 flex items-center justify-center ${isSel ? 'bg-violet-600 border-violet-600' : 'border-neutral-300 dark:border-neutral-600'}`}>{isSel && <Check className="size-3 text-white" />}</div>
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
                                            <button onClick={() => setShowUpdatedByDropdown(!showUpdatedByDropdown)} className="w-full text-left text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex justify-between items-center gap-2 hover:border-violet-400 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/20">
                                                <span className="truncate">{updatedByFilter.length === 0 ? 'All Users' : `${updatedByFilter.length} user${updatedByFilter.length > 1 ? 's' : ''} selected`}</span>
                                                <Search className="size-4 text-neutral-400 shrink-0" />
                                            </button>
                                            {showUpdatedByDropdown && (
                                                <div className="absolute z-[60] top-full mt-1 left-0 right-0 bg-white dark:bg-neutral-800 border border-sidebar-border rounded-xl shadow-2xl py-1 max-h-56 flex flex-col">
                                                    <div className="px-3 py-2 border-b border-sidebar-border/50"><input type="text" className="w-full text-sm p-2 bg-neutral-50 dark:bg-neutral-900 border border-sidebar-border rounded-lg focus:outline-none" placeholder="Search users..." value={updatedBySearch} onChange={e => setUpdatedBySearch(e.target.value)} onClick={e => e.stopPropagation()} /></div>
                                                    <div className="overflow-y-auto flex-1 p-1.5">
                                                        <div className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer rounded-lg" onClick={() => setUpdatedByFilter([])}>
                                                            <div className={`size-4 rounded border shrink-0 flex items-center justify-center ${updatedByFilter.length === 0 ? 'bg-violet-600 border-violet-600' : 'border-neutral-300 dark:border-neutral-600'}`}>{updatedByFilter.length === 0 && <Check className="size-3 text-white" />}</div>
                                                            <span className="font-medium">All Users</span>
                                                        </div>
                                                        {systemAccounts.filter(acc => acc.name.toLowerCase().includes(updatedBySearch.toLowerCase())).map(acc => {
                                                            const isSel = updatedByFilter.includes(acc.name);
                                                            return (
                                                                <div key={acc.id} className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer rounded-lg" onClick={() => setUpdatedByFilter(isSel ? updatedByFilter.filter(n => n !== acc.name) : [...updatedByFilter, acc.name])}>
                                                                    <div className={`size-4 rounded border shrink-0 flex items-center justify-center ${isSel ? 'bg-violet-600 border-violet-600' : 'border-neutral-300 dark:border-neutral-600'}`}>{isSel && <Check className="size-3 text-white" />}</div>
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
                            <button onClick={() => setShowFilters(false)} className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors shadow-sm">
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

function MiniStats({ transactions }: { transactions: Transaction[] }) {
    const total = transactions.length;

    // Status counts
    const statusCounts = useMemo(() => ({
        Approved: transactions.filter(t => t.status === 'Approved').length,
        Pending:  transactions.filter(t => t.status === 'Pending').length,
        Declined: transactions.filter(t => t.status === 'Declined').length,
    }), [transactions]);

    // Top 5 transaction types
    const topTypes = useMemo(() => {
        const map: Record<string, number> = {};
        transactions.forEach(t => { map[t.type] = (map[t.type] || 0) + 1; });
        return Object.entries(map)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }, [transactions]);

    // Monthly volume — last 6 months
    const monthlyData = useMemo(() => {
        const map: Record<string, number> = {};
        transactions.forEach(t => {
            if (!t.dateRequestedRaw) return;
            const d = new Date(t.dateRequestedRaw);
            if (isNaN(d.getTime())) return;
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            map[key] = (map[key] || 0) + 1;
        });
        const months: { label: string; count: number }[] = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            months.push({
                label: d.toLocaleString('default', { month: 'short' }),
                count: map[key] || 0,
            });
        }
        return months;
    }, [transactions]);

    const maxMonthly = Math.max(...monthlyData.map(m => m.count), 1);
    const maxType = topTypes[0]?.[1] ?? 1;

    if (total === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">

            {/* 1. Status Breakdown */}
            <div className="bg-white dark:bg-sidebar border border-sidebar-border/60 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                    <BarChart2 className="size-4 text-violet-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Status Breakdown</span>
                    <span className="ml-auto text-[10px] font-mono text-neutral-400">{total} total</span>
                </div>
                {/* Stacked bar */}
                <div className="flex h-3 rounded-full overflow-hidden gap-px">
                    {statusCounts.Approved > 0 && (
                        <div
                            className="bg-green-500 transition-all"
                            style={{ width: `${(statusCounts.Approved / total) * 100}%` }}
                            title={`Approved: ${statusCounts.Approved}`}
                        />
                    )}
                    {statusCounts.Pending > 0 && (
                        <div
                            className="bg-orange-400 transition-all"
                            style={{ width: `${(statusCounts.Pending / total) * 100}%` }}
                            title={`Pending: ${statusCounts.Pending}`}
                        />
                    )}
                    {statusCounts.Declined > 0 && (
                        <div
                            className="bg-red-400 transition-all"
                            style={{ width: `${(statusCounts.Declined / total) * 100}%` }}
                            title={`Declined: ${statusCounts.Declined}`}
                        />
                    )}
                </div>
                <div className="grid grid-cols-3 gap-1 text-center">
                    {([
                        { label: 'Approved', count: statusCounts.Approved, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
                        { label: 'Pending',  count: statusCounts.Pending,  color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                        { label: 'Declined', count: statusCounts.Declined, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
                    ] as const).map(s => (
                        <div key={s.label} className={`rounded-lg p-2 ${s.bg}`}>
                            <div className={`text-lg font-black font-mono ${s.color}`}>{s.count}</div>
                            <div className="text-[9px] uppercase font-bold text-neutral-400">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Top Transaction Types */}
            <div className="bg-white dark:bg-sidebar border border-sidebar-border/60 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                    <ClipboardList className="size-4 text-violet-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Top Types</span>
                    <span className="ml-auto text-[10px] font-mono text-neutral-400">{topTypes.length} type{topTypes.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="space-y-2">
                    {topTypes.map(([type, count]) => (
                        <div key={type} className="space-y-0.5">
                            <div className="flex justify-between text-[10px]">
                                <span className="truncate max-w-[70%] font-medium text-neutral-700 dark:text-neutral-300">{type}</span>
                                <span className="font-mono font-bold text-violet-600">{count}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                                <div
                                    className="h-full bg-violet-500 rounded-full transition-all"
                                    style={{ width: `${(count / maxType) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                    {topTypes.length === 0 && (
                        <p className="text-xs text-neutral-400 italic">No data.</p>
                    )}
                </div>
            </div>

            {/* 3. Monthly Volume (last 6 months) */}
            <div className="bg-white dark:bg-sidebar border border-sidebar-border/60 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                    <TrendingUp className="size-4 text-violet-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Monthly Volume</span>
                    <span className="ml-auto text-[10px] font-mono text-neutral-400">6 mo.</span>
                </div>
                <div className="flex items-end gap-1 h-16">
                    {monthlyData.map((m) => (
                        <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full flex items-end justify-center" style={{ height: '40px' }}>
                                <div
                                    className="w-full rounded-t bg-violet-500 dark:bg-violet-600 transition-all min-h-[2px]"
                                    style={{ height: `${(m.count / maxMonthly) * 40}px` }}
                                    title={`${m.label}: ${m.count}`}
                                />
                            </div>
                            <span className="text-[9px] font-mono text-neutral-400">{m.label}</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-[9px] font-mono text-neutral-400 border-t border-sidebar-border/40 pt-1">
                    <span>0</span>
                    <span>{maxMonthly}</span>
                </div>
            </div>

        </div>
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
        case 'Approved': return 'bg-green-100 text-green-700';
        case 'Pending': return 'bg-orange-100 text-orange-700';
        case 'Declined': return 'bg-red-100 text-red-700';
        default: return 'bg-neutral-100 text-neutral-600';
    }
}
