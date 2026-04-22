import {
    X, CheckCircle, Store, User, Users,
    Search, UserCheck, UserX, Building2, Loader2, Plus, Trash2
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

interface OwnerEntry {
    fname: string;
    lname: string;
    mname: string;
    suffix: string;
    ctz_id: number | null;
    ctzUuid: string;
    isLocked: boolean;
    // search state per-owner
    searchQuery: string;
    searchResults: CitizenResult[];
    isSearching: boolean;
    showResults: boolean;
}

interface BusinessCreationProps {
    isOpen: boolean;
    onClose: () => void;
    sitios: Sitio[];
}

const emptyOwner = (): OwnerEntry => ({
    fname: '', lname: '', mname: '', suffix: '',
    ctz_id: null, ctzUuid: '', isLocked: false,
    searchQuery: '', searchResults: [], isSearching: false, showResults: false,
});

export default function BusinessCreation({ isOpen, onClose, sitios }: BusinessCreationProps) {
    // Business fields
    const [businessName, setBusinessName] = useState('');
    const [status, setStatus] = useState('');
    const [address, setAddress] = useState('');
    const [sitioId, setSitioId] = useState('');
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');
    const [isDti, setIsDti] = useState(false);

    // Owners list — start with one empty entry
    const [owners, setOwners] = useState<OwnerEntry[]>([emptyOwner()]);

    // Form state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const resetForm = () => {
        setBusinessName(''); setStatus(''); setAddress(''); setSitioId('');
        setType(''); setDescription(''); setIsDti(false);
        setOwners([emptyOwner()]);
        setErrors({});
    };

    if (!isOpen) return null;

    // ---- Owner helpers ----

    const updateOwner = (idx: number, patch: Partial<OwnerEntry>) => {
        setOwners(prev => prev.map((o, i) => i === idx ? { ...o, ...patch } : o));
    };

    const addOwner = () => setOwners(prev => [...prev, emptyOwner()]);

    const removeOwner = (idx: number) => {
        setOwners(prev => prev.filter((_, i) => i !== idx));
    };

    const searchCitizens = async (query: string, idx: number) => {
        if (!query || query.length < 2) {
            updateOwner(idx, { searchResults: [], isSearching: false });
            return;
        }
        updateOwner(idx, { isSearching: true });
        try {
            const res = await fetch(`/api/citizen-search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            updateOwner(idx, { searchResults: data, isSearching: false });
        } catch {
            updateOwner(idx, { searchResults: [], isSearching: false });
        }
    };

    const handleOwnerSearchChange = (idx: number, q: string) => {
        updateOwner(idx, { searchQuery: q, showResults: true });
        // debounce-like via setTimeout in effect is complex per-owner; just call directly
        setTimeout(() => searchCitizens(q, idx), 350);
    };

    const handleSelectCitizen = (idx: number, c: CitizenResult) => {
        updateOwner(idx, {
            fname: c.first_name,
            lname: c.last_name,
            mname: c.middle_name ?? '',
            ctz_id: c.id,
            ctzUuid: c.uuid,
            isLocked: true,
            searchQuery: '',
            showResults: false,
            searchResults: [],
        });
    };

    const handleClearCitizen = (idx: number) => {
        updateOwner(idx, {
            fname: '', lname: '', mname: '', ctz_id: null, ctzUuid: '',
            isLocked: false, searchQuery: '',
        });
    };

    // ---- Submit ----

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};
        if (!businessName.trim()) newErrors.name = 'Business name is required.';
        if (!status) newErrors.status = 'Status is required.';
        if (!address.trim()) newErrors.address = 'Address is required.';
        if (!sitioId) newErrors.sitio_id = 'Sitio is required.';
        if (!type) newErrors.type = 'Business type is required.';
        owners.forEach((o, i) => {
            if (!o.fname.trim()) newErrors[`owners.${i}.fname`] = 'First name required.';
            if (!o.lname.trim()) newErrors[`owners.${i}.lname`] = 'Last name required.';
        });

        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

        setIsSubmitting(true);
        router.post('/institutions/business', {
            name: businessName,
            status,
            address,
            sitio_id: sitioId,
            type,
            description,
            is_dti: isDti,
            owners: owners.map(o => ({
                fname: o.fname,
                lname: o.lname,
                mname: o.mname || null,
                suffix: o.suffix || null,
                ctz_id: o.ctz_id,
            })),
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
                <div className="relative bg-blue-700 text-white p-5 flex justify-between items-center overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <Store className="w-32 h-32" />
                    </div>
                    <div className="z-10">
                        <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
                            <Building2 className="size-5 text-blue-200" />
                            Register Business
                        </h2>
                        <p className="text-[10px] text-blue-200 uppercase tracking-widest font-semibold mt-1">
                            Registering a New Business Record
                        </p>
                    </div>
                    <button onClick={onClose} className="z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white">
                        <X className="size-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">

                    {/* ── SECTION 1: Business Information ── */}
                    <div className="space-y-4">
                        <SectionLabel icon={<Store className="size-4" />} label="Business Information" color="text-blue-700" />
                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputGroup label="Business Name" placeholder="Input Business Name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
                                    {errors.name && <ErrMsg msg={errors.name} />}
                                </div>
                                <div>
                                    <SelectGroup label="Status" options={['Active', 'Inactive', 'Closed', 'Suspended']} value={status} onChange={(e) => setStatus(e.target.value)} required />
                                    {errors.status && <ErrMsg msg={errors.status} />}
                                </div>
                            </div>

                            <div>
                                <InputGroup label="Address" placeholder="Enter Address of Business Establishment" value={address} onChange={(e) => setAddress(e.target.value)} required />
                                {errors.address && <ErrMsg msg={errors.address} />}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <SitioSelect sitios={sitios} value={sitioId} onChange={setSitioId} />
                                    {errors.sitio_id && <ErrMsg msg={errors.sitio_id} />}
                                </div>
                                <div>
                                    <SelectGroup label="Business Type" options={['Cooperative', 'Sole Proprietorship', 'Partnership', 'Corporation', 'Franchise', 'Others']} value={type} onChange={(e) => setType(e.target.value)} required />
                                    {errors.type && <ErrMsg msg={errors.type} />}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">Description</label>
                                <textarea
                                    className="w-full text-xs p-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none h-24"
                                    placeholder="Enter Business Description Here..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 accent-blue-600 rounded cursor-pointer" checked={isDti} onChange={(e) => setIsDti(e.target.checked)} />
                                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-blue-600 transition-colors">DTI Registered</span>
                            </label>
                        </div>
                    </div>

                    {/* ── SECTION 2: Business Owners ── */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <SectionLabel icon={<Users className="size-4" />} label={`Business Owners (${owners.length})`} color="text-blue-700" />
                            <button
                                type="button"
                                onClick={addOwner}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm"
                            >
                                <Plus className="size-3.5" /> Add Owner
                            </button>
                        </div>

                        <div className="space-y-4">
                            {owners.map((owner, idx) => (
                                <div key={idx} className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4 relative">

                                    {/* Owner header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                                                {idx + 1}
                                            </div>
                                            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wide">
                                                {idx === 0 ? 'Primary Owner' : `Owner ${idx + 1}`}
                                            </span>
                                        </div>
                                        {owners.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeOwner(idx)}
                                                className="text-neutral-300 hover:text-red-500 transition-colors p-1 rounded"
                                                title="Remove owner"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Citizen Search */}
                                    {!owner.isLocked ? (
                                        <div className="relative z-20 space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                                                Search Citizen Record (Optional)
                                            </label>
                                            <div className="relative">
                                                <input
                                                    className="w-full text-xs p-2.5 pl-9 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                    placeholder="Search by name to auto-fill..."
                                                    value={owner.searchQuery}
                                                    onChange={(e) => handleOwnerSearchChange(idx, e.target.value)}
                                                    onFocus={() => updateOwner(idx, { showResults: true })}
                                                />
                                                <div className="absolute left-3 top-2.5 text-neutral-400">
                                                    {owner.isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                                                </div>
                                            </div>

                                            {owner.showResults && owner.searchQuery.length >= 2 && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-xl max-h-36 overflow-y-auto z-50">
                                                    {owner.searchResults.length > 0 ? (
                                                        owner.searchResults.map((c) => (
                                                            <button
                                                                key={c.id}
                                                                type="button"
                                                                onClick={() => handleSelectCitizen(idx, c)}
                                                                className="w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-between border-b border-neutral-100 dark:border-neutral-700/50 last:border-0 text-xs"
                                                            >
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
                                    ) : (
                                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-600"><UserCheck className="size-4" /></div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase text-blue-500 tracking-wide">Citizen Linked</p>
                                                    <p className="text-xs font-mono text-blue-900 dark:text-blue-100">{owner.ctzUuid}</p>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => handleClearCitizen(idx)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-black/20 border border-neutral-200 hover:border-red-300 hover:text-red-500 rounded text-[10px] font-bold uppercase text-neutral-500 transition-all">
                                                <UserX className="size-3" /> Change
                                            </button>
                                        </div>
                                    )}

                                    {/* Name Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <InputGroup
                                                label="First Name"
                                                placeholder="Given Name"
                                                value={owner.fname}
                                                onChange={e => updateOwner(idx, { fname: e.target.value })}
                                                readOnly={owner.isLocked}
                                                className={owner.isLocked ? 'bg-neutral-50/50 cursor-not-allowed' : ''}
                                                required
                                            />
                                            {errors[`owners.${idx}.fname`] && <ErrMsg msg={errors[`owners.${idx}.fname`]} />}
                                        </div>
                                        <InputGroup
                                            label="Middle Name"
                                            placeholder="Middle Name"
                                            value={owner.mname}
                                            onChange={e => updateOwner(idx, { mname: e.target.value })}
                                            readOnly={owner.isLocked}
                                            className={owner.isLocked ? 'bg-neutral-50/50 cursor-not-allowed' : ''}
                                        />
                                        <div>
                                            <InputGroup
                                                label="Last Name"
                                                placeholder="Surname"
                                                value={owner.lname}
                                                onChange={e => updateOwner(idx, { lname: e.target.value })}
                                                readOnly={owner.isLocked}
                                                className={owner.isLocked ? 'bg-neutral-50/50 cursor-not-allowed' : ''}
                                                required
                                            />
                                            {errors[`owners.${idx}.lname`] && <ErrMsg msg={errors[`owners.${idx}.lname`]} />}
                                        </div>
                                    </div>

                                    {!owner.isLocked && (
                                        <SelectGroup
                                            label="Suffix (Optional)"
                                            options={['Jr.', 'Sr.', 'I', 'II', 'III', 'IV', 'V']}
                                            value={owner.suffix}
                                            onChange={(e) => updateOwner(idx, { suffix: e.target.value })}
                                        />
                                    )}
                                </div>
                            ))}
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

// ── Helper Components ──

function SectionLabel({ icon, label, color = "text-neutral-700" }: { icon: React.ReactNode, label: string, color?: string }) {
    return (
        <div className={`flex items-center gap-2 pb-2 border-b-2 border-neutral-100 dark:border-neutral-800 ${color}`}>
            <div className="p-1.5 bg-white dark:bg-white/5 rounded shadow-sm border border-neutral-100 dark:border-neutral-700">{icon}</div>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${color} dark:text-neutral-200`}>{label}</h3>
        </div>
    );
}

function ErrMsg({ msg }: { msg: string }) {
    return <p className="text-red-500 text-[10px] mt-1">{msg}</p>;
}

function SitioSelect({ sitios, value, onChange }: { sitios: { sitio_id: number; sitio_name: string }[], value: string, onChange: (v: string) => void }) {
    return (
        <div className="space-y-1.5 w-full">
            <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">Sitio <span className="text-red-500">*</span></label>
            <div className="relative">
                <select
                    className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none transition-all cursor-pointer"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                >
                    <option value="">Select Sitio</option>
                    {sitios.map(s => <option key={s.sitio_id} value={s.sitio_id}>{s.sitio_name}</option>)}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-neutral-400">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
            </div>
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
            {label && <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">{label} {required && <span className="text-red-500">*</span>}</label>}
            <div className="relative group">
                <input className={`w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${className}`} {...props} />
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
            <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">{label} {required && <span className="text-red-500">*</span>}</label>
            <div className="relative">
                <select className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none transition-all cursor-pointer hover:border-blue-300" {...props}>
                    <option value="">Select {label}</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-neutral-400">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
            </div>
        </div>
    );
}
