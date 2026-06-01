import {
    X, CheckCircle, ClipboardList, User,
    Search, UserCheck, UserX, Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

interface CitizenResult { id: number; uuid: string; first_name: string; middle_name: string; last_name: string; suffix: string; }

interface ServicesEditProps { isOpen: boolean; onClose: () => void; transaction: any; }

export default function ServicesEdit({ isOpen, onClose, transaction }: ServicesEditProps) {
    // Requestor Fields
    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');
    const [mname, setMname] = useState('');
    const [suffix, setSuffix] = useState('');
    const [ctzId, setCtzId] = useState<number | null>(null);
    const [ctzUuid, setCtzUuid] = useState('');
    const [isLocked, setIsLocked] = useState(false);

    // Citizen Search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<CitizenResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Transaction Fields
    const [type, setType] = useState('');
    const [status, setStatus] = useState('Pending');
    const [dateRequested, setDateRequested] = useState('');
    const [purpose, setPurpose] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen && transaction) {
            setFname(transaction.firstName || '');
            setLname(transaction.lastName || '');
            setMname(transaction.middleName || '');
            setSuffix(transaction.suffix || '');
            setCtzId(transaction.ctzId || null);
            setCtzUuid(transaction.ctzUuid || '');
            setIsLocked(!!transaction.ctzId);
            
            setType(transaction.type || '');
            setStatus(transaction.status || 'Pending');
            setDateRequested(transaction.dateRequestedRaw || '');
            setPurpose(transaction.purpose || '');
            
            setErrors({});
            setSearchQuery('');
            setSearchResults([]);
            setShowResults(false);
        }
    }, [isOpen, transaction]);

    if (!isOpen || !transaction) return null;

    const searchCitizens = async (query: string) => {
        if (!query || query.length < 2) { setSearchResults([]); setIsSearching(false); return; }
        setIsSearching(true);
        try {
            const res = await fetch(`/api/citizen-search?q=${encodeURIComponent(query)}`);
            setSearchResults(await res.json());
            setIsSearching(false);
        } catch { setSearchResults([]); setIsSearching(false); }
    };

    const handleSearchChange = (q: string) => {
        setSearchQuery(q); setShowResults(true);
        setTimeout(() => searchCitizens(q), 350);
    };

    const handleSelectCitizen = (c: CitizenResult) => {
        setFname(c.first_name); setLname(c.last_name); setMname(c.middle_name ?? ''); setSuffix(c.suffix ?? '');
        setCtzId(c.id); setCtzUuid(c.uuid); setIsLocked(true);
        setSearchQuery(''); setShowResults(false); setSearchResults([]);
    };

    const handleClearCitizen = () => {
        setFname(''); setLname(''); setMname(''); setSuffix('');
        setCtzId(null); setCtzUuid(''); setIsLocked(false); setSearchQuery('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const errs: Record<string, string> = {};
        if (!fname.trim()) errs.first_name = 'First name is required.';
        if (!lname.trim()) errs.last_name = 'Last name is required.';
        if (!dateRequested) errs.date_requested = 'Date requested is required.';
        if (!type.trim()) errs.type = 'Transaction type is required.';
        if (!status) errs.status = 'Status is required.';
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setIsSubmitting(true);

        const data = {
            first_name: fname.trim(),
            last_name: lname.trim(),
            middle_name: mname.trim() || null,
            suffix: suffix.trim() || null,
            date_requested: dateRequested,
            type: type.trim(),
            status: status,
            purpose: purpose.trim() || null,
            ctz_id: ctzId,
        };

        router.put(`/transactions/services/${transaction.id}`, data, {
            onSuccess: () => onClose(),
            onError: (e) => setErrors(e),
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#F8F9FC] dark:bg-[#0f172a] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-white/20">

                {/* Header */}
                <div className="relative bg-violet-600 text-white p-5 flex justify-between items-center overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><ClipboardList className="w-32 h-32" /></div>
                    <div className="z-10">
                        <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
                            <ClipboardList className="size-5 text-violet-200" /> Update Transaction
                        </h2>
                        <p className="text-[10px] text-violet-200 uppercase tracking-widest font-semibold mt-1">{transaction.transactionId}</p>
                    </div>
                    <button onClick={onClose} className="z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"><X className="size-5" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">

                    {/* ── Requestor Details ── */}
                    <section className="space-y-4">
                        <SectionLabel icon={<User className="size-4" />} label="Requestor Information" color="text-violet-600" />
                        <div className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4 relative">
                            
                            {/* Citizen search */}
                            {!isLocked ? (
                                <div className="relative z-20 space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">Search Citizen Record (Optional)</label>
                                    <div className="relative">
                                        <input className="w-full text-xs p-2.5 pl-9 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                                            placeholder="Search by name to auto-fill..."
                                            value={searchQuery}
                                            onChange={e => handleSearchChange(e.target.value)}
                                            onFocus={() => setShowResults(true)} />
                                        <div className="absolute left-3 top-2.5 text-neutral-400">
                                            {isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                                        </div>
                                    </div>
                                    {showResults && searchQuery.length >= 2 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-xl max-h-36 overflow-y-auto z-50">
                                            {searchResults.length > 0 ? searchResults.map(c => (
                                                <button key={c.id} type="button" onClick={() => handleSelectCitizen(c)}
                                                    className="w-full text-left px-4 py-2 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors flex items-center justify-between border-b border-neutral-100 dark:border-neutral-700/50 last:border-0 text-xs">
                                                    <span className="font-bold text-neutral-700 dark:text-neutral-200">{c.last_name}, {c.first_name}</span>
                                                    <span className="text-[10px] text-neutral-400 font-mono">{c.uuid}</span>
                                                </button>
                                            )) : <div className="p-3 text-center text-xs text-neutral-400 italic">No citizens found. Enter manually below.</div>}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-900/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-violet-100 dark:bg-violet-900/40 rounded-full text-violet-600"><UserCheck className="size-4" /></div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-violet-500 tracking-wide">Citizen Linked</p>
                                            <p className="text-xs font-mono text-violet-900 dark:text-violet-100">{ctzUuid}</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={handleClearCitizen} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-black/20 border border-neutral-200 hover:border-red-300 hover:text-red-500 rounded text-[10px] font-bold uppercase text-neutral-500 transition-all">
                                        <UserX className="size-3" /> Change
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <FieldWrap error={errors.first_name}>
                                    <InputGroup label="First Name" placeholder="Given Name" value={fname} onChange={e => setFname(e.target.value)} readOnly={isLocked} className={isLocked ? 'bg-neutral-50/50 cursor-not-allowed' : ''} required />
                                </FieldWrap>
                                <InputGroup label="Middle Name" placeholder="Middle Name" value={mname} onChange={e => setMname(e.target.value)} readOnly={isLocked} className={isLocked ? 'bg-neutral-50/50 cursor-not-allowed' : ''} />
                                <FieldWrap error={errors.last_name}>
                                    <InputGroup label="Last Name" placeholder="Surname" value={lname} onChange={e => setLname(e.target.value)} readOnly={isLocked} className={isLocked ? 'bg-neutral-50/50 cursor-not-allowed' : ''} required />
                                </FieldWrap>
                                <SelectGroup label="Suffix" options={['Jr.', 'Sr.', 'I', 'II', 'IV', 'V']} value={suffix} onChange={e => setSuffix(e.target.value)} disabled={isLocked} />
                            </div>
                        </div>
                    </section>

                    {/* ── Transaction Details ── */}
                    <section className="space-y-4">
                        <SectionLabel icon={<ClipboardList className="size-4" />} label="Transaction Details" color="text-violet-600" />
                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FieldWrap error={errors.type}>
                                    <SelectGroup label="Transaction Type" options={['Barangay Clearance', 'Business Permit', 'Complaint', 'Cedula', 'Indigency', 'Residency']} value={type} onChange={e => setType(e.target.value)} required />
                                </FieldWrap>
                                <FieldWrap error={errors.date_requested}>
                                    <InputGroup type="date" label="Date Requested" value={dateRequested} onChange={e => setDateRequested(e.target.value)} required />
                                </FieldWrap>
                                <FieldWrap error={errors.status}>
                                    <SelectGroup label="Status" options={['Pending', 'Approved', 'Declined']} value={status} onChange={e => setStatus(e.target.value)} required />
                                </FieldWrap>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">Purpose / Description</label>
                                <textarea className="w-full text-xs p-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all resize-none h-24" placeholder="Enter reason or purpose for this transaction..." value={purpose} onChange={e => setPurpose(e.target.value)} />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-5 bg-white dark:bg-[#0f172a] border-t border-neutral-200 dark:border-neutral-800 flex justify-end shrink-0">
                    <button onClick={handleSubmit} disabled={isSubmitting}
                        className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
                        {isSubmitting ? 'Saving...' : 'Update Records'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Helpers ──

function SectionLabel({ icon, label, color = "text-neutral-700" }: { icon: React.ReactNode; label: string; color?: string }) {
    return (
        <div className={`flex items-center gap-2 pb-2 border-b-2 border-neutral-100 dark:border-neutral-800 ${color}`}>
            <div className="p-1.5 bg-white dark:bg-white/5 rounded shadow-sm border border-neutral-100 dark:border-neutral-700">{icon}</div>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${color} dark:text-neutral-200`}>{label}</h3>
        </div>
    );
}

function FieldWrap({ children, error }: { children: React.ReactNode; error?: string }) {
    return <div className="space-y-0.5">{children}{error && <p className="text-red-500 text-[10px] mt-1">{error}</p>}</div>;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string; }
function InputGroup({ label, required, className, ...props }: InputProps) {
    return (
        <div className="space-y-1.5 w-full">
            {label && <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">{label} {required && <span className="text-red-500">*</span>}</label>}
            <input className={`w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all ${className ?? ''}`} {...props} />
        </div>
    );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { label?: string; options: string[]; required?: boolean; }
function SelectGroup({ label, options, required, ...props }: SelectProps) {
    return (
        <div className="space-y-1.5 w-full">
            <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">{label} {required && <span className="text-red-500">*</span>}</label>
            <div className="relative">
                <select className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none appearance-none transition-all cursor-pointer" {...props}>
                    <option value="">Select {label}</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-neutral-400"><svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg></div>
            </div>
        </div>
    );
}
