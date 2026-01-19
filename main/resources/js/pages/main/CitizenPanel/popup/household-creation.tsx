import {
    X, CheckCircle, Home, MapPin, Droplets,
    FileText, Link as LinkIcon, Camera, Upload, Image as ImageIcon,
    Crosshair
} from 'lucide-react';
import { useState } from 'react';

interface HouseholdCreationProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HouseholdCreation({ isOpen, onClose }: HouseholdCreationProps) {
    const [showMap, setShowMap] = useState(false);
    const [coordinates, setCoordinates] = useState('');
    const [googleLink, setGoogleLink] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Household Form Submitted");
        onClose();
    };

    const handleLocationSelect = (coords: string) => {
        setCoordinates(coords);
        setShowMap(false);
    };

    return (
        <>
            {/* Map Picker Modal (Overlay) */}
            {showMap && (
                <LocationPicker
                    onClose={() => setShowMap(false)}
                    onSelect={handleLocationSelect}
                />
            )}

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-[#F8F9FC] dark:bg-[#0f172a] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-white/20">

                    {/* --- Header --- */}
                    <div className="relative bg-orange-700 text-white p-5 flex justify-between items-center overflow-hidden shrink-0">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <Home className="w-32 h-32" />
                        </div>

                        <div className="z-10">
                            <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
                                <Home className="size-5 text-orange-200" />
                                Register New Household
                            </h2>
                            <p className="text-[10px] text-orange-200 uppercase tracking-widest font-semibold mt-1">
                                Household Profiling Entry
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* --- Scrollable Content --- */}
                    <div className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-thin scrollbar-thumb-orange-200 dark:scrollbar-thumb-orange-900 space-y-8">

                        {/* SECTION 1: HOME INFORMATION & PHOTO */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* Left: Basic Info */}
                            <div className="space-y-6">
                                <SectionLabel icon={<Home className="size-4" />} label="Home Information" color="text-orange-600" />

                                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">
                                    <InputGroup label="Home Number" placeholder="Input House / Home Number" />
                                    <InputGroup label="Home Address" placeholder="Input House / Home Address" required />

                                    <div className="pt-2">
                                        <SelectGroup
                                            label="Specific Sitio"
                                            required
                                            options={['Ylaya', 'Suba-Basbas', 'Bankal', 'Kawayan', 'Crossing', 'Sangi', 'Agro-Macro', 'Ibabao', 'Mactan', 'Tandang Sora']}
                                        />
                                    </div>

                                    <SelectGroup
                                        label="Ownership Status"
                                        required
                                        options={['Owned', 'Rented', 'Shared', 'Caretaker', 'Informal Settler']}
                                    />
                                </div>
                            </div>

                            {/* Right: Photo & Location */}
                            <div className="space-y-6">
                                <SectionLabel icon={<ImageIcon className="size-4" />} label="Household Image & Location" color="text-orange-600" />

                                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">
                                    {/* Photo Upload Area */}
                                    <div className="w-full aspect-video bg-neutral-100 dark:bg-black/20 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600 flex flex-col items-center justify-center text-neutral-400 gap-2 hover:border-orange-400 transition-colors cursor-pointer group">
                                        <Camera className="size-8 group-hover:text-orange-500 transition-colors" />
                                        <span className="text-[10px] font-medium uppercase tracking-wide">Add Household Photo</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white p-2.5 rounded-lg transition-colors shadow-sm text-xs font-bold uppercase tracking-wide">
                                            <Camera className="size-3.5" /> Take Photo
                                        </button>
                                        <button className="flex items-center justify-center gap-2 bg-white border border-neutral-300 hover:bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-600 dark:text-white p-2.5 rounded-lg transition-colors shadow-sm text-xs font-bold uppercase tracking-wide">
                                            <Upload className="size-3.5" /> Upload
                                        </button>
                                    </div>

                                    {/* Location Fields */}
                                    <div className="pt-4 border-t border-dashed border-neutral-200 dark:border-neutral-700 space-y-4">
                                        {/* 1. Geographic Coordinates (from Map) */}
                                        <div className="flex gap-2 items-end">
                                            <div className="flex-1">
                                                <InputGroup
                                                    label="Geographic Coordinates"
                                                    placeholder="Lat, Long (Pin on Map)"
                                                    value={coordinates}
                                                    readOnly
                                                    icon={<MapPin className="size-3.5 text-orange-500" />}
                                                />
                                            </div>
                                            <button
                                                onClick={() => setShowMap(true)}
                                                className="mb-[1px] p-2.5 bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300 rounded-lg transition-colors border border-orange-200 dark:border-orange-800"
                                                title="Pin Location on Map"
                                            >
                                                <Crosshair className="size-4" />
                                            </button>
                                        </div>

                                        {/* 2. Google Home Link (Manual Paste) */}
                                        <InputGroup
                                            label="Google Maps Link"
                                            placeholder="Paste Google Maps URL here..."
                                            value={googleLink}
                                            onChange={(e) => setGoogleLink(e.target.value)}
                                            icon={<LinkIcon className="size-3.5 text-blue-500" />}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: ENVIRONMENTAL & DETAILS */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* Left: Environmental */}
                            <div className="space-y-6">
                                <SectionLabel icon={<Droplets className="size-4" />} label="Environmental Information" color="text-blue-500" />

                                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">
                                    <SelectGroup
                                        label="Type of Water Source"
                                        required
                                        options={['Deep Well', 'MCWD', 'Community Faucet', 'Shared Pump', 'Refilling Station', 'Spring/River']}
                                    />
                                    <SelectGroup
                                        label="Toilet Type"
                                        required
                                        options={['Water-sealed (Exclusive)', 'Water-sealed (Shared)', 'Flush', 'Antipolo', 'Open Pit', 'None']}
                                    />
                                </div>
                            </div>

                            {/* Right: Details */}
                            <div className="space-y-6">
                                <SectionLabel icon={<FileText className="size-4" />} label="Details" color="text-green-600" />

                                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <InputGroup label="Date of Visit" type="date" />
                                        </div>
                                        <span className="text-[10px] text-neutral-400 italic mt-6">Date of Interview</span>
                                    </div>
                                    <InputGroup label="Interviewed By" placeholder="Full Name" />
                                    <InputGroup label="Reviewed By" placeholder="Full Name" />

                                    <p className="text-[10px] text-neutral-400 italic text-center mt-2 border-t border-dashed border-neutral-200 dark:border-neutral-700 pt-2">
                                        Note: Additional member details can be added in the Citizen Profile module.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* --- Footer --- */}
                    <div className="p-5 bg-white dark:bg-[#0f172a] border-t border-neutral-200 dark:border-neutral-800 flex justify-end items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0">
                        <button
                            onClick={handleSubmit}
                            className="flex items-center gap-2 px-8 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-orange-600/20 active:scale-95"
                        >
                            <CheckCircle className="size-4" /> Confirm and Save
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}

