import React, { useState, useEffect } from 'react';
import { 
    X, Home, MapPin, Droplets, Users, 
    Calendar, User, Hash, AlertCircle, Info, ExternalLink 
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm shadow-2xl transition-all duration-300">
            <div 
                className="bg-white dark:bg-sidebar rounded-2xl w-full max-w-4xl flex flex-col shadow-2xl border border-sidebar-border/60 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                style={{ maxHeight: '90vh' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-sidebar-border/60 bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/10 dark:to-sidebar relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="size-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800/50 shadow-inner">
                            <Home className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 leading-tight">Household Information</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                                    {householdUuid}
                                </span>
                                {loading && <span className="text-[10px] text-neutral-500 animate-pulse">Loading...</span>}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 relative z-10">
                        {household && (
                            <Link
                                href={`/citizen-panel/household-profile?search=${household.uuid}`}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                            >
                                <ExternalLink className="size-3.5" /> Full Profile
                            </Link>
                        )}
                        <button 
                            onClick={onClose}
                            className="p-2 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                            <X className="size-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-neutral-50/30 dark:bg-[#0f0f11] flex-1">
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
                            
                            {/* Summary Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <SummaryBadge icon={<Hash />} label="House No." value={household.houseNumber} />
                                <SummaryBadge icon={<MapPin />} label="Sitio" value={household.sitio} />
                                <SummaryBadge icon={<Home />} label="Ownership" value={household.ownershipStatus} />
                                <SummaryBadge icon={<Droplets />} label="Water Source" value={household.waterType} />
                            </div>

                            {/* Details Container */}
                            <div className="bg-white dark:bg-sidebar rounded-xl border border-sidebar-border shadow-sm overflow-hidden">
                                
                                {/* Address Section */}
                                <div className="p-4 border-b border-sidebar-border bg-neutral-50/50 dark:bg-neutral-900/20">
                                    <div className="flex items-center gap-2 mb-3">
                                        <MapPin className="size-4 text-blue-500" />
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Location Details</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wide">Full Address</span>
                                            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 break-words">{household.address}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wide">Sanitation/Toilet</span>
                                            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{household.toiletType}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Members Section */}
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Users className="size-4 text-green-500" />
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                                            Household Members ({household.members.length})
                                        </h3>
                                    </div>
                                    
                                    {household.members.length > 0 ? (
                                        <div className="border border-sidebar-border rounded-lg overflow-hidden">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-neutral-50 dark:bg-neutral-800/80 text-[10px] sm:text-xs text-neutral-500 uppercase">
                                                    <tr>
                                                        <th className="px-4 py-2 sm:py-3 font-semibold">Name</th>
                                                        <th className="px-4 py-2 sm:py-3 font-semibold">Rel.</th>
                                                        <th className="px-4 py-2 sm:py-3 font-semibold text-center">Age</th>
                                                        <th className="px-4 py-2 sm:py-3 font-semibold text-center">Sex</th>
                                                        <th className="px-4 py-2 sm:py-3 font-semibold text-center w-16">View</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-sidebar-border">
                                                    {household.members.map(member => (
                                                        <tr key={member.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                                            <td className="px-4 py-2 sm:py-3 font-medium text-neutral-900 dark:text-neutral-100 truncate max-w-[120px] sm:max-w-none" title={member.name}>{member.name}</td>
                                                            <td className="px-4 py-2 sm:py-3 text-neutral-600 dark:text-neutral-400">{member.relationship}</td>
                                                            <td className="px-4 py-2 sm:py-3 text-center text-neutral-600 dark:text-neutral-400">{member.age}</td>
                                                            <td className="px-4 py-2 sm:py-3 text-center text-neutral-600 dark:text-neutral-400">{member.sex}</td>
                                                            <td className="px-4 py-2 sm:py-3 text-center">
                                                                <button 
                                                                    onClick={() => handleOpenCitizenQuickView(member.id)}
                                                                    className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors inline-flex items-center justify-center border border-blue-100 dark:border-blue-800"
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
                                        <div className="text-center p-4 text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-900/30 rounded-lg border border-dashed border-sidebar-border">
                                            No active members assigned to this household.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Footer / Meta Data */}
                {household && !loading && (
                    <div className="p-4 border-t border-sidebar-border/60 bg-neutral-50 dark:bg-neutral-900/50 flex flex-col md:flex-row justify-between text-[10px] text-neutral-400 font-mono gap-2 shrink-0">
                        <div className="space-y-1">
                            <span className="block font-medium">Encoded: {household.dateEncoded}</span>
                            <span className="block italic">by {household.encodedBy}</span>
                        </div>
                        <div className="space-y-1 md:text-right">
                            <span className="block font-medium">Updated: {household.dateUpdated}</span>
                            <span className="block italic">by {household.updatedBy}</span>
                        </div>
                    </div>
                )}
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

// Helper Components
function SummaryBadge({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="bg-white dark:bg-sidebar p-3 rounded-xl border border-sidebar-border shadow-sm flex flex-col justify-between gap-2">
            <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                <div className="[&>svg]:size-3.5">{icon}</div>
                <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </div>
            <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 line-clamp-1" title={value}>
                {value}
            </span>
        </div>
    );
}
