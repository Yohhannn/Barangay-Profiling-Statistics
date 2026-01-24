import {
    X, CheckCircle, Store, User,
    MapPin, FileText, Search, UserCheck, UserX, Building2
} from 'lucide-react';
import { useState, useMemo } from 'react';

interface BusinessCreationProps {
    isOpen: boolean;
    onClose: () => void;
}

// Mock Database of Citizens for Owner Search
const mockCitizensData = [
    { id: '2025-001', first: 'Roberto', middle: 'A.', last: 'Gonzales' },
    { id: '2025-002', first: 'Maria', middle: 'B.', last: 'Santos' },
    { id: '2025-005', first: 'Pedro', middle: 'C.', last: 'Magtanggol' },
    { id: '2025-014', first: 'Antonio', middle: 'L.', last: 'Luna' },
    { id: '2025-020', first: 'Juan', middle: 'D.', last: 'Dela Cruz' },
];

export default function BusinessCreation({ isOpen, onClose }: BusinessCreationProps) {
    // --- Business State ---
    const [businessName, setBusinessName] = useState('');
    const [status, setStatus] = useState('');
    const [address, setAddress] = useState('');
    const [sitio, setSitio] = useState('');
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');

    // --- Owner State ---
    const [ownerFirst, setOwnerFirst] = useState('');
    const [ownerMiddle, setOwnerMiddle] = useState(''); // Added middle for completeness
    const [ownerLast, setOwnerLast] = useState('');
    const [ownerId, setOwnerId] = useState('');

    // --- Search State ---
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    // Filter Logic
    const filteredCitizens = useMemo(() => {
        if (!searchQuery) return [];
        const lowerQuery = searchQuery.toLowerCase();
        return mockCitizensData.filter(c =>
            c.first.toLowerCase().includes(lowerQuery) ||
            c.last.toLowerCase().includes(lowerQuery) ||
            c.middle.toLowerCase().includes(lowerQuery)
        );
    }, [searchQuery]);

    if (!isOpen) return null;

    // --- Handlers ---

    const handleSelectOwner = (citizen: typeof mockCitizensData[0]) => {
        setOwnerId(citizen.id);
        setOwnerFirst(citizen.first);
        setOwnerMiddle(citizen.middle);
        setOwnerLast(citizen.last);
        setIsLocked(true);
        setSearchQuery('');
        setShowResults(false);
    };

    const handleCancelOwner = () => {
        setOwnerId('');
        setOwnerFirst('');
        setOwnerMiddle('');
        setOwnerLast('');
        setIsLocked(false);
        setSearchQuery('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Business Registered", {
            businessName,
            owner: { first: ownerFirst, last: ownerLast, id: ownerId }
        });
        onClose();
        // Reset Logic
        handleCancelOwner();
        setBusinessName('');
        setAddress('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#F8F9FC] dark:bg-[#0f172a] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-white/20">

                {/* --- Header (Blue Theme) --- */}
                <div className="relative bg-blue-700 text-white p-5 flex justify-between items-center overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <Store className="w-32 h-32" />
                    </div>

                    <div className="z-10">
                        <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
                            <Building2 className="size-5 text-blue-200" />
                            Register Business Page
                        </h2>
                        <p className="text-[10px] text-blue-200 uppercase tracking-widest font-semibold mt-1">
                            Registering a New Business
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* --- Scrollable Content --- */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-blue-900 space-y-8">

                    {/* SECTION 1: BUSINESS INFORMATION */}
                    <div className="space-y-4">
                        <SectionLabel icon={<Store className="size-4" />} label="Business Information" color="text-blue-700" />

                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputGroup
                                    label="Business Name"
                                    placeholder="Input Business Name"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    required
                                />
                                <SelectGroup
                                    label="Status"
                                    options={['Active', 'Pending Renewal', 'Closed', 'Suspended']}
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    required
                                />
                            </div>

                            <InputGroup
                                label="Address"
                                placeholder="Enter Address of Business Establishment"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SelectGroup
                                    label="Sitio"
                                    options={['Cadulang 1', 'Cadulang 2', 'Ibabao', 'Proper', 'Kawayan']}
                                    value={sitio}
                                    onChange={(e) => setSitio(e.target.value)}
                                    required
                                />
                                <SelectGroup
                                    label="Business Type"
                                    options={['Sari-sari Store', 'Hardware', 'Eatery', 'Service Center', 'Manufacturing', 'Other']}
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                                    Description
                                </label>
                                <textarea
                                    className="w-full text-xs p-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none h-24"
                                    placeholder="Enter Business Description Here..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: BUSINESS OWNER INFORMATION (With Search) */}
                    <div className="space-y-4">
                        <SectionLabel icon={<User className="size-4" />} label="Business Owner Information" color="text-blue-700" />

                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4 relative">

                            {/* SEARCH BAR (Only visible if NOT locked) */}
                            {!isLocked && (
                                <div className="space-y-1.5 relative z-20 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                                        Search Owner (Optional)
                                    </label>
                                    <div className="relative group">
                                        <input
                                            className="w-full text-xs p-2.5 pl-9 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Search by Name to auto-fill..."
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setShowResults(true);
                                            }}
                                            onFocus={() => setShowResults(true)}
                                        />
                                        <div className="absolute left-3 top-2.5 text-neutral-400"><Search className="size-4" /></div>
                                    </div>

                                    {/* RESULTS DROPDOWN */}
                                    {showResults && searchQuery.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-xl max-h-40 overflow-y-auto z-50">
                                            {filteredCitizens.length > 0 ? (
                                                filteredCitizens.map((c) => (
                                                    <button key={c.id} onClick={() => handleSelectOwner(c)} className="w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-between group border-b border-neutral-100 dark:border-neutral-700/50 last:border-0 text-xs">
                                                        <span className="font-bold text-neutral-700 dark:text-neutral-200">{c.last}, {c.first}</span>
                                                        <span className="text-[10px] text-neutral-400 font-mono">CTZ-{c.id}</span>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="p-3 text-center text-xs text-neutral-400 italic">No citizens found. Enter manually below.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Locked Banner */}
                            {isLocked && (
                                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-lg animate-in fade-in zoom-in">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-600 dark:text-blue-300"><UserCheck className="size-4" /></div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-blue-500 dark:text-blue-400 tracking-wide">Owner Selected</p>
                                            <p className="text-xs font-medium text-blue-900 dark:text-blue-100 font-mono">ID: CTZ-{ownerId}</p>
                                        </div>
                                    </div>
                                    <button onClick={handleCancelOwner} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-black/20 border border-neutral-200 dark:border-neutral-700 hover:border-red-300 hover:text-red-500 rounded text-[10px] font-bold uppercase text-neutral-500 transition-all"><UserX className="size-3" /> Change</button>
                                </div>
                            )}

                            {/* Owner Name Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InputGroup
                                    label="First Name"
                                    placeholder="First Name / Given"
                                    value={ownerFirst}
                                    onChange={e => setOwnerFirst(e.target.value)}
                                    readOnly={isLocked}
                                    className={isLocked ? 'bg-neutral-50/50 cursor-not-allowed' : ''}
                                    required
                                />
                                <InputGroup
                                    label="Middle Name"
                                    placeholder="Middle Name"
                                    value={ownerMiddle}
                                    onChange={e => setOwnerMiddle(e.target.value)}
                                    readOnly={isLocked}
                                    className={isLocked ? 'bg-neutral-50/50 cursor-not-allowed' : ''}
                                />
                                <InputGroup
                                    label="Last Name"
                                    placeholder="Last Name / Surname"
                                    value={ownerLast}
                                    onChange={e => setOwnerLast(e.target.value)}
                                    readOnly={isLocked}
                                    className={isLocked ? 'bg-neutral-50/50 cursor-not-allowed' : ''}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                </div>

                {/* --- Footer --- */}
                <div className="p-5 bg-white dark:bg-[#0f172a] border-t border-neutral-200 dark:border-neutral-800 flex justify-end items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0">
                    <button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-green-600/20 active:scale-95"
                    >
                        <CheckCircle className="size-4" /> Confirm and Save
                    </button>
                </div>

            </div>
        </div>
    );
}

// --- Helper Components ---

function SectionLabel({ icon, label, color = "text-neutral-700" }: { icon: React.ReactNode, label: string, color?: string }) {
    return (
        <div className={`flex items-center gap-2 pb-2 border-b-2 border-neutral-100 dark:border-neutral-800 ${color}`}>
            <div className="p-1.5 bg-white dark:bg-white/5 rounded shadow-sm border border-neutral-100 dark:border-neutral-700">
                {icon}
            </div>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${color} dark:text-neutral-200`}>
                {label}
            </h3>
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
                    className={`w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${className}`}
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
                    className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none transition-all cursor-pointer hover:border-blue-300"
                    {...props}
                >
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
