import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft, Search, Plus, Trash2,
    User, MapPin, Briefcase, UserX, GraduationCap,
    HeartPulse, Baby, Phone, Hash, Home,
    Filter, X, SlidersHorizontal, Edit3, ScanFace, Check, RotateCcw,
    Activity, FileText, Info, Store, Building, Lock,
    BarChart2, TrendingUp,
} from 'lucide-react';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import CitizenCreation from './popup/citizen-creation';
import CitizenEdit from './popup/citizen-edit';
import FaceSearch from './popup/face-search';

import MedicalQuickView from '../CitizenRecords/popup/medical-quick-view';
import SettlementQuickView from '../CitizenRecords/popup/settlement-quick-view';
import HistoryQuickView from '../CitizenRecords/popup/history-quick-view';
import CitizenQuickView from '../CitizenRecords/popup/citizen-quick-view';
import HouseholdQuickView from '../CitizenRecords/popup/household-quick-view';
import BusinessQuickView from '../Institutions/popup/business-quick-view';
import InfrastructureQuickView from '../Institutions/popup/infrastructures-quick-view';
import ServicesQuickView from '../Transactions/popup/services-quick-view';

// --- 1. Comprehensive Type Definition ---
interface HouseholdMember {
    id: number;
    name: string;
    relationship: string;
}

interface MedicalHistory {
    id: number;
    uuid: string;
    type: string;
    description: string;
    dateDiagnosed?: string;
}

interface SettlementHistory {
    id: number;
    uuid: string;
    title: string;
    type: string;
    description: string;
    status: string;
    dateCreated?: string;
    settlement_uuid?: string | null;
}

interface OwnedBusiness {
    id: number;
    uuid: string;
    name: string;
    type: string;
    status: string;
}

interface OwnedInfrastructure {
    id: number;
    infraId: string;
    name: string;
    type: string;
}

interface CitizenTransaction {
    id: number;
    transactionId: string;
    type: string;
    status: string;
    dateRequested: string;
}

interface Citizen {
    id: number;
    // Header
    firstName: string;
    middleName: string;
    lastName: string;
    suffix?: string;
    citizenId: string;
    status: string; // Active, Deceased, Moved

    // Personal
    dob: string;
    age: number;
    sex: string;
    bloodType: string;
    civilStatus: string;
    religion: string;
    pob: string; // Place of Birth

    // Contact (Dynamic Array) & Address
    email: string;
    contact: string[];
    personalAddress: string;
    householdAddress: string;
    fullAddress: string;
    sitio: string;

    // Socio-Economic
    employmentStatus: string;
    occupation: string;
    socioEconomicStatus: string;

    // Flags
    isGovWorker: boolean;
    isStudent: boolean;
    isVoter: boolean;
    isIp: boolean;
    isDeceased: boolean;

    // Conditional Data
    dateOfDeath?: string;
    causeOfDeath?: string;

    educAttainment?: string;
    schoolName?: string;
    elementary_name?: string;
    highschool_name?: string;
    senior_high_name?: string;
    college_name?: string;

    fpStatus?: string; // Family Planning
    fpMethod?: string;
    fpDateStarted?: string;
    fpDateEnded?: string;

    // System IDs
    nhtsNumber?: string;
    householdId: string;
    relationship: string;
    philhealthCategory?: string;
    philhealthId?: string;
    membershipType?: string;
    healthClassification?: string;

    householdMembers: HouseholdMember[];
    medicalHistories: MedicalHistory[];
    settlementHistories: SettlementHistory[];
    ownedBusinesses: OwnedBusiness[];
    ownedInfrastructures: OwnedInfrastructure[];
    transactionLogs: CitizenTransaction[];

    // Audit
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string;
    updatedBy: string;

    photoUrl?: string;
    faceRecogUuid?: string;
}

// --- 2. 20 Example Data Entries ---
// Mock data removed.


const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Citizen Panel', href: '/citizen-panel' },
    { title: 'Citizen Profiles', href: '/citizen-panel/citizen-profile' },
];

