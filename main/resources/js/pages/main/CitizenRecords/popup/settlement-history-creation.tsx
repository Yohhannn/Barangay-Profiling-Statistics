import {
    X, CheckCircle, Handshake, User,
    FileText, Search, Scale, UserCheck, UserX,
    Loader2, Plus, Trash2, ShieldAlert, Activity
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

interface SettlementHistoryCreationProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettlementHistoryCreation({ isOpen, onClose }: SettlementHistoryCreationProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        complainants: [
            { id: Date.now().toString(), has_record: false, citizen_id: '', first_name: '', middle_name: '', last_name: '' }
        ],
        subjects: [
            { id: (Date.now() + 1).toString(), has_record: false, citizen_id: '', first_name: '', middle_name: '', last_name: '', involvement_status: '', settlement_status: '' }
        ],

        linked_history_id: '',
        linked_history_details: null as any,
        complaint_description: '',
        settlement_description: '',
        date_of_settlement: '',
        mediator: '',
        case_classification: '',
    });

    if (!isOpen) return null;

    const addComplainant = () => {
        setData('complainants', [...data.complainants, { id: Date.now().toString(), has_record: false, citizen_id: '', first_name: '', middle_name: '', last_name: '' }]);
    };

    const removeComplainant = (id: string) => {
        if (data.complainants.length <= 1) return;
        setData('complainants', data.complainants.filter(c => c.id !== id));
    };

    const updateComplainant = (id: string, updates: any) => {
        setData('complainants', data.complainants.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const addSubject = () => {
        setData('subjects', [...data.subjects, { id: Date.now().toString(), has_record: false, citizen_id: '', first_name: '', middle_name: '', last_name: '', involvement_status: '', settlement_status: '' }]);
    };

    const removeSubject = (id: string) => {
        if (data.subjects.length <= 1) return;
        setData('subjects', data.subjects.filter(s => s.id !== id));
    };

    const updateSubject = (id: string, updates: any) => {
        setData('subjects', data.subjects.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation check to ensure no citizen is both a complainant and a subject
        const complainantIds = data.complainants.filter(c => c.citizen_id).map(c => c.citizen_id);
        const subjectIds = data.subjects.filter(s => s.citizen_id).map(s => s.citizen_id);
        const conflict = subjectIds.find(id => complainantIds.includes(id));
        
        if (conflict) {
            Swal.fire({
                icon: 'error',
                title: 'Data Conflict',
                text: 'A citizen cannot be both a Complainant and a Subject in the same settlement record.',
            });
            return;
        }

        post('/citizen-records/settlement-history', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Settlement record booked successfully.',
                });
                reset();
                clearErrors();
                onClose();
            },
            onError: (err) => {
                console.error(err);
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Please check the form for missing or invalid inputs.',
                });
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#F8F9FC] dark:bg-[#0f172a] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-white/20">

                <div className="relative bg-amber-600 dark:bg-amber-700 text-white p-5 flex justify-between items-center overflow-hidden shrink-0">
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

                    <button onClick={() => { reset(); clearErrors(); onClose(); }} className="z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white">
                        <X className="size-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-thin scrollbar-thumb-amber-200 dark:scrollbar-thumb-amber-900 space-y-8">

                    {/* COMPLAINANTS SECTION */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b-2 border-neutral-100 dark:border-neutral-800">
                            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-500">
                                <ShieldAlert className="size-4" />
                                <h3 className="text-sm font-bold uppercase tracking-wider">Complainants</h3>
                            </div>
                            <button onClick={addComplainant} type="button" className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg text-xs font-bold transition-colors">
                                <Plus className="size-3" /> Add Complainant
                            </button>
                        </div>

                        <div className="space-y-4">
                            {data.complainants.map((comp, index) => (
                                <ComplainantForm 
                                    key={comp.id} 
                                    data={comp} 
                                    index={index}
                                    canRemove={data.complainants.length > 1}
                                    onUpdate={(updates: any) => updateComplainant(comp.id, updates)}
                                    onRemove={() => removeComplainant(comp.id)}
                                    errors={errors}
                                />
                            ))}
                        </div>
                    </div>

                    {/* SUBJECTS SECTION */}
                    <div className="space-y-4 pt-4 border-t border-sidebar-border/50">
                        <div className="flex items-center justify-between pb-2 border-b-2 border-neutral-100 dark:border-neutral-800">
                            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500">
                                <User className="size-4" />
                                <h3 className="text-sm font-bold uppercase tracking-wider">Subjects / Respondents</h3>
                            </div>
                            <button onClick={addSubject} type="button" className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg text-xs font-bold transition-colors">
                                <Plus className="size-3" /> Add Subject
                            </button>
                        </div>

                        <div className="space-y-4">
                            {data.subjects.map((sub, index) => (
                                <SubjectForm 
                                    key={sub.id} 
                                    data={sub} 
                                    index={index}
                                    canRemove={data.subjects.length > 1}
                                    onUpdate={(updates: any) => updateSubject(sub.id, updates)}
                                    onRemove={() => removeSubject(sub.id)}
                                    errors={errors}
                                />
                            ))}
                        </div>
                    </div>

                    {/* OTHER INFO SECTION */}
                    <div className="space-y-4 pt-4 border-t border-sidebar-border/50">
                        <div className="flex items-center justify-between pb-2 border-b-2 border-neutral-100 dark:border-neutral-800">
                            <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                                <Activity className="size-4" />
                                <h3 className="text-sm font-bold uppercase tracking-wider">Other Information</h3>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4 relative">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <TextAreaGroup label="Complaint Description" placeholder="What is the complaint about?" value={data.complaint_description} onChange={(e: any) => setData('complaint_description', e.target.value)} required />
                                    {errors.complaint_description && <p className="text-[10px] text-red-500 mt-1">{errors.complaint_description}</p>}
                                </div>
                                <div>
                                    <TextAreaGroup label="Settlement Description" placeholder="Details of the resolution or agreement..." value={data.settlement_description} onChange={(e: any) => setData('settlement_description', e.target.value)} />
                                    {errors.settlement_description && <p className="text-[10px] text-red-500 mt-1">{errors.settlement_description}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
                                <div>
                                    <HistorySearch 
                                        value={data.linked_history_id}
                                        details={data.linked_history_details}
                                        onSelect={(history: any) => {
                                            setData(d => ({
                                                ...d,
                                                linked_history_id: history.uuid || history.cihi_uuid,
                                                linked_history_details: history
                                            }));
                                        }}
                                        onClear={() => {
                                            setData(d => ({
                                                ...d,
                                                linked_history_id: '',
                                                linked_history_details: null
                                            }));
                                        }}
                                        error={errors.linked_history_id}
                                    />
                                </div>
                                <div>
                                    <InputGroup label="Date of Settlement" type="date" value={data.date_of_settlement} onChange={(e: any) => setData('date_of_settlement', e.target.value)} required />
                                    {errors.date_of_settlement && <p className="text-[10px] text-red-500 mt-1">{errors.date_of_settlement}</p>}
                                </div>
                                <InputGroup label="Mediator / Lupon" placeholder="Official Name" value={data.mediator} onChange={(e: any) => setData('mediator', e.target.value)} />
                                <SelectGroup label="Case Classification" options={['Civil', 'Criminal', 'Administrative', 'Other']} value={data.case_classification} onChange={(e: any) => setData('case_classification', e.target.value)} />
                            </div>
                        </div>
                    </div>

                </div>

                <div className="p-5 bg-white dark:bg-[#0f172a] border-t border-neutral-200 dark:border-neutral-800 flex justify-end items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0">
                    <button onClick={handleSubmit} disabled={processing} className="flex items-center gap-2 px-8 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-amber-600/20 active:scale-95">
                        {processing ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />} 
                        {processing ? "Processing..." : "Confirm and Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- NEW COMPONENT FOR HISTORY SEARCH ---
function HistorySearch({ value, details, onSelect, onClear, error }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [recentHistories, setRecentHistories] = useState<any[]>([]);
    const [showRecent, setShowRecent] = useState(false);
    const [searchResult, setSearchResult] = useState<any>(null);

    useEffect(() => {
        fetch('/api/recent-histories')
            .then(res => res.json())
            .then(data => setRecentHistories(data))
            .catch(err => console.error('Failed to fetch recent histories', err));
    }, []);

    const handleSearch = () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        fetch(`/api/verify-history-link?id=${encodeURIComponent(searchQuery)}`)
            .then(res => res.json())
            .then(data => {
                if (data.found) {
                    setSearchResult(data);
                } else {
                    setSearchResult({ not_found: true });
                }
                setIsSearching(false);
            })
            .catch(() => setIsSearching(false));
    };

    return (
        <div className="space-y-1.5 relative">
            <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide flex justify-between">
                <span>Linked History Record</span>
                {recentHistories.length > 0 && !details && (
                    <button 
                        type="button" 
                        onClick={() => setShowRecent(!showRecent)}
                        className="text-amber-600 hover:underline normal-case font-bold"
                    >
                        {showRecent ? 'Close Recent' : 'Show Recent'}
                    </button>
                )}
            </label>

            {!details ? (
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <div className="relative flex-1 group">
                            <input
                                className="w-full text-xs p-2.5 pl-9 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                                placeholder="Search UUID or last 4 digits..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <div className="absolute left-3 top-2.5 text-neutral-400">
                                {isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                            </div>
                        </div>
                        <button 
                            type="button" 
                            onClick={handleSearch}
                            className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-bold hover:bg-neutral-200 transition-colors"
                        >
                            Verify
                        </button>
                    </div>

                    {showRecent && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-xl max-h-48 overflow-y-auto z-50 p-1">
                            <p className="p-2 text-[10px] font-bold uppercase text-neutral-400 border-b border-neutral-100 dark:border-neutral-700 mb-1">Recently Created Records</p>
                            {recentHistories.map(h => (
                                <button
                                    key={h.id}
                                    type="button"
                                    onClick={() => { onSelect(h); setShowRecent(false); }}
                                    className="w-full p-2 text-left hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded border-b border-neutral-50 dark:border-neutral-700/50 last:border-0"
                                >
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200">{h.title}</span>
                                        <span className="text-[10px] font-mono text-neutral-400">{h.uuid}</span>
                                    </div>
                                    <div className="text-[10px] text-neutral-500 mt-0.5">{h.name} • {h.type} • {h.status}</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {searchResult && !searchResult.not_found && (
                        <div className={`p-3 border rounded-lg animate-in slide-in-from-top-2 duration-200 ${searchResult.is_linked ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50'}`}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className={`text-xs font-bold ${searchResult.is_linked ? 'text-amber-800 dark:text-amber-300' : 'text-green-800 dark:text-green-300'}`}>
                                        {searchResult.is_linked ? 'Already Assigned' : 'Record Found!'}
                                    </p>
                                    <p className={`text-[11px] mt-0.5 ${searchResult.is_linked ? 'text-amber-700 dark:text-amber-400' : 'text-green-700 dark:text-green-400'}`}>{searchResult.title}</p>
                                    <p className={`text-[10px] opacity-80 ${searchResult.is_linked ? 'text-amber-600 dark:text-amber-500' : 'text-green-600 dark:text-green-500'}`}>{searchResult.uuid} • {searchResult.type}</p>
                                    {searchResult.is_linked && <p className="text-[9px] font-bold text-amber-600 uppercase mt-1">Cannot be re-assigned to another settlement</p>}
                                </div>
                                {!searchResult.is_linked && (
                                    <button 
                                        type="button"
                                        onClick={() => { onSelect(searchResult); setSearchResult(null); setSearchQuery(''); }}
                                        className="px-3 py-1.5 bg-green-600 text-white rounded text-[10px] font-bold uppercase tracking-wider"
                                    >
                                        Link This
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {searchResult?.not_found && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg text-xs text-red-700 dark:text-red-400 animate-in slide-in-from-top-2">
                            No record found matching "{searchQuery}". Please check the ID.
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-full text-amber-600 dark:text-amber-300">
                            <FileText className="size-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">Linked Record</p>
                            <p className="text-xs font-bold text-neutral-800 dark:text-neutral-100 mt-0.5">{details.title}</p>
                            <p className="text-[10px] text-neutral-500 font-mono mt-0.5">{details.uuid}</p>
                        </div>
                    </div>
                    <button 
                        type="button" 
                        onClick={() => { onClear(); setSearchResult(null); setSearchQuery(''); }}
                        className="p-1 text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>
            )}
            {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
        </div>
    );
}

// --- SUBCOMPONENTS ---

function ComplainantForm({ data, index, canRemove, onUpdate, onRemove, errors }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLocked, setIsLocked] = useState(!!data.citizen_id);

    useEffect(() => {
        if (searchQuery.trim().length > 1 && !isLocked) {
            setIsSearching(true);
            const timer = setTimeout(() => {
                fetch(`/api/citizen-search?q=${encodeURIComponent(searchQuery)}`)
                    .then(res => res.json())
                    .then(resData => { setResults(resData); setIsSearching(false); })
                    .catch(() => setIsSearching(false));
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setResults([]);
            setIsSearching(false);
        }
    }, [searchQuery, isLocked]);

    const parseName = (nameString: string) => {
        const parts = nameString.split(' ');
        const first = parts[0] || '';
        const last = parts.length > 1 ? parts[parts.length - 1] : '';
        const middle = parts.length > 2 ? parts.slice(1, -1).join(' ') : '';
        return { first, middle, last };
    };

    const handleSelect = (citizen: any) => {
        onUpdate({
            citizen_id: `CTZ-${citizen.id}`,
            first_name: citizen.first_name || parseName(citizen.name).first,
            middle_name: citizen.middle_name || parseName(citizen.name).middle,
            last_name: citizen.last_name || parseName(citizen.name).last
        });
        setIsLocked(true);
        setSearchQuery('');
        setShowResults(false);
    };

    const handleCancel = () => {
        onUpdate({ citizen_id: '', first_name: '', middle_name: '', last_name: '' });
        setIsLocked(false);
        setSearchQuery('');
    };

    return (
        <div className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm relative">
            {canRemove && (
                <button onClick={onRemove} type="button" className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 transition-colors p-1 bg-white dark:bg-neutral-800 rounded-md border border-transparent hover:border-red-200">
                    <Trash2 className="size-4" />
                </button>
            )}

            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <span className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/40 px-2 py-1 rounded w-fit">#{index + 1}</span>
                <div className="flex items-center gap-3 bg-white dark:bg-black/20 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 w-fit">
                    <span className="text-[10px] font-bold uppercase text-neutral-500">Has Barangay Record?</span>
                    <div className="flex gap-2">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" name={`cmp_hasRec_${data.id}`} className="accent-rose-600" checked={data.has_record} onChange={() => { 
                                onUpdate({ has_record: true, citizen_id: '', first_name: '', middle_name: '', last_name: '' }); 
                                setIsLocked(false); setSearchQuery(''); 
                            }} />
                            <span className="text-xs font-medium">Yes</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" name={`cmp_hasRec_${data.id}`} className="accent-rose-600" checked={!data.has_record} onChange={() => { 
                                onUpdate({ has_record: false, citizen_id: '', first_name: '', middle_name: '', last_name: '' }); 
                                setIsLocked(false); setSearchQuery(''); 
                            }} />
                            <span className="text-xs font-medium">No</span>
                        </label>
                    </div>
                </div>
            </div>

            {data.has_record && (
                <div className="mb-4">
                    {!isLocked && (
                        <div className="space-y-1.5 relative z-20">
                            <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">Search Complainant</label>
                            <div className="relative group">
                                <input
                                    className="w-full text-xs p-2.5 pl-9 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                                    placeholder="Search by Name..."
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
                                    onFocus={() => setShowResults(true)}
                                />
                                <div className="absolute left-3 top-2.5 text-neutral-400">
                                    {isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                                </div>
                            </div>
                            {showResults && searchQuery.length > 1 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-xl max-h-40 overflow-y-auto z-50">
                                    {results.length > 0 ? results.map((c) => (
                                        <button key={c.id} onClick={() => handleSelect(c)} type="button" className="w-full text-left px-4 py-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex justify-between border-b border-neutral-100 dark:border-neutral-700/50 text-xs">
                                            <span className="font-bold text-neutral-700 dark:text-neutral-200">{c.name}</span>
                                            <span className="text-[10px] text-neutral-400 font-mono">CTZ-{c.id}</span>
                                        </button>
                                    )) : <div className="p-3 text-center text-xs text-neutral-400 italic">No citizens found.</div>}
                                </div>
                            )}
                        </div>
                    )}
                    {isLocked && (
                        <div className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-full text-rose-600 dark:text-rose-300"><UserCheck className="size-4" /></div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-rose-500 dark:text-rose-400 tracking-wide">Selected</p>
                                    <p className="text-xs font-medium text-rose-900 dark:text-rose-100 font-mono">ID: {data.citizen_id}</p>
                                </div>
                            </div>
                            <button type="button" onClick={handleCancel} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-black/20 border border-neutral-200 hover:text-red-500 rounded text-[10px] font-bold uppercase text-neutral-500"><UserX className="size-3" /> Change</button>
                        </div>
                    )}
                </div>
            )}

            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${isLocked ? 'opacity-70' : ''}`}>
                <div>
                    <InputGroup label="First Name" value={data.first_name} onChange={(e: any) => onUpdate({ first_name: e.target.value })} readOnly={isLocked} className={isLocked ? 'bg-neutral-50/50 cursor-not-allowed' : ''} required />
                    {errors[`complainants.${index}.first_name`] && <p className="text-[10px] text-red-500 mt-1">{errors[`complainants.${index}.first_name`]}</p>}
                </div>
                <InputGroup label="Middle Name" value={data.middle_name} onChange={(e: any) => onUpdate({ middle_name: e.target.value })} readOnly={isLocked} className={isLocked ? 'bg-neutral-50/50 cursor-not-allowed' : ''} />
                <div>
                    <InputGroup label="Last Name" value={data.last_name} onChange={(e: any) => onUpdate({ last_name: e.target.value })} readOnly={isLocked} className={isLocked ? 'bg-neutral-50/50 cursor-not-allowed' : ''} required />
                    {errors[`complainants.${index}.last_name`] && <p className="text-[10px] text-red-500 mt-1">{errors[`complainants.${index}.last_name`]}</p>}
                </div>
            </div>
        </div>
    );
}

function SubjectForm({ data, index, canRemove, onUpdate, onRemove, errors }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLocked, setIsLocked] = useState(!!data.citizen_id);

    useEffect(() => {
        if (searchQuery.trim().length > 1 && !isLocked) {
            setIsSearching(true);
            const timer = setTimeout(() => {
                fetch(`/api/citizen-search?q=${encodeURIComponent(searchQuery)}`)
                    .then(res => res.json())
                    .then(resData => { setResults(resData); setIsSearching(false); })
                    .catch(() => setIsSearching(false));
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setResults([]);
            setIsSearching(false);
        }
    }, [searchQuery, isLocked]);

    const parseName = (nameString: string) => {
        const parts = nameString.split(' ');
        const first = parts[0] || '';
        const last = parts.length > 1 ? parts[parts.length - 1] : '';
        const middle = parts.length > 2 ? parts.slice(1, -1).join(' ') : '';
        return { first, middle, last };
    };

    const handleSelect = (citizen: any) => {
        onUpdate({
            citizen_id: `CTZ-${citizen.id}`,
            first_name: citizen.first_name || parseName(citizen.name).first,
            middle_name: citizen.middle_name || parseName(citizen.name).middle,
            last_name: citizen.last_name || parseName(citizen.name).last
        });
        setIsLocked(true);
        setSearchQuery('');
        setShowResults(false);
    };

    const handleCancel = () => {
        onUpdate({ citizen_id: '', first_name: '', middle_name: '', last_name: '' });
        setIsLocked(false);
        setSearchQuery('');
    };

    return (
        <div className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm relative">
            {canRemove && (
                <button onClick={onRemove} type="button" className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 transition-colors p-1 bg-white dark:bg-neutral-800 rounded-md border border-transparent hover:border-red-200">
                    <Trash2 className="size-4" />
                </button>
            )}

            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <span className="text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/40 px-2 py-1 rounded w-fit">#{index + 1}</span>
                <div className="flex items-center gap-3 bg-white dark:bg-black/20 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 w-fit">
                    <span className="text-[10px] font-bold uppercase text-neutral-500">Has Barangay Record? (Optional)</span>
                    <div className="flex gap-2">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" name={`sub_hasRec_${data.id}`} className="accent-amber-600" checked={data.has_record} onChange={() => { 
                                onUpdate({ has_record: true, citizen_id: '', first_name: '', middle_name: '', last_name: '' }); 
                                setIsLocked(false); setSearchQuery(''); 
                            }} />
                            <span className="text-xs font-medium">Yes</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" name={`sub_hasRec_${data.id}`} className="accent-amber-600" checked={!data.has_record} onChange={() => { 
                                onUpdate({ has_record: false, citizen_id: '', first_name: '', middle_name: '', last_name: '' }); 
                                setIsLocked(false); setSearchQuery(''); 
                            }} />
                            <span className="text-xs font-medium">No</span>
                        </label>
                    </div>
                </div>
            </div>

            {data.has_record && (
                <div className="mb-4">
                    {!isLocked && (
                        <div className="space-y-1.5 relative z-20">
                            <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">Search Subject</label>
                            <div className="relative group">
                                <input
                                    className="w-full text-xs p-2.5 pl-9 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                                    placeholder="Search by Name..."
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
                                    onFocus={() => setShowResults(true)}
                                />
                                <div className="absolute left-3 top-2.5 text-neutral-400">
                                    {isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                                </div>
                            </div>
                            {showResults && searchQuery.length > 1 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-xl max-h-40 overflow-y-auto z-50">
                                    {results.length > 0 ? results.map((c) => (
                                        <button key={c.id} onClick={() => handleSelect(c)} type="button" className="w-full text-left px-4 py-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex justify-between border-b border-neutral-100 dark:border-neutral-700/50 text-xs">
                                            <span className="font-bold text-neutral-700 dark:text-neutral-200">{c.name}</span>
                                            <span className="text-[10px] text-neutral-400 font-mono">CTZ-{c.id}</span>
                                        </button>
                                    )) : <div className="p-3 text-center text-xs text-neutral-400 italic">No citizens found.</div>}
                                </div>
                            )}
                        </div>
                    )}
                    {isLocked && (
                        <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-full text-amber-600 dark:text-amber-300"><UserCheck className="size-4" /></div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-amber-500 dark:text-amber-400 tracking-wide">Selected</p>
                                    <p className="text-xs font-medium text-amber-900 dark:text-amber-100 font-mono">ID: {data.citizen_id}</p>
                                </div>
                            </div>
                            <button type="button" onClick={handleCancel} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-black/20 border border-neutral-200 hover:text-red-500 rounded text-[10px] font-bold uppercase text-neutral-500"><UserX className="size-3" /> Change</button>
                        </div>
                    )}
                </div>
            )}

            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${isLocked ? 'opacity-70' : ''}`}>
                <div>
                    <InputGroup label="First Name" value={data.first_name} onChange={(e: any) => onUpdate({ first_name: e.target.value })} readOnly={isLocked} className={isLocked ? 'bg-neutral-50/50 cursor-not-allowed' : ''} required />
                    {errors[`subjects.${index}.first_name`] && <p className="text-[10px] text-red-500 mt-1">{errors[`subjects.${index}.first_name`]}</p>}
                </div>
                <InputGroup label="Middle Name" value={data.middle_name} onChange={(e: any) => onUpdate({ middle_name: e.target.value })} readOnly={isLocked} className={isLocked ? 'bg-neutral-50/50 cursor-not-allowed' : ''} />
                <div>
                    <InputGroup label="Last Name" value={data.last_name} onChange={(e: any) => onUpdate({ last_name: e.target.value })} readOnly={isLocked} className={isLocked ? 'bg-neutral-50/50 cursor-not-allowed' : ''} required />
                    {errors[`subjects.${index}.last_name`] && <p className="text-[10px] text-red-500 mt-1">{errors[`subjects.${index}.last_name`]}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-sidebar-border/50">
                <SelectGroup label="Involvement Status" options={['Principal', 'Accomplice', 'Witness', 'Person of Interest']} value={data.involvement_status} onChange={(e: any) => onUpdate({ involvement_status: e.target.value })} />
                <div>
                    <SelectGroup label="Settlement Status" options={['Pending', 'Amicable Settlement', 'Escalated', 'Resolved', 'Dismissed']} value={data.settlement_status} onChange={(e: any) => onUpdate({ settlement_status: e.target.value })} required />
                    {errors[`subjects.${index}.settlement_status`] && <p className="text-[10px] text-red-500 mt-1">{errors[`subjects.${index}.settlement_status`]}</p>}
                </div>
            </div>
        </div>
    );
}

// --- SHARED UI COMPONENTS ---

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string; isIdField?: boolean; }
function InputGroup({ label, required, className, isIdField, ...props }: InputProps) {
    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative group">
                {isIdField && <div className="absolute left-3 top-2.5 text-neutral-500 font-mono text-xs font-bold pointer-events-none select-none">CTZ-</div>}
                <input className={`w-full text-xs p-2.5 ${isIdField ? 'pl-12 font-mono' : ''} rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all ${className}`} {...props} />
            </div>
        </div>
    );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { label?: string; }
function TextAreaGroup({ label, required, ...props }: TextAreaProps) {
    return (
        <div className="space-y-1.5 w-full h-full flex flex-col">
            {label && (
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <textarea className="w-full flex-1 min-h-[120px] text-xs p-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all resize-none" {...props}></textarea>
        </div>
    );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { label?: string; options: string[]; required?: boolean; }
function SelectGroup({ label, options, required, ...props }: SelectProps) {
    return (
        <div className="space-y-1.5 w-full">
            <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <select className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none appearance-none transition-all cursor-pointer hover:border-amber-300" {...props}>
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
