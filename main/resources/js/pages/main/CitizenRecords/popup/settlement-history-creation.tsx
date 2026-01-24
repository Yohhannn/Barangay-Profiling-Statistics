import {
    X, CheckCircle, Handshake, User,
    FileText, Search, Scale, UserCheck, UserX, Link as LinkIcon, FileClock
} from 'lucide-react';
import { useState, useMemo } from 'react';

interface SettlementHistoryCreationProps {
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

// Mock Database of Citizen History Records (for linking)
const mockHistoryRecords = [
    { id: 'HIST-2025-001', type: 'Complaint', description: 'Noise Barrage late at night', involved: 'Roberto Gonzales' },
    { id: 'HIST-2025-002', type: 'Violation', description: 'Illegal Parking blockage', involved: 'Pedro Magtanggol' },
    { id: 'HIST-2025-003', type: 'Dispute', description: 'Boundary dispute with neighbor', involved: 'Maria Santos' },
];

export default function SettlementHistoryCreation({ isOpen, onClose }: SettlementHistoryCreationProps) {
    // --- 1. Complainant State ---
    const [hasRecord, setHasRecord] = useState(false); // Toggle
    const [cmpFirstName, setCmpFirstName] = useState('');
    const [cmpMiddleName, setCmpMiddleName] = useState('');
    const [cmpLastName, setCmpLastName] = useState('');
    const [cmpId, setCmpId] = useState('');

    // Complainant Search State
    const [cmpSearchQuery, setCmpSearchQuery] = useState('');
    const [showCmpResults, setShowCmpResults] = useState(false);
    const [isCmpLocked, setIsCmpLocked] = useState(false);

    // --- 2. Complainee State ---
    const [cmeFirstName, setCmeFirstName] = useState('');
    const [cmeMiddleName, setCmeMiddleName] = useState('');
    const [cmeLastName, setCmeLastName] = useState('');
    const [cmeId, setCmeId] = useState('');

    // Complainee Search State
    const [cmeSearchQuery, setCmeSearchQuery] = useState('');
    const [showCmeResults, setShowCmeResults] = useState(false);
    const [isCmeLocked, setIsCmeLocked] = useState(false);

    // --- 3. Linked History State (NEW) ---
    const [historySearchQuery, setHistorySearchQuery] = useState('');
    const [showHistoryResults, setShowHistoryResults] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState<typeof mockHistoryRecords[0] | null>(null);

    // --- Filter Logic ---
    const filterCitizens = (query: string) => {
        if (!query) return [];
        const lowerQuery = query.toLowerCase();
        return mockCitizensData.filter(c =>
            c.first.toLowerCase().includes(lowerQuery) ||
            c.last.toLowerCase().includes(lowerQuery) ||
            c.middle.toLowerCase().includes(lowerQuery)
        );
    };

    const filterHistory = (query: string) => {
        if (!query) return [];
        const lower = query.toLowerCase();
        return mockHistoryRecords.filter(h =>
            h.id.toLowerCase().includes(lower) ||
            h.description.toLowerCase().includes(lower) ||
            h.involved.toLowerCase().includes(lower)
        );
    };

    const filteredComplainants = useMemo(() => filterCitizens(cmpSearchQuery), [cmpSearchQuery]);
    const filteredComplainees = useMemo(() => filterCitizens(cmeSearchQuery), [cmeSearchQuery]);
    const filteredHistory = useMemo(() => filterHistory(historySearchQuery), [historySearchQuery]);

    if (!isOpen) return null;

    // --- Handlers: Complainant ---
    const handleSelectComplainant = (citizen: typeof mockCitizensData[0]) => {
        setCmpId(citizen.id);
        setCmpFirstName(citizen.first);
        setCmpMiddleName(citizen.middle);
        setCmpLastName(citizen.last);
        setIsCmpLocked(true);
        setCmpSearchQuery('');
        setShowCmpResults(false);
    };

    const handleCancelComplainant = () => {
        setCmpId('');
        setCmpFirstName('');
        setCmpMiddleName('');
        setCmpLastName('');
        setIsCmpLocked(false);
        setCmpSearchQuery('');
    };

    // --- Handlers: Complainee ---
    const handleSelectComplainee = (citizen: typeof mockCitizensData[0]) => {
        setCmeId(citizen.id);
        setCmeFirstName(citizen.first);
        setCmeMiddleName(citizen.middle);
        setCmeLastName(citizen.last);
        setIsCmeLocked(true);
        setCmeSearchQuery('');
        setShowCmeResults(false);
    };

    const handleCancelComplainee = () => {
        setCmeId('');
        setCmeFirstName('');
        setCmeMiddleName('');
        setCmeLastName('');
        setIsCmeLocked(false);
        setCmeSearchQuery('');
    };

    // --- Handlers: History Link ---
    const handleSelectHistory = (record: typeof mockHistoryRecords[0]) => {
        setSelectedHistory(record);
        setHistorySearchQuery('');
        setShowHistoryResults(false);
    };

    const handleUnlinkHistory = () => {
        setSelectedHistory(null);
        setHistorySearchQuery('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Settlement Record Submitted", {
            complainant: { hasRecord, id: cmpId, first: cmpFirstName, last: cmpLastName },
            complainee: { id: cmeId, first: cmeFirstName, last: cmeLastName },
            linkedHistory: selectedHistory ? selectedHistory.id : 'None'
        });
        onClose();
        // Reset Logic would go here
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#F8F9FC] dark:bg-[#0f172a] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-white/20">

                {/* --- Header --- */}
                <div className="relative bg-amber-600 text-white p-5 flex justify-between items-center overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <Handshake className="w-32 h-32" />
                    </div>

                    <div className="z-10">
                        <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
                            <Scale className="size-5 text-amber-200" />
                            Record Settlement History
                        </h2>
                        <p className="text-[10px] text-amber-100 uppercase tracking-widest font-semibold mt-1">
                            Dispute Resolution Entry
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
                <div className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-thin scrollbar-thumb-amber-200 dark:scrollbar-thumb-amber-900 space-y-8">

                    {/* SECTION 1: COMPLAINANT INFORMATION */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <SectionLabel icon={<User className="size-4" />} label="Complainant Information" color="text-amber-700" />

                            {/* Toggle for Record Existence */}
                            <div className="flex items-center gap-3 bg-white dark:bg-black/20 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700">
                                <span className="text-[10px] font-bold uppercase text-neutral-500">Has Barangay Record?</span>
                                <div className="flex gap-2">
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="hasRec"
                                            className="accent-amber-600"
                                            checked={hasRecord}
                                            onChange={() => { setHasRecord(true); handleCancelComplainant(); }}
                                        />
                                        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Yes</span>
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="hasRec"
                                            className="accent-amber-600"
                                            checked={!hasRecord}
                                            onChange={() => { setHasRecord(false); handleCancelComplainant(); }}
                                        />
                                        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">No</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4 relative">
                            {/* COMPLAINANT LOGIC */}
                            {hasRecord ? (
                                <>
                                    {/* Search Bar (Only if Not Locked) */}
                                    {!isCmpLocked && (
                                        <div className="space-y-1.5 relative z-20 animate-in fade-in slide-in-from-top-2">
                                            <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                                                Search Complainant
                                            </label>
                                            <div className="relative group">
                                                <input
                                                    className="w-full text-xs p-2.5 pl-9 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                                                    placeholder="Search by Name..."
                                                    value={cmpSearchQuery}
                                                    onChange={(e) => {
                                                        setCmpSearchQuery(e.target.value);
                                                        setShowCmpResults(true);
                                                    }}
                                                    onFocus={() => setShowCmpResults(true)}
                                                />
                                                <div className="absolute left-3 top-2.5 text-neutral-400"><Search className="size-4" /></div>
                                            </div>
                                            {/* Results */}
                                            {showCmpResults && cmpSearchQuery.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-xl max-h-40 overflow-y-auto z-50">
                                                    {filteredComplainants.map((c) => (
                                                        <button key={c.id} onClick={() => handleSelectComplainant(c)} className="w-full text-left px-4 py-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors flex items-center justify-between group border-b border-neutral-100 dark:border-neutral-700/50 last:border-0 text-xs">
                                                            <span className="font-bold text-neutral-700 dark:text-neutral-200">{c.last}, {c.first}</span>
                                                            <span className="text-[10px] text-neutral-400 font-mono">CTZ-{c.id}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Locked Banner */}
                                    {isCmpLocked && (
                                        <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 rounded-lg animate-in fade-in zoom-in">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-full text-amber-600 dark:text-amber-300"><UserCheck className="size-4" /></div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase text-amber-500 dark:text-amber-400 tracking-wide">Selected</p>
                                                    <p className="text-xs font-medium text-amber-900 dark:text-amber-100 font-mono">ID: CTZ-{cmpId}</p>
                                                </div>
                                            </div>
                                            <button onClick={handleCancelComplainant} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-black/20 border border-neutral-200 dark:border-neutral-700 hover:border-red-300 hover:text-red-500 rounded text-[10px] font-bold uppercase text-neutral-500 transition-all"><UserX className="size-3" /> Change</button>
                                        </div>
                                    )}

                                    {/* ID Field (Read-only) */}
                                    <InputGroup label="Citizen ID" value={cmpId} readOnly isIdField={true} className="bg-neutral-50/50 cursor-not-allowed" />
                                </>
                            ) : null}

                            {/* Name Fields (Conditional ReadOnly) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InputGroup label="First Name" placeholder="Given Name" value={cmpFirstName} onChange={e => setCmpFirstName(e.target.value)} readOnly={isCmpLocked} className={isCmpLocked ? 'bg-neutral-50/50 cursor-not-allowed' : ''} required />
                                <InputGroup label="Middle Name" placeholder="Middle Name" value={cmpMiddleName} onChange={e => setCmpMiddleName(e.target.value)} readOnly={isCmpLocked} className={isCmpLocked ? 'bg-neutral-50/50 cursor-not-allowed' : ''} />
                                <InputGroup label="Last Name" placeholder="Surname" value={cmpLastName} onChange={e => setCmpLastName(e.target.value)} readOnly={isCmpLocked} className={isCmpLocked ? 'bg-neutral-50/50 cursor-not-allowed' : ''} required />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: COMPLAINEE INFORMATION */}
                    <div className="space-y-4">
                        <SectionLabel icon={<User className="size-4" />} label="Complainee Information" color="text-amber-700" />

                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4 relative">

                            {/* SEARCH BAR (Only visible if NOT locked) */}
                            {!isCmeLocked && (
                                <div className="space-y-1.5 relative z-20 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                                        Search Existing Citizen (Optional)
                                    </label>
                                    <div className="relative group">
                                        <input
                                            className="w-full text-xs p-2.5 pl-9 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                                            placeholder="Search by Name..."
                                            value={cmeSearchQuery}
                                            onChange={(e) => {
                                                setCmeSearchQuery(e.target.value);
                                                setShowCmeResults(true);
                                            }}
                                            onFocus={() => setShowCmeResults(true)}
                                        />
                                        <div className="absolute left-3 top-2.5 text-neutral-400"><Search className="size-4" /></div>
                                    </div>
                                    {/* Results */}
                                    {showCmeResults && cmeSearchQuery.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-xl max-h-40 overflow-y-auto z-50">
                                            {filteredComplainees.length > 0 ? (
                                                filteredComplainees.map((c) => (
                                                    <button key={c.id} onClick={() => handleSelectComplainee(c)} className="w-full text-left px-4 py-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors flex items-center justify-between group border-b border-neutral-100 dark:border-neutral-700/50 last:border-0 text-xs">
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
                            {isCmeLocked && (
                                <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 rounded-lg animate-in fade-in zoom-in">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-full text-amber-600 dark:text-amber-300"><UserCheck className="size-4" /></div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-amber-500 dark:text-amber-400 tracking-wide">Selected</p>
                                            <p className="text-xs font-medium text-amber-900 dark:text-amber-100 font-mono">ID: CTZ-{cmeId}</p>
                                        </div>
                                    </div>
                                    <button onClick={handleCancelComplainee} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-black/20 border border-neutral-200 dark:border-neutral-700 hover:border-red-300 hover:text-red-500 rounded text-[10px] font-bold uppercase text-neutral-500 transition-all"><UserX className="size-3" /> Change</button>
                                </div>
                            )}

                            {/* ID Field (Only show if locked/found) */}
                            {isCmeLocked && (
                                <InputGroup label="Complainee Citizen ID" value={cmeId} readOnly isIdField={true} className="bg-neutral-50/50 cursor-not-allowed" />
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InputGroup label="First Name" placeholder="First Name" value={cmeFirstName} onChange={(e) => setCmeFirstName(e.target.value)} readOnly={isCmeLocked} className={isCmeLocked ? 'bg-neutral-50/50 cursor-not-allowed' : ''} />
                                <InputGroup label="Middle Name" placeholder="Middle Name" value={cmeMiddleName} onChange={(e) => setCmeMiddleName(e.target.value)} readOnly={isCmeLocked} className={isCmeLocked ? 'bg-neutral-50/50 cursor-not-allowed' : ''} />
                                <InputGroup label="Last Name" placeholder="Surname" value={cmeLastName} onChange={(e) => setCmeLastName(e.target.value)} readOnly={isCmeLocked} className={isCmeLocked ? 'bg-neutral-50/50 cursor-not-allowed' : ''} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <SelectGroup label="Involvement Status" options={['Principal', 'Accomplice', 'Witness', 'Person of Interest']} />
                                <SelectGroup label="Settlement Status" options={['Pending', 'Amicable Settlement', 'Escalated', 'Resolved', 'Dismissed']} required />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: OTHER INFORMATION */}
                    <div className="space-y-4">
                        <SectionLabel icon={<FileText className="size-4" />} label="Other Information" color="text-amber-700" />

                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4 relative">

                            {/* --- LINK CITIZEN HISTORY SEARCH --- */}
                            <div className="relative z-10 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-900/30 mb-2">
                                <label className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 tracking-wide flex items-center gap-1.5 mb-2">
                                    <LinkIcon className="size-3" /> Link Previous Citizen History (Optional)
                                </label>

                                {!selectedHistory ? (
                                    <div className="relative group">
                                        <input
                                            className="w-full text-xs p-2.5 pl-9 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="Search by History ID, Type, or Details..."
                                            value={historySearchQuery}
                                            onChange={(e) => {
                                                setHistorySearchQuery(e.target.value);
                                                setShowHistoryResults(true);
                                            }}
                                            onFocus={() => setShowHistoryResults(true)}
                                        />
                                        <div className="absolute left-3 top-2.5 text-indigo-400"><FileClock className="size-4" /></div>

                                        {/* History Results Dropdown */}
                                        {showHistoryResults && historySearchQuery.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-xl max-h-40 overflow-y-auto z-50">
                                                {filteredHistory.length > 0 ? (
                                                    filteredHistory.map((h) => (
                                                        <button key={h.id} onClick={() => handleSelectHistory(h)} className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center justify-between group border-b border-neutral-100 dark:border-neutral-700/50 last:border-0 text-xs">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-neutral-700 dark:text-neutral-200">{h.type} - {h.id}</span>
                                                                <span className="text-[10px] text-neutral-500 truncate max-w-[200px]">{h.description}</span>
                                                            </div>
                                                            <span className="text-[10px] bg-neutral-100 dark:bg-neutral-700 px-1.5 py-0.5 rounded text-neutral-500">{h.involved}</span>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="p-3 text-center text-xs text-neutral-400 italic">No history records found.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    // Linked History Banner
                                    <div className="flex items-center justify-between p-2 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-md">
                                        <div className="flex items-center gap-2">
                                            <FileClock className="size-4 text-indigo-600 dark:text-indigo-400" />
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">{selectedHistory.id} - {selectedHistory.type}</span>
                                                <span className="text-[10px] text-indigo-700 dark:text-indigo-300 truncate max-w-[250px]">{selectedHistory.description}</span>
                                            </div>
                                        </div>
                                        <button onClick={handleUnlinkHistory} className="p-1 hover:bg-white/50 rounded-full text-indigo-500 transition-colors" title="Remove Link">
                                            <X className="size-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <TextAreaGroup label="Complaint Description" placeholder="What is the complaint about?" required />
                                <TextAreaGroup label="Settlement Description" placeholder="Details of the resolution or agreement..." />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                <InputGroup label="Date of Settlement" type="date" required />
                                <InputGroup label="Mediator / Lupon" placeholder="Official Name" />
                                <SelectGroup label="Case Classification" options={['Civil', 'Criminal', 'Administrative', 'Other']} />
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
    isIdField?: boolean;
}

function InputGroup({ label, required, className, isIdField, ...props }: InputProps) {
    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative group">
                {isIdField && (
                    <div className="absolute left-3 top-2.5 text-neutral-500 font-mono text-xs font-bold pointer-events-none select-none">
                        CTZ-
                    </div>
                )}
                    <input
                        className={`w-full text-xs p-2.5 ${isIdField ? 'pl-12 font-mono' : ''} rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all ${className}`}
                        {...props}
                    />
            </div>
        </div>
    );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
}

function TextAreaGroup({ label, required, ...props }: TextAreaProps) {
    return (
        <div className="space-y-1.5 w-full h-full flex flex-col">
            {label && (
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <textarea
                className="w-full flex-1 min-h-[120px] text-xs p-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all resize-none"
                {...props}
            ></textarea>
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
                    className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none appearance-none transition-all cursor-pointer hover:border-amber-300"
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
