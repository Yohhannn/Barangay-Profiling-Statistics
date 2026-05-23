import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft, Search, UserX, User, MapPin, RotateCcw, AlertTriangle,
    Briefcase, GraduationCap, HeartPulse, Baby, Phone, Hash, Home,
    Activity, FileText, Info, Store, Building
} from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import MedicalQuickView from '../../main/CitizenRecords/popup/medical-quick-view';
import HistoryQuickView from '../../main/CitizenRecords/popup/history-quick-view';
import SettlementQuickView from '../../main/CitizenRecords/popup/settlement-quick-view';
import CitizenQuickView from '../../main/CitizenRecords/popup/citizen-quick-view';
import HouseholdQuickView from '../../main/CitizenRecords/popup/household-quick-view';
import BusinessQuickView from '../../main/Institutions/popup/business-quick-view';
import InfrastructureQuickView from '../../main/Institutions/popup/infrastructures-quick-view';
import ServicesQuickView from '../../main/Transactions/popup/services-quick-view';

interface HouseholdMember { id: number; name: string; relationship: string; }
interface MedicalHistory { id: number; uuid: string; type: string; description: string; dateDiagnosed?: string; }
interface SettlementHistory { id: number; uuid: string; title: string; type: string; description: string; status: string; dateCreated?: string; settlement_uuid?: string | null; }
interface OwnedBusiness { id: number; uuid: string; name: string; type: string; status: string; }
interface OwnedInfrastructure { id: number; infraId: string; name: string; type: string; }
interface CitizenTransaction { id: number; transactionId: string; type: string; status: string; dateRequested: string; }

interface ArchivedCitizen {
    id: number;
    citizenId: string;
    firstName: string;
    middleName: string;
    lastName: string;
    suffix?: string;
    status: string;
    dob: string;
    age: number | null;
    sex: string;
    bloodType: string;
    civilStatus: string;
    religion: string;
    pob: string;
    email: string;
    contact: string[];
    personalAddress: string;
    householdAddress: string;
    fullAddress: string;
    sitio: string;
    employmentStatus: string;
    occupation: string;
    socioEconomicStatus: string;
    isGovWorker: boolean;
    isStudent: boolean;
    isVoter: boolean;
    isIp: boolean;
    isDeceased: boolean;
    dateOfDeath?: string;
    causeOfDeath?: string;
    educAttainment?: string;
    schoolName?: string;
    elementary_name?: string;
    highschool_name?: string;
    senior_high_name?: string;
    college_name?: string;
    fpStatus?: string;
    fpMethod?: string;
    fpDateStarted?: string;
    fpDateEnded?: string;
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
    deleteReason: string;
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string;
    updatedBy: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Archives', href: '/archives' },
    { title: 'Citizens', href: '/archives/citizens' },
];

