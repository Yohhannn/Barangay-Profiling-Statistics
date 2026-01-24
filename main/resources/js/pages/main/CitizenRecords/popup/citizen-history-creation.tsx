import {
    X, CheckCircle, FileClock, User,
    Activity, Tag, Search, Loader2, UserCheck, UserX
} from 'lucide-react';
import { useState, useMemo } from 'react';

interface CitizenHistoryCreationProps {
    isOpen: boolean;
    onClose: () => void;
}

// Mock Database of Citizens
const mockCitizensData = [
    { id: '2025-001', first: 'Roberto', middle: 'A.', last: 'Gonzales' },
    { id: '2025-002', first: 'Maria', middle: 'B.', last: 'Santos' },
    { id: '2025-005', first: 'Pedro', middle: 'C.', last: 'Magtanggol' },
    { id: '2025-014', first: 'Antonio', middle: 'L.', last: 'Luna' },
    { id: '2025-020', first: 'Juan', middle: 'D.', last: 'Dela Cruz' },
];

export default function CitizenHistoryCreation({ isOpen, onClose }: CitizenHistoryCreationProps) {
    // --- Form State ---
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [citizenId, setCitizenId] = useState(''); // Hidden/Internal ID storage

    // --- Search State ---
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [isLocked, setIsLocked] = useState(false); // Controls if fields are editable

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

    // Handle Selecting a Citizen
    const handleSelectCitizen = (citizen: typeof mockCitizensData[0]) => {
        setCitizenId(citizen.id);
        setFirstName(citizen.first);
        setMiddleName(citizen.middle);
        setLastName(citizen.last);
        setIsLocked(true); // Lock fields

        setSearchQuery(''); // Clear search query visually
        setShowResults(false);
    };

    // Cancel Selection / Unlock
    const handleCancelSelection = () => {
        setCitizenId('');
        setFirstName('');
        setMiddleName('');
        setLastName('');
        setIsLocked(false); // Unlock fields
        setSearchQuery('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("History Record Submitted", {
            citizenId: citizenId ? `CTZ-${citizenId}` : 'Manual Entry',
            firstName,
            middleName,
            lastName
        });
        onClose();
        // Reset
        handleCancelSelection();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#F8F9FC] dark:bg-[#0f172a] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20">

                {/* --- Header --- */}
                <div className="relative bg-purple-700 text-white p-5 flex justify-between items-center overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <FileClock className="w-32 h-32" />
                    </div>

                    <div className="z-10">
                        <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
                            <FileClock className="size-5 text-purple-200" />
                            Record Citizen History
                        </h2>
                        <p className="text-[10px] text-purple-200 uppercase tracking-widest font-semibold mt-1">
                            Record a certain citizen history
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
                <div className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-thin scrollbar-thumb-purple-200 dark:scrollbar-thumb-purple-900 space-y-6">

                    {/* Citizen Information */}
                    <div className="space-y-4">
                        <SectionLabel icon={<User className="size-4" />} label="Citizen Information" color="text-purple-600" />

                        <div className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4 relative">

                            {/* SEARCH BAR (Only visible if NOT locked) */}
                            {!isLocked && (
                                <div className="space-y-1.5 relative z-20 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                                        Search Existing Citizen (Optional)
                                    </label>
                                    <div className="relative group">
                                        <input
                                            className="w-full text-xs p-2.5 pl-9 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                            placeholder="Search by Name..."
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setShowResults(true);
                                            }}
                                            onFocus={() => setShowResults(true)}
                                        />
                                        <div className="absolute left-3 top-2.5 text-neutral-400">
                                            <Search className="size-4" />
                                        </div>
                                    </div>

                                    {/* RESULTS DROPDOWN */}
                                    {showResults && searchQuery.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-xl max-h-48 overflow-y-auto z-50">
                                            {filteredCitizens.length > 0 ? (
                                                filteredCitizens.map((citizen) => (
                                                    <button
                                                        key={citizen.id}
                                                        onClick={() => handleSelectCitizen(citizen)}
                                                        className="w-full text-left px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center justify-between group border-b border-neutral-100 dark:border-neutral-700/50 last:border-0"
                                                    >
                                                        <div>
                                                            <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                                                                {citizen.last}, {citizen.first} {citizen.middle}
                                                            </p>
                                                            <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                                                                ID: CTZ-{citizen.id}
                                                            </p>
                                                        </div>
                                                        <UserCheck className="size-4 text-neutral-300 group-hover:text-purple-500" />
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-xs text-neutral-400 italic">
                                                    No citizens found.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* SELECTED CITIZEN BANNER (Visible ONLY when locked) */}
                            {isLocked && (
                                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/50 rounded-lg animate-in fade-in zoom-in duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full text-purple-600 dark:text-purple-300">
                                            <UserCheck className="size-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-purple-500 dark:text-purple-400 tracking-wide">
                                                Citizen Selected
                                            </p>
                                            <p className="text-xs font-medium text-purple-900 dark:text-purple-100 font-mono">
                                                ID: CTZ-{citizenId}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCancelSelection}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-black/20 border border-neutral-200 dark:border-neutral-700 hover:border-red-300 hover:text-red-500 dark:hover:border-red-800 dark:hover:text-red-400 rounded text-[10px] font-bold uppercase tracking-wider text-neutral-500 transition-all shadow-sm"
                                    >
                                        <UserX className="size-3" /> Change
                                    </button>
                                </div>
                            )}

                            {/* Divider (Only show if not locked to avoid clutter) */}
                            {!isLocked && <div className="border-t border-dashed border-neutral-200 dark:border-neutral-700 my-2"></div>}

                            {/* NAME FIELDS */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InputGroup
                                    label="First Name"
                                    placeholder="First Name"
                                    required
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    readOnly={isLocked}
                                    className={isLocked ? 'bg-neutral-50/80 dark:bg-neutral-900/50 text-neutral-500 cursor-not-allowed border-neutral-200' : ''}
                                />
                                <InputGroup
                                    label="Middle Name"
                                    placeholder="Middle Name"
                                    value={middleName}
                                    onChange={(e) => setMiddleName(e.target.value)}
                                    readOnly={isLocked}
                                    className={isLocked ? 'bg-neutral-50/80 dark:bg-neutral-900/50 text-neutral-500 cursor-not-allowed border-neutral-200' : ''}
                                />
                                <InputGroup
                                    label="Last Name"
                                    placeholder="Last Name"
                                    required
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    readOnly={isLocked}
                                    className={isLocked ? 'bg-neutral-50/80 dark:bg-neutral-900/50 text-neutral-500 cursor-not-allowed border-neutral-200' : ''}
                                />
                            </div>

                            <p className="text-[10px] text-right text-neutral-400 italic">
                                {isLocked
                                    ? "Fields are locked because a registered citizen is selected."
                                    : "Enter names manually if citizen is not in the database."}
                            </p>
                        </div>
                    </div>

                    {/* History Information */}
                    <div className="space-y-4">
                        <SectionLabel icon={<Activity className="size-4" />} label="History Information" color="text-purple-600" />

                        <div className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SelectGroup
                                    label="Select History Type"
                                    options={['Violation', 'Complaint', 'Commendation', 'Other']}
                                    required
                                />
                                <SelectGroup
                                    label="Status"
                                    options={['Resolved', 'Pending', 'Active', 'Dismissed']}
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full text-xs p-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all resize-none h-32"
                                    placeholder="What is it about?"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                </div>

                {/* --- Footer --- */}
                <div className="p-5 bg-white dark:bg-[#0f172a] border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0">
                    <span className="text-[10px] text-neutral-400 italic">Note: Kindly fill up the form</span>

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
                    className={`w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all ${className}`}
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
                    className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none appearance-none transition-all cursor-pointer hover:border-purple-300"
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
