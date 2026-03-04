import {
    X, CheckCircle, Handshake, User,
    FileText, Search, Scale, UserCheck, UserX,
    Loader2, Plus, Trash2, ShieldAlert, Activity
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

interface SettlementHistoryEditProps {
    isOpen: boolean;
    onClose: () => void;
    history: any;
}

export default function SettlementHistoryEdit({ isOpen, onClose, history }: SettlementHistoryEditProps) {
    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        complainants: [] as any[],
        complaint_description: '',
        settlement_description: '',
        linked_history_ids: [] as string[],
        linked_histories_details: [] as any[],
        date_of_settlement: '',
        mediator: '',
    });

    useEffect(() => {
        if (history && isOpen) {
            setData({
                complainants: history.complainants?.length ? history.complainants.map((c: any) => ({
                    id: c.id?.toString() || Math.random().toString(),
                    has_record: !!c.citizen_id,
                    citizen_id: c.citizen_id || '',
                    first_name: c.first_name || '',
                    middle_name: c.middle_name || '',
                    last_name: c.last_name || '',
                    comp_description: c.comp_description || ''
                })) : [],
                complaint_description: history.complaint_description || '',
                settlement_description: history.description || '',
                linked_history_ids: history.linked_histories?.length ? history.linked_histories.map((h: any) => h.cihi_uuid) : [],
                linked_histories_details: history.linked_histories?.length ? history.linked_histories.map((h: any) => ({
                    uuid: h.cihi_uuid,
                    title: h.title,
                    type: h.type,
                    status: h.status
                })) : [],
                date_of_settlement: history.dateOfSettlement !== 'N/A' ? history.dateOfSettlement : '',
                mediator: history.mediator || '',
            });
        }
    }, [history, isOpen]);

    if (!isOpen || !history) return null;

    const handleClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    const addComplainant = () => {
        setData('complainants', [...data.complainants, { id: Math.random().toString(), has_record: false, citizen_id: '', first_name: '', middle_name: '', last_name: '', comp_description: '' }]);
    };

    const removeComplainant = (id: string) => {
        if (data.complainants.length <= 1) return;
        setData('complainants', data.complainants.filter(c => c.id !== id));
    };

    const updateComplainant = (id: string, updates: any) => {
        setData('complainants', data.complainants.map(c => c.id === id ? { ...c, ...updates } : c));
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        
        put(`/citizen-records/settlement-history/${history.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: 'Settlement record updated successfully.',
                });
                handleClose();
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
                        <Scale className="w-32 h-32" />
                    </div>

                    <div className="z-10">
                        <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
                            <Scale className="size-5 text-amber-200" />
                            Edit Settlement Record
                        </h2>
                        <p className="text-[10px] text-amber-200 uppercase tracking-widest font-semibold mt-1">
                            Updating Incident: #{history.id}
                        </p>
                    </div>

                    <button onClick={handleClose} className="z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white">
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
                            {data.complainants.map((comp: any, index: number) => (
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


                    {/* HISTORY INFORMATION SECTION */}
                    <div className="space-y-4 pt-4 border-t border-sidebar-border/50">
                        <div className="flex items-center justify-between pb-2 border-b-2 border-neutral-100 dark:border-neutral-800">
                            <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                                <Activity className="size-4" />
                                <h3 className="text-sm font-bold uppercase tracking-wider">History Information</h3>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4 relative">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-2">
                                <div>
                                    <TextAreaGroup label="Complaint Description" placeholder="What is the complaint about?" value={data.complaint_description} onChange={(e: any) => setData('complaint_description', e.target.value)} required />
                                    {errors.complaint_description && <p className="text-[10px] text-red-500 mt-1">{errors.complaint_description}</p>}
                                </div>
                                <div>
                                    <TextAreaGroup label="Settlement Description" placeholder="Details of the resolution..." value={data.settlement_description} onChange={(e: any) => setData('settlement_description', e.target.value)} />
                                    {errors.settlement_description && <p className="text-[10px] text-red-500 mt-1">{errors.settlement_description}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-neutral-100 dark:border-neutral-800/50">
                                <div>
                                    <InputGroup label="Date of Settlement" type="date" value={data.date_of_settlement} onChange={(e: any) => setData('date_of_settlement', e.target.value)} required />
                                    {errors.date_of_settlement && <p className="text-[10px] text-red-500 mt-1">{errors.date_of_settlement}</p>}
                                </div>
                                <InputGroup label="Mediator / Lupon" placeholder="Official Name" value={data.mediator} onChange={(e: any) => setData('mediator', e.target.value)} />
                            </div>

                            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/50">
                                <HistorySearch 
                                    selectedIds={data.linked_history_ids}
                                    selectedDetails={data.linked_histories_details}
                                    onSelect={(history: any) => {
                                        if (data.linked_history_ids.includes(history.uuid || history.cihi_uuid)) return;
                                        setData(d => ({
                                            ...d,
                                            linked_history_ids: [...d.linked_history_ids, history.uuid || history.cihi_uuid],
                                            linked_histories_details: [...d.linked_histories_details, history]
                                        }));
                                    }}
                                    onRemove={(uuid: string) => {
                                        setData(d => ({
                                            ...d,
                                            linked_history_ids: d.linked_history_ids.filter(id => id !== uuid),
                                            linked_histories_details: d.linked_histories_details.filter(h => (h.uuid || h.cihi_uuid) !== uuid)
                                        }));
                                    }}
                                    error={errors.linked_history_ids}
                                />
                            </div>
                        </div>
                    </div>

                </div>

                <div className="p-5 bg-white dark:bg-[#0f172a] border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center sm:flex-row shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0">
                    <span className="text-[10px] text-neutral-400 italic">This action will modify the existing record and update the audit trail logs.</span>
                    <button onClick={handleSubmit} disabled={processing} className="flex items-center gap-2 px-8 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-amber-600/20 active:scale-95">
                        {processing ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />} 
                        {processing ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- NEW COMPONENT FOR HISTORY SEARCH ---
function HistorySearch({ selectedIds, selectedDetails, onSelect, onRemove, error }: any) {
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

    useEffect(() => {
        if (searchQuery.trim().length > 1) {
            setIsSearching(true);
            const debounceTimer = setTimeout(() => {
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
            }, 500); 
            return () => clearTimeout(debounceTimer);
        } else {
            setSearchResult(null);
            setIsSearching(false);
        }
    }, [searchQuery]);

    return (
        <div className="space-y-4 relative">
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide flex justify-between">
                    <span>Search History Records to Link</span>
                    {recentHistories.length > 0 && (
                        <button 
                            type="button" 
                            onClick={() => setShowRecent(!showRecent)}
                            className="text-amber-600 hover:underline normal-case font-bold"
                        >
                            {showRecent ? 'Close Recent' : 'Show Recent'}
                        </button>
                    )}
                </label>

                <div className="space-y-2">
                    <div className="relative group">
                        <input
                            className="w-full text-xs p-2.5 pl-9 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                            placeholder="Type UUID or part of title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute left-3 top-2.5 text-neutral-400">
                            {isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                        </div>
                    </div>

                    {showRecent && (
                        <div className="absolute top-12 left-0 right-0 mt-1 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-xl max-h-48 overflow-y-auto z-50 p-1">
                            <p className="p-2 text-[10px] font-bold uppercase text-neutral-400 border-b border-neutral-100 dark:border-neutral-700 mb-1">Recently Created Records</p>
                            {recentHistories.map(h => {
                                const isAlreadyLinked = h.is_assigned;
                                const isAdded = selectedIds.includes(h.uuid || h.cihi_uuid);
                                
                                return (
                                    <button
                                        key={h.id}
                                        type="button"
                                        disabled={isAlreadyLinked || isAdded}
                                        onClick={() => { onSelect(h); setShowRecent(false); setSearchQuery(''); }}
                                        className={`w-full p-2 text-left rounded border-b border-neutral-50 dark:border-neutral-700/50 last:border-0 transition-colors ${isAlreadyLinked || isAdded ? 'opacity-50 cursor-not-allowed bg-neutral-50 dark:bg-neutral-900/40' : 'hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
                                    >
                                        <div className="flex justify-between items-start text-amber-600">
                                            <span className={`text-xs font-bold ${isAlreadyLinked ? 'text-neutral-400' : 'text-neutral-700 dark:text-neutral-200'}`}>{h.title}</span>
                                            {isAlreadyLinked ? (
                                                <span className="text-[9px] font-bold uppercase tracking-tight bg-neutral-100 text-neutral-500 px-1 rounded">Assigned</span>
                                            ) : (
                                                <span className="text-[10px] font-mono text-neutral-400">{h.uuid}</span>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-neutral-500 mt-0.5">{h.name} • {h.type} • {h.status}</div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {searchResult && !searchResult.not_found && (
                        <div className={`p-3 border rounded-lg animate-in slide-in-from-top-2 duration-200 ${searchResult.is_assigned || searchResult.is_linked ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50'}`}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className={`text-xs font-bold ${searchResult.is_assigned || searchResult.is_linked ? 'text-amber-800 dark:text-amber-300' : 'text-green-800 dark:text-green-300'}`}>
                                        {searchResult.is_assigned || searchResult.is_linked ? 'Already Assigned' : 'Record Found!'}
                                    </p>
                                    <p className={`text-[11px] mt-0.5 ${searchResult.is_linked ? 'text-amber-700 dark:text-amber-400' : 'text-green-700 dark:text-green-400'}`}>{searchResult.title}</p>
                                    <p className={`text-[10px] opacity-80 ${searchResult.is_linked ? 'text-amber-600 dark:text-amber-500' : 'text-green-600 dark:text-green-500'}`}>{searchResult.uuid || searchResult.cihi_uuid} • {searchResult.type}</p>
                                </div>
                                {!searchResult.is_assigned && !searchResult.is_linked && !selectedIds.includes(searchResult.uuid || searchResult.cihi_uuid) && (
                                    <button 
                                        type="button"
                                        onClick={() => { onSelect(searchResult); setSearchResult(null); setSearchQuery(''); }}
                                        className="px-3 py-1.5 bg-green-600 text-white rounded text-[10px] font-bold uppercase tracking-wider hover:bg-green-700 transition-colors"
                                    >
                                        Add to List
                                    </button>
                                )}
                                {selectedIds.includes(searchResult.uuid || searchResult.cihi_uuid) && (
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase italic">Already Added</span>
                                )}
                            </div>
                        </div>
                    )}

                    {searchResult?.not_found && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg text-xs text-red-700 dark:text-red-400 animate-in slide-in-from-top-2">
                            No record found matching "{searchQuery}".
                        </div>
                    )}
                </div>
                {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
            </div>

            {/* SELECTED LIST UI */}
            <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">Linked Records ({selectedDetails.length})</p>
                {selectedDetails.length === 0 ? (
                    <div className="p-4 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl text-center">
                        <p className="text-xs text-neutral-400 italic">No history records linked yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                        {selectedDetails.map((details: any) => (
                            <div key={details.uuid || details.cihi_uuid} className="p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl flex justify-between items-center group shadow-sm hover:border-amber-200 dark:hover:border-amber-900/50 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                                        <FileText className="size-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-neutral-800 dark:text-neutral-100 truncate max-w-[200px]">{details.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-neutral-500 font-mono">{details.uuid || details.cihi_uuid}</span>
                                            <span className="text-[9px] px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-500 rounded uppercase font-bold">{details.type}</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => onRemove(details.uuid || details.cihi_uuid)}
                                    className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
                                    title="Unlink Record"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
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
        onUpdate({ citizen_id: '', first_name: '', middle_name: '', last_name: '', comp_description: '' });
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
                    <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-tight">Has Barangay Record?</span>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer group">
                            <input 
                                type="radio" 
                                name={`edit_cmp_hasRec_${data.id}`} 
                                className="accent-rose-600 h-3.5 w-3.5" 
                                checked={data.has_record} 
                                onChange={() => { 
                                    onUpdate({ has_record: true, citizen_id: '', first_name: '', middle_name: '', last_name: '' }); 
                                    setIsLocked(false); setSearchQuery(''); 
                                }} 
                            />
                            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300 group-hover:text-rose-500 transition-colors">Yes</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer group">
                            <input 
                                type="radio" 
                                name={`edit_cmp_hasRec_${data.id}`} 
                                className="accent-rose-600 h-3.5 w-3.5" 
                                checked={!data.has_record} 
                                onChange={() => { 
                                    onUpdate({ has_record: false, citizen_id: '', first_name: '', middle_name: '', last_name: '' }); 
                                    setIsLocked(false); setSearchQuery(''); 
                                }} 
                            />
                            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300 group-hover:text-rose-500 transition-colors">No</span>
                        </label>
                    </div>
                </div>
            </div>

            {data.has_record && (
                <div className="mb-4">
                    {!isLocked && (
                        <div className="space-y-1.5 relative z-20 animate-in fade-in max-w-sm">
                            <div className="relative group">
                                <input
                                    className="w-full text-xs p-2.5 pl-9 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                                    placeholder="Search by ID or Name..."
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
                                    onFocus={() => setShowResults(true)}
                                />
                                <div className="absolute left-3 top-2.5 text-neutral-400 group-focus-within:text-rose-500 transition-colors">
                                    {isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                                </div>
                            </div>
                            {showResults && searchQuery.length > 1 && (
                                <div className="mt-2 flex flex-col gap-1 max-h-48 overflow-y-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm p-1">
                                    {results.length > 0 ? results.map((c) => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onMouseDown={(e) => { e.preventDefault(); handleSelect(c); }}
                                            className="w-full p-2 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/30 text-left flex justify-between items-center group transition-colors"
                                        >
                                            <div>
                                                <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{c.name}</div>
                                                <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                                                    {`CTZ-${c.id}`} • {c.sex || 'Unknown'} {c.age !== null ? `(${c.age} yrs)` : ''}
                                                </div>
                                            </div>
                                            <div className="p-1 rounded bg-rose-100 dark:bg-rose-900/40 opacity-0 group-hover:opacity-100 transition-opacity text-rose-600 dark:text-rose-400">
                                                <UserCheck className="size-4" />
                                            </div>
                                        </button>
                                    )) : <div className="p-3 text-center text-xs text-neutral-400 italic">No citizens found.</div>}
                                </div>
                            )}
                        </div>
                    )}
                    {isLocked && (
                        <div className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 rounded-lg animate-in fade-in zoom-in duration-300 mb-4 max-w-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-full text-rose-600 dark:text-rose-300">
                                    <UserCheck className="size-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-rose-500 dark:text-rose-400 tracking-wide">Complainant Linked</p>
                                    <p className="text-xs font-medium text-rose-900 dark:text-rose-100 flex items-center gap-1 mt-0.5">{data.first_name} {data.last_name}</p>
                                </div>
                            </div>
                            <button type="button" onClick={handleCancel} className="text-[10px] font-bold tracking-wider text-red-500 hover:text-red-600 bg-white dark:bg-black/20 border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 rounded shadow-sm">
                                Change
                            </button>
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

            <div className="mt-4">
                <TextAreaGroup 
                    label="Complainant Statement / Description" 
                    placeholder="Enter this specific person's statement or role in the complaint..." 
                    value={data.comp_description} 
                    onChange={(e: any) => onUpdate({ comp_description: e.target.value })} 
                    rows={2}
                    className="min-h-[80px]"
                />
                {errors[`complainants.${index}.comp_description`] && <p className="text-[10px] text-red-500 mt-1">{errors[`complainants.${index}.comp_description`]}</p>}
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
