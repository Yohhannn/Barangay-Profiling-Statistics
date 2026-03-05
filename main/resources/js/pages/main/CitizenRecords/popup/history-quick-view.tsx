import React, { useState, useEffect } from 'react';
import { 
    X, User, Loader2, 
    AlertCircle, Scale, FileText, Info,
    Calendar, UserCheck, ShieldAlert,
    Activity, Clock, Hash
} from 'lucide-react';
import axios from 'axios';

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
                className="relative bg-white dark:bg-neutral-900 w-full max-w-xl rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Section */}
                <div className="bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-700 dark:to-amber-900 p-6 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <Scale className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold uppercase tracking-tight">Record Quick View</h2>
                            <p className="text-[10px] text-white/70 font-mono uppercase tracking-widest leading-none mt-1">Details of Citizen History</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <Loader2 className="size-8 text-amber-600 animate-spin" />
                            <p className="text-sm font-medium text-neutral-500 italic">Syncing record data...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <AlertCircle className="size-12 text-red-500 mb-4" />
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Access Error</h3>
                            <p className="text-sm text-neutral-500 max-w-xs">{error}</p>
                            <button 
                                onClick={fetchHistoryData}
                                className="mt-6 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold uppercase transition-all hover:bg-amber-700 shadow-md"
                            >
                                Retry Connection
                            </button>
                        </div>
                    ) : data ? (
                        <div className="space-y-6">
                            {/* Primary Info */}
                            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800 flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                                        {data.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                                            data.type === 'Violation' ? 'bg-red-100 text-red-700 dark:bg-red-900/40' :
                                            data.type === 'Complaint' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40' :
                                            'bg-green-100 text-green-700 dark:bg-green-900/40'
                                        }`}>
                                            {data.type}
                                        </span>
                                        <span className="text-[10px] font-mono text-neutral-500">{data.uuid}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Status</span>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                                        data.status === 'Resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                                        data.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' :
                                        'bg-neutral-100 text-neutral-700 dark:bg-neutral-800'
                                    }`}>
                                        {data.status}
                                    </span>
                                </div>
                            </div>

                            {/* Party Involved */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                    <User className="size-3.5" /> Identity Involved
                                </h4>
                                <div className="p-4 border border-neutral-100 dark:border-neutral-800 rounded-xl space-y-3">
                                    <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase">
                                                {data.firstName} {data.middleName} {data.lastName}
                                            </span>
                                            <span className="text-[10px] text-neutral-500 mt-0.5 font-medium tracking-tight">
                                                Involvement: <b className="text-neutral-900 dark:text-neutral-200">{data.involvement || 'Direct'}</b>
                                            </span>
                                        </div>
                                        {data.citizen_id ? (
                                            <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded border border-blue-100 dark:border-blue-800 font-bold shadow-sm">
                                                {data.citizen_id}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-400 px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700">
                                                No Linked Citizen
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center text-[10px]">
                                        <div className="text-neutral-500 flex items-center gap-1">
                                            <Activity className="size-3" /> Classification:
                                        </div>
                                        <div className="font-bold text-neutral-700 dark:text-neutral-300">
                                            {data.classification || 'Public Official / Citizen'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                    <FileText className="size-3.5" /> Full Description
                                </h4>
                                <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/40 border border-neutral-100 dark:border-neutral-800 rounded-xl shadow-inner min-h-[100px]">
                                    <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap italic opacity-90">
                                        "{data.description}"
                                    </p>
                                </div>
                            </div>

                            {/* Audit Trail */}
                            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800 space-y-3 text-[10px] font-mono shadow-sm">
                                <div className="flex justify-between border-b border-neutral-100 dark:border-neutral-700 pb-2">
                                    <span className="text-neutral-500 flex items-center gap-1.5"><Clock className="size-3" /> DATE ENCODED</span>
                                    <span className="text-neutral-900 dark:text-neutral-100">{data.dateEncoded}</span>
                                </div>
                                <div className="flex justify-between border-b border-neutral-100 dark:border-neutral-700 pb-2">
                                    <span className="text-neutral-500 flex items-center gap-1.5"><UserCheck className="size-3" /> ENCODED BY</span>
                                    <span className="text-neutral-900 dark:text-neutral-100 font-bold uppercase">{data.encodedBy}</span>
                                </div>
                                <div className="flex justify-between border-b border-neutral-100 dark:border-neutral-700 pb-2">
                                    <span className="text-neutral-500 flex items-center gap-1.5"><Clock className="size-3" /> DATE UPDATED</span>
                                    <span className="text-neutral-900 dark:text-neutral-100">{data.dateUpdated}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-500 flex items-center gap-1.5"><UserCheck className="size-3" /> UPDATED BY</span>
                                    <span className="text-neutral-900 dark:text-neutral-100 font-bold uppercase">{data.updatedBy}</span>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button 
                                    onClick={onClose}
                                    className="px-8 py-2.5 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl text-xs font-bold uppercase transition-all shadow-sm active:scale-95"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
