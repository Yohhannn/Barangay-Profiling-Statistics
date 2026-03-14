import React, { useState, useEffect } from 'react';
import { 
    X, User, Loader2, 
    AlertCircle, Scale, FileText, Info,
    Calendar, UserCheck, ShieldAlert,
    Activity, Clock, Hash, ExternalLink,
    FileClock, CheckCircle, AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { Link } from '@inertiajs/react';

interface HistoryQuickViewProps {
    isOpen: boolean;
    onClose: () => void;
    historyUuid: string | null;
    rawHistory?: {
        title: string;
        description: string;
        firstName: string;
        lastName: string;
        type: string;
        status?: string;
    } | null;
}

interface HistoryDetailData {
    uuid: string;
    title: string;
    description: string;
    type: string;
    status: string;
    firstName: string;
    middleName: string;
    lastName: string;
    involvement: string | null;
    classification: string | null;
    date: string;
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string;
    updatedBy: string;
    citizen_id: string | null;
}

export default function HistoryQuickView({ isOpen, onClose, historyUuid, rawHistory }: HistoryQuickViewProps) {
    const [data, setData] = useState<HistoryDetailData | (HistoryDetailData & { isRaw?: boolean }) | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (rawHistory) {
                setData({
                    uuid: 'N/A',
                    title: rawHistory.title,
                    description: rawHistory.description,
                    type: rawHistory.type,
                    status: rawHistory.status || 'Active',
                    firstName: rawHistory.firstName,
                    middleName: '',
                    lastName: rawHistory.lastName,
                    involvement: 'Direct',
                    classification: 'Manual Entry',
                    date: 'N/A',
                    dateEncoded: 'N/A',
                    encodedBy: 'N/A',
                    dateUpdated: 'N/A',
                    updatedBy: 'N/A',
                    citizen_id: null,
                    isRaw: true
                } as any);
            } else if (historyUuid) {
                fetchHistoryData();
            }
        } else {
            setData(null);
            setError(null);
        }
    }, [isOpen, historyUuid, rawHistory]);

    const fetchHistoryData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/history-detail/${historyUuid}`);
            setData(response.data);
        } catch (err) {
            setError('Failed to fetch record information.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="relative bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Section */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-900 p-6 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <FileClock className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold uppercase tracking-tight">History Quick View</h2>
                            <p className="text-[10px] text-white/70 font-mono uppercase tracking-widest leading-none mt-1">Details of Citizen Record</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <Loader2 className="size-8 text-purple-600 animate-spin" />
                            <p className="text-sm font-medium text-neutral-500 italic">Retrieving history records...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <AlertCircle className="size-12 text-red-500 mb-4" />
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Data Access Error</h3>
                            <p className="text-sm text-neutral-500 max-w-xs">{error}</p>
                            <button 
                                onClick={fetchHistoryData}
                                className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold uppercase transition-all hover:bg-purple-700 shadow-md"
                            >
                                Retry Connection
                            </button>
                        </div>
                    ) : data ? (
                        <div className="space-y-6">
                            {/* Primary Details Grid */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                                <div className="space-y-1">
                                    <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">History UUID</span>
                                    <div className="text-sm font-mono font-bold text-purple-600 dark:text-purple-400">{data.uuid}</div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Status / State</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                            data.status === 'Resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                                            data.status === 'Pending' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30' :
                                            'bg-neutral-100 text-neutral-700 dark:bg-neutral-800'
                                        }`}>
                                            {data.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="col-span-2 space-y-1 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                    <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Title / Case Name</span>
                                    <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase">{data.title}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Involved Party */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-bold text-purple-600 uppercase tracking-widest flex items-center gap-2">
                                        <User className="size-3.5" /> Identity Involved
                                    </h4>
                                    <div className="p-3 border border-neutral-100 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900/50">
                                        <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase">
                                            {data.firstName} {data.middleName} {data.lastName}
                                        </div>
                                        {data.citizen_id ? (
                                            <span className="text-[9px] font-mono text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-1 rounded block mt-1 w-fit font-bold">{data.citizen_id}</span>
                                        ) : (
                                            <span className="text-[9px] text-neutral-400 italic block mt-1">Manual Entry Detail</span>
                                        )}
                                    </div>
                                </div>

                                {/* Metadata Grid */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-bold text-purple-600 uppercase tracking-widest flex items-center gap-2">
                                        <Info className="size-3.5" /> Classification
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        <div className="p-2 border border-neutral-100 dark:border-neutral-800 rounded-lg bg-neutral-50/50 dark:bg-neutral-900/30">
                                            <div className="text-[9px] text-neutral-400 uppercase font-bold tracking-tight">Record Type</div>
                                            <div className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 uppercase">{data.type}</div>
                                        </div>
                                        <div className="p-2 border border-neutral-100 dark:border-neutral-800 rounded-lg bg-neutral-50/50 dark:bg-neutral-900/30">
                                            <div className="text-[9px] text-neutral-400 uppercase font-bold tracking-tight">Involvement</div>
                                            <div className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 uppercase">{data.involvement || 'Direct'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Full Description */}
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                    <FileText className="size-3.5" /> Narrative / Description
                                </h4>
                                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 rounded-xl text-xs leading-relaxed text-neutral-700 dark:text-neutral-300 font-mono italic shadow-inner">
                                    {data.description || 'No description provided for this record.'}
                                </div>
                            </div>

                            {/* Audit Trail */}
                            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800 grid grid-cols-2 gap-4 text-[10px] font-mono shadow-sm">
                                <div className="space-y-2">
                                    <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-700 pb-1">
                                        <span className="text-neutral-500 uppercase flex items-center gap-1.5"><Clock className="size-3" /> Encoded</span>
                                        <span className="text-neutral-900 dark:text-neutral-100">{data.dateEncoded}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500 uppercase flex items-center gap-1.5"><UserCheck className="size-3" /> By</span>
                                        <span className="text-neutral-900 dark:text-neutral-100 font-bold uppercase truncate max-w-[80px]">{data.encodedBy}</span>
                                    </div>
                                </div>
                                <div className="space-y-2 border-l border-neutral-200 dark:border-neutral-700 pl-4">
                                    <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-700 pb-1">
                                        <span className="text-neutral-500 uppercase flex items-center gap-1.5"><Clock className="size-3" /> Updated</span>
                                        <span className="text-neutral-900 dark:text-neutral-100">{data.dateUpdated}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500 uppercase flex items-center gap-1.5"><UserCheck className="size-3" /> By</span>
                                        <span className="text-neutral-900 dark:text-neutral-100 font-bold uppercase truncate max-w-[80px]">{data.updatedBy}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <button 
                                    onClick={onClose}
                                    className="px-6 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-xl text-xs font-bold uppercase transition-all shadow-sm active:scale-95"
                                >
                                    Dismiss View
                                </button>
                                <a 
                                    href={`/citizen-records/citizen-history?search=${data.uuid !== 'N/A' ? data.uuid : ''}`}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold uppercase transition-all shadow-md hover:shadow-lg group"
                                >
                                    View Full Details <ExternalLink className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </a>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
