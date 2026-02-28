import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft, Search, Plus, Trash2,
    Stethoscope, User, Calendar, FileText,
    Download, Edit3, X, SlidersHorizontal, Activity
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import Swal from 'sweetalert2';
import MedicalHistoryCreation from './popup/medical-history-creation'; // IMPORTED
import MedicalHistoryEdit from './popup/medical-history-edit'; // IMPORTED

// --- Types ---
export interface MedicalRecord {
    id: number;
    uuid: string;
    citizenId: string;
    ctz_id: number | null;
    firstName: string;
    middleName: string;
    lastName: string;
    type: string;
    description: string;
    dateDiagnosed: string;

    // Audit
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string;
    updatedBy: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Citizen Records', href: '/citizen-records' },
    { title: 'Medical History', href: '/citizen-records/medical-history' },
];

export default function MedicalHistory({ histories = [] }: { histories?: MedicalRecord[] }) {
    const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(histories.length > 0 ? histories[0] : null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterType, setFilterType] = useState('All');

    // --- NEW: Modal State ---
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    // Keep selectedRecord synced with prop updates
    useEffect(() => {
        setSelectedRecord(prev => {
            if (!prev) return histories.length > 0 ? histories[0] : null;
            const updated = histories.find(h => h.id === prev.id);
            return updated || (histories.length > 0 ? histories[0] : null);
        });
    }, [histories]);

    // Filter Logic
    const filteredHistory = useMemo(() => {
        return histories.filter(record => {
            const matchesSearch =
                record.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                record.firstName.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType = filterType === 'All' || record.type === filterType;

            return matchesSearch && matchesType;
        });
    }, [searchQuery, filterType, histories]);

    // Grouping Logic
    const groupedHistory = useMemo(() => {
        const groups: Record<string, MedicalRecord[]> = {};
        filteredHistory.forEach(rec => {
            const key = rec.ctz_id ? `CTZ-${rec.ctz_id}` : `EXT-${rec.firstName.trim().toLowerCase()}-${rec.lastName.trim().toLowerCase()}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(rec);
        });
        
        return Object.entries(groups).map(([key, records]) => ({
            key,
            ctz_id: records[0].ctz_id,
            firstName: records[0].firstName,
            lastName: records[0].lastName,
            records,
        })).sort((a, b) => a.lastName.localeCompare(b.lastName));
    }, [filteredHistory]);

    const toggleGroup = (key: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        Swal.fire({
            title: 'Archive Record',
            text: 'Are you sure you want to move this medical record to archives? Please provide a reason.',
            icon: 'warning',
            input: 'textarea',
            inputPlaceholder: 'Reason for archiving...',
            inputAttributes: {
                'aria-label': 'Reason for archiving'
            },
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, archive it!',
            preConfirm: (reason) => {
                if (!reason) {
                    Swal.showValidationMessage('A reason is required to archive a record');
                }
                return reason;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/citizen-records/medical-history/${id}`, {
                    data: { delete_reason: result.value },
                    onSuccess: () => {
                        if (selectedRecord?.id === id) {
                            setSelectedRecord(null);
                        }
                        Swal.fire('Archived!', 'The record has been moved to archives.', 'success');
                    },
                    onError: (errors: any) => {
                        Swal.fire('Error', errors?.error || 'Failed to archive record.', 'error');
                    }
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Medical History" />

            {/* --- MOUNT THE MODAL HERE --- */}
            <MedicalHistoryCreation isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
            <MedicalHistoryEdit isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} historyData={selectedRecord} />

            <div className="flex flex-col h-[calc(100vh-4rem)] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">

                {/* --- Header Bar --- */}
                <div className="flex items-center justify-between pb-2 border-b border-sidebar-border/60">
                    <div className="flex items-center gap-4">
                        <Link href="/citizen-records" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                            <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                                Citizen Records: <span className="text-rose-600 dark:text-rose-400">Medical History</span>
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
                                    <h2 className="text-xs font-bold text-white bg-neutral-900 dark:bg-rose-600 py-1 px-3 rounded-md uppercase tracking-wider">
                                        Medical List
                                    </h2>
                                    {/* RECORD (ADD) BUTTON CONNECTED */}
                                    <button
                                        onClick={() => setIsCreateOpen(true)}
                                        className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white p-1 rounded-md transition-colors shadow-sm"
                                        title="Record New Medical History"
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
                                        placeholder="Search Name..."
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`p-2 rounded-lg border border-sidebar-border transition-colors ${showFilters ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white hover:bg-neutral-50 text-neutral-500'}`}
                                >
                                    {showFilters ? <X className="size-4" /> : <SlidersHorizontal className="size-4" />}
                                </button>
                            </div>

                            {/* Filter Dropdown */}
                            {showFilters && (
                                <div className="pt-2 border-t border-sidebar-border/50 animate-in slide-in-from-top-2">
                                    <select
                                        className="w-full text-xs p-2 rounded-lg border border-sidebar-border bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-rose-500/20"
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                    >
                                        <option value="All">All Types</option>
                                        <option value="Hypertension">Hypertension</option>
                                        <option value="Diabetes">Diabetes</option>
                                        <option value="Checkup">Checkup</option>
                                        <option value="Prenatal">Prenatal</option>
                                        <option value="Vaccination">Vaccination</option>
                                        <option value="Surgery">Surgery</option>
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
                                    <th className="px-4 py-3 font-semibold border-b border-sidebar-border">Citizen Name</th>
                                    <th className="px-4 py-3 font-semibold border-b border-sidebar-border">Type & Description</th>
                                    <th className="px-4 py-3 font-semibold border-b border-sidebar-border text-right">Date & Actions</th>
                                </tr>
                                </thead>
                                {groupedHistory.map(group => (
                                    <tbody key={group.key} className="divide-y divide-sidebar-border/50">
                                        <tr 
                                            onClick={() => toggleGroup(group.key)}
                                            className="bg-neutral-100/50 dark:bg-neutral-800/80 cursor-pointer hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 transition-colors"
                                        >
                                            <td colSpan={3} className="px-4 py-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <User className="size-4 text-rose-600 dark:text-rose-400" />
                                                        <span className="font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
                                                            {group.firstName} {group.lastName}
                                                        </span>
                                                        {group.ctz_id && (
                                                            <span className="text-[10px] font-mono bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 rounded ml-2 shadow-sm border border-rose-200 dark:border-rose-800">
                                                                ID: {group.records[0].citizenId}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 bg-white dark:bg-black/20 px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-700 shadow-sm">
                                                            {group.records.length} Record{group.records.length !== 1 ? 's' : ''}
                                                        </span>
                                                        <div className={`p-1 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm text-neutral-500 transition-transform duration-200 ${expandedGroups.has(group.key) ? 'rotate-180' : ''}`}>
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedGroups.has(group.key) && group.records.map((rec) => (
                                            <tr
                                                key={rec.id}
                                                onClick={() => setSelectedRecord(rec)}
                                                className={`
                                                        cursor-pointer transition-all hover:bg-rose-50 dark:hover:bg-rose-900/10
                                                        ${selectedRecord?.id === rec.id ? 'bg-rose-50 dark:bg-rose-900/20 border-l-4 border-l-rose-500' : 'border-l-4 border-transparent'}
                                                    `}
                                            >
                                                <td className="px-4 py-3 font-mono text-xs text-neutral-500 pl-8 relative border-l-[3px] border-l-rose-300/30 dark:border-l-rose-700/30">
                                                    {rec.uuid}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-bold text-neutral-900 dark:text-neutral-100">{rec.type}</div>
                                                    <div className="text-[10px] text-neutral-500 truncate max-w-xs">{rec.description}</div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        <span className="text-[10px] text-neutral-500">{rec.dateDiagnosed}</span>
                                                        <button
                                                            onClick={(e) => handleDelete(e, rec.id)}
                                                            className="text-neutral-300 hover:text-red-500 transition-colors p-1 bg-white dark:bg-neutral-800 rounded border border-transparent hover:border-red-200 dark:hover:border-red-900"
                                                            title="Delete Record"
                                                        >
                                                            <Trash2 className="size-3" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                ))}
                            </table>
                        </div>
                    </div>

                    {/* === RIGHT COLUMN: Details (Spans 8) === */}
                    <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">

                        {/* Detail Content */}
                        {selectedRecord ? (
                            <div className="flex-1 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm flex flex-col overflow-hidden">

                                {/* 1. Details Header (New) */}
                                <div className="bg-neutral-50 dark:bg-neutral-900/20 border-b border-sidebar-border p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/20">
                                                <Stethoscope className="size-8 text-rose-600 dark:text-rose-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                                    {selectedRecord.type}
                                                </h2>
                                                <div className="flex items-center gap-2 mt-1 text-sm text-neutral-500">
                                                    <User className="size-3.5" />
                                                    <span className="font-medium">{selectedRecord.firstName} {selectedRecord.lastName}</span>
                                                    <span className="font-mono bg-white dark:bg-black/20 border px-1.5 rounded text-xs ml-2">
                                                        {selectedRecord.citizenId}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* EDIT BUTTON MOVED HERE */}
                                        <button onClick={() => setIsEditOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all hover:shadow-md">
                                            <Edit3 className="size-3.5" /> Edit Record
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 bg-white dark:bg-sidebar border border-sidebar-border rounded-xl p-5 shadow-sm">
                                        <InfoRow label="Record ID" value={selectedRecord.uuid} highlight />
                                        <InfoRow label="Date Diagnosed" value={selectedRecord.dateDiagnosed} />
                                        <InfoRow label="Medical Type" value={selectedRecord.type}
                                                 className="text-rose-600 dark:text-rose-400 font-bold"
                                        />
                                    </div>

                                    {/* Description Block */}
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                            <Activity className="size-3.5" /> Medical Details / Observations
                                        </h3>
                                        <div className="bg-neutral-50/50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 min-h-[150px]">
                                            {selectedRecord.description}
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
                                <Stethoscope className="size-12 mb-2 opacity-20" />
                                <p>Select a medical record to view details</p>
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
            <span className={`font-semibold text-sm ${highlight ? 'text-rose-600 dark:text-rose-400 font-mono' : 'text-neutral-900 dark:text-neutral-100'} ${className}`}>
                {value}
            </span>
        </div>
    );
}
