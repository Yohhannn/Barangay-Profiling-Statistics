import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft, Search, Plus, Trash2,
    Stethoscope, User, Calendar, FileText,
    Download, Edit3, X, SlidersHorizontal, Activity
} from 'lucide-react';
import { useState, useMemo } from 'react';
import MedicalHistoryCreation from './popup/medical-history-creation'; // IMPORTED POPUP

// --- Types ---
interface MedicalRecord {
    id: number;
    medicalId: string;
    citizenId: string;
    firstName: string;
    lastName: string;
    medicalType: string;
    description: string;
    dateRecorded: string;

    // Audit
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string;
    updatedBy: string;
}

// --- Mock Data ---
const mockMedical: MedicalRecord[] = [
    {
        id: 1, medicalId: 'MED-2025-001', citizenId: 'CIT-2025-001', firstName: 'Roberto', lastName: 'Gonzales',
        medicalType: 'Hypertension',
        description: 'Patient reported dizziness and headache. BP reading: 150/90. Prescribed maintenance medication.',
        dateRecorded: 'July 10, 2025',
        dateEncoded: 'July 10, 2025 | 09:30 AM', encodedBy: 'NURSE_A', dateUpdated: 'N/A', updatedBy: 'N/A'
    },
    {
        id: 2, medicalId: 'MED-2025-002', citizenId: 'CIT-2025-005', firstName: 'Pedro', lastName: 'Magtanggol',
        medicalType: 'General Checkup',
        description: 'Annual physical examination. Patient is in good health. Advised to reduce salt intake.',
        dateRecorded: 'Aug 05, 2025',
        dateEncoded: 'Aug 05, 2025 | 02:15 PM', encodedBy: 'NURSE_B', dateUpdated: 'N/A', updatedBy: 'N/A'
    },
    // ... (Other mock data)
];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Citizen Records', href: '/citizen-records' },
    { title: 'Medical History', href: '/citizen-records/medical-history' },
];

export default function MedicalHistory() {
    const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(mockMedical[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterType, setFilterType] = useState('All');

    // --- NEW: Modal State ---
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Filter Logic
    const filteredHistory = useMemo(() => {
        return mockMedical.filter(record => {
            const matchesSearch =
                record.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                record.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                record.medicalId.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType = filterType === 'All' || record.medicalType.includes(filterType);

            return matchesSearch && matchesType;
        });
    }, [searchQuery, filterType]);

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this medical record?')) {
            console.log('Deleted medical record:', id);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Medical History" />

            {/* --- MOUNT MODAL HERE --- */}
            <MedicalHistoryCreation isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

            <div className="flex flex-col h-[calc(100vh-4rem)] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">

                {/* --- Header Bar --- */}
                <div className="flex items-center justify-between pb-2 border-b border-sidebar-border/60">
                    <div className="flex items-center gap-4">
                        <Link href="/citizen-records" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                            <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                                History Records: <span className="text-rose-600 dark:text-rose-400">Medical History</span>
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
                                    {/* REGISTER BUTTON (Connected) */}
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
                                        placeholder="Search Citizen ID, Name..."
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
                                        <option value="Checkup">Checkup</option>
                                        <option value="Hypertension">Hypertension</option>
                                        <option value="Diabetes">Diabetes</option>
                                        <option value="Vaccination">Vaccination</option>
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
                                    <th className="px-4 py-3 font-semibold border-b border-sidebar-border text-right">Date</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/50">
                                {filteredHistory.map((rec) => (
                                    <tr
                                        key={rec.id}
                                        onClick={() => setSelectedRecord(rec)}
                                        className={`
                                                cursor-pointer transition-all hover:bg-rose-50 dark:hover:bg-rose-900/10
                                                ${selectedRecord?.id === rec.id ? 'bg-rose-50 dark:bg-rose-900/20 border-l-4 border-l-rose-500' : 'border-l-4 border-l-transparent'}
                                            `}
                                    >
                                        <td className="px-4 py-3 font-mono text-xs text-neutral-500">{rec.id}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-neutral-900 dark:text-neutral-100">{rec.firstName} {rec.lastName}</div>
                                            <div className="text-[10px] text-rose-600 font-medium">{rec.medicalType}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-[10px] text-neutral-500">{rec.dateRecorded}</span>
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
                                            <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/20">
                                                <Stethoscope className="size-8 text-rose-600 dark:text-rose-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                                    {selectedRecord.medicalType}
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
                                        {/* EDIT BUTTON (Blue) */}
                                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all hover:shadow-md">
                                            <Edit3 className="size-3.5" /> Edit Record
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 bg-white dark:bg-sidebar border border-sidebar-border rounded-xl p-5 shadow-sm">
                                        <InfoRow label="Medical ID" value={selectedRecord.medicalId} highlight />
                                        <InfoRow label="Citizen ID" value={selectedRecord.citizenId} />
                                        <InfoRow label="Citizen Name" value={`${selectedRecord.firstName} ${selectedRecord.lastName}`} />
                                        <InfoRow label="Medical Type" value={selectedRecord.medicalType}
                                                 className="text-rose-600 font-bold"
                                        />
                                    </div>

                                    {/* Description Block */}
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                            <Activity className="size-3.5" /> Medical Notes / Description
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
