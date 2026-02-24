import {
    X, CheckCircle, Home, MapPin, Droplets,
    FileText, Link as LinkIcon, Camera, Upload, Image as ImageIcon,
    Crosshair, Search, Users, Trash2, Plus
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface HouseholdCreationProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HouseholdCreation({ isOpen, onClose }: HouseholdCreationProps) {
    const [showMap, setShowMap] = useState(false);
    const [sitioOptions, setSitioOptions] = useState<string[]>([]);

    // Inertia form handler
    const { data, setData, post, processing, errors, reset } = useForm({
        house_number: '',
        home_address: '',
        sitio: '',
        ownership_status: '',
        home_link: '',
        water_type: '',
        toilet_type: '',
        date_visited: '',
        interviewer_name: '',
        reviewer_name: '',
        
        // Unused fields as per request, but keeping state if needed
        coordinates: '',
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState<any[]>([]);

    useEffect(() => {
        if (searchQuery.trim().length > 1) {
            setIsSearching(true);
            const debounceTimer = setTimeout(() => {
                fetch(`/api/citizen-search?q=${encodeURIComponent(searchQuery)}`)
                    .then(res => res.json())
                    .then(data => {
                        // Filter out already selected members
                        const filtered = data.filter((item: any) => !selectedMembers.find(m => m.id === item.id));
                        setSearchResults(filtered);
                        setIsSearching(false);
                    })
                    .catch(err => {
                        console.error("Failed to search citizens", err);
                        setIsSearching(false);
                    });
            }, 300);
            return () => clearTimeout(debounceTimer);
        } else {
            setSearchResults([]);
            setIsSearching(false);
        }
    }, [searchQuery]); // Removed selectedMembers to avoid refetching while adding

    useEffect(() => {
        if (isOpen) {
            fetch('/api/sitio-list')
                .then(res => res.json())
                .then(data => {
                    const names = data.map((s: any) => s.sitio_name);
                    // Filter out duplicates using Set
                    const uniqueNames = [...new Set(names)] as string[];
                    setSitioOptions(uniqueNames.sort());
                })
                .catch(err => console.error("Failed to fetch sitios", err));
        }
    }, [isOpen]);

    // Handle resetting states when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setSearchResults([]);
            setSelectedMembers([]);
            reset();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const payload = {
            ...data,
            members: selectedMembers.map(m => m.id)
        };
        
        router.post('/households/store', payload, {
            preserveScroll: true,
            onSuccess: (page) => {
                // The backend flashes 'success' with the Household Code
                const flash = page.props.flash as Record<string, any>;
                const msg = flash?.success || 'Household Record Created!';
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: msg as string,
                });
                reset();
                
                // Force an Inertia reload on the current page to retrieve fresh database records
                router.reload({
                    only: ['households', 'citizens'], // Reloading relevant props
                    onFinish: () => {
                        onClose();
                    }
                });
            },
            onError: (err) => {
                console.error(err);
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Please check the form for errors.',
                });
            }
        });
    };

    const handleLocationSelect = (coords: string) => {
        setData('coordinates', coords);
        setShowMap(false);
    };

    return (
        <>
            {/* Map Picker Modal (Overlay) - Ignoring for now but keeping functionality */}
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
                                    <InputGroup 
                                        label="Home Number" 
                                        placeholder="Input House / Home Number" 
                                        value={data.house_number}
                                        onChange={e => setData('house_number', e.target.value)}
                                        error={errors.house_number}
                                    />
                                    <InputGroup 
                                        label="Home Address" 
                                        placeholder="Input House / Home Address" 
                                        required 
                                        value={data.home_address}
                                        onChange={e => setData('home_address', e.target.value)}
                                        error={errors.home_address}
                                    />

                                    <div className="pt-2">
                                        <SelectGroup
                                            label="Specific Sitio"
                                            required
                                            options={sitioOptions}
                                            value={data.sitio}
                                            onChange={e => setData('sitio', e.target.value)}
                                            error={errors.sitio}
                                        />
                                    </div>

                                    <SelectGroup
                                        label="Ownership Status"
                                        required
                                        options={['Owned', 'Rented', 'Leased', 'Informal Settler']}
                                        value={data.ownership_status}
                                        onChange={e => setData('ownership_status', e.target.value)}
                                        error={errors.ownership_status}
                                    />
                                </div>
                            </div>

                            {/* Right: Photo & Location */}
                            <div className="space-y-6">
                                <SectionLabel icon={<ImageIcon className="size-4" />} label="Household Image & Location" color="text-orange-600" />

                                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4 opacity-60">
                                    <p className="text-xs text-orange-600 dark:text-orange-400 font-bold mb-2">Note: Photo & GPS Upload currently disabled.</p>
                                    
                                    {/* Photo Upload Area */}
                                    <div className="w-full aspect-video bg-neutral-100 dark:bg-black/20 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600 flex flex-col items-center justify-center text-neutral-400 gap-2 cursor-not-allowed group">
                                        <Camera className="size-8 transition-colors" />
                                        <span className="text-[10px] font-medium uppercase tracking-wide">Add Household Photo</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button disabled className="cursor-not-allowed flex items-center justify-center gap-2 bg-orange-600/50 text-white p-2.5 rounded-lg shadow-sm text-xs font-bold uppercase tracking-wide">
                                            <Camera className="size-3.5" /> Take Photo
                                        </button>
                                        <button disabled className="cursor-not-allowed flex items-center justify-center gap-2 bg-white/50 border border-neutral-300 dark:bg-neutral-800/50 dark:border-neutral-600 dark:text-white p-2.5 rounded-lg shadow-sm text-xs font-bold uppercase tracking-wide">
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
                                                    value={data.coordinates}
                                                    readOnly
                                                    icon={<MapPin className="size-3.5 text-neutral-400" />}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowMap(true)}
                                                className="mb-[1px] p-2.5 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors"
                                                title="Open Map Picker"
                                            >
                                                <Crosshair className="size-4" />
                                            </button>
                                        </div>

                                        {/* 2. Google Home Link (Map Embed Link) */}
                                        <InputGroup
                                            label="Google Maps Embed Link"
                                            placeholder="Paste Google Maps Embed URL here... (e.g., https://www.google.com/maps/embed?...)"
                                            value={data.home_link}
                                            onChange={(e) => setData('home_link', e.target.value)}
                                            icon={<LinkIcon className="size-3.5 text-blue-500" />}
                                            error={errors.home_link}
                                            disabled={false}
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
                                        options={['Level 1 - Point Source', 'Level 2 - Communal Faucet', 'Level 3 - Individual Connection']}
                                        value={data.water_type}
                                        onChange={e => setData('water_type', e.target.value)}
                                        error={errors.water_type}
                                    />
                                    <SelectGroup
                                        label="Toilet Type"
                                        required
                                        options={['A - Pour/flush type connected to septic tank', 'A - Pour/flush toilet connected to Sewerage System', 'C - Ventilated Pit (VIP) latrine', 'D - Water-sealed toilet', 'E - G - Without toilet', 'E - Overhung latrine', 'F - Open pit latrine']}
                                        value={data.toilet_type}
                                        onChange={e => setData('toilet_type', e.target.value)}
                                        error={errors.toilet_type}
                                    />
                                </div>
                            </div>

                            {/* Right: Details */}
                            <div className="space-y-6">
                                <SectionLabel icon={<FileText className="size-4" />} label="Details" color="text-green-600" />

                                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <InputGroup 
                                                label="Date of Visit" 
                                                type="date" 
                                                value={data.date_visited}
                                                onChange={e => setData('date_visited', e.target.value)}
                                                error={errors.date_visited}
                                            />
                                        </div>
                                        <span className="text-[10px] text-neutral-400 italic mt-6">Date of Interview</span>
                                    </div>
                                    <InputGroup 
                                        label="Interviewed By" 
                                        placeholder="Full Name" 
                                        value={data.interviewer_name}
                                        onChange={e => setData('interviewer_name', e.target.value)}
                                        error={errors.interviewer_name}
                                    />
                                    <InputGroup 
                                        label="Reviewed By" 
                                        placeholder="Full Name" 
                                        value={data.reviewer_name}
                                        onChange={e => setData('reviewer_name', e.target.value)}
                                        error={errors.reviewer_name}
                                    />

                                    <p className="text-[10px] text-neutral-400 italic text-center mt-2 border-t border-dashed border-neutral-200 dark:border-neutral-700 pt-2">
                                        Note: Additional member details can be added in the Citizen Profile module.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: HOUSEHOLD MEMBERS */}
                        <div className="space-y-6">
                            <SectionLabel icon={<Users className="size-4" />} label="Household Members Assignment" color="text-purple-600" />

                            <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-6">
                                
                                {/* Search Bar */}
                                <div className="space-y-1.5 w-full">
                                    <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                                        Search Citizens
                                    </label>
                                    <div className="relative group">
                                        <input
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by name or Citizen ID (e.g. CTZ-0001)..."
                                            className="w-full text-xs p-2.5 pl-9 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                        />
                                        <div className="absolute left-3 top-2.5 text-neutral-400 group-focus-within:text-purple-500 transition-colors">
                                            <Search className="size-4" />
                                        </div>
                                    </div>
                                    
                                    {/* Inline Results List (Not a floating dropdown) */}
                                    {isSearching && searchResults.length === 0 && (
                                        <div className="w-full mt-2 p-3 text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                                            Searching...
                                        </div>
                                    )}
                                    {searchResults.length > 0 && (
                                        <div className="w-full mt-2 bg-neutral-50 dark:bg-neutral-800/30 rounded-lg border border-neutral-200 dark:border-neutral-700 p-2 space-y-2 max-h-64 overflow-y-auto">
                                            <p className="text-[10px] font-bold uppercase text-neutral-500 px-1 pt-1">Search Results</p>
                                            {searchResults.map((result) => (
                                                <div 
                                                    key={result.id}
                                                    className="p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm flex justify-between items-center transition-all"
                                                >
                                                    <div>
                                                        <span className="font-bold text-neutral-800 dark:text-neutral-200 text-xs">{result.name}</span>
                                                        <span className="block text-[10px] text-neutral-500 mt-0.5">
                                                            {result.uuid} • {result.sex || 'Unknown'} {result.age !== null ? `(${result.age} yrs)` : ''}
                                                        </span>
                                                    </div>
                                                    {result.has_household ? (
                                                        <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 px-3 py-1.5 rounded font-bold uppercase tracking-wider">
                                                            Assigned
                                                        </span>
                                                    ) : (
                                                        <button 
                                                            type="button" 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                if (result.has_household) return;
                                                                setSelectedMembers(prev => {
                                                                    if (prev.some(m => m.id === result.id)) return prev;
                                                                    return [...prev, result];
                                                                });
                                                                setSearchQuery('');
                                                                setSearchResults([]);
                                                            }}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-purple-600 text-white hover:bg-purple-700 active:scale-95 font-bold uppercase tracking-wider text-[10px] transition-all shadow-sm shadow-purple-600/20"
                                                        >
                                                            <Plus className="size-3" /> Add Member
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Selected Members List */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                                        Assigned Members ({selectedMembers.length})
                                    </label>
                                    
                                    {selectedMembers.length === 0 ? (
                                        <div className="p-4 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-lg text-center text-xs text-neutral-400">
                                            No members assigned yet. Search and add citizens above.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {selectedMembers.map(member => (
                                                <div key={member.id} className="flex justify-between items-center p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                                                    <div>
                                                        <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{member.name}</p>
                                                        <p className="text-[10px] text-neutral-500">{member.uuid}</p>
                                                    </div>
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            Swal.fire({
                                                                title: "Remove Member?",
                                                                text: `Are you sure you want to remove ${member.name} from this household?`,
                                                                icon: "warning",
                                                                showCancelButton: true,
                                                                confirmButtonColor: "#d33",
                                                                cancelButtonColor: "#9ca3af",
                                                                confirmButtonText: "Yes, remove",
                                                            }).then((result) => {
                                                                if (result.isConfirmed) {
                                                                    setSelectedMembers(prev => prev.filter(m => m.id !== member.id));
                                                                }
                                                            });
                                                        }}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>

                    </div>

                    {/* --- Footer --- */}
                    <div className="p-5 bg-white dark:bg-[#0f172a] border-t border-neutral-200 dark:border-neutral-800 flex justify-end items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0">
                        <button
                            onClick={handleSubmit}
                            disabled={processing}
                            className={`flex items-center gap-2 px-8 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-orange-600/20 active:scale-95 ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <CheckCircle className="size-4" /> {processing ? 'Saving...' : 'Confirm and Save'}
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}

// --- Map Picker Component (Leaflet) ---
function LocationPicker({ onClose, onSelect }: { onClose: () => void, onSelect: (coords: string) => void }) {
    const [position, setPosition] = useState<[number, number] | null>(null);

    function MapClickHandler() {
        useMapEvents({
            click(e) {
                setPosition([e.latlng.lat, e.latlng.lng]);
            },
        });
        return position ? <Marker position={position} /> : null;
    }

    const handleConfirm = () => {
        if (position) {
            onSelect(`${position[0].toFixed(6)}, ${position[1].toFixed(6)}`);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-[#1e293b] w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl border border-white/20 flex flex-col h-[75vh]">
                <div className="p-4 bg-orange-700 text-white flex justify-between items-center shrink-0">
                    <h3 className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
                        <MapPin className="size-4" /> Pick Location on Map
                    </h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full"><X className="size-5" /></button>
                </div>

                <div className="flex-1 bg-neutral-200 dark:bg-neutral-800 relative w-full h-full z-0">
                    <MapContainer 
                        center={[10.3157, 123.8854]} 
                        zoom={13} 
                        scrollWheelZoom={true} 
                        style={{ height: "100%", width: "100%", zIndex: 0 }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapClickHandler />
                    </MapContainer>
                </div>

                <div className="p-4 bg-white dark:bg-[#1e293b] flex flex-col md:flex-row items-center justify-between gap-4 border-t border-neutral-200 dark:border-neutral-700 shrink-0">
                    <div className="flex-1 text-xs text-neutral-500">
                        <p className="font-bold text-orange-600 dark:text-orange-400 mb-1">Instructions:</p>
                        <p>1. Scroll and zoom to find the household location.</p>
                        <p>2. Click on the map to drop a pin.</p>
                        <p>3. Once pinned, click Confirm PIN.</p>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Select a location to get coords"
                            className="flex-1 md:w-64 text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                            value={position ? `${position[0].toFixed(6)}, ${position[1].toFixed(6)}` : ''}
                            readOnly
                        />
                        <button
                            onClick={handleConfirm}
                            disabled={!position}
                            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                        >
                            Confirm PIN
                        </button>
                    </div>
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
    error?: string;
}

function InputGroup({ label, className, icon, required, error, ...props }: InputProps) {
    return (
        <div className={`space-y-1.5 w-full ${className}`}>
            {label && (
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative group">
                <input
                    className={`w-full text-xs p-2.5 rounded-lg border ${error ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'} bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all`}
                    {...props}
                />
                {icon && <div className="absolute right-3 top-2.5 text-neutral-400 group-focus-within:text-orange-500 transition-colors">{icon}</div>}
            </div>
            {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
        </div>
    );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: string[];
    required?: boolean;
    error?: string;
}

function SelectGroup({ label, options, required, error, ...props }: SelectProps) {
    return (
        <div className="space-y-1.5 w-full">
            <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <select
                    className={`w-full text-xs p-2.5 rounded-lg border ${error ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'} bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none appearance-none transition-all cursor-pointer hover:border-orange-300`}
                    {...props}
                >
                    <option value="">Select Option</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-neutral-400">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
            </div>
            {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
        </div>
    );
}
