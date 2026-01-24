import {
    X, CheckCircle, FileClock, User,
    FileText, Activity, Tag, Search
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface CitizenHistoryCreationProps {
    isOpen: boolean;
    onClose: () => void;
}

// Mock Data for Auto-fill
const mockCitizens: Record<string, { first: string; middle: string; last: string }> = {
    '2025-001': { first: 'Roberto', middle: 'A.', last: 'Gonzales' },
    '2025-002': { first: 'Maria', middle: 'B.', last: 'Santos' },
    '2025-005': { first: 'Pedro', middle: 'C.', last: 'Magtanggol' },
};

export default function CitizenHistoryCreation({ isOpen, onClose }: CitizenHistoryCreationProps) {
    // --- State ---
    const [citizenIdSuffix, setCitizenIdSuffix] = useState('');
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isAutoFilled, setIsAutoFilled] = useState(false);

    // Auto-fill Logic
    useEffect(() => {
        const citizen = mockCitizens[citizenIdSuffix];
        if (citizen) {
            setFirstName(citizen.first);
            setMiddleName(citizen.middle);
            setLastName(citizen.last);
            setIsAutoFilled(true);
        } else {
            // Only clear if we were previously autofilled to allow manual entry if needed
            if (isAutoFilled) {
                setFirstName('');
                setMiddleName('');
                setLastName('');
                setIsAutoFilled(false);
            }
        }
    }, [citizenIdSuffix]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("History Record Submitted", {
            citizenId: `CTZ-${citizenIdSuffix}`,
            firstName,
            middleName,
            lastName
        });
        onClose();
        // Reset
        setCitizenIdSuffix('');
        setFirstName('');
        setMiddleName('');
        setLastName('');
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

                        <div className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4 relative overflow-hidden">
                            {isAutoFilled && (
                                <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg shadow-sm animate-in slide-in-from-top-1">
                                    ✓ Record Found
                                </div>
                            )}

                            {/* ID Input with Fixed Prefix */}
                            <div className="space-y-1.5 w-full">
                                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                                    Citizen ID (Optional)
                                </label>
                                <div className="relative group flex items-center">
                                    <div className="absolute left-3 top-2.5 text-neutral-500 font-mono text-xs font-bold pointer-events-none select-none">
                                        CTZ-
                                    </div>
                                    <input
                                        className="w-full text-xs p-2.5 pl-12 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-mono"
                                        placeholder="XXXX-XXX"
                                        value={citizenIdSuffix}
                                        onChange={(e) => setCitizenIdSuffix(e.target.value)}
                                    />
                                    <div className="absolute right-3 top-2.5 text-neutral-400">
                                        <Search className="size-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InputGroup
                                    label="First Name"
                                    placeholder="First Name"
                                    required
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    readOnly={isAutoFilled}
                                    className={isAutoFilled ? 'opacity-80 bg-neutral-50' : ''}
                                />
                                <InputGroup
                                    label="Middle Name"
                                    placeholder="Middle Name"
                                    value={middleName}
                                    onChange={(e) => setMiddleName(e.target.value)}
                                    readOnly={isAutoFilled}
                                    className={isAutoFilled ? 'opacity-80 bg-neutral-50' : ''}
                                />
                                <InputGroup
                                    label="Last Name"
                                    placeholder="Last Name"
                                    required
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    readOnly={isAutoFilled}
                                    className={isAutoFilled ? 'opacity-80 bg-neutral-50' : ''}
                                />
                            </div>

                            <p className="text-[10px] text-right text-neutral-400 italic">
                                {isAutoFilled
                                    ? "Data auto-populated from Citizen Database."
                                    : "Enter ID to auto-populate (e.g., 2025-001)"}
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
