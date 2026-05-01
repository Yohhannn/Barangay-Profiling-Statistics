import React, { useState, useEffect } from 'react';
import { 
    X, Building, MapPin, Loader2, 
    AlertCircle, FileText, Clock, UserCheck, Users
} from 'lucide-react';
import axios from 'axios';

interface InfrastructureQuickViewProps {
    isOpen: boolean;
    onClose: () => void;
    infrastructureId: number | null;
}

interface QuickViewData {
    id: number;
    infraId: string;
    name: string;
    type: string;
    address: string;
    sitio: string;
    description: string;
    ownerFullName: string;
    ctzId: number | null;
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string | null;
    updatedBy: string | null;
}

export default function InfrastructureQuickView({ isOpen, onClose, infrastructureId }: InfrastructureQuickViewProps) {
    const [data, setData] = useState<QuickViewData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && infrastructureId) {
            fetchInfrastructureData();
        } else {
            // Reset state when closed
            if (!isOpen) {
                setData(null);
                setError(null);
            }
        }
    }, [isOpen, infrastructureId]);

    const fetchInfrastructureData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/infrastructure-detail/${infrastructureId}`);
            setData(response.data);
        } catch (err) {
            setError('Failed to fetch infrastructure information.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="relative bg-white dark:bg-neutral-900 w-full max-w-xl rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Section with Gradient Background */}
                <div className="relative h-28 bg-gradient-to-r from-sky-600 to-blue-700 dark:from-sky-700 dark:to-blue-900 shrink-0">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors z-10"
                    >
                        <X className="size-5" />
                    </button>
                    
                    {/* Floating Avatar Placeholder */}
                    <div className="absolute -bottom-10 left-8 size-20 bg-white dark:bg-neutral-800 rounded-2xl border-4 border-white dark:border-neutral-900 shadow-xl flex items-center justify-center">
                        <Building className="size-10 text-sky-400 dark:text-sky-500" />
                    </div>
                </div>

                <div className="pt-12 pb-6 px-8 flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <Loader2 className="size-8 text-sky-600 animate-spin" />
                            <p className="text-sm font-medium text-neutral-500">Retrieving infrastructure record...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <AlertCircle className="size-12 text-red-500 mb-4" />
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Fetch Error</h3>
                            <p className="text-sm text-neutral-500 max-w-xs">{error}</p>
                            <button 
                                onClick={fetchInfrastructureData}
                                className="mt-6 px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-bold uppercase transition-all hover:bg-sky-700 shadow-md"
                            >
                                Retry Connection
                            </button>
                        </div>
                    ) : data ? (
                        <div className="space-y-6">
                            {/* Identity Title */}
                            <div>
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                                    {data.name}
                                </h2>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className="text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 px-2 py-0.5 rounded border border-sky-100 dark:border-sky-800">
                                        {data.infraId}
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider bg-neutral-100 text-neutral-600 border-neutral-200">
                                        {data.type}
                                    </span>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                {/* Details */}
                                <div className="space-y-4">
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
                                    <Users className="size-3.5" /> Ownership
                                </h3>
                                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                                    <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800">
                                        <div className="flex items-center gap-2">
                                            <div className="size-6 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 text-xs font-bold">
                                                {data.ownerFullName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">{data.ownerFullName}</p>
                                                {data.ctzId && (
                                                    <p className="text-[9px] font-mono text-neutral-400">Citizen Profile Linked</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
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
                                        <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-tight">{data.encodedBy}</span>
                                    </div>
                                </div>
                                <div className="space-y-3 border-l border-neutral-200 dark:border-neutral-800 pl-4">
                                    <div className="flex justify-between">
                                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5"><Clock className="size-3" /> DATE UPDATED</span>
                                        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{data.dateUpdated || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5"><UserCheck className="size-3" /> UPDATED BY</span>
                                        <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-tight">{data.updatedBy || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between pt-2">
                                <a
                                    href={`/institutions/infrastructures-profile?search=${data.infraId}`}
                                    className="px-6 py-2.5 bg-sky-50 text-sky-600 hover:bg-sky-100 dark:bg-sky-900/30 dark:text-sky-400 dark:hover:bg-sky-900/50 rounded-xl text-xs font-bold uppercase transition-all"
                                >
                                    View Full Details
                                </a>
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
