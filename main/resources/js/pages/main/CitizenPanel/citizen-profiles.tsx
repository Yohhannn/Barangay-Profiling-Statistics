import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft, Search, Plus, Trash2,
    User, MapPin, Briefcase, UserX, GraduationCap,
    HeartPulse, Baby, Phone, Hash,
    Filter, X, SlidersHorizontal, Edit3, ScanFace
} from 'lucide-react';
import { useState, useMemo } from 'react';
// IMPORT THE MODAL COMPONENT
import CitizenCreation from './popup/citizen-creation';

// --- 1. Comprehensive Type Definition ---
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

    // Audit
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string;
    updatedBy: string;
}

// --- 2. 20 Example Data Entries ---
// Mock data removed.


const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Citizen Panel', href: '/citizen-panel' },
    { title: 'Citizen Profiles', href: '/citizen-panel/citizen-profile' },
];

export default function CitizenProfiles({ citizens = [], sitios = [] }: { citizens?: Citizen[], sitios?: { sitio_id: number, sitio_name: string }[] }) {
    const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(citizens.length > 0 ? citizens[0] : null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // --- NEW STATE FOR MODAL ---
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Filter States
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterSitio, setFilterSitio] = useState('All');
    const [filterSex, setFilterSex] = useState('All');

    // Get unique Sitios for dropdown
    const uniqueSitios = useMemo(() => {
        if (sitios && sitios.length > 0) {
            return sitios.map(s => s.sitio_name);
        }
        return Array.from(new Set(citizens.map(c => c.sitio))).sort();
    }, [citizens, sitios]);

    // Derived State for Filtered List
    const filteredCitizens = useMemo(() => {
        return citizens.filter(citizen => {
            const matchesSearch =
                citizen.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                citizen.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                citizen.citizenId.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = filterStatus === 'All' || citizen.status === filterStatus;
            const matchesSitio = filterSitio === 'All' || citizen.sitio === filterSitio;
            const matchesSex = filterSex === 'All' || citizen.sex === filterSex;

            return matchesSearch && matchesStatus && matchesSitio && matchesSex;
        });
    }, [searchQuery, filterStatus, filterSitio, filterSex]);

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to move this citizen to archives?')) {
            console.log('Deleted citizen:', id);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Citizen Profiles" />

            {/* --- MOUNT THE MODAL HERE --- */}
            <CitizenCreation isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

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
                                    {/* REGISTER BUTTON ADDED HERE */}
                                    <button
                                        onClick={() => setIsCreateOpen(true)}
                                        className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white p-1 rounded-md transition-colors shadow-sm"
                                        title="Register New Citizen"
                                    >
                                        <Plus className="size-4" />
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
                                        placeholder="Search..."
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button
                                    className="p-2 rounded-lg border border-sidebar-border bg-white hover:bg-neutral-50 text-neutral-500 transition-colors"
                                    title="Scan Face to Search"
                                >
                                    <ScanFace className="size-4" />
                                </button>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`p-2 rounded-lg border border-sidebar-border transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white hover:bg-neutral-50 text-neutral-500'}`}
                                >
                                    {showFilters ? <X className="size-4" /> : <SlidersHorizontal className="size-4" />}
                                </button>
                            </div>

                            {/* Collapsible Filters */}
                            {showFilters && (
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-sidebar-border/50 animate-in slide-in-from-top-2 duration-200">
                                    <select
                                        className="text-xs p-2 rounded-lg border border-sidebar-border bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500/20"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="All">All Status</option>
                                        <option value="Active">Active</option>
                                        <option value="Deceased">Deceased</option>
                                        <option value="Moved">Moved</option>
                                    </select>
                                    <select
                                        className="text-xs p-2 rounded-lg border border-sidebar-border bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500/20"
                                        value={filterSex}
                                        onChange={(e) => setFilterSex(e.target.value)}
                                    >
                                        <option value="All">All Sex</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                    <select
                                        className="col-span-2 text-xs p-2 rounded-lg border border-sidebar-border bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500/20"
                                        value={filterSitio}
                                        onChange={(e) => setFilterSitio(e.target.value)}
                                    >
                                        <option value="All">All Sitios / Locations</option>
                                        {uniqueSitios.map(sitio => (
                                            <option key={sitio} value={sitio}>{sitio}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
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
                                                        onClick={(e) => handleDelete(e, citizen.id)}
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
                                        <div className="w-24 h-24 shrink-0 bg-white dark:bg-neutral-800 rounded-xl border border-sidebar-border flex items-center justify-center shadow-sm">
                                            <User className="size-10 text-neutral-300" />
                                        </div>

                                        {/* Name Block */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                                        {selectedCitizen.firstName} {selectedCitizen.middleName} {selectedCitizen.lastName} <span className="text-neutral-400 text-lg">{selectedCitizen.suffix}</span>
                                                    </h1>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="font-mono text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                                                            {selectedCitizen.citizenId}
                                                        </span>
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${selectedCitizen.status === 'Deceased' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                                            {selectedCitizen.status.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                {/* UPDATE BUTTON ADDED HERE */}
                                                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all hover:shadow-md">
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
                                                    <InfoItem label="Sitio" value={selectedCitizen.sitio} highlight />
                                                    <InfoItem label="Full Address" value={selectedCitizen.fullAddress} />
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
                                                <InfoItem label="Household ID" value={selectedCitizen.householdId} highlight />
                                                <InfoItem label="Relationship" value={selectedCitizen.relationship} />
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

                                        {selectedCitizen.isStudent && (
                                            <div className="col-span-1 space-y-4">
                                                <SectionHeader icon={<GraduationCap className="size-4 text-yellow-600" />} title="Education" />
                                                <div className="bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-200 rounded-xl p-4 space-y-2">
                                                    <InfoItem label="Level" value={selectedCitizen.educAttainment || 'N/A'} />
                                                    <InfoItem label="School" value={selectedCitizen.schoolName || 'N/A'} />
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

                                    </div>
                                </div>

                                {/* 3. Footer Audit Log */}
                                <div className="p-4 border-t border-sidebar-border/60 bg-neutral-50 dark:bg-neutral-900/50 grid grid-cols-2 gap-4 text-xs font-mono">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-bold text-neutral-500 uppercase tracking-wider text-[10px]">Date Encoded:</span>
                                        <span className="text-neutral-700 dark:text-neutral-300 font-bold">{selectedCitizen.dateEncoded}</span>
                                        <span className="font-bold text-neutral-500 uppercase tracking-wider text-[10px] mt-1">Encoded By:</span>
                                        <span className="text-neutral-700 dark:text-neutral-300">{selectedCitizen.encodedBy}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 border-l border-sidebar-border/50 pl-4">
                                        <span className="font-bold text-neutral-500 uppercase tracking-wider text-[10px]">Date Updated:</span>
                                        <span className="text-neutral-700 dark:text-neutral-300 font-bold">{selectedCitizen.dateUpdated}</span>
                                        <span className="font-bold text-neutral-500 uppercase tracking-wider text-[10px] mt-1">Updated By:</span>
                                        <span className="text-neutral-700 dark:text-neutral-300">{selectedCitizen.updatedBy}</span>
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
