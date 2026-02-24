import {
    X, CheckCircle, Home, MapPin, Droplets,
    FileText, Link as LinkIcon, Camera, Upload, Image as ImageIcon,
    Crosshair
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

interface HouseholdEditProps {
    isOpen: boolean;
    onClose: () => void;
    household: any | null;
}

export default function HouseholdEdit({ isOpen, onClose, household }: HouseholdEditProps) {
    const [showMap, setShowMap] = useState(false);
    const [sitioOptions, setSitioOptions] = useState<string[]>([]);

    // Inertia form handler
    const { data, setData, put, processing, errors, reset } = useForm({
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
        coordinates: '',
    });

    useEffect(() => {
        if (isOpen) {
            fetch('/api/sitio-list')
                .then(res => res.json())
                .then(data => {
                    const names = data.map((s: any) => s.sitio_name);
                    const uniqueNames = [...new Set(names)] as string[];
                    setSitioOptions(uniqueNames.sort());
                })
                .catch(err => console.error("Failed to fetch sitios", err));
        }
    }, [isOpen]);

    // Populate form data when household prop changes
    useEffect(() => {
        if (household && isOpen) {
            setData({
                house_number: household.householdNumber !== 'N/A' ? household.householdNumber : '',
                home_address: household.homeAddress || '',
                sitio: household.sitio || '',
                ownership_status: household.ownershipStatus || '',
                home_link: household.homeLink !== 'N/A' ? household.homeLink : '',
                water_type: household.waterSource || '',
                toilet_type: household.toiletType || '',
                date_visited: household.dateOfVisit !== 'N/A' ? household.dateOfVisit : '',
                interviewer_name: household.interviewedBy !== 'N/A' ? household.interviewedBy : '',
                reviewer_name: household.reviewedBy !== 'N/A' ? household.reviewedBy : '',
                coordinates: household.coordinates !== 'N/A' ? household.coordinates : '',
            });
        }
    }, [household, isOpen]);

    if (!isOpen || !household) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        put(`/households/${household.id}`, {
            preserveScroll: true,
            onSuccess: (page) => {
                const flash = page.props.flash as Record<string, any>;
                const msg = flash?.success || 'Household Record Updated!';
                Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: msg as string,
                });
                
                router.reload({
                    only: ['households', 'filters'],
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
            {showMap && (
                <LocationPicker
                    onClose={() => setShowMap(false)}
                    onSelect={handleLocationSelect}
                    initialCoords={data.coordinates}
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
                                Edit Household Record
                            </h2>
                            <p className="text-[10px] text-orange-200 uppercase tracking-widest font-semibold mt-1">
                                Household Code: {household.householdId}
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

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

                            <div className="space-y-6">
                                <SectionLabel icon={<ImageIcon className="size-4" />} label="Household Image & Location" color="text-orange-600" />

                                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4 opacity-60">
                                    <p className="text-xs text-orange-600 dark:text-orange-400 font-bold mb-2">Note: Photo Upload currently disabled.</p>
                                    
                                    <div className="w-full aspect-video bg-neutral-100 dark:bg-black/20 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600 flex flex-col items-center justify-center text-neutral-400 gap-2 cursor-not-allowed group">
                                        <Camera className="size-8 transition-colors" />
                                        <span className="text-[10px] font-medium uppercase tracking-wide">Update Household Photo</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button disabled className="cursor-not-allowed flex items-center justify-center gap-2 bg-orange-600/50 text-white p-2.5 rounded-lg shadow-sm text-xs font-bold uppercase tracking-wide">
                                            <Camera className="size-3.5" /> Take Photo
                                        </button>
                                        <button disabled className="cursor-not-allowed flex items-center justify-center gap-2 bg-white/50 border border-neutral-300 dark:bg-neutral-800/50 dark:border-neutral-600 dark:text-white p-2.5 rounded-lg shadow-sm text-xs font-bold uppercase tracking-wide">
                                            <Upload className="size-3.5" /> Upload
                                        </button>
                                    </div>

                                    <div className="pt-4 border-t border-dashed border-neutral-200 dark:border-neutral-700 space-y-4">
                                        <div className="flex gap-2 items-end">
                                            <div className="flex-1">
                                                <InputGroup
                                                    label="Geographic Coordinates"
                                                    placeholder="Lat, Long (Pin on Map)"
                                                    value={data.coordinates}
                                                    readOnly
                                                    icon={<MapPin className="size-3.5 text-neutral-400" />}
                                                    error={errors.coordinates}
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

                                        <InputGroup
                                            label="Google Maps Embed Link"
                                            placeholder="Paste Google Maps Embed URL here..."
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

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

                    </div>

                    <div className="p-5 bg-white dark:bg-[#0f172a] border-t border-neutral-200 dark:border-neutral-800 flex justify-end items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0">
                        <button
                            onClick={handleSubmit}
                            disabled={processing}
                            className={`flex items-center gap-2 px-8 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-orange-600/20 active:scale-95 ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <CheckCircle className="size-4" /> {processing ? 'Updating...' : 'Update Household'}
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}

// --- Map Picker Component (Leaflet) ---
function LocationPicker({ onClose, onSelect, initialCoords }: { onClose: () => void, onSelect: (coords: string) => void, initialCoords?: string }) {
    let defaultPos: [number, number] = [10.3157, 123.8854]; // Cebu default
    if (initialCoords) {
        const parts = initialCoords.split(',');
        if (parts.length === 2 && !isNaN(parseFloat(parts[0])) && !isNaN(parseFloat(parts[1]))) {
            defaultPos = [parseFloat(parts[0]), parseFloat(parts[1])];
        }
    }

    const [position, setPosition] = useState<[number, number] | null>(initialCoords && initialCoords !== 'N/A' && initialCoords.includes(',') ? defaultPos : null);

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
                        center={defaultPos} 
                        zoom={15} 
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
