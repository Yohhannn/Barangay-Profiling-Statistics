import { X, CheckCircle, Store, Users, Search, UserCheck, UserX, Building2, Loader2, Plus, Trash2, Upload, Image, Pencil } from 'lucide-react';
import { useState, useRef } from 'react';
import { router } from '@inertiajs/react';

interface Sitio { sitio_id: number; sitio_name: string; }
interface CitizenResult { id: number; uuid: string; first_name: string; middle_name: string; last_name: string; }
interface ExistingOwner { id: number; fname: string; lname: string; mname: string; ctzId: number | null; ctzUuid: string | null; }

interface BusinessData {
    id: number; businessId: string; businessName: string;
    businessType: string; status: string; address: string;
    sitioId: number; description: string; isDti: boolean;
    dtiPhoto: string | null; owners: ExistingOwner[];
}

interface OwnerEntry {
    boId: number | null; fname: string; lname: string; mname: string;
    ctz_id: number | null; ctzUuid: string; isLocked: boolean;
    searchQuery: string; searchResults: CitizenResult[]; isSearching: boolean; showResults: boolean;
}

interface Props { isOpen: boolean; onClose: () => void; sitios: Sitio[]; business: BusinessData | null; }

const makeOwnerEntry = (o?: ExistingOwner): OwnerEntry => ({
    boId: o?.id ?? null,
    fname: o?.fname ?? '', lname: o?.lname ?? '', mname: o?.mname ?? '',
    ctz_id: o?.ctzId ?? null, ctzUuid: o?.ctzUuid ?? '',
    isLocked: !!(o?.ctzId), searchQuery: '', searchResults: [], isSearching: false, showResults: false,
});

