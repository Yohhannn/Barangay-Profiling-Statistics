import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft, Search, Plus, Trash2,
    Home, MapPin, Droplets, Link as LinkIcon,
    UserCheck, FileText, Edit3, X, SlidersHorizontal, Hash, Check
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import HouseholdCreation from './popup/household-creation';
import HouseholdEdit from './popup/household-edit';

// --- Types ---
interface HouseholdMember {
    id: number;
    firstName: string;
    lastName: string;
    relationship: string;
}

interface Household {
    id: number;
    // Identifiers
    householdId: string;
    householdNumber: string;
    sitio: string;

    // Status
    ownershipStatus: string;

    // Interview Details
    interviewedBy: string;
    reviewedBy: string;
    dateOfVisit: string;

    // Facilities
    waterSource: string;
    toiletType: string;

    // Location
    homeAddress: string;
    homeLink: string; // Coordinates or Google Maps Link
    coordinates: string;

    // Members
    members: HouseholdMember[];

    // Audit
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string;
    updatedBy: string;
}

// --- Mock Data --- (Removed)

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Citizen Panel', href: '/citizen-panel' },
    { title: 'Household', href: '/households' },
];

export default function HouseholdProfiles({ households = [], filters = {}, systemAccounts = [] }: { households: Household[], filters: any, systemAccounts?: {id: number, name: string}[] }) {
    // If households array is empty, default selectedHousehold to null
    const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(households.length > 0 ? households[0] : null);

    // Sync selectedHousehold with latest households data (e.g. after Edit or reload)
    useEffect(() => {
        if (selectedHousehold && households.length > 0) {
            const updated = households.find(h => h.id === selectedHousehold.id);
            if (updated && JSON.stringify(updated) !== JSON.stringify(selectedHousehold)) {
                setSelectedHousehold(updated);
            }
        } else if (!selectedHousehold && households.length > 0) {
            setSelectedHousehold(households[0]);
        }
    }, [households]);
    
    // --- Filters State ---
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [filterSitio, setFilterSitio] = useState(filters.sitio || 'All');
    const [filterWater, setFilterWater] = useState(filters.water_type || 'All');
    const [filterToilet, setFilterToilet] = useState(filters.toilet_type || 'All');
    const [filterOwnership, setFilterOwnership] = useState(filters.ownership_status || 'All');
    
    // --- Advanced Audit Filters State ---
    const [dateEncodedStart, setDateEncodedStart] = useState(filters.dateEncodedRange?.split(' to ')[0] || '');
    const [dateEncodedEnd, setDateEncodedEnd] = useState(filters.dateEncodedRange?.split(' to ')[1] || '');
    const [dateUpdatedStart, setDateUpdatedStart] = useState(filters.dateUpdatedRange?.split(' to ')[0] || '');
    const [dateUpdatedEnd, setDateUpdatedEnd] = useState(filters.dateUpdatedRange?.split(' to ')[1] || '');
    const [encodedBy, setEncodedBy] = useState<string[]>(filters.encodedBy || []);
    const [updatedBy, setUpdatedBy] = useState<string[]>(filters.updatedBy || []);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [sitioOptions, setSitioOptions] = useState<string[]>([]);
    
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

    useEffect(() => {
        // Fetch Sitios for the filter dropdown
        fetch('/api/sitio-list')
            .then(res => res.json())
            .then(data => {
                const names = data.map((s: any) => s.sitio_name);
                const uniqueNames = [...new Set(names)] as string[];
                setSitioOptions(uniqueNames.sort());
            })
            .catch(err => console.error("Failed to fetch sitios", err));
    }, []);

    // Server-side searching triggered through inertia's router.get
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            router.get('/citizen-panel/household-profile', {
                search: searchQuery,
                sitio: filterSitio,
                water_type: filterWater,
                toilet_type: filterToilet,
                ownership_status: filterOwnership,
                dateEncodedRange: dateEncodedStart && dateEncodedEnd ? `${dateEncodedStart} to ${dateEncodedEnd}` : '',
                dateUpdatedRange: dateUpdatedStart && dateUpdatedEnd ? `${dateUpdatedStart} to ${dateUpdatedEnd}` : '',
                encodedBy: encodedBy.join(','),
                updatedBy: updatedBy.join(',')
            }, { preserveState: true, replace: true });
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, filterSitio, filterWater, filterToilet, filterOwnership, dateEncodedStart, dateEncodedEnd, dateUpdatedStart, dateUpdatedEnd, encodedBy, updatedBy]);

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        Swal.fire({
            title: 'Archive Household',
            text: 'Are you sure you want to move this household to archives? Please provide a reason.',
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
                    Swal.showValidationMessage('A reason is required to archive a household');
                }
                return reason;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/households/${id}`, {
                    data: { delete_reason: result.value },
                    onSuccess: () => {
                        setSelectedHousehold(null);
                        Swal.fire('Archived!', 'The household has been moved to archives.', 'success');
                    },
                    onError: (errors: any) => {
                        Swal.fire('Error', errors?.error || 'Failed to archive household.', 'error');
                    }
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Household Profile" />

            {/* --- MOUNT THE MODAL --- */}
            <HouseholdCreation isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
            <HouseholdEdit isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} household={selectedHousehold} />

            <div className="flex flex-col h-[calc(100vh-4rem)] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">

                <div className="flex items-center justify-between pb-2 border-b border-sidebar-border/60">
                    <div className="flex items-center gap-4">
                        <Link href="/citizen-panel" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                            <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                                Citizen Panel: <span className="text-orange-600 dark:text-orange-400">Household</span>
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                    <div className="lg:col-span-4 flex flex-col gap-4 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm overflow-hidden">
                        <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/20 border-b border-sidebar-border/60 space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xs font-bold text-white bg-neutral-900 dark:bg-orange-600 py-1 px-3 rounded-md uppercase tracking-wider">
                                        Registered Household
                                    </h2>
                                    {/* --- CONNECTED BUTTON --- */}
                                    <button
                                        onClick={() => setIsCreateOpen(true)}
                                        className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white p-1 rounded-md transition-colors shadow-sm"
                                        title="Register New Household"
                                    >
                                        <Plus className="size-4" />
                                    </button>
                                </div>
                                <span className="text-[10px] text-neutral-400 font-mono">
                                    TOTAL: {households.length}
                                </span>
                            </div>

                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                                    <input
                                        type="text"
                                        placeholder="Search Household ID..."
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`p-2 rounded-lg border border-sidebar-border transition-colors ${showFilters ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white hover:bg-neutral-50 text-neutral-500'}`}
                                >
                                    {showFilters ? <X className="size-4" /> : <SlidersHorizontal className="size-4" />}
                                </button>
                            </div>

                            {showFilters && (
                                <div className="pt-2 border-t border-sidebar-border/50 animate-in slide-in-from-top-2 grid gap-2">
                                    <select className="w-full text-xs p-2 rounded-lg border border-sidebar-border bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-orange-500/20"
                                        value={filterSitio} onChange={(e) => setFilterSitio(e.target.value)}>
                                        <option value="All">All Sitios</option>
                                        {sitioOptions.map(sitio => (<option key={sitio} value={sitio}>{sitio}</option>))}
                                    </select>
                                    <select className="w-full text-xs p-2 rounded-lg border border-sidebar-border bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-orange-500/20"
                                        value={filterOwnership} onChange={(e) => setFilterOwnership(e.target.value)}>
                                        <option value="All">All Ownership</option>
                                        <option value="Owned">Owned</option>
                                        <option value="Rented">Rented</option>
                                        <option value="Leased">Leased</option>
                                        <option value="Informal Settler">Informal Settler</option>
                                    </select>
                                    <select className="w-full text-xs p-2 rounded-lg border border-sidebar-border bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-orange-500/20"
                                        value={filterWater} onChange={(e) => setFilterWater(e.target.value)}>
                                        <option value="All">All Water Sources</option>
                                        <option value="Level 1 - Point Source">Level 1 - Point Source</option>
                                        <option value="Level 2 - Communal Faucet">Level 2 - Communal Faucet</option>
                                        <option value="Level 3 - Individual Connection">Level 3 - Individual Connection</option>
                                    </select>
                                    <select className="w-full text-xs p-2 rounded-lg border border-sidebar-border bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-orange-500/20"
                                        value={filterToilet} onChange={(e) => setFilterToilet(e.target.value)}>
                                        <option value="All">All Toilet Types</option>
                                        <option value="A - Pour/flush type connected to septic tank">A - Pour/flush type connected to septic tank</option>
                                        <option value="A - Pour/flush toilet connected to Sewerage System">A - Pour/flush toilet connected to Sewerage System</option>
                                        <option value="C - Ventilated Pit (VIP) latrine">C - Ventilated Pit (VIP) latrine</option>
                                        <option value="D - Water-sealed toilet">D - Water-sealed toilet</option>
                                        <option value="E - G - Without toilet">E - G - Without toilet</option>
                                        <option value="E - Overhung latrine">E - Overhung latrine</option>
                                        <option value="F - Open pit latrine">F - Open pit latrine</option>
                                    </select>
                                    
                                    {/* Advanced Audit Filters */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-t border-sidebar-border/50 pt-2 mt-2">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Date Encoded</span>
                                            <div className="flex flex-col gap-1">
                                                <input type="date" className="text-[10px] p-1.5 rounded-md border border-sidebar-border w-full bg-white dark:bg-neutral-800" value={dateEncodedStart} onChange={e => setDateEncodedStart(e.target.value)} />
                                                <input type="date" className="text-[10px] p-1.5 rounded-md border border-sidebar-border w-full bg-white dark:bg-neutral-800" value={dateEncodedEnd} onChange={e => setDateEncodedEnd(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Date Updated</span>
                                            <div className="flex flex-col gap-1">
                                                <input type="date" className="text-[10px] p-1.5 rounded-md border border-sidebar-border w-full bg-white dark:bg-neutral-800" value={dateUpdatedStart} onChange={e => setDateUpdatedStart(e.target.value)} />
                                                <input type="date" className="text-[10px] p-1.5 rounded-md border border-sidebar-border w-full bg-white dark:bg-neutral-800" value={dateUpdatedEnd} onChange={e => setDateUpdatedEnd(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 w-full" ref={encodedByRef}>
                                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Encoded By (Multi)</span>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowEncodedByDropdown(!showEncodedByDropdown)}
                                                    className="w-full text-left text-[10px] p-2 rounded-md border border-sidebar-border bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex justify-between items-center"
                                                >
                                                    <span className="truncate">
                                                        {encodedBy.length === 0 ? 'All Users' : `${encodedBy.length} Selected`}
                                                    </span>
                                                    <Search className="size-3 text-neutral-400" />
                                                </button>
                                                
                                                {showEncodedByDropdown && (
                                                    <div className="absolute z-50 mt-1 w-full bg-white dark:bg-neutral-800 border border-sidebar-border rounded-md shadow-lg py-1 max-h-48 flex flex-col">
                                                        <div className="px-2 py-1 sticky top-0 bg-white dark:bg-neutral-800 border-b border-sidebar-border/50">
                                                            <input 
                                                                type="text" 
                                                                className="w-full text-[10px] p-1.5 bg-neutral-50 dark:bg-neutral-900 border border-sidebar-border rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                                                                placeholder="Search users..."
                                                                value={encodedBySearch}
                                                                onChange={(e) => setEncodedBySearch(e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                        <div className="overflow-y-auto flex-1 p-1">
                                                            <div 
                                                                className="flex items-center gap-2 px-2 py-1.5 text-[10px] hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer rounded"
                                                                onClick={() => setEncodedBy([])}
                                                            >
                                                                <div className={`size-3.5 rounded border flex items-center justify-center ${encodedBy.length === 0 ? 'bg-orange-500 border-orange-500' : 'border-neutral-300 dark:border-neutral-600'}`}>
                                                                    {encodedBy.length === 0 && <Check className="size-2.5 text-white" />}
                                                                </div>
                                                                <span>All Users</span>
                                                            </div>
                                                            {systemAccounts?.filter(acc => acc.name.toLowerCase().includes(encodedBySearch.toLowerCase())).map(acc => {
                                                                const isSelected = encodedBy.includes(acc.id.toString());
                                                                return (
                                                                    <div 
                                                                        key={acc.id}
                                                                        className="flex items-center gap-2 px-2 py-1.5 text-[10px] hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer rounded"
                                                                        onClick={() => {
                                                                            const newSelection = isSelected 
                                                                                ? encodedBy.filter((id: string) => id !== acc.id.toString())
                                                                                : [...encodedBy, acc.id.toString()];
                                                                            setEncodedBy(newSelection);
                                                                        }}
                                                                    >
                                                                        <div className={`size-3.5 rounded border flex flex-shrink-0 items-center justify-center ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-neutral-300 dark:border-neutral-600'}`}>
                                                                            {isSelected && <Check className="size-2.5 text-white" />}
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
                                        <div className="flex flex-col gap-1 w-full" ref={updatedByRef}>
                                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Updated By (Multi)</span>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowUpdatedByDropdown(!showUpdatedByDropdown)}
                                                    className="w-full text-left text-[10px] p-2 rounded-md border border-sidebar-border bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex justify-between items-center"
                                                >
                                                    <span className="truncate">
                                                        {updatedBy.length === 0 ? 'All Users' : `${updatedBy.length} Selected`}
                                                    </span>
                                                    <Search className="size-3 text-neutral-400" />
                                                </button>
                                                
                                                {showUpdatedByDropdown && (
                                                    <div className="absolute z-50 mt-1 w-full bg-white dark:bg-neutral-800 border border-sidebar-border rounded-md shadow-lg py-1 max-h-48 flex flex-col">
                                                        <div className="px-2 py-1 sticky top-0 bg-white dark:bg-neutral-800 border-b border-sidebar-border/50">
                                                            <input 
                                                                type="text" 
                                                                className="w-full text-[10px] p-1.5 bg-neutral-50 dark:bg-neutral-900 border border-sidebar-border rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                                                                placeholder="Search users..."
                                                                value={updatedBySearch}
                                                                onChange={(e) => setUpdatedBySearch(e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                        <div className="overflow-y-auto flex-1 p-1">
                                                            <div 
                                                                className="flex items-center gap-2 px-2 py-1.5 text-[10px] hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer rounded"
                                                                onClick={() => setUpdatedBy([])}
                                                            >
                                                                <div className={`size-3.5 rounded border flex items-center justify-center ${updatedBy.length === 0 ? 'bg-orange-500 border-orange-500' : 'border-neutral-300 dark:border-neutral-600'}`}>
                                                                    {updatedBy.length === 0 && <Check className="size-2.5 text-white" />}
                                                                </div>
                                                                <span>All Users</span>
                                                            </div>
                                                            {systemAccounts?.filter(acc => acc.name.toLowerCase().includes(updatedBySearch.toLowerCase())).map(acc => {
                                                                const isSelected = updatedBy.includes(acc.id.toString());
                                                                return (
                                                                    <div 
                                                                        key={acc.id}
                                                                        className="flex items-center gap-2 px-2 py-1.5 text-[10px] hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer rounded"
                                                                        onClick={() => {
                                                                            const newSelection = isSelected 
                                                                                ? updatedBy.filter((id: string) => id !== acc.id.toString())
                                                                                : [...updatedBy, acc.id.toString()];
                                                                            setUpdatedBy(newSelection);
                                                                        }}
                                                                    >
                                                                        <div className={`size-3.5 rounded border flex flex-shrink-0 items-center justify-center ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-neutral-300 dark:border-neutral-600'}`}>
                                                                            {isSelected && <Check className="size-2.5 text-white" />}
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
                            )}
                        </div>

                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-800/50 sticky top-0 z-10 backdrop-blur-sm">
                                <tr>
                                    <th className="px-4 py-3 font-semibold border-b border-sidebar-border w-16">ID</th>
                                    <th className="px-4 py-3 font-semibold border-b border-sidebar-border">Members</th>
                                    <th className="px-4 py-3 font-semibold border-b border-sidebar-border text-right">Sitio</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/50">
                                {households.map((hh: Household) => (
                                    <tr
                                        key={hh.id}
                                        onClick={() => setSelectedHousehold(hh)}
                                        className={`
                                                cursor-pointer transition-all hover:bg-orange-50 dark:hover:bg-orange-900/10
                                                ${selectedHousehold?.id === hh.id ? 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-l-orange-500' : 'border-l-4 border-l-transparent'}
                                            `}
                                    >
                                        <td className="px-4 py-3 font-mono text-xs text-neutral-500">{hh.householdId}</td>
                                        <td className="px-4 py-3 font-bold text-neutral-900 dark:text-neutral-100">{hh.members.length}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-xs text-neutral-600">{hh.sitio}</span>
                                                <button
                                                    onClick={(e) => handleDelete(e, hh.id)}
                                                    className="text-neutral-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    title="Move to Archive"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
                        {selectedHousehold ? (
                            <div className="flex-1 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm flex flex-col overflow-hidden">
                                <div className="p-6 border-b border-sidebar-border/60 bg-neutral-50/50 dark:bg-neutral-900/30">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                                                <Home className="size-8 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            <div>
                                                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                                    {selectedHousehold.householdId}
                                                </h1>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <MapPin className="size-3 text-neutral-400" />
                                                    <span className="text-sm text-neutral-500 font-medium">{selectedHousehold.sitio}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setIsEditOpen(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all hover:shadow-md"
                                        >
                                            <Edit3 className="size-3.5" /> Edit Household
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-neutral-50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-5 space-y-3">
                                            <div className="flex items-center gap-2 pb-2 border-b border-sidebar-border/50 text-orange-600">
                                                <Hash className="size-4" />
                                                <h3 className="text-xs font-bold uppercase tracking-wider">Household Info</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <InfoItem label="Household Number" value={selectedHousehold.householdNumber} highlight />
                                                <InfoItem label="Ownership Status" value={selectedHousehold.ownershipStatus} />
                                            </div>
                                        </div>
                                        <div className="bg-neutral-50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-5 space-y-3">
                                            <div className="flex items-center gap-2 pb-2 border-b border-sidebar-border/50 text-blue-600">
                                                <UserCheck className="size-4" />
                                                <h3 className="text-xs font-bold uppercase tracking-wider">Interview Details</h3>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-xs text-neutral-500">Interviewed By:</span>
                                                    <span className="text-sm font-medium">{selectedHousehold.interviewedBy}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-xs text-neutral-500">Reviewed By:</span>
                                                    <span className="text-sm font-medium">{selectedHousehold.reviewedBy}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-xs text-neutral-500">Date of Visit:</span>
                                                    <span className="text-sm font-medium">{selectedHousehold.dateOfVisit}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-neutral-50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-5 flex flex-col justify-center">
                                            <div className="grid grid-cols-2 text-center divide-x divide-sidebar-border">
                                                <div className="px-2">
                                                    <div className="flex flex-col items-center gap-1 mb-2">
                                                        <Droplets className="size-4 text-cyan-500" />
                                                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Water Source</span>
                                                    </div>
                                                    <span className="text-sm font-medium">{selectedHousehold.waterSource}</span>
                                                </div>
                                                <div className="px-2">
                                                    <div className="flex flex-col items-center gap-1 mb-2">
                                                        <FileText className="size-4 text-purple-500" />
                                                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Toilet Type</span>
                                                    </div>
                                                    <span className="text-sm font-medium">{selectedHousehold.toiletType}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-neutral-50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-5 flex flex-col items-center justify-center text-center overflow-hidden">
                                            <div className="flex items-center gap-2 mb-3 text-neutral-500">
                                                <MapPin className="size-4 text-red-500" />
                                                <span className="text-xs font-bold uppercase">Household Location</span>
                                            </div>
                                            
                                            {selectedHousehold.homeLink && selectedHousehold.homeLink !== 'N/A' ? (
                                                <div className="w-full flex flex-col gap-3">
                                                    {selectedHousehold.homeLink.includes('<iframe') || selectedHousehold.homeLink.includes('/embed') ? (
                                                        <div className="w-full h-32 rounded-lg overflow-hidden border border-sidebar-border bg-neutral-200">
                                                            {/* If they pasted a direct raw embed URL rather than the iframe code */}
                                                            {selectedHousehold.homeLink.startsWith('http') ? (
                                                                <iframe 
                                                                    src={selectedHousehold.homeLink}
                                                                    width="100%" 
                                                                    height="100%" 
                                                                    style={{ border: 0 }} 
                                                                    allowFullScreen 
                                                                    loading="lazy" 
                                                                    referrerPolicy="no-referrer-when-downgrade"
                                                                />
                                                            ) : (
                                                                /* If they pasted the HTML iframe tag */
                                                                <div 
                                                                    dangerouslySetInnerHTML={{ __html: selectedHousehold.homeLink }} 
                                                                    className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full"
                                                                />
                                                            )}
                                                        </div>
                                                    ) : null}

                                                    <a 
                                                        href={selectedHousehold.homeLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center justify-center gap-2 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 px-4 py-2 rounded-lg border border-sidebar-border text-xs font-bold uppercase tracking-wider text-blue-600 transition-colors cursor-pointer w-full"
                                                    >
                                                        <LinkIcon className="size-3.5" />
                                                        Open in Google Maps
                                                    </a>
                                                </div>
                                            ) : (
                                                <div className="bg-white dark:bg-neutral-800 px-4 py-3 rounded border border-sidebar-border font-mono text-xs text-neutral-400 w-full">
                                                    No Location Data Provided
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-neutral-50 dark:bg-neutral-900/20 border border-sidebar-border rounded-xl p-4 flex flex-col md:flex-row gap-4">
                                        <div className="flex-1 flex items-center gap-4">
                                            <span className="text-xs font-bold text-neutral-500 uppercase whitespace-nowrap">Home Address:</span>
                                            <span className="text-sm font-medium truncate">{selectedHousehold.homeAddress}</span>
                                        </div>
                                        <div className="flex-1 flex items-center gap-4 border-t md:border-t-0 md:border-l border-sidebar-border pt-3 md:pt-0 md:pl-4">
                                            <span className="text-xs font-bold text-neutral-500 uppercase whitespace-nowrap">Coordinates:</span>
                                            <span className="text-sm font-mono text-neutral-600 dark:text-neutral-400">{selectedHousehold.coordinates}</span>
                                        </div>
                                    </div>

                                    <div className="border border-sidebar-border rounded-xl overflow-hidden">
                                        <table className="w-full text-sm text-left bg-white dark:bg-sidebar">
                                            <thead className="bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-500 uppercase">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold text-center border-r border-sidebar-border">First Name</th>
                                                <th className="px-4 py-3 font-semibold text-center border-r border-sidebar-border">Last Name</th>
                                                <th className="px-4 py-3 font-semibold text-center">Relationship</th>
                                            </tr>
                                            </thead>
                                            <tbody className="divide-y divide-sidebar-border">
                                            {selectedHousehold.members.map((member) => (
                                                <tr key={member.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                                                    <td className="px-4 py-3 text-center border-r border-sidebar-border">{member.firstName}</td>
                                                    <td className="px-4 py-3 text-center border-r border-sidebar-border">{member.lastName}</td>
                                                    <td className="px-4 py-3 text-center text-neutral-500">{member.relationship}</td>
                                                </tr>
                                            ))}
                                            {selectedHousehold.members.length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-6 text-center text-neutral-400 italic">No members listed</td>
                                                </tr>
                                            )}
                                            </tbody>
                                        </table>
                                    </div>

                                </div>

                                <div className="p-4 border-t border-sidebar-border/60 bg-neutral-50 dark:bg-neutral-900/50 flex flex-col md:flex-row justify-between items-start md:items-center text-[10px] text-neutral-400 font-mono gap-4">
                                    <div className="space-y-1">
                                        <div className="flex gap-2">
                                            <span className="font-bold w-20">DATE ENCODED:</span>
                                            <span>{selectedHousehold.dateEncoded}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="font-bold w-20">ENCODED BY:</span>
                                            <span>{selectedHousehold.encodedBy}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <span className="font-bold">DATE UPDATED:</span>
                                            <span>{selectedHousehold.dateUpdated}</span>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <span className="font-bold">UPDATED BY:</span>
                                            <span>{selectedHousehold.updatedBy}</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-sidebar-border rounded-2xl bg-neutral-50/50 text-neutral-400">
                                <Home className="size-12 mb-2 opacity-20" />
                                <p>Select a household to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

// --- Reusable ---
function InfoItem({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) {
    return (
        <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide mb-0.5">{label}</span>
            <span className={`text-sm truncate font-medium ${highlight ? 'text-orange-600 dark:text-orange-400 font-bold' : 'text-neutral-800 dark:text-neutral-200'}`}>
                {value}
            </span>
        </div>
    );
}
