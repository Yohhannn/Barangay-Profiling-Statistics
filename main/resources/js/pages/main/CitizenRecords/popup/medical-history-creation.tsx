import {
    X, CheckCircle, Stethoscope, User,
    Activity, Tag, Search, Loader2, UserCheck, Trash2, Plus
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

interface MedicalHistoryCreationProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MedicalHistoryCreation({ isOpen, onClose }: MedicalHistoryCreationProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        citizens: [
            { citizen_id: null as number | null, first_name: '', middle_name: '', last_name: '' }
        ],
        histories: [
            { type: '', description: '', date_diagnosed: '' }
        ]
    });

    const [resetKey, setResetKey] = useState(0);

    const handleClose = () => {
        reset();
        clearErrors();
        setResetKey(prev => prev + 1);
        onClose();
    };

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post('/citizen-records/medical-history', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Medical history record(s) logged successfully.',
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

    const addCitizen = () => {
        setData('citizens', [...data.citizens, { citizen_id: null, first_name: '', middle_name: '', last_name: '' }]);
    };

    const removeCitizen = (index: number) => {
        if (data.citizens.length > 1) {
            setData('citizens', data.citizens.filter((_, i) => i !== index));
        }
    };

    const updateCitizen = (index: number, field: string, value: any) => {
        setData(data => {
            const newCitizens = [...data.citizens];
            newCitizens[index] = { ...newCitizens[index], [field]: value };
            return { ...data, citizens: newCitizens };
        });
    };

    const addHistory = () => {
        setData('histories', [...data.histories, { type: '', description: '', date_diagnosed: '' }]);
    };

    const removeHistory = (index: number) => {
        if (data.histories.length > 1) {
            setData('histories', data.histories.filter((_, i) => i !== index));
        }
    };

    const updateHistory = (index: number, field: string, value: any) => {
        setData(data => {
            const newHistories = [...data.histories];
            newHistories[index] = { ...newHistories[index], [field]: value };
            return { ...data, histories: newHistories };
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#F8F9FC] dark:bg-[#0f172a] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20">

                {/* --- Header --- */}
                <div className="relative bg-rose-700 text-white p-5 flex justify-between items-center overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <Stethoscope className="w-32 h-32" />
                    </div>

                    <div className="z-10">
                        <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
                            <Stethoscope className="size-5 text-rose-200" />
                            Record Medical History / Batch Link
                        </h2>
                        <p className="text-[10px] text-rose-200 uppercase tracking-widest font-semibold mt-1">
                            Record and link multiple citizens to multiple medical events
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
                <div className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-thin scrollbar-thumb-rose-200 dark:scrollbar-thumb-rose-900 space-y-8">

                    {/* CITIZENS SECTION */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b-2 border-neutral-100 dark:border-neutral-800 pb-2">
                            <div className="flex items-center gap-2 text-rose-600">
                                <div className="p-1.5 bg-white dark:bg-white/5 rounded shadow-sm border border-neutral-100 dark:border-neutral-700">
                                    <User className="size-4" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-wider dark:text-neutral-200">
                                    Involved Citizens
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={addCitizen}
                                className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                            >
                                <Plus className="size-3.5" /> Link More Citizens
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4" key={`citizens-${resetKey}`}>
                            {data.citizens.map((citizen, idx) => (
                                <CitizenBlock 
                                    key={idx} 
                                    index={idx}
                                    data={citizen}
                                    onChange={(field: string, val: any) => updateCitizen(idx, field, val)}
                                    onRemove={() => removeCitizen(idx)}
                                    canRemove={data.citizens.length > 1}
                                    errors={errors}
                                />
                            ))}
                        </div>
                    </div>

                    {/* HISTORIES SECTION */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b-2 border-neutral-100 dark:border-neutral-800 pb-2">
                            <div className="flex items-center gap-2 text-rose-600">
                                <div className="p-1.5 bg-white dark:bg-white/5 rounded shadow-sm border border-neutral-100 dark:border-neutral-700">
                                    <Activity className="size-4" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-wider dark:text-neutral-200">
                                    Medical Information
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={addHistory}
                                className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                            >
                                <Plus className="size-3.5" /> Link Additional Tests
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4" key={`history-${resetKey}`}>
                            {data.histories.map((history, idx) => (
                                <HistoryBlock
                                    key={idx}
                                    index={idx}
                                    data={history}
                                    onChange={(field: string, val: any) => updateHistory(idx, field, val)}
                                    onRemove={() => removeHistory(idx)}
                                    canRemove={data.histories.length > 1}
                                    errors={errors}
                                />
                            ))}
                        </div>
                    </div>

                    {(data.citizens.length > 1 || data.histories.length > 1) && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 p-4 rounded-xl flex gap-3 text-sm text-yellow-800 dark:text-yellow-200 animate-in fade-in slide-in-from-bottom-2">
                            <Tag className="size-5 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold">Important Notice:</p>
                                <p className="text-xs opacity-80 mt-1">
                                    You are about to create <strong className="font-mono bg-yellow-100 dark:bg-yellow-900/50 px-1 rounded">{data.citizens.length * data.histories.length}</strong> separate medical history records (multiplying {data.citizens.length} citizens by {data.histories.length} records).
                                </p>
                            </div>
                        </div>
                    )}

                </div>

                {/* --- Footer --- */}
                <div className="p-5 bg-white dark:bg-[#0f172a] border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0">
                    <span className="text-[10px] text-neutral-400 italic">Review linked entries before saving</span>

                    <button
                        onClick={handleSubmit}
                        disabled={processing}
                        className="flex items-center gap-2 px-8 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-green-600/20 active:scale-95"
                    >
                        {processing ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />} 
                        {processing ? 'Processing...' : `Confirm & Save ${data.citizens.length * data.histories.length} Records`}
                    </button>
                </div>

            </div>
        </div>
    );
}

// --- Subcomponents ---

function CitizenBlock({ index, data, onChange, onRemove, canRemove, errors }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLocked, setIsLocked] = useState(data.citizen_id !== null);
    const [hasRecord, setHasRecord] = useState(false);

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
                    .catch(e => setIsSearching(false));
            }, 300);
            return () => clearTimeout(debounceTimer);
        } else {
            setSearchResults([]);
            setIsSearching(false);
        }
    }, [searchQuery, isLocked]);

    const handleSelectCitizen = (citizen: any) => {
        onChange('citizen_id', citizen.id);
        
        const firstName = citizen.first_name || citizen.name.split(' ')[0] || '';
        const lastName = citizen.last_name || (citizen.name.split(' ').length > 1 ? citizen.name.split(' ')[citizen.name.split(' ').length - 1] : '');
        const middleName = citizen.middle_name || (citizen.name.split(' ').length > 2 ? citizen.name.split(' ').slice(1, -1).join(' ') : '');

        onChange('first_name', firstName);
        onChange('last_name', lastName);
        onChange('middle_name', middleName);
        
        setIsLocked(true);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleCancelSelection = () => {
        onChange('citizen_id', null);
        onChange('first_name', '');
        onChange('middle_name', '');
        onChange('last_name', '');
        setIsLocked(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    return (
        <div className={`bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm relative animate-in fade-in slide-in-from-bottom-4`}>
            {canRemove && (
                <button type="button" onClick={onRemove} className="absolute top-3 right-3 text-red-400 hover:text-red-500 bg-red-50 dark:bg-red-900/20 p-1.5 rounded-md transition-colors z-30">
                    <Trash2 className="size-4" />
                </button>
            )}

            {!isLocked && (
                <div className="mb-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer mb-3">
                        <div className="relative">
                            <input 
                                type="checkbox" 
                                className="sr-only" 
                                checked={hasRecord}
                                onChange={(e) => {
                                    setHasRecord(e.target.checked);
                                    if (!e.target.checked) handleCancelSelection();
                                }}
                            />
                            <div className={`block w-10 h-6 rounded-full transition-colors ${hasRecord ? 'bg-rose-500' : 'bg-neutral-300 dark:bg-neutral-600'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${hasRecord ? 'transform translate-x-4' : ''}`}></div>
                        </div>
                        <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wide">
                            Has Barangay Record?
                        </span>
                    </label>

                    {hasRecord && (
                        <div className="space-y-1.5 relative z-20 animate-in fade-in max-w-sm">
                            <div className="relative group mt-2">
                                <input
                                    className="w-full text-xs p-2.5 pl-9 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                                    placeholder="Search by ID or Name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <div className="absolute left-3 top-2.5 text-neutral-400 group-focus-within:text-rose-500 transition-colors">
                                    {isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                                </div>
                            </div>

                            {searchQuery.length > 1 && (
                                <div className="mt-2 flex flex-col gap-1 max-h-48 overflow-y-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm p-1">
                                    {searchResults.length > 0 ? (
                                        searchResults.map(result => (
                                            <button
                                                type="button"
                                                key={result.id}
                                                onMouseDown={(e) => { e.preventDefault(); handleSelectCitizen(result); }}
                                                className="w-full p-2 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/30 text-left flex justify-between items-center group transition-colors"
                                            >
                                                <div>
                                                    <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{result.name}</div>
                                                    <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                                                        {result.uuid} • {result.sex || 'Unknown'} {result.age !== null ? `(${result.age} yrs)` : ''}
                                                    </div>
                                                </div>
                                                <div className="p-1 rounded bg-rose-100 dark:bg-rose-900/40 opacity-0 group-hover:opacity-100 transition-opacity text-rose-600 dark:text-rose-400">
                                                    <UserCheck className="size-4" />
                                                </div>
                                            </button>
                                        ))
                                    ) : (!isSearching && <div className="p-2 text-center text-xs text-neutral-500">No matching citizens found.</div>)}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {isLocked && (
                <div className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 rounded-lg animate-in fade-in zoom-in duration-300 mb-4 max-w-sm mt-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-full text-rose-600 dark:text-rose-300">
                            <UserCheck className="size-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase text-rose-500 dark:text-rose-400 tracking-wide">Citizen Linked</p>
                            <p className="text-xs font-medium text-rose-900 dark:text-rose-100 flex items-center gap-1 mt-0.5">{data.first_name} {data.last_name}</p>
                        </div>
                    </div>
                    <button type="button" onClick={handleCancelSelection} className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-600 bg-white dark:bg-black/20 border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 rounded shadow-sm">
                        Unlink
                    </button>
                </div>
            )}

            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${isLocked ? 'opacity-80' : ''}`}>
                <InputGroup label="First Name" required value={data.first_name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('first_name', e.target.value)} readOnly={isLocked} className={isLocked ? 'bg-neutral-50/80 dark:bg-neutral-900/50 text-neutral-500 cursor-not-allowed' : ''} />
                <InputGroup label="Middle Name" value={data.middle_name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('middle_name', e.target.value)} readOnly={isLocked} className={isLocked ? 'bg-neutral-50/80 dark:bg-neutral-900/50 text-neutral-500 cursor-not-allowed' : ''} />
                <InputGroup label="Last Name" required value={data.last_name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('last_name', e.target.value)} readOnly={isLocked} className={isLocked ? 'bg-neutral-50/80 dark:bg-neutral-900/50 text-neutral-500 cursor-not-allowed' : ''} />
            </div>
            {(errors[`citizens.${index}.first_name`] || errors[`citizens.${index}.last_name`]) && (
                <p className="text-[10px] text-red-500 font-medium mt-1">First Name and Last Name are required.</p>
            )}
        </div>
    );
}

function HistoryBlock({ index, data, onChange, onRemove, canRemove, errors }: any) {
    return (
        <div className={`bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm relative space-y-4 animate-in fade-in slide-in-from-bottom-4 mt-2`}>
            {canRemove && (
                <button type="button" onClick={onRemove} className="absolute top-3 right-3 text-red-400 hover:text-red-500 bg-red-50 dark:bg-red-900/20 p-1.5 rounded-md transition-colors z-10">
                    <Trash2 className="size-4" />
                </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                    <SelectGroup label="Select Medical Type" options={['Hypertension', 'Diabetes', 'Checkup', 'Prenatal', 'Vaccination', 'Surgery', 'Other']} required value={data.type} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('type', e.target.value)} />
                    {errors[`histories.${index}.type`] && <p className="text-[10px] text-red-500 mt-1">{errors[`histories.${index}.type`]}</p>}
                </div>
                <div>
                    <InputGroup type="date" label="Date Diagnosed" value={data.date_diagnosed} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('date_diagnosed', e.target.value)} />
                    {errors[`histories.${index}.date_diagnosed`] && <p className="text-[10px] text-red-500 mt-1">{errors[`histories.${index}.date_diagnosed`]}</p>}
                </div>
            </div>
            
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                    Description <span className="text-red-500">*</span>
                </label>
                <textarea
                    className="w-full text-xs p-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all resize-none h-24"
                    placeholder="Brief description of the medical record..."
                    value={data.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange('description', e.target.value)}
                ></textarea>
                {errors[`histories.${index}.description`] && <p className="text-[10px] text-red-500 mt-1">{errors[`histories.${index}.description`]}</p>}
            </div>
        </div>
    );
}

function InputGroup({ label, required, className, ...props }: any) {
    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <input className={`w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all ${className}`} {...props} />
        </div>
    );
}

function SelectGroup({ label, options, required, ...props }: any) {
    return (
        <div className="space-y-1.5 w-full">
            <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all appearance-none cursor-pointer" {...props}>
                <option value="" disabled>Select Option</option>
                {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    );
}
