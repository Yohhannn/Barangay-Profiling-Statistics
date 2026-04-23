import React, { useState, useEffect } from 'react';
import { 
    X, Store, MapPin, Loader2, 
    AlertCircle, Users, BadgeCheck, FileText,
    Clock, UserCheck, CreditCard
} from 'lucide-react';
import axios from 'axios';

interface BusinessQuickViewProps {
    isOpen: boolean;
    onClose: () => void;
    businessUuid: string | null;
}

interface QuickViewData {
    id: number;
    uuid: string;
    businessName: string;
    businessType: string;
    status: string;
    address: string;
    sitio: string;
    description: string;
    isDti: boolean;
    dtiPhoto: string | null;
    owners: Array<{
        id: number;
        fullName: string;
        ctzUuid: string | null;
    }>;
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string | null;
    updatedBy: string | null;
}

export default function BusinessQuickView({ isOpen, onClose, businessUuid }: BusinessQuickViewProps) {
    const [data, setData] = useState<QuickViewData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && businessUuid) {
            fetchBusinessData();
        } else {
            // Reset state when closed
            if (!isOpen) {
                setData(null);
                setError(null);
            }
        }
    }, [isOpen, businessUuid]);

    const fetchBusinessData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/business-detail/${businessUuid}`);
            setData(response.data);
        } catch (err) {
            setError('Failed to fetch business information.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            case 'Inactive': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
            case 'Closed': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            case 'Suspended': return 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700';
            default: return 'bg-neutral-100 text-neutral-600 border-neutral-200';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="relative bg-white dark:bg-neutral-900 w-full max-w-xl rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Section with Gradient Background */}
                <div className="relative h-28 bg-gradient-to-r from-indigo-600 to-purple-700 dark:from-indigo-700 dark:to-purple-900 shrink-0">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors z-10"
                    >
                        <X className="size-5" />
                    </button>
                    
                    {/* Floating Avatar Placeholder */}
                    <div className="absolute -bottom-10 left-8 size-20 bg-white dark:bg-neutral-800 rounded-2xl border-4 border-white dark:border-neutral-900 shadow-xl flex items-center justify-center">
                        <Store className="size-10 text-indigo-300 dark:text-indigo-600" />
                    </div>
                </div>

                <div className="pt-12 pb-6 px-8 flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <Loader2 className="size-8 text-indigo-600 animate-spin" />
                            <p className="text-sm font-medium text-neutral-500">Retrieving business record...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <AlertCircle className="size-12 text-red-500 mb-4" />
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Fetch Error</h3>
                            <p className="text-sm text-neutral-500 max-w-xs">{error}</p>
                            <button 
                                onClick={fetchBusinessData}
                                className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold uppercase transition-all hover:bg-indigo-700 shadow-md"
                            >
                                Retry Connection
                            </button>
                        </div>
                    ) : data ? (
                        <div className="space-y-6">
                            {/* Identity Title */}
                            <div>
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                                    {data.businessName}
                                </h2>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800">
                                        {data.uuid}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusColor(data.status)}`}>
                                        {data.status}
                                    </span>
                                    {data.isDti && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400 flex items-center gap-1 uppercase tracking-wider">
                                            <BadgeCheck className="size-3" /> DTI Verified
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                {/* Details */}
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-neutral-500">
                                            <CreditCard className="size-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Business Type</p>
                                            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{data.businessType}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-neutral-500">
                                            <MapPin className="size-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Location</p>
                                            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{data.sitio}</p>
                                            <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">{data.address || 'No specific address'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-neutral-500">
                                            <FileText className="size-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Description</p>
                                            <p className="text-xs text-neutral-500 mt-1">{data.description || 'No description provided.'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Owners Section */}
                            <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                    <Users className="size-3.5" /> Ownership Team ({data.owners.length})
                                </h3>
                                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                                    {data.owners.map((owner, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800">
                                            <div className="flex items-center gap-2">
                                                <div className="size-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                                                    {owner.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">{owner.fullName}</p>
                                                    {owner.ctzUuid && (
                                                        <p className="text-[9px] font-mono text-neutral-400">Citizen: {owner.ctzUuid}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">{data.encodedBy}</span>
                                    </div>
                                </div>
                                {data.dateUpdated && (
                                    <div className="space-y-3 border-l border-neutral-200 dark:border-neutral-800 pl-4">
                                        <div className="flex justify-between">
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5"><Clock className="size-3" /> DATE UPDATED</span>
                                            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{data.dateUpdated}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5"><UserCheck className="size-3" /> UPDATED BY</span>
                                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">{data.updatedBy}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-xl text-xs font-bold uppercase transition-all"
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