export default function BusinessEdit({ isOpen, onClose, sitios, business }: Props) {
    const [businessName, setBusinessName] = useState(business?.businessName ?? '');
    const [status, setStatus] = useState(business?.status ?? '');
    const [address, setAddress] = useState(business?.address ?? '');
    const [sitioId, setSitioId] = useState(String(business?.sitioId ?? ''));
    const [type, setType] = useState(business?.businessType ?? '');
    const [description, setDescription] = useState(business?.description ?? '');
    const [isDti, setIsDti] = useState(business?.isDti ?? false);
    const [dtiPhoto, setDtiPhoto] = useState<File | null>(null);
    const [dtiPreview, setDtiPreview] = useState<string | null>(business?.dtiPhoto ?? null);
    const [removeDti, setRemoveDti] = useState(false);
    const dtiInputRef = useRef<HTMLInputElement>(null);
    const [owners, setOwners] = useState<OwnerEntry[]>(
        business?.owners?.length ? business.owners.map(o => makeOwnerEntry(o)) : [makeOwnerEntry()]
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    if (!isOpen || !business) return null;

    const handleDtiToggle = (v: boolean) => { setIsDti(v); if (!v) { setDtiPhoto(null); setDtiPreview(null); setRemoveDti(true); } else { setRemoveDti(false); } };
    const handleDtiFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] ?? null; setDtiPhoto(f); setRemoveDti(false);
        if (f) { const r = new FileReader(); r.onload = ev => setDtiPreview(ev.target?.result as string); r.readAsDataURL(f); }
    };

    const updateOwner = (idx: number, p: Partial<OwnerEntry>) => setOwners(prev => prev.map((o, i) => i === idx ? { ...o, ...p } : o));
    const addOwner = () => setOwners(prev => [...prev, makeOwnerEntry()]);
    const removeOwner = (idx: number) => setOwners(prev => prev.filter((_, i) => i !== idx));

    const searchCitizens = async (q: string, idx: number) => {
        if (!q || q.length < 2) { updateOwner(idx, { searchResults: [], isSearching: false }); return; }
        updateOwner(idx, { isSearching: true });
        try { const res = await fetch(`/api/citizen-search?q=${encodeURIComponent(q)}`); updateOwner(idx, { searchResults: await res.json(), isSearching: false }); }
        catch { updateOwner(idx, { searchResults: [], isSearching: false }); }
    };
    const handleSearch = (idx: number, q: string) => { updateOwner(idx, { searchQuery: q, showResults: true }); setTimeout(() => searchCitizens(q, idx), 350); };
    const handleSelect = (idx: number, c: CitizenResult) => updateOwner(idx, { fname: c.first_name, lname: c.last_name, mname: c.middle_name ?? '', ctz_id: c.id, ctzUuid: c.uuid, isLocked: true, searchQuery: '', showResults: false, searchResults: [] });
    const handleClear = (idx: number) => updateOwner(idx, { fname: '', lname: '', mname: '', ctz_id: null, ctzUuid: '', isLocked: false, searchQuery: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const errs: Record<string, string> = {};
        if (!businessName.trim()) errs.name = 'Business name is required.';
        if (!status) errs.status = 'Status is required.';
        if (!address.trim()) errs.address = 'Address is required.';
        if (!sitioId) errs.sitio_id = 'Sitio is required.';
        if (!type) errs.type = 'Business type is required.';
        owners.forEach((o, i) => {
            if (!o.fname.trim()) errs[`owners.${i}.fname`] = 'First name required.';
            if (!o.lname.trim()) errs[`owners.${i}.lname`] = 'Last name required.';
        });
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setIsSubmitting(true);
        const fd = new FormData();
        fd.append('_method', 'PUT');
        fd.append('name', businessName.trim());
        fd.append('status', status);
        fd.append('address', address.trim());
        fd.append('sitio_id', sitioId);
        fd.append('type', type);
        fd.append('description', description || '');
        fd.append('is_dti', isDti ? '1' : '0');
        if (isDti && dtiPhoto) fd.append('dti_photo', dtiPhoto);
        if (removeDti) fd.append('remove_dti_photo', '1');
        owners.forEach((o, i) => {
            fd.append(`owners[${i}][fname]`, o.fname.trim());
            fd.append(`owners[${i}][lname]`, o.lname.trim());
            fd.append(`owners[${i}][mname]`, o.mname.trim() || '');
            if (o.ctz_id !== null) fd.append(`owners[${i}][ctz_id]`, String(o.ctz_id));
        });

        router.post(`/institutions/business/${business.id}`, fd, {
            forceFormData: true,
            onSuccess: () => { setErrors({}); onClose(); },
            onError: (e) => setErrors(e),
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#F8F9FC] dark:bg-[#0f172a] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-white/20">

                {/* Header */}
                <div className="relative bg-indigo-700 text-white p-5 flex justify-between items-center overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><Store className="w-32 h-32" /></div>
                    <div className="z-10">
                        <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
                            <Pencil className="size-5 text-indigo-200" /> Edit Business
                        </h2>
                        <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-semibold mt-1">
                            {business.businessId} — Modifying Business Record
                        </p>
                    </div>
                    <button onClick={onClose} className="z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"><X className="size-5" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">

                    {/* Business Info */}
                    <section className="space-y-4">
                        <SectionLabel icon={<Store className="size-4" />} label="Business Information" color="text-indigo-700" />
                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FW error={errors.name}><InputGroup label="Business Name" placeholder="Business Name" value={businessName} onChange={e => setBusinessName(e.target.value)} required /></FW>
                                <FW error={errors.status}><SelectGroup label="Status" options={['Active', 'Inactive', 'Closed', 'Suspended']} value={status} onChange={e => setStatus(e.target.value)} required /></FW>
                            </div>
                            <FW error={errors.address}><InputGroup label="Address" placeholder="Business Address" value={address} onChange={e => setAddress(e.target.value)} required /></FW>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FW error={errors.sitio_id}><SitioSelect sitios={sitios} value={sitioId} onChange={setSitioId} /></FW>
                                <FW error={errors.type}><SelectGroup label="Business Type" options={['Cooperative', 'Sole Proprietorship', 'Partnership', 'Corporation', 'Franchise', 'Others']} value={type} onChange={e => setType(e.target.value)} required /></FW>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">Description</label>
                                <textarea className="w-full text-xs p-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none h-24" placeholder="Business Description" value={description} onChange={e => setDescription(e.target.value)} />
                            </div>

                            {/* DTI Toggle */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${isDti ? 'bg-indigo-600' : 'bg-neutral-300 dark:bg-neutral-600'}`} onClick={() => handleDtiToggle(!isDti)}>
                                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${isDti ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </div>
                                    <span className={`text-xs font-semibold transition-colors ${isDti ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-500'}`}>DTI Registered</span>
                                </label>

                                {isDti && (
                                    <div className="animate-in slide-in-from-top-2 duration-200 space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-indigo-600 tracking-wide flex items-center gap-1.5"><Image className="size-3" /> DTI Certificate Photo</label>
                                        <input ref={dtiInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleDtiFile} />

                                        {!dtiPreview ? (
                                            <button type="button" onClick={() => dtiInputRef.current?.click()} className="w-full flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-xl bg-indigo-50/50 hover:bg-indigo-50 dark:bg-indigo-900/10 transition-colors group">
                                                <Upload className="size-6 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                                                <span className="text-xs text-indigo-500 font-medium">Click to upload DTI certificate image</span>
                                                <span className="text-[10px] text-neutral-400">JPG, PNG, WEBP — max 5MB</span>
                                            </button>
                                        ) : (
                                            <div className="relative rounded-xl overflow-hidden border border-indigo-200 dark:border-indigo-800">
                                                <img src={dtiPreview} alt="DTI" className="w-full max-h-48 object-contain bg-neutral-50 dark:bg-neutral-900" />
                                                <div className="absolute top-2 right-2 flex gap-2">
                                                    <button type="button" onClick={() => dtiInputRef.current?.click()} className="p-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow transition-colors" title="Replace photo"><Upload className="size-3" /></button>
                                                    <button type="button" onClick={() => { setDtiPhoto(null); setDtiPreview(null); setRemoveDti(true); if (dtiInputRef.current) dtiInputRef.current.value = ''; }} className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow transition-colors" title="Remove photo"><X className="size-3" /></button>
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                                    <p className="text-[10px] text-white font-medium truncate">{dtiPhoto ? dtiPhoto.name : 'Existing photo'}</p>
                                                </div>
                                            </div>
                                        )}
                                        {errors.dti_photo && <p className="text-red-500 text-[10px]">{errors.dti_photo}</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Owners */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <SectionLabel icon={<Users className="size-4" />} label={`Business Owners (${owners.length})`} color="text-indigo-700" />
                            <button type="button" onClick={addOwner} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm">
                                <Plus className="size-3.5" /> Add Owner
                            </button>
                        </div>
                        <div className="space-y-4">
                            {owners.map((owner, idx) => (
                                <div key={idx} className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">{idx + 1}</div>
                                            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wide">{idx === 0 ? 'Primary Owner' : `Owner ${idx + 1}`}</span>
                                            {owner.boId && <span className="text-[9px] text-neutral-400 font-mono">ID:{owner.boId}</span>}
                                        </div>
                                        {owners.length > 1 && <button type="button" onClick={() => removeOwner(idx)} className="text-neutral-300 hover:text-red-500 transition-colors p-1"><Trash2 className="size-4" /></button>}
                                    </div>

                                    {!owner.isLocked ? (
                                        <div className="relative z-20 space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">Search Citizen Record (Optional)</label>
                                            <div className="relative">
                                                <input className="w-full text-xs p-2.5 pl-9 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="Search by name to auto-fill..." value={owner.searchQuery} onChange={e => handleSearch(idx, e.target.value)} onFocus={() => updateOwner(idx, { showResults: true })} />
                                                <div className="absolute left-3 top-2.5 text-neutral-400">{owner.isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}</div>
                                            </div>
                                            {owner.showResults && owner.searchQuery.length >= 2 && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-xl max-h-36 overflow-y-auto z-50">
                                                    {owner.searchResults.length > 0 ? owner.searchResults.map(c => (
                                                        <button key={c.id} type="button" onClick={() => handleSelect(idx, c)} className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center justify-between border-b border-neutral-100 dark:border-neutral-700/50 last:border-0 text-xs">
                                                            <span className="font-bold text-neutral-700 dark:text-neutral-200">{c.last_name}, {c.first_name}</span>
                                                            <span className="text-[10px] text-neutral-400 font-mono">{c.uuid}</span>
                                                        </button>
                                                    )) : <div className="p-3 text-center text-xs text-neutral-400 italic">No citizens found. Enter manually below.</div>}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-full text-indigo-600"><UserCheck className="size-4" /></div>
                                                <div><p className="text-[10px] font-bold uppercase text-indigo-500 tracking-wide">Citizen Linked</p><p className="text-xs font-mono text-indigo-900 dark:text-indigo-100">{owner.ctzUuid}</p></div>
                                            </div>
                                            <button type="button" onClick={() => handleClear(idx)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-black/20 border border-neutral-200 hover:border-red-300 hover:text-red-500 rounded text-[10px] font-bold uppercase text-neutral-500 transition-all">
                                                <UserX className="size-3" /> Change
                                            </button>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FW error={errors[`owners.${idx}.fname`]}><InputGroup label="First Name" placeholder="Given Name" value={owner.fname} onChange={e => updateOwner(idx, { fname: e.target.value })} readOnly={owner.isLocked} className={owner.isLocked ? 'bg-neutral-50/50 cursor-not-allowed' : ''} required /></FW>
                                        <InputGroup label="Middle Name" placeholder="Middle Name" value={owner.mname} onChange={e => updateOwner(idx, { mname: e.target.value })} readOnly={owner.isLocked} className={owner.isLocked ? 'bg-neutral-50/50 cursor-not-allowed' : ''} />
                                        <FW error={errors[`owners.${idx}.lname`]}><InputGroup label="Last Name" placeholder="Surname" value={owner.lname} onChange={e => updateOwner(idx, { lname: e.target.value })} readOnly={owner.isLocked} className={owner.isLocked ? 'bg-neutral-50/50 cursor-not-allowed' : ''} required /></FW>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-5 bg-white dark:bg-[#0f172a] border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center shrink-0">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 border border-neutral-200 dark:border-neutral-700 rounded-lg transition-all">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function SectionLabel({ icon, label, color = 'text-neutral-700' }: { icon: React.ReactNode; label: string; color?: string }) {
    return (
        <div className={`flex items-center gap-2 pb-2 border-b-2 border-neutral-100 dark:border-neutral-800`}>
            <div className="p-1.5 bg-white dark:bg-white/5 rounded shadow-sm border border-neutral-100 dark:border-neutral-700">{icon}</div>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${color} dark:text-neutral-200`}>{label}</h3>
        </div>
    );
}
function FW({ children, error }: { children: React.ReactNode; error?: string }) {
    return <div className="space-y-0.5">{children}{error && <p className="text-red-500 text-[10px] mt-1">{error}</p>}</div>;
}
function SitioSelect({ sitios, value, onChange }: { sitios: Sitio[]; value: string; onChange: (v: string) => void }) {
    return (
        <div className="space-y-1.5 w-full">
            <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">Sitio <span className="text-red-500">*</span></label>
            <div className="relative">
                <select className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none cursor-pointer transition-all" value={value} onChange={e => onChange(e.target.value)}>
                    <option value="">Select Sitio</option>
                    {sitios.map(s => <option key={s.sitio_id} value={s.sitio_id}>{s.sitio_name}</option>)}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-neutral-400"><svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg></div>
            </div>
        </div>
    );
}
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string; }
function InputGroup({ label, required, className, ...props }: InputProps) {
    return (
        <div className="space-y-1.5 w-full">
            {label && <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">{label} {required && <span className="text-red-500">*</span>}</label>}
            <input className={`w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all ${className ?? ''}`} {...props} />
        </div>
    );
}
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { label?: string; options: string[]; required?: boolean; }
function SelectGroup({ label, options, required, ...props }: SelectProps) {
    return (
        <div className="space-y-1.5 w-full">
            <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">{label} {required && <span className="text-red-500">*</span>}</label>
            <div className="relative">
                <select className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none cursor-pointer hover:border-indigo-300 transition-all" {...props}>
                    <option value="">Select {label}</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-neutral-400"><svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg></div>
            </div>
        </div>
    );
}
