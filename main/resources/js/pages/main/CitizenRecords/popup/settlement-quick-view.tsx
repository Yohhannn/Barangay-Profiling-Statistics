import React, { useState, useEffect } from 'react';
import { 
    X, User, Loader2, 
    AlertCircle, Scale, FileText, Info,
    Calendar, UserCheck, Handshake,
    ShieldAlert, Activity, Clock, Hash
} from 'lucide-react';
import axios from 'axios';

interface SettlementQuickViewProps {
    isOpen: boolean;
    onClose: () => void;
    settlementUuid: string | null;
}

interface SettlementDetailData {
    id: number;
    sett_uuid: string;
    complaint_description: string;
    settlement_description: string;
    date_of_settlement: string;
    mediator: string | null;
    date_encoded: string;
    encoded_by: string;
    date_updated: string;
    updated_by: string;
    complainants: Array<{
        name: string;
        citizen_id: string | null;
    }>;
    respondents: Array<{
        name: string;
        cihi_uuid: string;
    }>;
}

export default function SettlementQuickView({ isOpen, onClose, settlementUuid }: SettlementQuickViewProps) {
    const [data, setData] = useState<SettlementDetailData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && settlementUuid) {
            fetchSettlementData();
        } else {
            setData(null);
            setError(null);
        }
    }, [isOpen, settlementUuid]);

    const fetchSettlementData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/settlement-detail/${settlementUuid}`);
            setData(response.data);
        } catch (err) {
            setError('Failed to fetch settlement information.');
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
                <div className="bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-700 dark:to-amber-900 p-6 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <Handshake className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold uppercase tracking-tight">Settlement Quick View</h2>
                            <p className="text-[10px] text-white/70 font-mono uppercase tracking-widest leading-none mt-1">LUPONG TAGAPAMAYAPA RECORD</p>
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
                            <Loader2 className="size-8 text-amber-600 animate-spin" />
                            <p className="text-sm font-medium text-neutral-500 italic">Retrieving settlement records...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <AlertCircle className="size-12 text-red-500 mb-4" />
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Data Access Error</h3>
                            <p className="text-sm text-neutral-500 max-w-xs">{error}</p>
                            <button 
                                onClick={fetchSettlementData}
                                className="mt-6 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold uppercase transition-all hover:bg-amber-700 shadow-md"
                            >
                                Retry Connection
                            </button>
                        </div>
                    ) : data ? (
                        <div className="space-y-6">
                            {/* Primary Details */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                                <div className="space-y-1">
                                    <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Settlement UUID</span>
                                    <div className="text-sm font-mono font-bold text-amber-600 dark:text-amber-500">{data.sett_uuid}</div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Date of Settlement</span>
                                    <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{data.date_of_settlement}</div>
                                </div>
                                <div className="col-span-2 space-y-1 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                    <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Mediator / Lupon</span>
                                    <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{data.mediator || 'N/A'}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Complainants */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-2">
                                        <ShieldAlert className="size-3.5" /> Complainants
                                    </h4>
                                    <div className="space-y-2">
                                        {data.complainants.map((c, i) => (
                                            <div key={i} className="p-3 border border-neutral-100 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900/50">
                                                <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase">{c.name}</div>
                                                {c.citizen_id && (
                                                    <span className="text-[9px] font-mono text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-1 rounded block mt-1 w-fit">{c.citizen_id}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Respondents */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2">
                                        <User className="size-3.5" /> Respondents
                                    </h4>
                                    <div className="space-y-2">
                                        {data.respondents.map((r, i) => (
                                            <div key={i} className="p-3 border border-neutral-100 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900/50">
                                                <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase">{r.name}</div>
                                                <span className="text-[9px] font-mono text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1 rounded block mt-1 w-fit">{r.cihi_uuid}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Descriptions */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                        <FileText className="size-3.5" /> Incident / Complaint
                                    </h4>
                                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 rounded-xl text-xs leading-relaxed text-neutral-700 dark:text-neutral-300 font-mono italic">
                                        {data.complaint_description}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                        <Handshake className="size-3.5" /> Resolution
                                    </h4>
                                    <div className="p-3 bg-white dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-xl text-xs leading-relaxed text-neutral-700 dark:text-neutral-300 font-mono shadow-inner">
                                        {data.settlement_description || 'Pending resolution details.'}
                                    </div>
                                </div>
                            </div>

                            {/* Audit Trail */}
                            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800 grid grid-cols-2 gap-4 text-[10px] font-mono">
                                <div className="space-y-2">
                                    <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-700 pb-1">
                                        <span className="text-neutral-500 uppercase">Encoded</span>
                                        <span className="text-neutral-900 dark:text-neutral-100">{data.date_encoded}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500 uppercase">By</span>
                                        <span className="text-neutral-900 dark:text-neutral-100 font-bold uppercase truncate max-w-[80px]">{data.encoded_by}</span>
                                    </div>
                                </div>
                                <div className="space-y-2 border-l border-neutral-200 dark:border-neutral-700 pl-4">
                                    <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-700 pb-1">
                                        <span className="text-neutral-500 uppercase">Updated</span>
                                        <span className="text-neutral-900 dark:text-neutral-100">{data.date_updated}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500 uppercase">By</span>
                                        <span className="text-neutral-900 dark:text-neutral-100 font-bold uppercase truncate max-w-[80px]">{data.updated_by}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button 
                                    onClick={onClose}
                                    className="px-8 py-2.5 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl text-xs font-bold uppercase transition-all shadow-sm active:scale-95"
                                >
                                    Close View
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
