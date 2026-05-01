import React, { useState, useEffect } from 'react';
import { 
    X, ClipboardList, Loader2, 
    AlertCircle, FileText, Clock, User, Calendar
} from 'lucide-react';
import axios from 'axios';

interface ServicesQuickViewProps {
    isOpen: boolean;
    onClose: () => void;
    transactionId: number | null;
}

interface QuickViewData {
    id: number;
    transactionId: string;
    fullName: string;
    type: string;
    status: string;
    purpose: string;
    dateRequested: string;
    ctzId: number | null;
    ctzUuid: string | null;
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string | null;
    updatedBy: string | null;
}

export default function ServicesQuickView({ isOpen, onClose, transactionId }: ServicesQuickViewProps) {
    const [data, setData] = useState<QuickViewData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && transactionId) {
            fetchTransactionData();
        } else {
            if (!isOpen) {
                setData(null);
                setError(null);
            }
        }
    }, [isOpen, transactionId]);

    const fetchTransactionData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/transaction-detail/${transactionId}`);
            setData(response.data);
        } catch (err) {
            setError('Failed to fetch transaction information.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#F8F9FC] dark:bg-[#0f172a] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
                
                {/* Header */}
                <div className="relative bg-violet-600 text-white p-5 flex justify-between items-start overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <ClipboardList className="w-32 h-32" />
                    </div>
                    <div className="z-10 flex gap-4 items-start">
                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                            <ClipboardList className="size-8 text-violet-100" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-wide">
                                {loading ? 'Loading...' : data?.type || 'Transaction Profile'}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 bg-black/20 rounded font-mono text-xs font-medium border border-white/10">
                                    {data?.transactionId || 'N/A'}
                                </span>
                                {data?.status && (
                                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider ${
                                        data.status === 'Approved' ? 'bg-green-500/20 text-green-100 border border-green-400/30' :
                                        data.status === 'Pending' ? 'bg-orange-500/20 text-orange-100 border border-orange-400/30' :
                                        'bg-red-500/20 text-red-100 border border-red-400/30'
                                    }`}>
                                        {data.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 relative">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-violet-600 dark:text-violet-400">
                            <Loader2 className="size-10 animate-spin mb-4" />
                            <p className="text-sm font-medium tracking-wide">Fetching transaction details...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 text-red-500">
                            <AlertCircle className="size-10 mb-4 opacity-50" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    ) : data ? (
                        <div className="space-y-6">
                            
                            {/* Requestor Info */}
                            <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-sm">
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50">
                                    <User className="size-4 text-violet-500" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Requestor Information</h3>
                                </div>
                                <div className="p-4 grid grid-cols-2 gap-y-4 gap-x-6">
                                    <DetailItem label="Full Name" value={data.fullName} />
                                    <DetailItem label="Citizen UUID" value={data.ctzUuid || 'Not Linked to Citizen'} />
                                    <DetailItem label="Date Requested" value={data.dateRequested} />
                                </div>
                            </div>

                            {/* Transaction Purpose */}
                            <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-sm">
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50">
                                    <FileText className="size-4 text-violet-500" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Purpose / Description</h3>
                                </div>
                                <div className="p-5 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed bg-neutral-50/30 dark:bg-neutral-900/20">
                                    {data.purpose || <span className="text-neutral-400 italic">No description provided.</span>}
                                </div>
                            </div>

                        </div>
                    ) : null}
                </div>

                {/* Audit Footer */}
                {data && !loading && !error && (
                    <div className="bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800 p-4 shrink-0 flex flex-col sm:flex-row justify-between gap-4 text-[10px] text-neutral-500 font-mono">
                        <div className="flex items-start gap-2">
                            <Clock className="size-3.5 text-neutral-400 mt-0.5" />
                            <div>
                                <p className="font-bold text-neutral-600 dark:text-neutral-400">ENCODED</p>
                                <p>{data.dateEncoded}</p>
                                <p className="text-neutral-400">by {data.encodedBy}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <Clock className="size-3.5 text-neutral-400 mt-0.5" />
                            <div>
                                <p className="font-bold text-neutral-600 dark:text-neutral-400">UPDATED</p>
                                <p>{data.dateUpdated}</p>
                                <p className="text-neutral-400">by {data.updatedBy}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">{label}</span>
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{value}</span>
        </div>
    );
}
