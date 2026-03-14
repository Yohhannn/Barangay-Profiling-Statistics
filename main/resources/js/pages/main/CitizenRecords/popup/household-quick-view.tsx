import React, { useState, useEffect } from 'react';
import { 
    X, Home, MapPin, Droplets, Users, 
    Calendar, User, Hash, AlertCircle, Info, ExternalLink,
    Clock, UserCheck
} from 'lucide-react';
import axios from 'axios';
import { Link } from '@inertiajs/react';
import CitizenQuickView from './citizen-quick-view';

interface HouseholdQuickViewProps {
    isOpen: boolean;
    onClose: () => void;
    householdUuid: string | null;
}

interface HouseholdDetail {
    id: number;
    uuid: string;
    houseNumber: string;
    sitio: string;
    address: string;
    waterType: string;
    toiletType: string;
    ownershipStatus: string;
    members: Array<{
        id: number;
        name: string;
        relationship: string;
        age: number | string;
        sex: string;
    }>;
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string;
    updatedBy: string;
    isDeleted: boolean;
}

export default function HouseholdQuickView({ isOpen, onClose, householdUuid }: HouseholdQuickViewProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [household, setHousehold] = useState<HouseholdDetail | null>(null);

    // nested citizen quick view
    const [citizenQuickViewOpen, setCitizenQuickViewOpen] = useState(false);
    const [selectedCitizenId, setSelectedCitizenId] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen && householdUuid) {
            setLoading(true);
            setError(null);
            
            axios.get(`/api/household-detail/${householdUuid}`)
                .then(res => {
                    setHousehold(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch household details:", err);
                    setError("Could not load household details.");
                    setLoading(false);
                });
        }
    }, [isOpen, householdUuid]);

    if (!isOpen) return null;

    const handleOpenCitizenQuickView = (id: number) => {
        setSelectedCitizenId(id);
        setCitizenQuickViewOpen(true);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="relative bg-white dark:bg-neutral-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
                style={{ maxHeight: '90vh' }}
            >
                {/* Header Section with Gradient Background */}
                <div className="relative h-32 bg-gradient-to-r from-orange-600 to-amber-700 dark:from-orange-700 dark:to-amber-900">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors z-10"
                    >
                        <X className="size-5" />
                    </button>
                    
                    {/* Floating Avatar Placeholder */}
                    <div className="absolute -bottom-10 left-8 size-24 bg-white dark:bg-neutral-800 rounded-2xl border-4 border-white dark:border-neutral-900 shadow-xl flex items-center justify-center">
                        <Home className="size-12 text-orange-300 dark:text-orange-600" />
                    </div>
                </div>

                {/* Body */}
                <div className="pt-12 pb-6 px-8 h-[75vh] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-12 space-y-4">
                            <div className="size-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                            <p className="text-sm text-neutral-500 font-medium">Retrieving household details...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-xl border border-red-200 dark:border-red-800 flex items-start gap-3">
                            <AlertCircle className="size-5 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-sm">Error Loading Data</h4>
                                <p className="text-xs mt-1">{error}</p>
                            </div>
                        </div>
                    ) : household ? (
                        <div className="space-y-6">
                            
                            {/* Identity Title */}
                            <div>
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                                    Household Data
                                </h2>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded border border-orange-100 dark:border-orange-800">
                                        {household.uuid}
                                    </span>
                                    <span className="text-xs font-medium text-neutral-500">
                                        House No. {household.houseNumber}
                                    </span>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                {/* Address details */}
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-neutral-500">
                                            <MapPin className="size-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Sitio / Location</p>
                                            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{household.sitio}</p>
                                            <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">{household.address}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Dwelling details */}
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-neutral-500">
                                            <Home className="size-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Dwelling Specs</p>
                                            <div className="flex flex-col gap-1.5 mt-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-neutral-500 min-w-[70px]">Ownership:</p>
                                                    <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{household.ownershipStatus}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-neutral-500 min-w-[70px]">Water:</p>
                                                    <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{household.waterType}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-neutral-500 min-w-[70px]">Toilet:</p>
                                                    <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{household.toiletType}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Members Section */}
                            <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                    <Users className="size-3.5" /> Household Members ({household.members.length})
                                </h3>
                                
                                {household.members.length > 0 ? (
                                    <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-neutral-50 dark:bg-neutral-800/80 text-[10px] sm:text-xs text-neutral-500 uppercase font-bold tracking-wider border-b border-neutral-100 dark:border-neutral-800">
                                                    <tr>
                                                        <th className="px-4 py-2 sm:py-3 font-semibold">Name</th>
                                                        <th className="px-4 py-2 sm:py-3 font-semibold">Rel.</th>
                                                        <th className="px-4 py-2 sm:py-3 font-semibold text-center">Age</th>
                                                        <th className="px-4 py-2 sm:py-3 font-semibold text-center">Sex</th>
                                                        <th className="px-4 py-2 sm:py-3 font-semibold text-center w-16">View</th>
                                                    </tr>
                                                </thead>
                                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                                {household.members.map((member, i) => (
                                                    <tr key={member.id} className={`${i % 2 === 0 ? 'bg-white dark:bg-neutral-900' : 'bg-neutral-50/50 dark:bg-neutral-800/20'} hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors`}>
                                                        <td className="px-4 py-3 sm:py-4 font-bold text-neutral-900 dark:text-neutral-100 truncate max-w-[120px] sm:max-w-none" title={member.name}>{member.name}</td>
                                                        <td className="px-4 py-3 sm:py-4 font-semibold text-neutral-600 dark:text-neutral-400">{member.relationship}</td>
                                                        <td className="px-4 py-3 sm:py-4 text-center font-medium text-neutral-600 dark:text-neutral-400">{member.age}</td>
                                                        <td className="px-4 py-3 sm:py-4 text-center font-medium text-neutral-600 dark:text-neutral-400">{member.sex}</td>
                                                        <td className="px-4 py-3 sm:py-4 text-center">
                                                            <button 
                                                                onClick={() => handleOpenCitizenQuickView(member.id)}
                                                                className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-800/50 transition-colors inline-flex items-center justify-center border border-orange-100 dark:border-orange-800"
                                                                title="View Citizen Profile"
                                                            >
                                                                <Info className="size-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 rounded-2xl border-2 border-dashed border-neutral-100 dark:border-neutral-800/50">
                                        <Users className="size-8 text-neutral-200 dark:text-neutral-800 mb-2" />
                                        <p className="text-xs text-neutral-400 italic font-medium">No members records discovered for this household.</p>
                                    </div>
                                )}
                            </div>

                            {/* Audit Trail */}
                            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800 space-y-3 text-[10px] font-mono shadow-sm mt-6">
                                <div className="flex justify-between border-b border-neutral-100 dark:border-neutral-700 pb-2">
                                    <span className="text-neutral-500 flex items-center gap-1.5"><Clock className="size-3" /> DATE ENCODED</span>
                                    <span className="text-neutral-900 dark:text-neutral-100">{household.dateEncoded}</span>
                                </div>
                                <div className="flex justify-between border-b border-neutral-100 dark:border-neutral-700 pb-2">
                                    <span className="text-neutral-500 flex items-center gap-1.5"><UserCheck className="size-3" /> ENCODED BY</span>
                                    <span className="text-neutral-900 dark:text-neutral-100 font-bold uppercase">{household.encodedBy}</span>
                                </div>
                                <div className="flex justify-between border-b border-neutral-100 dark:border-neutral-700 pb-2">
                                    <span className="text-neutral-500 flex items-center gap-1.5"><Clock className="size-3" /> DATE UPDATED</span>
                                    <span className="text-neutral-900 dark:text-neutral-100">{household.dateUpdated}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-500 flex items-center gap-1.5"><UserCheck className="size-3" /> UPDATED BY</span>
                                    <span className="text-neutral-900 dark:text-neutral-100 font-bold uppercase">{household.updatedBy}</span>
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
                                    href={`/citizen-panel/household-profile?search=${household.uuid}`}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold uppercase transition-all shadow-md hover:shadow-lg group"
                                >
                                    View Full Extensive Profile <ExternalLink className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </a>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Nested Modal for Citizen Quick View */}
            <CitizenQuickView 
                isOpen={citizenQuickViewOpen}
                onClose={() => setCitizenQuickViewOpen(false)}
                citizenId={selectedCitizenId}
            />
        </div>
    );
}


