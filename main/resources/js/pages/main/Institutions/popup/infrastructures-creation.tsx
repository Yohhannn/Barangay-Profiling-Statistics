import {
    X, CheckCircle, Building, User,
    Search, UserCheck, UserX, Construction, Loader2
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';

interface Sitio {
    sitio_id: number;
    sitio_name: string;
}

interface CitizenResult {
    id: number;
    uuid: string;
    name: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    age: number | null;
    sex: string;
}

interface InfrastructureCreationProps {
    isOpen: boolean;
    onClose: () => void;
    sitios: Sitio[];
}

export default function InfrastructureCreation({ isOpen, onClose, sitios }: InfrastructureCreationProps) {
    // Infra fields
    const [infraName, setInfraName] = useState('');
    const [address, setAddress] = useState('');
    const [sitioId, setSitioId] = useState('');
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');

    // Owner fields
    const [ownerFirst, setOwnerFirst] = useState('');
    const [ownerMiddle, setOwnerMiddle] = useState('');
    const [ownerLast, setOwnerLast] = useState('');
    const [ownerSuffix, setOwnerSuffix] = useState('');
    const [ctzId, setCtzId] = useState<number | null>(null);
    const [ownerUuid, setOwnerUuid] = useState('');

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<CitizenResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    // Form state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const searchCitizens = useCallback(async (q: string) => {
        if (!q || q.length < 2) { setSearchResults([]); return; }
        setIsSearching(true);
        try {
            const res = await fetch(`/api/citizen-search?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            setSearchResults(data);
        } catch {
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => searchCitizens(searchQuery), 350);
        return () => clearTimeout(t);
    }, [searchQuery, searchCitizens]);

    if (!isOpen) return null;

    const handleSelectOwner = (c: CitizenResult) => {
        setCtzId(c.id);
        setOwnerUuid(c.uuid);
        setOwnerFirst(c.first_name);
        setOwnerMiddle(c.middle_name ?? '');
        setOwnerLast(c.last_name);
        setIsLocked(true);
        setSearchQuery('');
        setShowResults(false);
    };

    const handleCancelOwner = () => {
        setCtzId(null);
        setOwnerUuid('');
        setOwnerFirst('');
        setOwnerMiddle('');
        setOwnerLast('');
        setOwnerSuffix('');
        setIsLocked(false);
        setSearchQuery('');
    };

    const resetForm = () => {
        setInfraName(''); setAddress(''); setSitioId(''); setType(''); setDescription('');
        handleCancelOwner();
        setErrors({});
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};
        if (!infraName.trim()) newErrors.name = 'Infrastructure name is required.';
        if (!sitioId) newErrors.sitio_id = 'Sitio is required.';
        if (!type) newErrors.type = 'Infrastructure type is required.';
        if (!ownerFirst.trim()) newErrors.owner_fname = 'Owner first name is required.';
        if (!ownerLast.trim()) newErrors.owner_lname = 'Owner last name is required.';

        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

        setIsSubmitting(true);
        router.post('/institutions/infrastructure', {
            name: infraName,
            type,
            address_description: address || null,
            sitio_id: sitioId,
            description,
            owner_fname: ownerFirst,
            owner_mname: ownerMiddle || null,
            owner_lname: ownerLast,
            owner_suffix: ownerSuffix || null,
            ctz_id: ctzId,
        }, {
            onSuccess: () => { resetForm(); onClose(); },
            onError: (errs) => setErrors(errs),
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#F8F9FC] dark:bg-[#0f172a] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-white/20">

                {/* Header */}
                <div className="relative bg-sky-600 text-white p-5 flex justify-between items-center overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <Building className="w-32 h-32" />
                    </div>
                    <div className="z-10">
                        <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
                            <Construction className="size-5 text-sky-200" />
                            Register Infrastructure
                        </h2>
                        <p className="text-[10px] text-sky-200 uppercase tracking-widest font-semibold mt-1">
                            Registering a New Infrastructure Record
                        </p>
                    </div>
                    <button onClick={onClose} className="z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white">
                        <X className="size-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">

                    {/* SECTION 1: Infrastructure Information */}
                    <div className="space-y-4">
                        <SectionLabel icon={<Building className="size-4" />} label="Infrastructure Information" color="text-sky-700" />
                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">

                            <div>
                                <InputGroup
                                    label="Infrastructure Name"
                                    placeholder="Input Infrastructure Name"
                                    value={infraName}
                                    onChange={(e) => setInfraName(e.target.value)}
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name}</p>}
                            </div>

                            <InputGroup
                                label="Address / Description"
                                placeholder="Enter Address or Location Description"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="space-y-1.5 w-full">
                                        <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                                            Sitio <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none appearance-none transition-all cursor-pointer"
                                                value={sitioId}
                                                onChange={(e) => setSitioId(e.target.value)}
                                            >
                                                <option value="">Select Sitio</option>
                                                {sitios.map(s => (
                                                    <option key={s.sitio_id} value={s.sitio_id}>{s.sitio_name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-3 pointer-events-none text-neutral-400">
                                                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                                            </div>
                                        </div>
                                    </div>
                                    {errors.sitio_id && <p className="text-red-500 text-[10px] mt-1">{errors.sitio_id}</p>}
                                </div>
                                <div>
                                    <SelectGroup
                                        label="Infrastructure Type"
                                        options={['Residential', 'Commercial Building', 'Government Building', 'Religious', 'Utility', 'School', 'Health Facility', 'Other']}
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        required
                                    />
                                    {errors.type && <p className="text-red-500 text-[10px] mt-1">{errors.type}</p>}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">Description</label>
                                <textarea
                                    className="w-full text-xs p-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all resize-none h-24"
                                    placeholder="Enter Description Here..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Owner Information */}
                    <div className="space-y-4">
                        <SectionLabel icon={<User className="size-4" />} label="Infrastructure Owner Information" color="text-sky-700" />
                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4 relative">

                            {!isLocked && (
                                <div className="space-y-1.5 relative z-20 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                                        Search Citizen Owner (Optional)
                                    </label>
                                    <div className="relative group">
                                        <input
                                            className="w-full text-xs p-2.5 pl-9 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                                            placeholder="Search by Name to auto-fill..."
                                            value={searchQuery}
                                            onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
                                            onFocus={() => setShowResults(true)}
                                        />
                                        <div className="absolute left-3 top-2.5 text-neutral-400">
                                            {isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                                        </div>
                                    </div>

                                    {showResults && searchQuery.length >= 2 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-xl max-h-40 overflow-y-auto z-50">
                                            {searchResults.length > 0 ? (
                                                searchResults.map((c) => (
                                                    <button key={c.id} onClick={() => handleSelectOwner(c)} className="w-full text-left px-4 py-2 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors flex items-center justify-between border-b border-neutral-100 dark:border-neutral-700/50 last:border-0 text-xs">
                                                        <span className="font-bold text-neutral-700 dark:text-neutral-200">{c.last_name}, {c.first_name}</span>
                                                        <span className="text-[10px] text-neutral-400 font-mono">{c.uuid}</span>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="p-3 text-center text-xs text-neutral-400 italic">No citizens found. Enter manually below.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {isLocked && (
                                <div className="flex items-center justify-between p-3 bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-900/50 rounded-lg animate-in fade-in zoom-in">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-sky-100 dark:bg-sky-900/40 rounded-full text-sky-600 dark:text-sky-300"><UserCheck className="size-4" /></div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-sky-500 dark:text-sky-400 tracking-wide">Citizen Linked</p>
                                            <p className="text-xs font-medium text-sky-900 dark:text-sky-100 font-mono">{ownerUuid}</p>
                                        </div>
                                    </div>
                                    <button onClick={handleCancelOwner} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-black/20 border border-neutral-200 dark:border-neutral-700 hover:border-red-300 hover:text-red-500 rounded text-[10px] font-bold uppercase text-neutral-500 transition-all">
                                        <UserX className="size-3" /> Change
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <InputGroup label="First Name" placeholder="First Name / Given" value={ownerFirst} onChange={e => setOwnerFirst(e.target.value)} readOnly={isLocked} className={isLocked ? 'bg-neutral-50/50 cursor-not-allowed' : ''} required />
                                    {errors.owner_fname && <p className="text-red-500 text-[10px] mt-1">{errors.owner_fname}</p>}
                                </div>
                                <InputGroup label="Middle Name" placeholder="Middle Name" value={ownerMiddle} onChange={e => setOwnerMiddle(e.target.value)} readOnly={isLocked} className={isLocked ? 'bg-neutral-50/50 cursor-not-allowed' : ''} />
                                <div>
                                    <InputGroup label="Last Name" placeholder="Last Name / Surname" value={ownerLast} onChange={e => setOwnerLast(e.target.value)} readOnly={isLocked} className={isLocked ? 'bg-neutral-50/50 cursor-not-allowed' : ''} required />
                                    {errors.owner_lname && <p className="text-red-500 text-[10px] mt-1">{errors.owner_lname}</p>}
                                </div>
                            </div>
                            {!isLocked && (
                                <SelectGroup
                                    label="Suffix (Optional)"
                                    options={['Jr.', 'Sr.', 'I', 'II', 'III', 'IV', 'V']}
                                    value={ownerSuffix}
                                    onChange={(e) => setOwnerSuffix(e.target.value)}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 bg-white dark:bg-[#0f172a] border-t border-neutral-200 dark:border-neutral-800 flex justify-end items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-8 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-green-600/20 active:scale-95"
                    >
                        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
                        {isSubmitting ? 'Saving...' : 'Confirm and Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function SectionLabel({ icon, label, color = "text-neutral-700" }: { icon: React.ReactNode, label: string, color?: string }) {
    return (
        <div className={`flex items-center gap-2 pb-2 border-b-2 border-neutral-100 dark:border-neutral-800 ${color}`}>
            <div className="p-1.5 bg-white dark:bg-white/5 rounded shadow-sm border border-neutral-100 dark:border-neutral-700">{icon}</div>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${color} dark:text-neutral-200`}>{label}</h3>
        </div>
    );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React.ReactNode;
}

function InputGroup({ label, icon, required, className, ...props }: InputProps) {
    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative group">
                <input
                    className={`w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all ${className}`}
                    {...props}
                />
                {icon && <div className="absolute right-3 top-2.5">{icon}</div>}
            </div>
        </div>
    );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: string[];
    required?: boolean;
}

function SelectGroup({ label, options, required, ...props }: SelectProps) {
    return (
        <div className="space-y-1.5 w-full">
            <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <select
                    className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none appearance-none transition-all cursor-pointer hover:border-sky-300"
                    {...props}
                >
                    <option value="">Select Option</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-neutral-400">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
            </div>
        </div>
    );
}
