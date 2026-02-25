import {
    X, CheckCircle, FileClock, User,
    Activity, Tag, Search, Loader2, UserCheck, UserX
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { HistoryRecord } from '../citizen-history';

interface CitizenHistoryEditProps {
    isOpen: boolean;
    onClose: () => void;
    historyData?: HistoryRecord | null;
}

export default function CitizenHistoryEdit({ isOpen, onClose, historyData }: CitizenHistoryEditProps) {
    // --- Form State ---
    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        citizen_id: null as number | null,
        first_name: '',
        middle_name: '',
        last_name: '',
        type: '',
        title: '',
        description: '',
        status: 'Pending',
    });

    // --- Search State ---
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLocked, setIsLocked] = useState(false); // Controls if fields are editable

    // Live Search Effect
    useEffect(() => {
        if (searchQuery.trim().length > 1 && !isLocked) {
            setIsSearching(true);
            const debounceTimer = setTimeout(() => {
                fetch(`/api/citizen-search?q=${encodeURIComponent(searchQuery)}`)
                    .then(res => res.json())
                    .then(resData => {
                        setSearchResults(resData);
                        setIsSearching(false);
                    })
                    .catch(err => {
                        console.error("Failed to search citizens", err);
                        setIsSearching(false);
                    });
            }, 300);
            return () => clearTimeout(debounceTimer);
        } else {
            setSearchResults([]);
            setIsSearching(false);
        }
    }, [searchQuery, isLocked]);

    // Handle Selecting a Citizen
    const handleSelectCitizen = (citizen: any) => {
        setData(prev => ({
            ...prev,
            citizen_id: citizen.id,
            first_name: citizen.name.split(' ')[0] || '',
            last_name: citizen.name.split(' ').slice(1).join(' ') || '',
            middle_name: '' 
        }));
        
        setIsLocked(true); // Lock fields
        setSearchQuery(''); // Clear search query visually
        setSearchResults([]);
        clearErrors();
    };

    // Cancel Selection / Unlock
    const handleCancelSelection = () => {
        setData(prev => ({
            ...prev,
            citizen_id: null,
            first_name: '',
            middle_name: '',
            last_name: ''
        }));
        setIsLocked(false); // Unlock fields
        setSearchQuery('');
        setSearchResults([]);
    };

    // Populate data on open
    useEffect(() => {
        if (isOpen && historyData) {
            setData({
                citizen_id: historyData.ctz_id,
                first_name: historyData.firstName,
                middle_name: historyData.middleName || '',
                last_name: historyData.lastName,
                type: historyData.type,
                title: historyData.title,
                description: historyData.description,
                status: historyData.status,
            });

            if (historyData.ctz_id) {
                setIsLocked(true);
            } else {
                setIsLocked(false);
            }
        }
    }, [isOpen, historyData]);

    const handleClose = () => {
        reset();
        handleCancelSelection();
        clearErrors();
        onClose();
    };

    if (!isOpen || !historyData) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        put(`/citizen-records/citizen-history/${historyData.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Citizen history record updated successfully.',
                });
                handleClose();
            },
            onError: (err) => {
                console.error(err);
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Please check the form for errors.',
                });
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#F8F9FC] dark:bg-[#0f172a] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20">

                {/* --- Header --- */}
                <div className="relative bg-blue-700 text-white p-5 flex justify-between items-center overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <FileClock className="w-32 h-32" />
                    </div>

                    <div className="z-10">
                        <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
                            <FileClock className="size-5 text-blue-200" />
                            Edit Citizen History
                        </h2>
                        <p className="text-[10px] text-blue-200 uppercase tracking-widest font-semibold mt-1">
                            Update an existing citizen history record
                        </p>
                    </div>

                    <button
                        onClick={handleClose}
                        className="z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white"
                        type="button"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* --- Scrollable Content --- */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-blue-900 space-y-6">

                    {/* Citizen Information */}
                    <div className="space-y-4">
                        <SectionLabel icon={<User className="size-4" />} label="Citizen Information" color="text-blue-600" />

                        <div className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4 relative">

                            {/* SEARCH BAR (Only visible if NOT locked) */}
                            {!isLocked && (
                                <div className="space-y-1.5 relative z-20 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                                        Search Existing Citizen (Optional)
                                    </label>
                                    <div className="relative group">
                                        <input
                                            className="w-full text-xs p-2.5 pl-9 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Search by Name or CTZ ID..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <div className="absolute left-3 top-2.5 text-neutral-400">
                                            {isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                                        </div>
                                    </div>

                                    {/* RESULTS DROPDOWN (Inline List) */}
                                    {searchQuery.length > 1 && (
                                        <div className="mt-2 flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                                            {searchResults.length > 0 ? (
                                                searchResults.map((result) => (
                                                    <button
                                                        type="button"
                                                        key={result.id}
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            handleSelectCitizen(result);
                                                        }}
                                                        className="w-full p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm flex items-center justify-between hover:border-blue-300 dark:hover:border-blue-500 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-all text-left group"
                                                    >
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-700 dark:group-hover:text-blue-400">
                                                                    {result.name}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-500 px-1.5 py-0.5 rounded font-mono">
                                                                    {result.uuid}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-md text-neutral-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                            <UserCheck className="size-4" />
                                                        </div>
                                                    </button>
                                                ))
                                            ) : (
                                                !isSearching && (
                                                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg text-center">
                                                        <span className="text-xs text-neutral-500">No citizens found matching "{searchQuery}"</span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* SELECTED CITIZEN BANNER (Visible ONLY when locked) */}
                            {isLocked && (
                                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-lg animate-in fade-in zoom-in duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-600 dark:text-blue-300">
                                            <UserCheck className="size-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-blue-500 dark:text-blue-400 tracking-wide">
                                                Citizen Linked
                                            </p>
                                            <p className="text-xs font-medium text-blue-900 dark:text-blue-100 font-mono flex items-center gap-1 mt-0.5">
                                                {data.first_name} {data.last_name}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCancelSelection}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-black/20 border border-neutral-200 dark:border-neutral-700 hover:border-red-300 hover:text-red-500 dark:hover:border-red-800 dark:hover:text-red-400 rounded text-[10px] font-bold uppercase tracking-wider text-neutral-500 transition-all shadow-sm"
                                    >
                                        <UserX className="size-3" /> Unlink
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
                                    value={data.first_name}
                                    onChange={(e) => setData('first_name', e.target.value)}
                                    readOnly={isLocked}
                                    className={isLocked ? 'bg-neutral-50/80 dark:bg-neutral-900/50 text-neutral-500 cursor-not-allowed border-neutral-200' : ''}
                                />
                                <InputGroup
                                    label="Middle Name"
                                    placeholder="Middle Name"
                                    value={data.middle_name}
                                    onChange={(e) => setData('middle_name', e.target.value)}
                                    readOnly={isLocked}
                                    className={isLocked ? 'bg-neutral-50/80 dark:bg-neutral-900/50 text-neutral-500 cursor-not-allowed border-neutral-200' : ''}
                                />
                                <InputGroup
                                    label="Last Name"
                                    placeholder="Last Name"
                                    required
                                    value={data.last_name}
                                    onChange={(e) => setData('last_name', e.target.value)}
                                    readOnly={isLocked}
                                    className={isLocked ? 'bg-neutral-50/80 dark:bg-neutral-900/50 text-neutral-500 cursor-not-allowed border-neutral-200' : ''}
                                />
                            </div>
                            
                            {(errors.first_name || errors.last_name) && (
                                <p className="text-[10px] text-red-500 font-medium">First Name and Last Name are required.</p>
                            )}

                            <p className="text-[10px] text-right text-neutral-400 italic mt-2">
                                {isLocked
                                    ? "Fields are locked because a registered citizen is linked."
                                    : "Enter names manually if editing an unregistered history record."}
                            </p>
                        </div>
                    </div>

                    {/* History Information */}
                    <div className="space-y-4">
                        <SectionLabel icon={<Activity className="size-4" />} label="History Information" color="text-blue-600" />

                        <div className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <SelectGroup
                                        label="Select History Type"
                                        options={['Violation', 'Complaint', 'Commendation', 'Other']}
                                        required
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                    />
                                    {errors.type && <p className="text-[10px] text-red-500 mt-1">{errors.type}</p>}
                                </div>
                                <div>
                                    <SelectGroup
                                        label="Status"
                                        options={['Resolved', 'Pending', 'Active', 'Dismissed']}
                                        required
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                    />
                                    {errors.status && <p className="text-[10px] text-red-500 mt-1">{errors.status}</p>}
                                </div>
                            </div>
                            
                            <div>
                                <InputGroup
                                    label="Record Title"
                                    placeholder="e.g. Noise Complaint or Traffic Violation"
                                    required
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                />
                                {errors.title && <p className="text-[10px] text-red-500 mt-1">{errors.title}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full text-xs p-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none h-32"
                                    placeholder="What is it about?"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                ></textarea>
                                {errors.description && <p className="text-[10px] text-red-500 mt-1">{errors.description}</p>}
                            </div>
                        </div>
                    </div>

                </div>

                {/* --- Footer --- */}
                <div className="p-5 bg-white dark:bg-[#0f172a] border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0">
                    <span className="text-[10px] text-neutral-400 italic">Note: Review details before saving</span>

                    <button
                        onClick={handleSubmit}
                        disabled={processing}
                        className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                        {processing ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />} 
                        {processing ? 'Updating...' : 'Save Changes'}
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