// --- Map Picker Component (Simulated) ---
function LocationPicker({ onClose, onSelect }: { onClose: () => void, onSelect: (coords: string) => void }) {
    const handleMapClick = () => {
        const randomLat = (10.2 + Math.random() * 0.1).toFixed(6);
        const randomLng = (123.9 + Math.random() * 0.1).toFixed(6);
        onSelect(`${randomLat}, ${randomLng}`);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-[#1e293b] w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl border border-white/20 flex flex-col h-[600px]">
                <div className="p-4 bg-orange-700 text-white flex justify-between items-center shrink-0">
                    <h3 className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
                        <MapPin className="size-4" /> Pin Location
                    </h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full"><X className="size-5" /></button>
                </div>

                <div
                    className="flex-1 bg-neutral-200 dark:bg-neutral-800 relative cursor-crosshair group"
                    onClick={handleMapClick}
                >
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 pointer-events-none">
                        <MapPin className="size-12 mb-2 opacity-50" />
                        <p className="text-xs font-bold uppercase">Click anywhere to pin location</p>
                        <p className="text-[10px] opacity-70">(Map View Simulation)</p>
                    </div>

                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                         style={{
                             backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                             backgroundSize: '40px 40px'
                         }}
                    />
                </div>

                <div className="p-4 bg-white dark:bg-[#1e293b] text-center border-t border-neutral-200 dark:border-neutral-700 shrink-0">
                    <p className="text-xs text-neutral-500">
                        Use the map to pinpoint the exact household location.
                    </p>
                </div>
            </div>
        </div>
    );
}

// --- Helper Components ---

function SectionLabel({ icon, label, color = "text-neutral-700" }: { icon: React.ReactNode, label: string, color?: string }) {
    return (
        <div className={`flex items-center gap-2 pb-2 border-b-2 border-neutral-100 dark:border-neutral-800 ${color}`}>
            <div className="p-1.5 bg-white dark:bg-white/5 rounded shadow-sm border border-neutral-100 dark:border-neutral-700">
                {icon}
            </div>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${color} dark:text-neutral-200`}>
                {label}
            </h3>
        </div>
    );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React.ReactNode;
}

function InputGroup({ label, className, icon, required, ...props }: InputProps) {
    return (
        <div className={`space-y-1.5 w-full ${className}`}>
            {label && (
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative group">
                <input
                    className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                    {...props}
                />
                {icon && <div className="absolute right-3 top-2.5 text-neutral-400 group-focus-within:text-orange-500 transition-colors">{icon}</div>}
            </div>
        </div>
    );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: string[];
    required?: boolean;
}

function SelectGroup({ label, options, required, ...props }: SelectProps) {
    return (
        <div className="space-y-1.5 w-full">
            <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <select
                    className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none appearance-none transition-all cursor-pointer hover:border-orange-300"
                    {...props}
                >
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