export default function CitizensArchive({ records = [], filters = {} }: { records?: ArchivedCitizen[], filters?: any }) {
    const [selected, setSelected] = useState<ArchivedCitizen | null>(records[0] ?? null);
    const [search, setSearch] = useState(filters?.search || '');
    const [isDebouncing, setIsDebouncing] = useState(false);

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

    const handleSearch = (val: string) => {
        setSearch(val);
        setIsDebouncing(true);
        clearTimeout((window as any).__archiveSearchTimer);
        (window as any).__archiveSearchTimer = setTimeout(() => {
            router.get('/archives/citizens', { search: val }, { preserveState: true, preserveScroll: true, replace: true, onFinish: () => setIsDebouncing(false) });
        }, 400);
    };

    const handleRestore = (e: React.MouseEvent, record: ArchivedCitizen) => {
        e.stopPropagation();
        Swal.fire({
            title: 'Restore Citizen',
            text: `Are you sure you want to restore "${record.firstName} ${record.lastName}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, restore!',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/archives/citizens/${record.id}/restore`, {}, {
                    preserveScroll: true,
                    onSuccess: () => { if (selected?.id === record.id) setSelected(null); Swal.fire('Restored!', 'Citizen has been restored successfully.', 'success'); },
                    onError: () => Swal.fire('Error', 'Failed to restore citizen.', 'error'),
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Archived Citizens" />

            <MedicalQuickView isOpen={medicalQuickViewOpen} onClose={() => setMedicalQuickViewOpen(false)} medicalUuid={selectedMedicalUuid} />
            <HistoryQuickView isOpen={historyQuickViewOpen} onClose={() => setHistoryQuickViewOpen(false)} historyUuid={selectedHistoryUuid} />
            <SettlementQuickView isOpen={settlementQuickViewOpen} onClose={() => setSettlementQuickViewOpen(false)} settlementUuid={selectedSettlementUuid} />
            <CitizenQuickView isOpen={citizenQuickViewOpen} onClose={() => setCitizenQuickViewOpen(false)} citizenId={selectedCitizenId} />
            <HouseholdQuickView isOpen={householdQuickViewOpen} onClose={() => setHouseholdQuickViewOpen(false)} householdUuid={selectedHouseholdUuid} />
            <BusinessQuickView isOpen={businessQuickViewOpen} onClose={() => setBusinessQuickViewOpen(false)} businessUuid={selectedBusinessUuid} />
            <InfrastructureQuickView isOpen={infrastructureQuickViewOpen} onClose={() => setInfrastructureQuickViewOpen(false)} infrastructureId={selectedInfrastructureId} />
            <ServicesQuickView isOpen={servicesQuickViewOpen} onClose={() => setServicesQuickViewOpen(false)} transactionId={selectedTransactionId} />

            <div className="flex flex-col h-[calc(100vh-4rem)] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">

                {/* Header */}
                <div className="flex items-center gap-4 pb-2 border-b border-sidebar-border/60">
                    <Link href="/archives" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                            Archives: <span className="text-blue-600 dark:text-blue-400">Citizens</span>
                        </h1>
                        <p className="text-xs text-neutral-500 mt-0.5">Soft-deleted citizen records — restore to reinstate</p>
                    </div>
                </div>

                {/* Main Split */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                    {/* LEFT: List */}
                    <div className="lg:col-span-4 flex flex-col gap-4 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm overflow-hidden">
                        <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/20 border-b border-sidebar-border/60 space-y-3">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xs font-bold text-white bg-blue-600 py-1 px-3 rounded-md uppercase tracking-wider">Archived List</h2>
                                <span className="text-[10px] text-neutral-400 font-mono">TOTAL: {records.length}</span>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search name or ID..."
                                    className="w-full pl-10 pr-4 py-2 text-sm border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                                {isDebouncing && <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>}
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                            {records.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-neutral-400 gap-2">
                                    <UserX className="size-8 opacity-20" />
                                    <p className="text-xs">No archived citizens found.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {records.map((c) => (
                                        <div
                                            key={c.id}
                                            onClick={() => setSelected(c)}
                                            className={`group cursor-pointer p-4 border-b border-sidebar-border/50 border-l-4 transition-all duration-200 ${selected?.id === c.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-blue-500' : 'border-l-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:border-l-blue-200'}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className={`font-bold text-sm ${selected?.id === c.id ? 'text-blue-700 dark:text-blue-300' : 'text-neutral-900 dark:text-neutral-100'}`}>
                                                        {c.lastName}, {c.firstName}
                                                    </h3>
                                                    <p className="text-xs text-neutral-500 font-mono mt-0.5">{c.citizenId}</p>
                                                </div>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">{c.sitio}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Full Profile */}
                    <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
                        {selected ? (
                            <div className="flex-1 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm flex flex-col overflow-hidden">

                                {/* Profile Header */}
                                <div className="p-6 border-b border-sidebar-border/60 bg-neutral-50/50 dark:bg-neutral-900/30">
                                    <div className="flex items-start gap-5">
                                        <div className="w-24 h-24 shrink-0 bg-white dark:bg-neutral-800 rounded-xl border border-sidebar-border flex items-center justify-center shadow-sm">
                                            <User className="size-10 text-neutral-300" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                                        {selected.firstName} {selected.middleName} {selected.lastName} <span className="text-neutral-400 text-lg">{selected.suffix}</span>
                                                    </h1>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="font-mono text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">{selected.citizenId}</span>
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${selected.status === 'Deceased' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>{selected.status.toUpperCase()}</span>
                                                        <span className="text-xs font-bold px-2 py-0.5 rounded border bg-red-50 text-red-600 border-red-100">ARCHIVED</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => handleRestore(e, selected)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all hover:shadow-md"
                                                >
                                                    <RotateCcw className="size-3.5" /> Restore
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                <FlagBadge label="Voter" active={selected.isVoter} color="green" />
                                                <FlagBadge label="Gov. Worker" active={selected.isGovWorker} color="blue" />
                                                <FlagBadge label="Student" active={selected.isStudent} color="yellow" />
                                                <FlagBadge label="4Ps / NHTS" active={!!selected.nhtsNumber} color="purple" />
                                                <FlagBadge label="Indigenous" active={selected.isIp} color="indigo" />
                                                <FlagBadge label="Senior" active={(selected.age ?? 0) >= 60} color="orange" />
                                                <FlagBadge label="Deceased" active={selected.isDeceased} color="red" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Scrollable Detail Body */}
                                <div className="flex-1 overflow-y-auto p-6">

                                    {/* Archive Reason Banner */}
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 mb-6">
                                        <AlertTriangle className="size-5 text-red-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-1">Archive Reason</p>
                                            <p className="text-sm text-red-700 dark:text-red-300">{selected.deleteReason}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                                        {/* Identity */}
                                        <div className="col-span-1 space-y-4">
                                            <SectionHeader icon={<User className="size-4" />} title="Identity" />
                                            <div className="bg-neutral-50 dark:bg-neutral-900/20 rounded-xl p-4 border border-sidebar-border space-y-3">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <InfoItem label="Age" value={selected.age !== null ? `${selected.age} yrs` : 'N/A'} />
                                                    <InfoItem label="Sex" value={selected.sex} />
                                                    <InfoItem label="Blood Type" value={selected.bloodType} />
                                                    <InfoItem label="Civil Status" value={selected.civilStatus} />
                                                </div>
                                                <div className="pt-2 border-t border-sidebar-border/50">
                                                    <InfoItem label="Date of Birth" value={selected.dob} />
                                                    <InfoItem label="Place of Birth" value={selected.pob} />
                                                    <InfoItem label="Religion" value={selected.religion} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contact & Address */}
                                        <div className="col-span-1 space-y-4">
                                            <SectionHeader icon={<MapPin className="size-4" />} title="Contact & Address" />
                                            <div className="bg-neutral-50 dark:bg-neutral-900/20 rounded-xl p-4 border border-sidebar-border space-y-3">
                                                <div>
                                                    <span className="text-[10px] font-bold text-neutral-400 uppercase">Contact Numbers</span>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {selected.contact && selected.contact.length > 0 ? (
                                                            selected.contact.map((num, idx) => (
                                                                <span key={idx} className="inline-flex items-center gap-1 text-xs font-mono bg-white dark:bg-neutral-800 border border-sidebar-border px-2 py-1 rounded-md text-neutral-700 dark:text-neutral-300">
                                                                    <Phone className="size-3 text-neutral-400" /> {num}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-neutral-400 italic">No contact info provided</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <InfoItem label="Email Address" value={selected.email} />
                                                <div className="pt-2 border-t border-sidebar-border/50">
                                                    <InfoItem label="Personal Address" value={selected.personalAddress !== 'N/A' && selected.personalAddress !== '' ? selected.personalAddress : 'Not Provided'} />
                                                    <InfoItem label="Household Address" value={selected.householdAddress !== 'N/A' && selected.householdAddress !== '' ? selected.householdAddress : 'No household assigned'} />
                                                    <InfoItem label="Sitio" value={selected.sitio} highlight />
                                                    <InfoItem label="Format Address" value={selected.fullAddress} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Socio-Economic */}
                                        <div className="col-span-1 space-y-4">
                                            <SectionHeader icon={<Briefcase className="size-4" />} title="Socio-Economic" />
                                            <div className="bg-neutral-50 dark:bg-neutral-900/20 rounded-xl p-4 border border-sidebar-border space-y-3">
                                                <InfoItem label="Emp. Status" value={selected.employmentStatus} />
                                                <InfoItem label="Occupation" value={selected.occupation} />
                                                <InfoItem label="Economic Class" value={selected.socioEconomicStatus} />
                                            </div>
                                        </div>

                                        {/* Government IDs */}
                                        <div className="col-span-1 md:col-span-2 space-y-4">
                                            <SectionHeader icon={<Hash className="size-4" />} title="Government IDs" />
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
                                                <InfoItem label="PhilHealth ID" value={selected.philhealthId || 'N/A'} />
                                                <InfoItem label="Category" value={selected.philhealthCategory || 'N/A'} />
                                                <InfoItem label="Membership" value={selected.membershipType || 'N/A'} />
                                                <InfoItem label="Health Class." value={selected.healthClassification || 'N/A'} />
                                                <InfoItem label="NHTS Number" value={selected.nhtsNumber || 'N/A'} />
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">Household ID</span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-sm truncate font-medium text-blue-600 dark:text-blue-400">{selected.householdId}</span>
                                                        {selected.householdId && selected.householdId !== 'N/A' && (
                                                            <button
                                                                onClick={() => { setSelectedHouseholdUuid(selected.householdId); setHouseholdQuickViewOpen(true); }}
                                                                className="opacity-60 hover:opacity-100 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 hover:bg-blue-200 transition-all shadow-sm border border-blue-200 dark:border-blue-800"
                                                                title="Quick View Household Profile"
                                                            >
                                                                <Info className="size-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <InfoItem label="Relationship" value={selected.relationship} />
                                            </div>
                                        </div>

                                        {/* Household Members */}
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
                                                        {selected.householdMembers && selected.householdMembers.length > 0 ? (
                                                            selected.householdMembers.map((member) => (
                                                                <tr key={member.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 group/row">
                                                                    <td className="px-4 py-3 border-r border-sidebar-border relative">
                                                                        <div className="flex items-center justify-between gap-2">
                                                                            <span className="font-medium">{member.name}</span>
                                                                            <button
                                                                                onClick={() => { setSelectedCitizenId(member.id); setCitizenQuickViewOpen(true); }}
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
                                                            <tr><td colSpan={2} className="px-4 py-6 text-center text-neutral-400 italic">No other members listed</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Family Planning (conditional) */}
                                        {selected.fpStatus && selected.fpStatus !== 'N/A' && (
                                            <div className="col-span-1 space-y-4">
                                                <SectionHeader icon={<Baby className="size-4 text-purple-500" />} title="Family Planning" />
                                                <div className="bg-purple-50/50 dark:bg-purple-900/10 border border-purple-200 rounded-xl p-4 space-y-2">
                                                    <InfoItem label="Status" value={selected.fpStatus} />
                                                    <InfoItem label="Method" value={selected.fpMethod || 'N/A'} />
                                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-purple-200/50">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">Started</span>
                                                            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{selected.fpDateStarted || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">Ended</span>
                                                            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{selected.fpDateEnded || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Education (conditional) */}
                                        {(selected.isStudent || selected.educAttainment || selected.elementary_name) && (
                                            <div className="col-span-1 space-y-4">
                                                <SectionHeader icon={<GraduationCap className="size-4 text-yellow-600" />} title="Education" />
                                                <div className="bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-200 rounded-xl p-4 space-y-2">
                                                    <InfoItem label="Status" value={selected.isStudent ? 'Currently Studying' : 'Not Studying'} />
                                                    <InfoItem label="Highest Attainment" value={selected.educAttainment || 'N/A'} />
                                                    {selected.isStudent && <InfoItem label="Current School" value={selected.schoolName || 'N/A'} />}
                                                    <div className="pt-2 border-t border-yellow-200/50 space-y-2 mt-2">
                                                        <span className="text-[10px] font-bold uppercase text-yellow-600/80 dark:text-yellow-400/80">Educational History</span>
                                                        <InfoItem label="Elementary" value={selected.elementary_name || 'N/A'} />
                                                        <InfoItem label="High School" value={selected.highschool_name || 'N/A'} />
                                                        <InfoItem label="Senior High" value={selected.senior_high_name || 'N/A'} />
                                                        <InfoItem label="College" value={selected.college_name || 'N/A'} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Deceased Info (conditional) */}
                                        {selected.isDeceased && (
                                            <div className="col-span-1 space-y-4">
                                                <SectionHeader icon={<UserX className="size-4 text-red-600" />} title="Deceased Info" />
                                                <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-200 rounded-xl p-4 space-y-2">
                                                    <InfoItem label="Date of Death" value={selected.dateOfDeath || 'N/A'} />
                                                    <InfoItem label="Cause" value={selected.causeOfDeath || 'N/A'} />
                                                </div>
                                            </div>
                                        )}

                                        {/* Medical History */}
                                        {selected.medicalHistories && selected.medicalHistories.length > 0 && (
                                            <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-4">
                                                <SectionHeader icon={<HeartPulse className="size-4 text-red-500" />} title="Medical History" />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {selected.medicalHistories.map((med) => (
                                                        <div key={med.id} className="bg-red-50/30 dark:bg-red-900/10 border border-red-100 rounded-xl p-4 space-y-2 group/card relative overflow-hidden">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">{med.type}</h4>
                                                                    <span className="text-[10px] font-mono text-rose-500 font-bold block mt-0.5">{med.uuid}</span>
                                                                </div>
                                                                <div className="flex flex-col items-end gap-2">
                                                                    <span className="text-xs font-mono text-neutral-500">{med.dateDiagnosed || 'Date Not Specified'}</span>
                                                                    <button
                                                                        onClick={() => { setSelectedMedicalUuid(med.uuid); setMedicalQuickViewOpen(true); }}
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

                                        {/* Settlement / Citizen History */}
                                        {selected.settlementHistories && selected.settlementHistories.length > 0 && (
                                            <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-4">
                                                <SectionHeader icon={<RotateCcw className="size-4 text-orange-500" />} title="Settlement / Citizen History" />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {selected.settlementHistories.map((hist) => (
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
                                                                    }`}>{hist.status.toUpperCase()}</span>
                                                                    <span className="text-[9px] font-mono text-neutral-400 font-bold">{hist.dateCreated || 'NO DATE'}</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 italic p-2 bg-white/40 dark:bg-black/20 rounded border border-orange-50 px-3">{hist.description}</p>
                                                            <div className="flex gap-2 pt-1 mt-auto">
                                                                <button
                                                                    onClick={() => { setSelectedHistoryUuid(hist.uuid); setHistoryQuickViewOpen(true); }}
                                                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-neutral-900 dark:bg-neutral-800 text-white text-[9px] font-bold uppercase rounded-lg shadow-sm hover:bg-neutral-800 dark:hover:bg-neutral-700 transition-all active:scale-95 border border-neutral-700"
                                                                >
                                                                    <FileText className="size-3" /> Record Details
                                                                </button>
                                                                {hist.settlement_uuid && (
                                                                    <button
                                                                        onClick={() => { setSelectedSettlementUuid(hist.settlement_uuid!); setSettlementQuickViewOpen(true); }}
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

                                        {/* Owned Businesses */}
                                        {selected.ownedBusinesses && selected.ownedBusinesses.length > 0 && (
                                            <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-4">
                                                <SectionHeader icon={<Store className="size-4 text-indigo-500" />} title="Owned Businesses" />
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {selected.ownedBusinesses.map((biz) => (
                                                        <div key={biz.id} className="bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100 rounded-xl p-4 space-y-3 flex flex-col">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 leading-tight">{biz.name}</h4>
                                                                    <div className="flex items-center gap-2 mt-1 text-[10px]">
                                                                        <span className="font-mono text-indigo-600 font-bold bg-indigo-100/50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded">{biz.uuid}</span>
                                                                    </div>
                                                                </div>
                                                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${biz.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'}`}>{biz.status}</span>
                                                            </div>
                                                            <p className="text-xs text-neutral-500 line-clamp-1">{biz.type}</p>
                                                            <button
                                                                onClick={() => { setSelectedBusinessUuid(biz.uuid); setBusinessQuickViewOpen(true); }}
                                                                className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold uppercase rounded-lg shadow-sm hover:bg-indigo-700 transition-all active:scale-95"
                                                            >
                                                                <Store className="size-3" /> Quick View Business
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Owned Infrastructures */}
                                        {selected.ownedInfrastructures && selected.ownedInfrastructures.length > 0 && (
                                            <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-4">
                                                <SectionHeader icon={<Building className="size-4 text-sky-500" />} title="Owned Infrastructures" />
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {selected.ownedInfrastructures.map((infra) => (
                                                        <div key={infra.id} className="bg-sky-50/30 dark:bg-sky-900/10 border border-sky-100 rounded-xl p-4 space-y-3 flex flex-col">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 leading-tight">{infra.name}</h4>
                                                                    <div className="flex items-center gap-2 mt-1 text-[10px]">
                                                                        <span className="font-mono text-sky-600 font-bold bg-sky-100/50 dark:bg-sky-900/30 px-1.5 py-0.5 rounded">{infra.infraId}</span>
                                                                    </div>
                                                                </div>
                                                                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600">{infra.type}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => { setSelectedInfrastructureId(infra.id); setInfrastructureQuickViewOpen(true); }}
                                                                className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-sky-600 text-white text-[10px] font-bold uppercase rounded-lg shadow-sm hover:bg-sky-700 transition-all active:scale-95"
                                                            >
                                                                <Building className="size-3" /> Quick View Infrastructure
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Transaction Logs */}
                                        {selected.transactionLogs && selected.transactionLogs.length > 0 && (
                                            <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-4">
                                                <SectionHeader icon={<FileText className="size-4 text-violet-500" />} title="Transaction Records" />
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {selected.transactionLogs.map((trx) => (
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
                                                                }`}>{trx.status}</span>
                                                            </div>
                                                            <p className="text-xs text-neutral-500 line-clamp-1">{trx.dateRequested}</p>
                                                            <button
                                                                onClick={() => { setSelectedTransactionId(trx.id); setServicesQuickViewOpen(true); }}
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

                                {/* Audit Footer */}
                                <div className="p-4 border-t border-sidebar-border/60 bg-neutral-50 dark:bg-neutral-900/50 flex flex-col md:flex-row justify-between items-start md:items-center text-[10px] text-neutral-400 font-mono gap-4">
                                    <div className="space-y-1">
                                        <div className="flex gap-2"><span className="font-bold w-28">DATE ENCODED:</span><span>{selected.dateEncoded}</span></div>
                                        <div className="flex gap-2"><span className="font-bold w-28">ENCODED BY:</span><span>{selected.encodedBy}</span></div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <div className="flex gap-2 justify-end"><span className="font-bold">DATE ARCHIVED:</span><span>{selected.dateUpdated}</span></div>
                                        <div className="flex gap-2 justify-end"><span className="font-bold">ARCHIVED BY:</span><span>{selected.updatedBy}</span></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-sidebar-border rounded-2xl bg-neutral-50/50 text-neutral-400">
                                <UserX className="size-12 mb-2 opacity-20" />
                                <p>Select an archived citizen to view full profile</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

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
            <span className={`text-sm truncate font-medium ${highlight ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-800 dark:text-neutral-200'}`}>{value}</span>
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
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${colors[color]}`}>{label}</span>;
}
