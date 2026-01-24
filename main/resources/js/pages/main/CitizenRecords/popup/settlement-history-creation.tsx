import {
    X, CheckCircle, Handshake, User,
    FileText, Activity, Search, Scale
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface SettlementHistoryCreationProps {
    isOpen: boolean;
    onClose: () => void;
}

// Mock Data for Auto-fill
const mockCitizens: Record<string, { first: string; middle: string; last: string }> = {
    '2025-001': { first: 'Roberto', middle: 'A.', last: 'Gonzales' },
    '2025-005': { first: 'Pedro', middle: 'C.', last: 'Magtanggol' },
    '2025-014': { first: 'Antonio', middle: 'L.', last: 'Luna' },
};

export default function SettlementHistoryCreation({ isOpen, onClose }: SettlementHistoryCreationProps) {
    // --- 1. ALWAYS CALL ALL HOOKS FIRST ---

    // --- Complainant State ---
    const [hasRecord, setHasRecord] = useState(false);
    const [complainantIdSuffix, setComplainantIdSuffix] = useState('');
    const [complainantFirst, setComplainantFirst] = useState('');
    const [complainantMiddle, setComplainantMiddle] = useState('');
    const [complainantLast, setComplainantLast] = useState('');

    // --- Complainee State ---
    const [complaineeIdSuffix, setComplaineeIdSuffix] = useState('');
    const [complaineeFirst, setComplaineeFirst] = useState('');
    const [complaineeMiddle, setComplaineeMiddle] = useState('');
    const [complaineeLast, setComplaineeLast] = useState('');
    const [isComplaineeAutoFilled, setIsComplaineeAutoFilled] = useState(false);

    // --- Effects for Auto-fill ---

    // 1. Complainant Auto-fill
    useEffect(() => {
        if (!hasRecord) return;
        const citizen = mockCitizens[complainantIdSuffix];
        if (citizen) {
            setComplainantFirst(citizen.first);
            setComplainantMiddle(citizen.middle);
            setComplainantLast(citizen.last);
        } else {
            // Only clear if previously autofilled or empty to avoid overwriting manual typing if logic changes
            if(complainantIdSuffix === '') {
                setComplainantFirst('');
                setComplainantMiddle('');
                setComplainantLast('');
            }
        }
    }, [complainantIdSuffix, hasRecord]);

    // 2. Complainee Auto-fill
    useEffect(() => {
        const citizen = mockCitizens[complaineeIdSuffix];
        if (citizen) {
            setComplaineeFirst(citizen.first);
            setComplaineeMiddle(citizen.middle);
            setComplaineeLast(citizen.last);
            setIsComplaineeAutoFilled(true);
        } else {
            if (isComplaineeAutoFilled) {
                setComplaineeFirst('');
                setComplaineeMiddle('');
                setComplaineeLast('');
                setIsComplaineeAutoFilled(false);
            }
        }
    }, [complaineeIdSuffix]);

    // --- Handlers ---
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Settlement Record Submitted");
        onClose();
    };

    // --- 2. NOW CHECK VISIBILITY (Moved after all hooks) ---
    if (!isOpen) return null;

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
                                        <input type="radio" name="hasRec" className="accent-amber-600" checked={hasRecord} onChange={() => setHasRecord(true)} />
                                        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Yes</span>
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input type="radio" name="hasRec" className="accent-amber-600" checked={!hasRecord} onChange={() => setHasRecord(false)} />
                                        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">No</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">
                            {hasRecord ? (
                                // HAS RECORD: Show ID input + ReadOnly Fields
                                <>
                                    <InputGroup
                                        label="Complainant Citizen ID"
                                        isIdField={true}
                                        value={complainantIdSuffix}
                                        onChange={(e) => setComplainantIdSuffix(e.target.value)}
                                        placeholder="XXXX-XXX"
                                        required
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/30">
                                        <InputGroup label="First Name" value={complainantFirst} readOnly className="bg-transparent" />
                                        <InputGroup label="Middle Name" value={complainantMiddle} readOnly className="bg-transparent" />
                                        <InputGroup label="Last Name" value={complainantLast} readOnly className="bg-transparent" />
                                    </div>
                                </>
                            ) : (
                                // NO RECORD: Manual Entry
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <InputGroup label="First Name" placeholder="Given Name" value={complainantFirst} onChange={e => setComplainantFirst(e.target.value)} required />
                                    <InputGroup label="Middle Name" placeholder="Middle Name" value={complainantMiddle} onChange={e => setComplainantMiddle(e.target.value)} />
                                    <InputGroup label="Last Name" placeholder="Surname" value={complainantLast} onChange={e => setComplainantLast(e.target.value)} required />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECTION 2: COMPLAINEE INFORMATION */}
                    <div className="space-y-4">
                        <SectionLabel icon={<User className="size-4" />} label="Complainee Information" color="text-amber-700" />

                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">
                            <InputGroup
                                label="Complainee Citizen ID (Optional)"
                                isIdField={true}
                                value={complaineeIdSuffix}
                                onChange={(e) => setComplaineeIdSuffix(e.target.value)}
                                placeholder="XXXX-XXX"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InputGroup
                                    label="First Name"
                                    placeholder="First Name"
                                    value={complaineeFirst}
                                    onChange={(e) => setComplaineeFirst(e.target.value)}
                                    readOnly={isComplaineeAutoFilled}
                                    className={isComplaineeAutoFilled ? 'opacity-70 bg-neutral-100' : ''}
                                />
                                <InputGroup
                                    label="Middle Name"
                                    placeholder="Middle Name"
                                    value={complaineeMiddle}
                                    onChange={(e) => setComplaineeMiddle(e.target.value)}
                                    readOnly={isComplaineeAutoFilled}
                                    className={isComplaineeAutoFilled ? 'opacity-70 bg-neutral-100' : ''}
                                />
                                <InputGroup
                                    label="Last Name"
                                    placeholder="Surname"
                                    value={complaineeLast}
                                    onChange={(e) => setComplaineeLast(e.target.value)}
                                    readOnly={isComplaineeAutoFilled}
                                    className={isComplaineeAutoFilled ? 'opacity-70 bg-neutral-100' : ''}
                                />
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

                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">

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