export default function CitizenProfiles({ citizens = [], sitios = [], systemAccounts = [] }: { citizens?: Citizen[], sitios?: { sitio_id: number, sitio_name: string }[], systemAccounts?: {id: number, name: string}[] }) {
    // --- State ---
    const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(citizens.length > 0 ? citizens[0] : null);
    const [showFilters, setShowFilters] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isFaceSearchOpen, setIsFaceSearchOpen] = useState(false);
    const [pendingSelectId, setPendingSelectId] = useState<number | null>(null);
    const [photoLightboxOpen, setPhotoLightboxOpen] = useState(false);
    const [photoRevealed, setPhotoRevealed] = useState(false);

    // --- Quick View State ---
    const [medicalQuickViewOpen, setMedicalQuickViewOpen] = useState(false);
    const [selectedMedicalUuid, setSelectedMedicalUuid] = useState<string | null>(null);

    const [historyQuickViewOpen, setHistoryQuickViewOpen] = useState(false);
    const [selectedHistoryUuid, setSelectedHistoryUuid] = useState<string | null>(null);

    const [settlementQuickViewOpen, setSettlementQuickViewOpen] = useState(false);
    const [selectedSettlementUuid, setSelectedSettlementUuid] = useState<string | null>(null);

    const [citizenQuickViewOpen, setCitizenQuickViewOpen] = useState(false);
    const [selectedCitizenId, setSelectedCitizenId] = useState<number | null>(null);

    const [householdQuickViewOpen, setHouseholdQuickViewOpen] = useState(false);
    const [selectedHouseholdUuid, setSelectedHouseholdUuid] = useState<string | null>(null);

    const [businessQuickViewOpen, setBusinessQuickViewOpen] = useState(false);
    const [selectedBusinessUuid, setSelectedBusinessUuid] = useState<string | null>(null);

    const [infrastructureQuickViewOpen, setInfrastructureQuickViewOpen] = useState(false);
    const [selectedInfrastructureId, setSelectedInfrastructureId] = useState<number | null>(null);

    const [servicesQuickViewOpen, setServicesQuickViewOpen] = useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);

    const handleOpenMedicalQuickView = (e: React.MouseEvent, uuid: string) => {
        e.stopPropagation();
        setSelectedMedicalUuid(uuid);
        setMedicalQuickViewOpen(true);
    };

    const handleOpenHistoryQuickView = (e: React.MouseEvent, uuid: string) => {
        e.stopPropagation();
        setSelectedHistoryUuid(uuid);
        setHistoryQuickViewOpen(true);
    };

    const handleOpenSettlementQuickView = (e: React.MouseEvent, uuid: string) => {
        e.stopPropagation();
        setSelectedSettlementUuid(uuid);
        setSettlementQuickViewOpen(true);
    };

    const handleOpenCitizenQuickView = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setSelectedCitizenId(id);
        setCitizenQuickViewOpen(true);
    };

    const handleOpenHouseholdQuickView = (e: React.MouseEvent, uuid: string) => {
        e.stopPropagation();
        setSelectedHouseholdUuid(uuid);
        setHouseholdQuickViewOpen(true);
    };

    const handleOpenBusinessQuickView = (e: React.MouseEvent, uuid: string) => {
        e.stopPropagation();
        setSelectedBusinessUuid(uuid);
        setBusinessQuickViewOpen(true);
    };

    const handleOpenInfrastructureQuickView = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setSelectedInfrastructureId(id);
        setInfrastructureQuickViewOpen(true);
    };

    const handleOpenServicesQuickView = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setSelectedTransactionId(id);
        setServicesQuickViewOpen(true);
    };
    
    // Multi-select dropdown state
    const [showEncodedByDropdown, setShowEncodedByDropdown] = useState(false);
    const [showUpdatedByDropdown, setShowUpdatedByDropdown] = useState(false);
    const [encodedBySearch, setEncodedBySearch] = useState('');
    const [updatedBySearch, setUpdatedBySearch] = useState('');
    
    const encodedByRef = useRef<HTMLDivElement>(null);
    const updatedByRef = useRef<HTMLDivElement>(null);

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (encodedByRef.current && !encodedByRef.current.contains(event.target as Node)) {
                setShowEncodedByDropdown(false);
            }
            if (updatedByRef.current && !updatedByRef.current.contains(event.target as Node)) {
                setShowUpdatedByDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- Filter State ---
    // Lazy initializer parses URL params once instead of 11 separate calls
    const [filterState, setFilterState] = useState(() => {
        const p = new URLSearchParams(window.location.search);
        return {
            search: p.get('search') || '',
            sitio: p.get('sitio') || '',
            sex: p.get('sex') || '',
            civilStatus: p.get('civilStatus') || '',
            employmentStatus: p.get('employmentStatus') || '',
            isVoter: p.get('isVoter') || '',
            dateEncodedStart: p.get('dateEncodedRange')?.split(' to ')[0] || '',
            dateEncodedEnd: p.get('dateEncodedRange')?.split(' to ')[1] || '',
            dateUpdatedStart: p.get('dateUpdatedRange')?.split(' to ')[0] || '',
            dateUpdatedEnd: p.get('dateUpdatedRange')?.split(' to ')[1] || '',
            encodedBy: p.get('encodedBy') ? p.get('encodedBy')!.split(',') : [] as string[],
            updatedBy: p.get('updatedBy') ? p.get('updatedBy')!.split(',') : [] as string[],
        };
    });

    const [isDebouncing, setIsDebouncing] = useState(false);

    // Tracks first render (skip) and previous search value (to differentiate debounce delay)
    const isFirstRender = useRef(true);
    const prevSearchRef = useRef(filterState.search);

    // --- Search/Filter Effect ---
    // Search input: 350ms debounce. Dropdowns/selects: immediate (0ms).
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const isSearchChange = prevSearchRef.current !== filterState.search;
        prevSearchRef.current = filterState.search;
        const delay = isSearchChange ? 350 : 0;

        if (isSearchChange) setIsDebouncing(true);

        const timer = setTimeout(() => {
            router.get(
                '/citizen-panel/citizen-profile',
                {
                    search: filterState.search,
                    sitio: filterState.sitio,
                    sex: filterState.sex,
                    civilStatus: filterState.civilStatus,
                    employmentStatus: filterState.employmentStatus,
                    isVoter: filterState.isVoter,
                    dateEncodedRange: filterState.dateEncodedStart && filterState.dateEncodedEnd
                        ? `${filterState.dateEncodedStart} to ${filterState.dateEncodedEnd}`
                        : '',
                    dateUpdatedRange: filterState.dateUpdatedStart && filterState.dateUpdatedEnd
                        ? `${filterState.dateUpdatedStart} to ${filterState.dateUpdatedEnd}`
                        : '',
                    encodedBy: filterState.encodedBy.join(','),
                    updatedBy: filterState.updatedBy.join(','),
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    onFinish: () => setIsDebouncing(false),
                }
            );
        }, delay);

        return () => clearTimeout(timer);
    }, [filterState]);

    const handleFilterChange = useCallback((key: string, value: any) => {
        setFilterState(prev => ({ ...prev, [key]: value }));
    }, []);

    // Reset photo state when switching citizens
    useEffect(() => {
        setPhotoLightboxOpen(false);
        setPhotoRevealed(false);
    }, [selectedCitizen?.id]);

    // Close lightbox on Escape key
    useEffect(() => {
        if (!photoLightboxOpen) return;
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPhotoLightboxOpen(false); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [photoLightboxOpen]);

    // Auto-select citizen after face search redirects the list
    useEffect(() => {
        if (pendingSelectId === null) return;
        const found = citizens.find(c => c.id === pendingSelectId);
        if (found) {
            setSelectedCitizen(found);
            setPendingSelectId(null);
        }
    }, [citizens, pendingSelectId]);

    const resetFilters = () => {
        setFilterState({
            search: '',
            sitio: '',
            sex: '',
            civilStatus: '',
            employmentStatus: '',
            isVoter: '',
            dateEncodedStart: '',
            dateEncodedEnd: '',
            dateUpdatedStart: '',
            dateUpdatedEnd: '',
            encodedBy: [],
            updatedBy: [],
        });
    };

    // Count active (non-empty) filters for the badge on the toggle button
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filterState.sitio) count++;
        if (filterState.sex) count++;
        if (filterState.civilStatus) count++;
        if (filterState.employmentStatus) count++;
        if (filterState.isVoter) count++;
        if (filterState.dateEncodedStart || filterState.dateEncodedEnd) count++;
        if (filterState.dateUpdatedStart || filterState.dateUpdatedEnd) count++;
        if (filterState.encodedBy.length > 0) count++;
        if (filterState.updatedBy.length > 0) count++;
        return count;
    }, [filterState]);

    // Use citizens directly from props (backend filtered)
    const filteredCitizens = citizens;

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
        if (!archiveReason.trim()) { setArchiveError('A reason is required to archive this citizen.'); return; }
        setArchiveLoading(true);
        router.delete(`/citizens/${archiveTarget.id}`, {
            data: { deleted_reason: archiveReason },
            preserveScroll: true,
            onSuccess: () => { setArchiveTarget(null); setSelectedCitizen(null); },
            onError: (errors: any) => { setArchiveError(errors?.error || 'Failed to archive. Please try again.'); },
            onFinish: () => setArchiveLoading(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Citizen Profiles" />

            {/* --- MOUNT THE MODAL HERE --- */}
            <FaceSearch
                isOpen={isFaceSearchOpen}
                onClose={() => setIsFaceSearchOpen(false)}
                onFound={(citizenId, citizenUuid) => {
                    const found = citizens.find(c => c.id === citizenId);
                    if (found) {
                        setSelectedCitizen(found);
                    } else {
                        // Citizen exists but is filtered out — search by UUID to surface it
                        setPendingSelectId(citizenId);
                        handleFilterChange('search', citizenUuid);
                    }
                }}
            />
            <CitizenCreation isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
            <CitizenEdit 
                isOpen={isEditOpen} 
                onClose={() => setIsEditOpen(false)} 
                citizen={selectedCitizen} 
                onSuccess={() => {
                    // Force a full reload to get fresh data
                    router.get('/citizen-panel/citizen-profile');
                    // We don't preserve state so it completely refreshes the data.
                    // The selectedCitizen might reset to null or the first one depending on initial state,
                    // which matches creation behavior
                }}
            />

            <MedicalQuickView isOpen={medicalQuickViewOpen} onClose={() => setMedicalQuickViewOpen(false)} medicalUuid={selectedMedicalUuid} />
            <HistoryQuickView isOpen={historyQuickViewOpen} onClose={() => setHistoryQuickViewOpen(false)} historyUuid={selectedHistoryUuid} />
            <SettlementQuickView isOpen={settlementQuickViewOpen} onClose={() => setSettlementQuickViewOpen(false)} settlementUuid={selectedSettlementUuid} />
            <CitizenQuickView isOpen={citizenQuickViewOpen} onClose={() => setCitizenQuickViewOpen(false)} citizenId={selectedCitizenId} />
            <HouseholdQuickView isOpen={householdQuickViewOpen} onClose={() => setHouseholdQuickViewOpen(false)} householdUuid={selectedHouseholdUuid} />
            <BusinessQuickView isOpen={businessQuickViewOpen} onClose={() => setBusinessQuickViewOpen(false)} businessUuid={selectedBusinessUuid} />
            <InfrastructureQuickView isOpen={infrastructureQuickViewOpen} onClose={() => setInfrastructureQuickViewOpen(false)} infrastructureId={selectedInfrastructureId} />
            <ServicesQuickView isOpen={servicesQuickViewOpen} onClose={() => setServicesQuickViewOpen(false)} transactionId={selectedTransactionId} />

            {/* Archive Citizen Modal */}
            {archiveTarget !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#0f172a] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                        <div className="bg-red-950 text-white p-5 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold flex items-center gap-2"><Trash2 className="size-5 text-red-400" /> Archive Citizen</h2>
                                <p className="text-[10px] text-red-300 mt-1 uppercase tracking-wider">{archiveTarget.label}</p>
                            </div>
                            <button onClick={() => setArchiveTarget(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"><X className="size-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Are you sure you want to move this citizen to archives?</p>
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

            {/* Photo Lightbox */}
            {photoLightboxOpen && selectedCitizen?.photoUrl && (
                <div
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-150"
                    onClick={() => setPhotoLightboxOpen(false)}
                >
                    <div className="relative flex flex-col items-center" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setPhotoLightboxOpen(false)}
                            className="absolute -top-10 right-0 p-1.5 text-white/60 hover:text-white transition-colors"
                        >
                            <X className="size-6" />
                        </button>
                        <img
                            src={selectedCitizen.photoUrl}
                            alt={`${selectedCitizen.firstName} ${selectedCitizen.lastName}`}
                            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10"
                        />
                        <p className="text-white/40 text-[10px] font-mono mt-3 uppercase tracking-widest">
                            {selectedCitizen.firstName} {selectedCitizen.lastName} · {selectedCitizen.citizenId}
                        </p>
                    </div>
                </div>
            )}

            <div className="flex flex-col h-[calc(100vh-4rem)] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">

                {/* --- Header Bar --- */}
                <div className="flex items-center gap-4 pb-2 border-b border-sidebar-border/60">
                    <Link href="/citizen-panel" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                            Citizen Panel: <span className="text-blue-600 dark:text-blue-400">Citizen Profiles</span>
                        </h1>
                    </div>
                </div>

                {/* Mini Statistics Panel */}
                <CitizenMiniStats citizens={citizens} />

                {/* --- Main Content Split --- */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                    {/* === LEFT COLUMN: Table List (Spans 4 columns) === */}
                    <div className="lg:col-span-4 flex flex-col gap-4 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm overflow-hidden">

                        {/* Table Header / Search & Filter */}
                        <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/20 border-b border-sidebar-border/60 space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xs font-bold text-white bg-neutral-900 dark:bg-blue-600 py-1 px-3 rounded-md uppercase tracking-wider">
                                        Registered List
                                    </h2>
                                    <button
                                        onClick={() => setIsCreateOpen(true)}
                                        className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white p-1 rounded-md transition-colors shadow-sm"
                                        title="Register New Citizen"
                                    >
                                        <Plus className="size-4" />
                                    </button>
                                    <button
                                        onClick={() => setIsFaceSearchOpen(true)}
                                        className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-md transition-colors shadow-sm"
                                        title="Search by Face"
                                    >
                                        <ScanFace className="size-4" />
                                    </button>
                                </div>
                                <span className="text-[10px] text-neutral-400 font-mono">
                                    TOTAL: {filteredCitizens.length}
                                </span>
                            </div>

                            {/* Search & Toggle Row */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                                    <input
                                        type="text"
                                        placeholder="Search name..."
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        value={filterState.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                    />
                                    {isDebouncing && <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>}
                                </div>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`relative p-2 rounded-lg border transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : activeFilterCount > 0 ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-sidebar-border bg-white hover:bg-neutral-50 text-neutral-500'}`}
                                    title={activeFilterCount > 0 ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active` : 'Filter'}
                                >
                                    {showFilters ? <X className="size-4" /> : <SlidersHorizontal className="size-4" />}
                                    {!showFilters && activeFilterCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white leading-none">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </button>
                            </div>

                        </div>

                        {/* Table Content */}
                        <div className="flex-1 overflow-auto">
                            <div className="flex flex-col">
                                {filteredCitizens.length > 0 ? (
                                    filteredCitizens.map((citizen) => (
                                        <div
                                            key={citizen.id}
                                            onClick={() => setSelectedCitizen(citizen)}
                                            className={`
                                                group cursor-pointer p-4 border-b border-sidebar-border/50 border-l-4 transition-all duration-200
                                                ${selectedCitizen?.id === citizen.id
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-l-blue-500'
                                                : 'border-l-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:border-l-blue-200'}
                                            `}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className={`font-bold text-sm ${selectedCitizen?.id === citizen.id ? 'text-blue-700 dark:text-blue-300' : 'text-neutral-900 dark:text-neutral-100'}`}>
                                                        {citizen.lastName}, {citizen.firstName}
                                                    </h3>
                                                    <p className="text-xs text-neutral-500 font-mono mt-0.5">{citizen.citizenId}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${citizen.status === 'Deceased' ? 'bg-red-100 text-red-700' : 'bg-neutral-100 text-neutral-600'}`}>
                                                        {citizen.sitio}
                                                    </span>
                                                    {/* TRASH ICON ADDED HERE */}
                                                    <button
                                                        onClick={(e) => handleDelete(e, citizen.id, `${citizen.firstName} ${citizen.lastName}`)}
                                                        className="text-neutral-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        title="Move to Archive"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-neutral-400 text-xs">
                                        No citizens found matching your filters.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* === RIGHT COLUMN: Detailed Profile (Spans 8 columns) === */}
                    <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">

                        {/* Main Profile Container */}
                        {selectedCitizen ? (
                            <div className="flex-1 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm flex flex-col overflow-hidden">

                                {/* 1. Top Header (Name & Key Stats) */}
                                <div className="p-6 border-b border-sidebar-border/60 bg-neutral-50/50 dark:bg-neutral-900/30">
                                    <div className="flex items-start gap-5">
                                        {/* Photo */}
                                        <div
                                            onClick={() => { if (photoRevealed && selectedCitizen.photoUrl) setPhotoLightboxOpen(true); }}
                                            onDoubleClick={() => { if (!photoRevealed && selectedCitizen.photoUrl) setPhotoRevealed(true); }}
                                            className={`w-24 h-24 shrink-0 bg-white dark:bg-neutral-800 rounded-xl border border-sidebar-border overflow-hidden flex items-center justify-center shadow-sm relative group select-none ${selectedCitizen.photoUrl ? (photoRevealed ? 'cursor-zoom-in' : 'cursor-pointer') : ''}`}
                                        >
                                            {selectedCitizen.photoUrl ? (
                                                <>
                                                    <img
                                                        src={selectedCitizen.photoUrl}
                                                        alt={selectedCitizen.firstName}
                                                        className={`w-full h-full object-cover transition-all duration-500 ${photoRevealed ? '' : 'blur scale-110'}`}
                                                    />
                                                    {/* Blurred state overlay */}
                                                    {!photoRevealed && (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pointer-events-none">
                                                            <div className="bg-black/40 rounded-full p-1.5">
                                                                <Lock className="size-3.5 text-white/80" />
                                                            </div>
                                                            <span className="text-white text-[8px] font-bold uppercase tracking-wide text-center leading-snug px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                Double-click<br/>to reveal
                                                            </span>
                                                        </div>
                                                    )}
                                                    {/* Revealed state hover hint */}
                                                    {photoRevealed && (
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                            <span className="text-white text-[9px] font-bold uppercase tracking-wide text-center leading-snug px-1">
                                                                Click to<br/>maximize
                                                            </span>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <User className="size-10 text-neutral-300" />
                                            )}
                                        </div>

                                        {/* Name Block */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                                        {selectedCitizen.firstName} {selectedCitizen.middleName} {selectedCitizen.lastName} <span className="text-neutral-400 text-lg">{selectedCitizen.suffix}</span>
                                                    </h1>
                                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                                        <span className="font-mono text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                                                            {selectedCitizen.citizenId}
                                                        </span>
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${selectedCitizen.status === 'Deceased' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                                            {selectedCitizen.status.toUpperCase()}
                                                        </span>
                                                        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded border ${
                                                            selectedCitizen.faceRecogUuid
                                                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800'
                                                                : 'bg-neutral-50 text-neutral-400 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-500 dark:border-neutral-700'
                                                        }`}>
                                                            <ScanFace className="size-3" />
                                                            {selectedCitizen.faceRecogUuid ? 'Biometrics' : 'No Biometrics'}
                                                        </span>
                                                    </div>
                                                </div>
                                                {/* UPDATE BUTTON ADDED HERE */}
                                                <button onClick={() => setIsEditOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all hover:shadow-md">
                                                    <Edit3 className="size-3.5" /> Edit Profile
                                                </button>
                                            </div>

                                            {/* Flags / Tags Row */}
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                <FlagBadge label="Voter" active={selectedCitizen.isVoter} color="green" />
                                                <FlagBadge label="Gov. Worker" active={selectedCitizen.isGovWorker} color="blue" />
                                                <FlagBadge label="Student" active={selectedCitizen.isStudent} color="yellow" />
                                                <FlagBadge label="4Ps / NHTS" active={!!selectedCitizen.nhtsNumber} color="purple" />
                                                <FlagBadge label="Indigenous" active={selectedCitizen.isIp} color="indigo" />
                                                <FlagBadge label="Senior" active={selectedCitizen.age >= 60} color="orange" />
                                                <FlagBadge label="Deceased" active={selectedCitizen.isDeceased} color="red" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Scrollable Details */}
                                <div className="flex-1 overflow-y-auto p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                                        {/* Card: Personal Information */}
                                        <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-4">
                                            <SectionHeader icon={<User className="size-4" />} title="Identity" />
                                            <div className="bg-neutral-50 dark:bg-neutral-900/20 rounded-xl p-4 border border-sidebar-border space-y-3">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <InfoItem label="Age" value={`${selectedCitizen.age} yrs`} />
                                                    <InfoItem label="Sex" value={selectedCitizen.sex} />
                                                    <InfoItem label="Blood Type" value={selectedCitizen.bloodType} />
                                                    <InfoItem label="Civil Status" value={selectedCitizen.civilStatus} />
                                                </div>
                                                <div className="pt-2 border-t border-sidebar-border/50">
                                                    <InfoItem label="Date of Birth" value={selectedCitizen.dob} />
                                                    <InfoItem label="Place of Birth" value={selectedCitizen.pob} />
                                                    <InfoItem label="Religion" value={selectedCitizen.religion} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card: Contact & Address (Dynamic) */}
                                        <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-4">
                                            <SectionHeader icon={<MapPin className="size-4" />} title="Contact & Address" />
                                            <div className="bg-neutral-50 dark:bg-neutral-900/20 rounded-xl p-4 border border-sidebar-border space-y-3">
                                                {/* Dynamic Contact Numbers */}
                                                <div>
                                                    <span className="text-[10px] font-bold text-neutral-400 uppercase">Contact Numbers</span>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {selectedCitizen.contact.length > 0 ? (
                                                            selectedCitizen.contact.map((num, idx) => (
                                                                <span key={idx} className="inline-flex items-center gap-1 text-xs font-mono bg-white dark:bg-neutral-800 border border-sidebar-border px-2 py-1 rounded-md text-neutral-700 dark:text-neutral-300">
                                                                    <Phone className="size-3 text-neutral-400" /> {num}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-neutral-400 italic">No contact info provided</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <InfoItem label="Email Address" value={selectedCitizen.email} />
                                                <div className="pt-2 border-t border-sidebar-border/50">
                                                    <InfoItem label="Personal Address" value={selectedCitizen.personalAddress !== 'N/A' && selectedCitizen.personalAddress !== '' ? selectedCitizen.personalAddress : 'Not Provided'} />
                                                    <InfoItem 
                                                        label="Household Address" 
                                                        value={selectedCitizen.householdAddress !== 'N/A' && selectedCitizen.householdAddress !== '' ? selectedCitizen.householdAddress : 'No household assigned'} 
                                                    />
                                                    <InfoItem label="Sitio" value={selectedCitizen.sitio} highlight />
                                                    <InfoItem label="Format Address" value={selectedCitizen.fullAddress} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card: Economic & Occupation */}
                                        <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-4">
                                            <SectionHeader icon={<Briefcase className="size-4" />} title="Socio-Economic" />
                                            <div className="bg-neutral-50 dark:bg-neutral-900/20 rounded-xl p-4 border border-sidebar-border space-y-3">
                                                <InfoItem label="Emp. Status" value={selectedCitizen.employmentStatus} />
                                                <InfoItem label="Occupation" value={selectedCitizen.occupation} />
                                                <InfoItem label="Economic Class" value={selectedCitizen.socioEconomicStatus} />
                                            </div>
                                        </div>

                                        {/* Card: System IDs */}
                                        <div className="col-span-1 md:col-span-2 space-y-4">
                                            <SectionHeader icon={<Hash className="size-4" />} title="Government IDs" />
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
                                                <InfoItem label="PhilHealth ID" value={selectedCitizen.philhealthId || 'N/A'} />
                                                <InfoItem label="Category" value={selectedCitizen.philhealthCategory || 'N/A'} />
                                                <InfoItem label="Membership" value={selectedCitizen.membershipType || 'N/A'} />
                                                <InfoItem label="Health Class." value={selectedCitizen.healthClassification || 'N/A'} />

                                                {/* Second Row */}
                                                <InfoItem label="NHTS Number" value={selectedCitizen.nhtsNumber || 'N/A'} />
                                                
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">Household ID</span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-sm truncate font-medium text-blue-600 dark:text-blue-400">
                                                            {selectedCitizen.householdId}
                                                        </span>
                                                        {selectedCitizen.householdId && selectedCitizen.householdId !== 'N/A' && (
                                                            <button 
                                                                onClick={(e) => handleOpenHouseholdQuickView(e, selectedCitizen.householdId)}
                                                                className="opacity-60 hover:opacity-100 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 hover:bg-blue-200 transition-all shadow-sm border border-blue-200 dark:border-blue-800"
                                                                title="Quick View Household Profile"
                                                            >
                                                                <Info className="size-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <InfoItem label="Relationship" value={selectedCitizen.relationship} />
                                            </div>
                                        </div>

                                        <div className="col-span-1 md:col-span-2 space-y-4">
                                            <SectionHeader icon={<Home className="size-4" />} title="Household Members" />
                                            <div className="border border-sidebar-border rounded-xl overflow-hidden">
                                                <table className="w-full text-sm text-left bg-white dark:bg-sidebar">
                                                    <thead className="bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-500 uppercase">
                                                    <tr>
                                                        <th className="px-4 py-3 font-semibold text-center border-r border-sidebar-border">Name</th>
                                                        <th className="px-4 py-3 font-semibold text-center">Relationship</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-sidebar-border">
                                                    {selectedCitizen.householdMembers && selectedCitizen.householdMembers.length > 0 ? (
                                                        selectedCitizen.householdMembers.map((member) => (
                                                            <tr key={member.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 group/row">
                                                                <td className="px-4 py-3 border-r border-sidebar-border relative">
                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <span className="font-medium">{member.name}</span>
                                                                        <button 
                                                                            onClick={(e) => handleOpenCitizenQuickView(e, member.id)}
                                                                            className="opacity-0 group-hover/row:opacity-100 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 hover:bg-blue-200 transition-all shadow-sm border border-blue-200 dark:border-blue-800"
                                                                            title="Quick View Member Profile"
                                                                        >
                                                                            <Info className="size-3" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-center text-neutral-500">{member.relationship}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={2} className="px-4 py-6 text-center text-neutral-400 italic">No other members listed</td>
                                                        </tr>
                                                    )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Card: Conditional Sections (Grid based) */}

                                        {/* Family Planning */}
                                        {selectedCitizen.fpStatus && selectedCitizen.fpStatus !== 'N/A' && (
                                            <div className="col-span-1 space-y-4">
                                                <SectionHeader icon={<Baby className="size-4 text-purple-500" />} title="Family Planning" />
                                                <div className="bg-purple-50/50 dark:bg-purple-900/10 border border-purple-200 rounded-xl p-4 space-y-2">
                                                    <InfoItem label="Status" value={selectedCitizen.fpStatus} />
                                                    <InfoItem label="Method" value={selectedCitizen.fpMethod || 'N/A'} />
                                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-purple-200/50">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">Started</span>
                                                            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{selectedCitizen.fpDateStarted || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">Ended</span>
                                                            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{selectedCitizen.fpDateEnded || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {(selectedCitizen.isStudent || selectedCitizen.educAttainment || selectedCitizen.elementary_name) && (
                                            <div className="col-span-1 space-y-4">
                                                <SectionHeader icon={<GraduationCap className="size-4 text-yellow-600" />} title="Education" />
                                                <div className="bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-200 rounded-xl p-4 space-y-2">
                                                    <InfoItem label="Status" value={selectedCitizen.isStudent ? 'Currently Studying' : 'Not Studying'} />
                                                    <InfoItem label="Highest Attainment" value={selectedCitizen.educAttainment || 'N/A'} />
                                                    {selectedCitizen.isStudent && <InfoItem label="Current School" value={selectedCitizen.schoolName || 'N/A'} />}
                                                    <div className="pt-2 border-t border-yellow-200/50 space-y-2 mt-2">
                                                        <span className="text-[10px] font-bold uppercase text-yellow-600/80 dark:text-yellow-400/80">Educational History</span>
                                                        <InfoItem label="Elementary" value={selectedCitizen.elementary_name || 'N/A'} />
                                                        <InfoItem label="High School" value={selectedCitizen.highschool_name || 'N/A'} />
                                                        <InfoItem label="Senior High" value={selectedCitizen.senior_high_name || 'N/A'} />
                                                        <InfoItem label="College" value={selectedCitizen.college_name || 'N/A'} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedCitizen.isDeceased && (
                                            <div className="col-span-1 space-y-4">
                                                <SectionHeader icon={<UserX className="size-4 text-red-600" />} title="Deceased Info" />
                                                <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-200 rounded-xl p-4 space-y-2">
                                                    <InfoItem label="Date of Death" value={selectedCitizen.dateOfDeath || 'N/A'} />
                                                    <InfoItem label="Cause" value={selectedCitizen.causeOfDeath || 'N/A'} />
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Medical History Section */}
                                        {selectedCitizen.medicalHistories && selectedCitizen.medicalHistories.length > 0 && (
                                            <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-4">
                                                <SectionHeader icon={<HeartPulse className="size-4 text-red-500" />} title="Medical History" />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {selectedCitizen.medicalHistories.map((med) => (
                                                        <div key={med.id} className="bg-red-50/30 dark:bg-red-900/10 border border-red-100 rounded-xl p-4 space-y-2 group/card relative overflow-hidden">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">{med.type}</h4>
                                                                    <span className="text-[10px] font-mono text-rose-500 font-bold block mt-0.5">{med.uuid}</span>
                                                                </div>
                                                                <div className="flex flex-col items-end gap-2">
                                                                    <span className="text-xs font-mono text-neutral-500">{med.dateDiagnosed || 'Date Not Specified'}</span>
                                                                    <button 
                                                                        onClick={(e) => handleOpenMedicalQuickView(e, med.uuid)}
                                                                        className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white text-[10px] font-bold uppercase rounded-lg shadow-sm hover:bg-rose-700 transition-all active:scale-95"
                                                                    >
                                                                        <Activity className="size-3" /> Quick View
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2 italic">{med.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Settlement History Section */}
                                        {selectedCitizen.settlementHistories && selectedCitizen.settlementHistories.length > 0 && (
                                            <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-4">
                                                <SectionHeader icon={<RotateCcw className="size-4 text-orange-500" />} title="Settlement / Citizen History" />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {selectedCitizen.settlementHistories.map((hist) => (
                                                        <div key={hist.id} className="bg-orange-50/30 dark:bg-orange-900/10 border border-orange-100 rounded-xl p-4 space-y-3 group/hist relative flex flex-col">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-1">
                                                                    <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 leading-tight">{hist.title}</h4>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <span className="text-[10px] font-mono text-amber-600 font-bold">{hist.uuid}</span>
                                                                        <span className="text-[9px] uppercase font-bold text-amber-600/60 dark:text-amber-400/60 tracking-widest">• {hist.type}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold shadow-sm border ${
                                                                        hist.status === 'Resolved' || hist.status === 'Completed' || hist.status === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                                                        hist.status === 'Pending' || hist.status === 'Ongoing' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                                        'bg-neutral-100 text-neutral-700 border-neutral-200'
                                                                    }`}>
                                                                        {hist.status.toUpperCase()}
                                                                    </span>
                                                                    <span className="text-[9px] font-mono text-neutral-400 font-bold">{hist.dateCreated || 'NO DATE'}</span>
                                                                </div>
                                                            </div>
                                                            
                                                            <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 italic p-2 bg-white/40 dark:bg-black/20 rounded border border-orange-50 px-3">
                                                                {hist.description}
                                                            </p>

                                                            <div className="flex gap-2 pt-1 mt-auto">
                                                                <button 
                                                                    onClick={(e) => handleOpenHistoryQuickView(e, hist.uuid)}
                                                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-neutral-900 dark:bg-neutral-800 text-white text-[9px] font-bold uppercase rounded-lg shadow-sm hover:bg-neutral-800 dark:hover:bg-neutral-700 transition-all active:scale-95 border border-neutral-700"
                                                                >
                                                                    <FileText className="size-3" /> Record Details
                                                                </button>
                                                                {hist.settlement_uuid && (
                                                                    <button 
                                                                        onClick={(e) => handleOpenSettlementQuickView(e, hist.settlement_uuid!)}
                                                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-[9px] font-bold uppercase rounded-lg shadow-sm hover:bg-amber-700 transition-all active:scale-95 border border-amber-500"
                                                                    >
                                                                        <RotateCcw className="size-3" /> View Settlement
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Business Ownership Section */}
                                        {selectedCitizen.ownedBusinesses && selectedCitizen.ownedBusinesses.length > 0 && (
                                            <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-4">
                                                <SectionHeader icon={<Store className="size-4 text-indigo-500" />} title="Owned Businesses" />
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {selectedCitizen.ownedBusinesses.map((biz) => (
                                                        <div key={biz.id} className="bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100 rounded-xl p-4 space-y-3 flex flex-col">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 leading-tight">{biz.name}</h4>
                                                                    <div className="flex items-center gap-2 mt-1 text-[10px]">
                                                                        <span className="font-mono text-indigo-600 font-bold bg-indigo-100/50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded">{biz.uuid}</span>
                                                                    </div>
                                                                </div>
                                                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${biz.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'}`}>
                                                                    {biz.status}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-neutral-500 line-clamp-1">{biz.type}</p>
                                                            <button 
                                                                onClick={(e) => handleOpenBusinessQuickView(e, biz.uuid)}
                                                                className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold uppercase rounded-lg shadow-sm hover:bg-indigo-700 transition-all active:scale-95"
                                                            >
                                                                <Store className="size-3" /> Quick View Business
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Infrastructure Ownership Section */}
                                        {selectedCitizen.ownedInfrastructures && selectedCitizen.ownedInfrastructures.length > 0 && (
                                            <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-4">
                                                <SectionHeader icon={<Building className="size-4 text-sky-500" />} title="Owned Infrastructures" />
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {selectedCitizen.ownedInfrastructures.map((infra) => (
                                                        <div key={infra.id} className="bg-sky-50/30 dark:bg-sky-900/10 border border-sky-100 rounded-xl p-4 space-y-3 flex flex-col">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 leading-tight">{infra.name}</h4>
                                                                    <div className="flex items-center gap-2 mt-1 text-[10px]">
                                                                        <span className="font-mono text-sky-600 font-bold bg-sky-100/50 dark:bg-sky-900/30 px-1.5 py-0.5 rounded">{infra.infraId}</span>
                                                                    </div>
                                                                </div>
                                                                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600">
                                                                    {infra.type}
                                                                </span>
                                                            </div>
                                                            <button 
                                                                onClick={(e) => handleOpenInfrastructureQuickView(e, infra.id)}
                                                                className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-sky-600 text-white text-[10px] font-bold uppercase rounded-lg shadow-sm hover:bg-sky-700 transition-all active:scale-95"
                                                            >
                                                                <Building className="size-3" /> Quick View Infrastructure
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Transaction Logs Section */}
                                        {selectedCitizen.transactionLogs && selectedCitizen.transactionLogs.length > 0 && (
                                            <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-4">
                                                <SectionHeader icon={<FileText className="size-4 text-violet-500" />} title="Transaction Records" />
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {selectedCitizen.transactionLogs.map((trx) => (
                                                        <div key={trx.id} className="bg-violet-50/30 dark:bg-violet-900/10 border border-violet-100 rounded-xl p-4 space-y-3 flex flex-col">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 leading-tight">{trx.type}</h4>
                                                                    <div className="flex items-center gap-2 mt-1 text-[10px]">
                                                                        <span className="font-mono text-violet-600 font-bold bg-violet-100/50 dark:bg-violet-900/30 px-1.5 py-0.5 rounded">{trx.transactionId}</span>
                                                                    </div>
                                                                </div>
                                                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                                                    trx.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                                    trx.status === 'Pending'  ? 'bg-orange-100 text-orange-700' :
                                                                    'bg-red-100 text-red-700'
                                                                }`}>
                                                                    {trx.status}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-neutral-500 line-clamp-1">{trx.dateRequested}</p>
                                                            <button
                                                                onClick={(e) => handleOpenServicesQuickView(e, trx.id)}
                                                                className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white text-[10px] font-bold uppercase rounded-lg shadow-sm hover:bg-violet-700 transition-all active:scale-95"
                                                            >
                                                                <FileText className="size-3" /> Quick View
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </div>

                                {/* 3. Footer Audit Log */}
                                <div className="p-4 border-t border-sidebar-border/60 bg-neutral-50 dark:bg-neutral-900/50 flex flex-col md:flex-row justify-between items-start md:items-center text-[10px] text-neutral-400 font-mono gap-4">
                                    <div className="space-y-1">
                                        <div className="flex gap-2">
                                            <span className="font-bold w-20">DATE ENCODED:</span>
                                            <span>{selectedCitizen.dateEncoded}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="font-bold w-20">ENCODED BY:</span>
                                            <span>{selectedCitizen.encodedBy}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <span className="font-bold">DATE UPDATED:</span>
                                            <span>{selectedCitizen.dateUpdated}</span>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <span className="font-bold">UPDATED BY:</span>
                                            <span>{selectedCitizen.updatedBy}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-sidebar-border rounded-2xl bg-neutral-50/50 text-neutral-400">
                                <User className="size-12 mb-2 opacity-20" />
                                <p>Select a citizen from the list to view full profile</p>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* ===== FILTER DRAWER ===== */}
            {showFilters && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
                        onClick={() => setShowFilters(false)}
                    />

                    {/* Drawer panel */}
                    <div className="fixed right-0 top-0 bottom-0 z-50 flex flex-col w-[380px] bg-white dark:bg-neutral-900 border-l border-sidebar-border shadow-2xl animate-in slide-in-from-right duration-200">

                        {/* Drawer Header */}
                        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-sidebar-border bg-neutral-50 dark:bg-neutral-800/60">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40">
                                    <SlidersHorizontal className="size-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Filter Citizens</h3>
                                    <p className="text-xs text-neutral-500 mt-0.5">
                                        {activeFilterCount > 0
                                            ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`
                                            : 'No filters applied'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-500 dark:text-neutral-400"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">

                            {/* ---- Section: Profile ---- */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 shrink-0">Profile</span>
                                    <div className="flex-1 h-px bg-sidebar-border/60" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">Employment Status</label>
                                        <select
                                            className="w-full text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:outline-none transition-colors"
                                            value={filterState.employmentStatus}
                                            onChange={(e) => handleFilterChange('employmentStatus', e.target.value)}
                                        >
                                            <option value="">All</option>
                                            <option value="Employed">Employed</option>
                                            <option value="Unemployed">Unemployed</option>
                                            <option value="Self-Employed">Self-Employed</option>
                                            <option value="Student">Student</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">Sex</label>
                                        <select
                                            className="w-full text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:outline-none transition-colors"
                                            value={filterState.sex}
                                            onChange={(e) => handleFilterChange('sex', e.target.value)}
                                        >
                                            <option value="">All</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">Civil Status</label>
                                        <select
                                            className="w-full text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:outline-none transition-colors"
                                            value={filterState.civilStatus}
                                            onChange={(e) => handleFilterChange('civilStatus', e.target.value)}
                                        >
                                            <option value="">All</option>
                                            <option value="Single">Single</option>
                                            <option value="Married">Married</option>
                                            <option value="Widowed">Widowed</option>
                                            <option value="Separated">Separated</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">Voter Status</label>
                                        <select
                                            className="w-full text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:outline-none transition-colors"
                                            value={filterState.isVoter}
                                            onChange={(e) => handleFilterChange('isVoter', e.target.value)}
                                        >
                                            <option value="">All</option>
                                            <option value="Yes">Registered Voter</option>
                                            <option value="No">Non-Voter</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">Sitio / Location</label>
                                    <select
                                        className="w-full text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:outline-none transition-colors"
                                        value={filterState.sitio}
                                        onChange={(e) => handleFilterChange('sitio', e.target.value)}
                                    >
                                        <option value="">All Sitios</option>
                                        {sitios && sitios.map(s => (
                                            <option key={s.sitio_id} value={s.sitio_id}>{s.sitio_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* ---- Section: Date Filters ---- */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 shrink-0">Date Filters</span>
                                    <div className="flex-1 h-px bg-sidebar-border/60" />
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">Date Encoded</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="date"
                                                className="flex-1 text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 min-w-0 transition-colors"
                                                value={filterState.dateEncodedStart}
                                                onChange={e => handleFilterChange('dateEncodedStart', e.target.value)}
                                            />
                                            <span className="text-sm text-neutral-400 font-medium shrink-0">→</span>
                                            <input
                                                type="date"
                                                className="flex-1 text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 min-w-0 transition-colors"
                                                value={filterState.dateEncodedEnd}
                                                onChange={e => handleFilterChange('dateEncodedEnd', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">Date Updated</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="date"
                                                className="flex-1 text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 min-w-0 transition-colors"
                                                value={filterState.dateUpdatedStart}
                                                onChange={e => handleFilterChange('dateUpdatedStart', e.target.value)}
                                            />
                                            <span className="text-sm text-neutral-400 font-medium shrink-0">→</span>
                                            <input
                                                type="date"
                                                className="flex-1 text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 min-w-0 transition-colors"
                                                value={filterState.dateUpdatedEnd}
                                                onChange={e => handleFilterChange('dateUpdatedEnd', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ---- Section: Audit Trail ---- */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 shrink-0">Audit Trail</span>
                                    <div className="flex-1 h-px bg-sidebar-border/60" />
                                </div>
                                <div className="space-y-4">

                                    {/* Encoded By */}
                                    <div className="space-y-1.5" ref={encodedByRef}>
                                        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">Encoded By</label>
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowEncodedByDropdown(!showEncodedByDropdown)}
                                                className="w-full text-left text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex justify-between items-center gap-2 hover:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                            >
                                                <span className="truncate">
                                                    {filterState.encodedBy.length === 0 ? 'All Users' : `${filterState.encodedBy.length} user${filterState.encodedBy.length > 1 ? 's' : ''} selected`}
                                                </span>
                                                <Search className="size-4 text-neutral-400 shrink-0" />
                                            </button>
                                            {showEncodedByDropdown && (
                                                <div className="absolute z-[60] top-full mt-1 left-0 right-0 bg-white dark:bg-neutral-800 border border-sidebar-border rounded-xl shadow-2xl py-1 max-h-56 flex flex-col">
                                                    <div className="px-3 py-2 border-b border-sidebar-border/50">
                                                        <input
                                                            type="text"
                                                            className="w-full text-sm p-2 bg-neutral-50 dark:bg-neutral-900 border border-sidebar-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                            placeholder="Search users..."
                                                            value={encodedBySearch}
                                                            onChange={(e) => setEncodedBySearch(e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                    <div className="overflow-y-auto flex-1 p-1.5">
                                                        <div
                                                            className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer rounded-lg"
                                                            onClick={() => handleFilterChange('encodedBy', [])}
                                                        >
                                                            <div className={`size-4 rounded border shrink-0 flex items-center justify-center ${filterState.encodedBy.length === 0 ? 'bg-blue-600 border-blue-600' : 'border-neutral-300 dark:border-neutral-600'}`}>
                                                                {filterState.encodedBy.length === 0 && <Check className="size-3 text-white" />}
                                                            </div>
                                                            <span className="font-medium">All Users</span>
                                                        </div>
                                                        {systemAccounts?.filter(acc => acc.name.toLowerCase().includes(encodedBySearch.toLowerCase())).map(acc => {
                                                            const isSelected = filterState.encodedBy.includes(acc.id.toString());
                                                            return (
                                                                <div
                                                                    key={acc.id}
                                                                    className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer rounded-lg"
                                                                    onClick={() => {
                                                                        const newSelection = isSelected
                                                                            ? filterState.encodedBy.filter((id: string) => id !== acc.id.toString())
                                                                            : [...filterState.encodedBy, acc.id.toString()];
                                                                        handleFilterChange('encodedBy', newSelection);
                                                                    }}
                                                                >
                                                                    <div className={`size-4 rounded border shrink-0 flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-neutral-300 dark:border-neutral-600'}`}>
                                                                        {isSelected && <Check className="size-3 text-white" />}
                                                                    </div>
                                                                    <span className="truncate">{acc.name}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Updated By */}
                                    <div className="space-y-1.5" ref={updatedByRef}>
                                        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">Updated By</label>
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowUpdatedByDropdown(!showUpdatedByDropdown)}
                                                className="w-full text-left text-sm p-2.5 rounded-xl border border-sidebar-border bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex justify-between items-center gap-2 hover:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                            >
                                                <span className="truncate">
                                                    {filterState.updatedBy.length === 0 ? 'All Users' : `${filterState.updatedBy.length} user${filterState.updatedBy.length > 1 ? 's' : ''} selected`}
                                                </span>
                                                <Search className="size-4 text-neutral-400 shrink-0" />
                                            </button>
                                            {showUpdatedByDropdown && (
                                                <div className="absolute z-[60] top-full mt-1 left-0 right-0 bg-white dark:bg-neutral-800 border border-sidebar-border rounded-xl shadow-2xl py-1 max-h-56 flex flex-col">
                                                    <div className="px-3 py-2 border-b border-sidebar-border/50">
                                                        <input
                                                            type="text"
                                                            className="w-full text-sm p-2 bg-neutral-50 dark:bg-neutral-900 border border-sidebar-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                            placeholder="Search users..."
                                                            value={updatedBySearch}
                                                            onChange={(e) => setUpdatedBySearch(e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                    <div className="overflow-y-auto flex-1 p-1.5">
                                                        <div
                                                            className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer rounded-lg"
                                                            onClick={() => handleFilterChange('updatedBy', [])}
                                                        >
                                                            <div className={`size-4 rounded border shrink-0 flex items-center justify-center ${filterState.updatedBy.length === 0 ? 'bg-blue-600 border-blue-600' : 'border-neutral-300 dark:border-neutral-600'}`}>
                                                                {filterState.updatedBy.length === 0 && <Check className="size-3 text-white" />}
                                                            </div>
                                                            <span className="font-medium">All Users</span>
                                                        </div>
                                                        {systemAccounts?.filter(acc => acc.name.toLowerCase().includes(updatedBySearch.toLowerCase())).map(acc => {
                                                            const isSelected = filterState.updatedBy.includes(acc.id.toString());
                                                            return (
                                                                <div
                                                                    key={acc.id}
                                                                    className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer rounded-lg"
                                                                    onClick={() => {
                                                                        const newSelection = isSelected
                                                                            ? filterState.updatedBy.filter((id: string) => id !== acc.id.toString())
                                                                            : [...filterState.updatedBy, acc.id.toString()];
                                                                        handleFilterChange('updatedBy', newSelection);
                                                                    }}
                                                                >
                                                                    <div className={`size-4 rounded border shrink-0 flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-neutral-300 dark:border-neutral-600'}`}>
                                                                        {isSelected && <Check className="size-3 text-white" />}
                                                                    </div>
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

                        {/* Drawer Footer */}
                        <div className="shrink-0 flex items-center gap-3 px-6 py-4 border-t border-sidebar-border bg-neutral-50 dark:bg-neutral-800/60">
                            <button
                                onClick={resetFilters}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-800 dark:hover:text-red-400 transition-colors"
                            >
                                <RotateCcw className="size-4" />
                                Reset All
                            </button>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm"
                            >
                                <Check className="size-4" />
                                Done
                            </button>
                        </div>

                    </div>
                </>
            )}

        </AppLayout>
    );
}

// --- Reusable Sub-Components ---

function SectionHeader({ icon, title }: { icon: React.ReactNode, title: string }) {
    return (
        <div className="flex items-center gap-2 pb-1 border-b border-sidebar-border/50">
            <span className="text-neutral-400">{icon}</span>
            <h3 className="text-xs font-bold uppercase text-neutral-600 dark:text-neutral-300 tracking-wider">{title}</h3>
        </div>
    );
}

function InfoItem({ label, value, highlight = false }: { label: string, value: string | number, highlight?: boolean }) {
    return (
        <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">{label}</span>
            <span className={`text-sm truncate font-medium ${highlight ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-800 dark:text-neutral-200'}`}>
                {value}
            </span>
        </div>
    );
}

// --- Mini Statistics ---

function CitizenMiniStats({ citizens }: { citizens: Citizen[] }) {
    const total = citizens.length;

    // Status counts
    const active   = useMemo(() => citizens.filter(c => !c.isDeceased).length, [citizens]);
    const deceased = useMemo(() => citizens.filter(c => c.isDeceased).length,  [citizens]);

    // Sex split
    const male   = useMemo(() => citizens.filter(c => c.sex === 'Male').length,   [citizens]);
    const female = useMemo(() => citizens.filter(c => c.sex === 'Female').length, [citizens]);

    // Top 5 sitios
    const topSitios = useMemo(() => {
        const map: Record<string, number> = {};
        citizens.forEach(c => { if (c.sitio) map[c.sitio] = (map[c.sitio] || 0) + 1; });
        return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
    }, [citizens]);

    const maxSitio = topSitios[0]?.[1] ?? 1;

    if (total === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">

            {/* 1. Status Breakdown */}
            <div className="bg-white dark:bg-sidebar border border-sidebar-border/60 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                    <BarChart2 className="size-4 text-blue-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Citizen Status</span>
                    <span className="ml-auto text-[10px] font-mono text-neutral-400">{total} total</span>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden gap-px">
                    {active > 0 && (
                        <div className="bg-green-500 transition-all" style={{ width: `${(active / total) * 100}%` }} title={`Active: ${active}`} />
                    )}
                    {deceased > 0 && (
                        <div className="bg-red-400 transition-all" style={{ width: `${(deceased / total) * 100}%` }} title={`Deceased: ${deceased}`} />
                    )}
                </div>
                <div className="grid grid-cols-2 gap-1 text-center">
                    {([
                        { label: 'Active',   count: active,   color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
                        { label: 'Deceased', count: deceased, color: 'text-red-500',   bg: 'bg-red-50 dark:bg-red-900/20' },
                    ] as const).map(s => (
                        <div key={s.label} className={`rounded-lg p-2 ${s.bg}`}>
                            <div className={`text-xl font-black font-mono ${s.color}`}>{s.count}</div>
                            <div className="text-[9px] uppercase font-bold text-neutral-400">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Sex Distribution */}
            <div className="bg-white dark:bg-sidebar border border-sidebar-border/60 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                    <User className="size-4 text-blue-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Sex Distribution</span>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden gap-px">
                    {male > 0 && (
                        <div className="bg-blue-500 transition-all" style={{ width: `${(male / total) * 100}%` }} title={`Male: ${male}`} />
                    )}
                    {female > 0 && (
                        <div className="bg-pink-400 transition-all" style={{ width: `${(female / total) * 100}%` }} title={`Female: ${female}`} />
                    )}
                </div>
                <div className="grid grid-cols-2 gap-1 text-center">
                    {([
                        { label: 'Male',   count: male,   color: 'text-blue-600',  bg: 'bg-blue-50 dark:bg-blue-900/20' },
                        { label: 'Female', count: female, color: 'text-pink-500',  bg: 'bg-pink-50 dark:bg-pink-900/20' },
                    ] as const).map(s => (
                        <div key={s.label} className={`rounded-lg p-2 ${s.bg}`}>
                            <div className={`text-xl font-black font-mono ${s.color}`}>{s.count}</div>
                            <div className="text-[9px] uppercase font-bold text-neutral-400">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Top Sitios */}
            <div className="bg-white dark:bg-sidebar border border-sidebar-border/60 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-blue-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Top Sitios</span>
                    <span className="ml-auto text-[10px] font-mono text-neutral-400">{topSitios.length} location{topSitios.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="space-y-2">
                    {topSitios.map(([sitio, count]) => (
                        <div key={sitio} className="space-y-0.5">
                            <div className="flex justify-between text-[10px]">
                                <span className="truncate max-w-[70%] font-medium text-neutral-700 dark:text-neutral-300">{sitio}</span>
                                <span className="font-mono font-bold text-blue-600">{count}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(count / maxSitio) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                    {topSitios.length === 0 && <p className="text-xs text-neutral-400 italic">No data.</p>}
                </div>
            </div>

        </div>
    );
}

function FlagBadge({ label, active, color }: { label: string, active: boolean, color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' | 'indigo' }) {
    if (!active) return null;

    const colors = {
        blue: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
        green: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
        red: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
        yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
        purple: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
        orange: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
        indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
    };

    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${colors[color]}`}>
            {label}
        </span>
    );
}
