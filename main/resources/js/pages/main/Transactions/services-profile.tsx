import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft, Search, Plus, Trash2,
    FileText, User, Calendar, CheckCircle,
    Download, Edit3, X, SlidersHorizontal, ClipboardList
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
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
}

interface ServicesProfileProps {
    transactions: Transaction[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Transactions', href: '/transactions' },
    { title: 'Services', href: '/transactions/services-profile' },
];

export default function ServicesProfile({ transactions = [] }: ServicesProfileProps) {
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');

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

            return matchesSearch && matchesStatus;
        });
    }, [searchQuery, filterStatus, transactions]);

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        
        const result = await Swal.fire({
            title: 'Archive Transaction',
            text: 'Are you sure you want to move this transaction to archives? Please provide a reason.',
            icon: 'warning',
            input: 'textarea',
            inputPlaceholder: 'Reason for archiving...',
            inputAttributes: {
                'aria-label': 'Reason for archiving'
            },
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Archive',
            preConfirm: (reason) => {
                if (!reason || reason.trim() === '') {
                    Swal.showValidationMessage('A reason is required to archive a record');
                    return false;
                }
                return reason;
            }
        });

        if (result.isConfirmed && result.value) {
            router.delete(`/transactions/services/${id}`, {
                data: { deleted_reason: result.value },
                preserveScroll: true,
                onSuccess: () => {
                    Swal.fire({
                        title: 'Archived!',
                        text: 'Transaction has been moved to archives.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    if (selectedTransaction?.id === id) {
                        setSelectedTransaction(null);
                    }
                }
            });
        }
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
                                        <option value="Approved">Approved</option>
                                        <option value="Declined">Declined</option>
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
                                                    onClick={(e) => handleDelete(e, trx.id)}
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
        case 'Approved': return 'bg-green-100 text-green-700';
        case 'Pending': return 'bg-orange-100 text-orange-700';
        case 'Declined': return 'bg-red-100 text-red-700';
        default: return 'bg-neutral-100 text-neutral-600';
    }
}
