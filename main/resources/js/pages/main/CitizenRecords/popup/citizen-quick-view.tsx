import React, { useState, useEffect } from 'react';
import { 
    X, User, MapPin, Phone, Mail, 
    Briefcase, Hash, ExternalLink, Loader2, 
    AlertCircle, Scale, Baby, HeartPulse, ChevronDown, FileText,
    Clock, UserCheck
} from 'lucide-react';
import axios from 'axios';

interface CitizenQuickViewProps {
    isOpen: boolean;
    onClose: () => void;
    citizenId: number | null;
}

interface QuickViewData {
    id: number;
    uuid: string;
    firstName: string;
    middleName: string;
    lastName: string;
    suffix?: string;
    sex: string;
    age: number;
    dob: string;
    civilStatus: string;
    sitio: string;
    pob: string;
    bloodType: string;
    religion: string;
    occupation: string;
    employmentStatus: string;
    isVoter: boolean;
    isIp: boolean;
    isGovWorker: boolean;
    healthClassification: string;
    philhealthId: string;
    householdId: string;
    contactNumbers: string[];
    email: string;
    fullAddress: string;
    histories: Array<{
        uuid: string;
        title: string;
        description: string;
        type: string;
        involvement: string | null;
        classification: string | null;
        date: string;
        status: string;
    }>;
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string;
    updatedBy: string;
}

export default function CitizenQuickView({ isOpen, onClose, citizenId }: CitizenQuickViewProps) {
    const [data, setData] = useState<QuickViewData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedHistories, setExpandedHistories] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isOpen && citizenId) {
            fetchCitizenData();
        } else {
            // Reset state when closed
            if (!isOpen) {
                setData(null);
                setError(null);
                setExpandedHistories(new Set());
            }
        }
    }, [isOpen, citizenId]);

    const toggleHistory = (uuid: string) => {
        setExpandedHistories(prev => {
            const next = new Set(prev);
            if (next.has(uuid)) next.delete(uuid);
            else next.add(uuid);
            return next;
        });
    };

    const fetchCitizenData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/citizen/${citizenId}`);
            setData(response.data);
        } catch (err) {
            setError('Failed to fetch citizen information.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="relative bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Section with Gradient Background */}
                <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-900">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors z-10"
                    >
                        <X className="size-5" />
                    </button>
                    
                    {/* Floating Avatar Placeholder */}
                    <div className="absolute -bottom-10 left-8 size-24 bg-white dark:bg-neutral-800 rounded-2xl border-4 border-white dark:border-neutral-900 shadow-xl flex items-center justify-center">
                        <User className="size-12 text-neutral-300 dark:text-neutral-600" />
                    </div>
                </div>

                <div className="pt-12 pb-6 px-8 h-[75vh] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <Loader2 className="size-8 text-blue-600 animate-spin" />
                            <p className="text-sm font-medium text-neutral-500">Retrieving citizen record...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <AlertCircle className="size-12 text-red-500 mb-4" />
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Encryption Error</h3>
                            <p className="text-sm text-neutral-500 max-w-xs">{error}</p>
                            <button 
                                onClick={fetchCitizenData}
                                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold uppercase transition-all hover:bg-blue-700 shadow-md"
                            >
                                Retry Connection
                            </button>
                        </div>
                    ) : data ? (
                        <div className="space-y-6">
                            {/* Identity Title */}
                            <div>
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                                    {data.firstName} {data.middleName} {data.lastName} {data.suffix}
                                </h2>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-800">
                                        {data.uuid}
                                    </span>
                                    <span className="text-xs font-medium text-neutral-500">
                                        {data.age} yrs • {data.sex} • {data.civilStatus}
                                    </span>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                {/* Address & Contact */}
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-neutral-500">
                                            <MapPin className="size-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Primary Location</p>
                                            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{data.sitio}</p>
                                            <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">{data.fullAddress}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-neutral-500">
                                            <Phone className="size-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Contact Details</p>
                                            <div className="space-y-0.5 mt-0.5">
                                                {data.contactNumbers.length > 0 ? (
                                                    data.contactNumbers.map((num, i) => (
                                                        <p key={i} className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{num}</p>
                                                    ))
                                                ) : (
                                                    <p className="text-sm font-semibold text-neutral-400 italic">No number listed</p>
                                                )}
                                                {data.email && data.email !== 'N/A' && (
                                                    <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1.5 pt-1">
                                                        <Mail className="size-3" /> {data.email}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Classifications & IDs */}
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-neutral-500">
                                            <Briefcase className="size-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Socio-Economic</p>
                                            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{data.occupation}</p>
                                            <p className="text-xs text-neutral-500 mt-0.5">{data.employmentStatus}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-neutral-500">
                                            <Hash className="size-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Identifiers</p>
                                            <div className="flex flex-col gap-1.5 mt-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-neutral-500 min-w-[70px]">PhilHealth:</p>
                                                    <p className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-1.5 rounded">{data.philhealthId}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-neutral-500 min-w-[70px]">Household:</p>
                                                    <p className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-1.5 rounded">{data.householdId}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Histories Section (FULL INFORMATION) */}
                            <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                    <Scale className="size-3.5" /> Extended History Profile
                                </h3>
                                <div className="space-y-3">
                                    {data.histories.length > 0 ? (
                                        data.histories.map((history, i) => (
                                            <div 
                                                key={i} 
                                                className={`group flex flex-col rounded-2xl border transition-all duration-300 ${
                                                    expandedHistories.has(history.uuid) 
                                                    ? 'bg-neutral-50 dark:bg-neutral-800/80 border-blue-200 dark:border-blue-900/50 shadow-sm' 
                                                    : 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 hover:border-blue-100 dark:hover:border-blue-900/30'
                                                }`}
                                            >
                                                {/* Card Header (Always Visible) */}
                                                <div 
                                                    className="flex items-center justify-between p-4 cursor-pointer"
                                                    onClick={() => toggleHistory(history.uuid)}
                                                >
                                                    <div className="flex flex-col min-w-0 pr-4">
                                                        <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">{history.title}</p>
                                                        <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-500">
                                                            <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-[9px]">{history.uuid}</span>
                                                            <span>•</span>
                                                            <span className="font-medium">{history.date}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <div className="flex flex-col items-end">
                                                            <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                                                                history.type === 'Violation' ? 'bg-red-100 text-red-700 dark:bg-red-900/40' :
                                                                history.type === 'Complaint' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40' :
                                                                'bg-green-100 text-green-700 dark:bg-green-900/40'
                                                            }`}>
                                                                {history.type}
                                                            </span>
                                                        </div>
                                                        <ChevronDown className={`size-4 text-neutral-400 transition-transform duration-300 ${expandedHistories.has(history.uuid) ? 'rotate-180' : ''}`} />
                                                    </div>
                                                </div>

                                                {/* Collapsible Content */}
                                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedHistories.has(history.uuid) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                                    <div className="px-4 pb-4 pt-2 border-t border-neutral-200/50 dark:border-neutral-700/50 space-y-4">
                                                        {/* Metadata Grid */}
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-1">
                                                                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Classification</p>
                                                                <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{history.classification || 'Unclassified'}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Involvement Type</p>
                                                                <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{history.involvement || 'Direct'}</p>
                                                            </div>
                                                        </div>

                                                        {/* Description */}
                                                        <div className="space-y-1.5">
                                                            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                                                                <FileText className="size-3" /> Incident Description
                                                            </p>
                                                            <div className="p-3 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl">
                                                                <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
                                                                    {history.description}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between pt-2">
                                                            <span className="text-[9px] font-bold text-neutral-400 uppercase">Process Status: <b>{history.status}</b></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 rounded-2xl border-2 border-dashed border-neutral-100 dark:border-neutral-800/50">
                                            <FileText className="size-8 text-neutral-200 dark:text-neutral-800 mb-2" />
                                            <p className="text-xs text-neutral-400 italic font-medium">No history records discovered for this identity.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Badges / Flags Bar */}
                            <div className="flex flex-wrap gap-2 py-4 px-5 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-inner">
                                <QuickBadge icon={<Scale className="size-3" />} label="Voter" active={data.isVoter} color="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" />
                                <QuickBadge icon={<Baby className="size-3" />} label="Indigenous" active={data.isIp} color="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" />
                                <QuickBadge icon={<Briefcase className="size-3" />} label="Gov. Employee" active={data.isGovWorker} color="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" />
                                <QuickBadge icon={<HeartPulse className="size-3" />} label={data.healthClassification} active={true} color="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" />
                            </div>

                            {/* Audit Trail Section */}
                            <div className="grid grid-cols-2 gap-4 py-4 px-6 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5"><Clock className="size-3" /> DATE ENCODED</span>
                                        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{data.dateEncoded}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5"><UserCheck className="size-3" /> ENCODED BY</span>
                                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight">{data.encodedBy}</span>
                                    </div>
                                </div>
                                <div className="space-y-3 border-l border-neutral-200 dark:border-neutral-800 pl-4">
                                    <div className="flex justify-between">
                                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5"><Clock className="size-3" /> DATE UPDATED</span>
                                        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{data.dateUpdated}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5"><UserCheck className="size-3" /> UPDATED BY</span>
                                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight">{data.updatedBy}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-xl text-xs font-bold uppercase transition-all"
                                >
                                    Dismiss
                                </button>
                                <a 
                                    href={`/citizen-panel/citizen-profile?search=${data.uuid}`}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase transition-all shadow-md hover:shadow-lg group"
                                >
                                    View Full Extensive Profile <ExternalLink className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </a>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function QuickBadge({ icon, label, active, color }: { icon: React.ReactNode, label: string, active: boolean, color: string }) {
    if (!active) return null;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${color}`}>
            {icon}
            {label}
        </span>
    );
}
