import {
    X, Camera, Plus, Trash2, ScanFace,
    User, MapPin, Briefcase, GraduationCap, Activity, Home,
    CreditCard, Heart, CheckCircle, Search, Loader2,
    Droplets, FileText, Link as LinkIcon, Upload, Image as ImageIcon,
    Crosshair, Users, Layers,
} from 'lucide-react';
import { useState, useEffect, useRef, FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import RegisterFace from './register-face';
import PhotoCapture from './photo-capture';
import Swal from 'sweetalert2';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

interface CombinedRegistrationProps {
    isOpen: boolean;
    onClose: () => void;
}

type ActiveTab = 'citizen' | 'household';

export default function CombinedRegistration({ isOpen, onClose }: CombinedRegistrationProps) {
    const [activeTab, setActiveTab] = useState<ActiveTab>('citizen');
    const [sitioOptions, setSitioOptions] = useState<string[]>([]);

    // ============================================================
    // CITIZEN STATE
    // ============================================================
    const { data: cd, setData: scd, post: cPost, processing: cProc, reset: cReset, errors: cErr, transform: cTrans } = useForm({
        first_name: '', middle_name: '', last_name: '', suffix: '', sex: 'Male',
        date_of_birth: '', place_of_birth: '', civil_status: '', religion: '', blood_type: '',
        contact_numbers: [''], email: '', personal_address: '', sitio: '',
        household_id: '', relationship_to_head: '', socio_economic_class: '', nhts_number: '',
        employment_status: '', occupation: '', is_gov: false,
        philhealth_id: '', philhealth_category: '', philhealth_membership: '',
        is_studying: false, school_name: '', current_level: '',
        elementary_name: '', highschool_name: '', senior_high_name: '', college_name: '',
        health_classification: '', is_voter: false, is_ip: false, is_deceased: false,
        date_of_death: '', cause_of_death: '',
        fp_method: '', fp_status: '', fp_start_date: '', fp_end_date: '',
        face_recog_uuid: '',
    });

    const [isFaceScanOpen, setIsFaceScanOpen] = useState(false);
    const [isCitizenPhotoOpen, setIsCitizenPhotoOpen] = useState(false);
    const [citizenPhotoPreview, setCitizenPhotoPreview] = useState<string | null>(null);
    const citizenPhotoInputRef = useRef<HTMLInputElement>(null);
    const citizenPhotoFileRef = useRef<File | null>(null);

    const [searchHHQuery, setSearchHHQuery] = useState('');
    const [householdInfo, setHouseholdInfo] = useState<{ members: { name: string; relationship: string }[]; status: string } | null>(null);
    const [isSearchingHH, setIsSearchingHH] = useState(false);

    // Household ID search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchHHQuery.length >= 3) {
                setIsSearchingHH(true);
                fetch(`/api/household-search?q=${searchHHQuery}`)
                    .then(res => res.json())
                    .then((data) => {
                        if (data && data.length > 0) {
                            const found = data.find((h: any) => h.hh_id.toLowerCase() === searchHHQuery.toLowerCase());
                            if (found) { setHouseholdInfo(found); scd('household_id', found.id.toString()); }
                            else { setHouseholdInfo(null); scd('household_id', ''); }
                        } else { setHouseholdInfo(null); scd('household_id', ''); }
                    })
                    .catch(() => { setHouseholdInfo(null); scd('household_id', ''); })
                    .finally(() => setIsSearchingHH(false));
            } else { setHouseholdInfo(null); scd('household_id', ''); }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchHHQuery]);

    useEffect(() => { if (!cd.household_id) scd('relationship_to_head', ''); }, [cd.household_id]);

    const updateContactNumber = (index: number, val: string) => {
        const nums = [...cd.contact_numbers]; nums[index] = val; scd('contact_numbers', nums);
    };
    const addContactNumber = () => scd('contact_numbers', [...cd.contact_numbers, '']);
    const removeContactNumber = (index: number) => scd('contact_numbers', cd.contact_numbers.filter((_, i) => i !== index));

    const handleCitizenSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (searchHHQuery && searchHHQuery !== 'HH-' && !householdInfo) {
            Swal.fire({ icon: 'error', title: 'Invalid Household ID', text: 'Please enter a valid existing Household ID.' });
            return;
        }
        cTrans((d) => ({ ...d, ...(citizenPhotoFileRef.current ? { photo: citizenPhotoFileRef.current } : {}) }));
        cPost('/citizens/store', {
            forceFormData: true,
            onSuccess: () => {
                Swal.fire({ icon: 'success', title: 'Success', text: 'Citizen Record Created!' });
                cReset(); setSearchHHQuery(''); setHouseholdInfo(null);
                setCitizenPhotoPreview(null); citizenPhotoFileRef.current = null;
                if (citizenPhotoInputRef.current) citizenPhotoInputRef.current.value = '';
                onClose();
            },
            onError: (err) => { console.error(err); Swal.fire({ icon: 'error', title: 'Error', text: 'Please check the form for errors.' }); }
        });
    };

    // ============================================================
    // HOUSEHOLD STATE
    // ============================================================
    const { data: hd, setData: shd, post: hPost, processing: hProc, reset: hReset, errors: hErr, transform: hTrans } = useForm({
        house_number: '', home_address: '', sitio: '', ownership_status: '', home_link: '',
        water_type: '', toilet_type: '', date_visited: '', interviewer_name: '', reviewer_name: '',
        coordinates: '',
    });

    const [showMap, setShowMap] = useState(false);
    const [isHHPhotoOpen, setIsHHPhotoOpen] = useState(false);
    const [hhPhotoPreview, setHHPhotoPreview] = useState<string | null>(null);
    const hhPhotoInputRef = useRef<HTMLInputElement>(null);
    const hhPhotoFileRef = useRef<File | null>(null);

    const [memberSearchQuery, setMemberSearchQuery] = useState('');
    const [memberSearchResults, setMemberSearchResults] = useState<any[]>([]);
    const [isSearchingMembers, setIsSearchingMembers] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState<any[]>([]);

    useEffect(() => {
        if (memberSearchQuery.trim().length > 1) {
            setIsSearchingMembers(true);
            const t = setTimeout(() => {
                fetch(`/api/citizen-search?q=${encodeURIComponent(memberSearchQuery)}`)
                    .then(res => res.json())
                    .then(data => {
                        setMemberSearchResults(data.filter((item: any) => !selectedMembers.find(m => m.id === item.id)));
                        setIsSearchingMembers(false);
                    })
                    .catch(() => setIsSearchingMembers(false));
            }, 300);
            return () => clearTimeout(t);
        } else { setMemberSearchResults([]); setIsSearchingMembers(false); }
    }, [memberSearchQuery]);

    const handleHouseholdSubmit = (e: FormEvent) => {
        e.preventDefault();
        hTrans((d) => ({
            ...d,
            members: selectedMembers.map(m => m.id),
            ...(hhPhotoFileRef.current ? { photo: hhPhotoFileRef.current } : {}),
        }));
        hPost('/households/store', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                const flash = (page.props as any).flash as Record<string, any>;
                Swal.fire({ icon: 'success', title: 'Success!', text: (flash?.success || 'Household Record Created!') as string });
                hReset(); setSelectedMembers([]); setMemberSearchQuery([]);
                setHHPhotoPreview(null); hhPhotoFileRef.current = null;
                onClose();
            },
            onError: (err) => { console.error(err); Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Please check the form for errors.' }); }
        });
    };

    // ============================================================
    // SHARED EFFECTS
    // ============================================================
    useEffect(() => {
        if (isOpen) {
            fetch('/api/sitio-list')
                .then(res => res.json())
                .then(data => setSitioOptions([...new Set(data.map((s: any) => s.sitio_name))] as string[]))
                .catch(err => console.error('Failed to load sitios', err));
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            cReset(); hReset();
            setSearchHHQuery(''); setHouseholdInfo(null);
            setCitizenPhotoPreview(null); citizenPhotoFileRef.current = null;
            setHHPhotoPreview(null); hhPhotoFileRef.current = null;
            setSelectedMembers([]); setMemberSearchQuery(''); setMemberSearchResults([]);
            setActiveTab('citizen');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const isCitizenRelationRequired = !!cd.household_id;

    return (
        <>
            <RegisterFace
                isOpen={isFaceScanOpen}
                onClose={() => setIsFaceScanOpen(false)}
                onCapture={(faceId) => scd('face_recog_uuid', faceId)}
                existingFaceId={cd.face_recog_uuid || undefined}
            />
            {isCitizenPhotoOpen && (
                <PhotoCapture
                    isOpen={true}
                    onClose={() => setIsCitizenPhotoOpen(false)}
                    onCapture={(file, previewUrl) => { citizenPhotoFileRef.current = file; setCitizenPhotoPreview(previewUrl); }}
                />
            )}
            {isHHPhotoOpen && (
                <PhotoCapture
                    isOpen={true}
                    onClose={() => setIsHHPhotoOpen(false)}
                    onCapture={(file, previewUrl) => { hhPhotoFileRef.current = file; setHHPhotoPreview(previewUrl); }}
                />
            )}
            {showMap && (
                <LocationPicker
                    onClose={() => setShowMap(false)}
                    onSelect={(coords) => { shd('coordinates', coords); setShowMap(false); }}
                />
            )}

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-[#F8F9FC] dark:bg-[#0f172a] w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-white/20">

                    {/* ---- Header with Tab Switcher ---- */}
                    <div className={`relative text-white p-5 flex items-center gap-4 overflow-hidden shrink-0 transition-colors duration-300 ${activeTab === 'citizen' ? 'bg-[#1e1b4b]' : 'bg-orange-700'}`}>
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            {activeTab === 'citizen' ? <User className="w-32 h-32" /> : <Home className="w-32 h-32" />}
                        </div>

                        <div className="z-10 flex-1">
                            <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
                                <Layers className="size-5 text-white/60" />
                                Combined Registration
                            </h2>
                            <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-1">
                                Quick Entry · New Record
                            </p>
                        </div>

                        {/* Tab Pills */}
                        <div className="z-10 flex bg-white/10 rounded-xl p-1 gap-1">
                            <button
                                type="button"
                                onClick={() => setActiveTab('citizen')}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all ${activeTab === 'citizen' ? 'bg-white text-indigo-700 shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                            >
                                <User className="size-3" /> Citizen
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('household')}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all ${activeTab === 'household' ? 'bg-white text-orange-700 shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                            >
                                <Home className="size-3" /> Household
                            </button>
                        </div>

                        <button onClick={onClose} className="z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white">
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* ========== CITIZEN TAB ========== */}
                    {activeTab === 'citizen' && (
                        <>
                            <form onSubmit={handleCitizenSubmit} className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-thin scrollbar-thumb-indigo-200 dark:scrollbar-thumb-indigo-900 space-y-8">

                                {/* SECTION 1: PERSONAL IDENTITY */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    <div className="lg:col-span-7 space-y-6">
                                        <SectionLabel icon={<User className="size-4" />} label="Personal Identity" />
                                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col sm:flex-row gap-6">
                                            <div className="flex flex-col gap-3 w-full sm:w-40 shrink-0">
                                                <div
                                                    onClick={() => citizenPhotoInputRef.current?.click()}
                                                    className="w-full aspect-[3/4] bg-neutral-100 dark:bg-black/20 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600 flex flex-col items-center justify-center text-neutral-400 gap-2 hover:border-indigo-400 transition-colors cursor-pointer group overflow-hidden relative"
                                                >
                                                    {citizenPhotoPreview ? (
                                                        <>
                                                            <img src={citizenPhotoPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <Camera className="size-6 text-white" />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Camera className="size-8 group-hover:text-indigo-500 transition-colors" />
                                                            <span className="text-[10px] font-medium uppercase tracking-wide">Click to Upload</span>
                                                        </>
                                                    )}
                                                </div>
                                                <input
                                                    ref={citizenPhotoInputRef}
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/gif,image/jpg"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        if (citizenPhotoPreview) URL.revokeObjectURL(citizenPhotoPreview);
                                                        citizenPhotoFileRef.current = file;
                                                        setCitizenPhotoPreview(URL.createObjectURL(file));
                                                    }}
                                                />
                                                <button type="button" onClick={() => setIsCitizenPhotoOpen(true)} className="w-full flex items-center justify-center gap-1.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border border-neutral-200 dark:border-neutral-600 dark:bg-neutral-800/50 dark:text-neutral-400 p-2 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all">
                                                    <Camera className="size-3.5" /> Take Photo
                                                </button>
                                                {cd.face_recog_uuid ? (
                                                    <div className="flex gap-1.5 mt-1">
                                                        <button type="button" onClick={() => setIsFaceScanOpen(true)} className="flex-1 flex items-center justify-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400 p-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all">
                                                            <CheckCircle className="size-3.5" /> Retake
                                                        </button>
                                                        <button type="button" onClick={() => scd('face_recog_uuid', '')} className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:border-red-800 dark:bg-red-900/20 rounded-lg transition-all" title="Remove face">
                                                            <X className="size-3.5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button type="button" onClick={() => setIsFaceScanOpen(true)} className="w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 dark:border-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400 p-2.5 rounded-lg transition-all text-[10px] font-bold uppercase tracking-wide shadow-sm mt-1">
                                                        <ScanFace className="size-4" /> Register Face Data
                                                    </button>
                                                )}
                                            </div>

                                            <div className="flex-1 grid grid-cols-2 gap-4">
                                                <InputGroup label="First Name" value={cd.first_name} placeholder="e.g. John" onChange={e => scd('first_name', e.target.value)} required error={cErr.first_name} className="col-span-2" />
                                                <InputGroup label="Middle Name" value={cd.middle_name} placeholder="e.g. Doe" onChange={e => scd('middle_name', e.target.value)} error={cErr.middle_name} />
                                                <InputGroup label="Suffix" value={cd.suffix} placeholder="e.g. Jr." onChange={e => scd('suffix', e.target.value)} error={cErr.suffix} />
                                                <InputGroup label="Last Name" value={cd.last_name} placeholder="e.g. Doe" onChange={e => scd('last_name', e.target.value)} required error={cErr.last_name} className="col-span-2" />

                                                <div className="col-span-2 pt-2 border-t border-dashed border-neutral-200 dark:border-neutral-700 mt-2">
                                                    <div className="flex gap-6">
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold uppercase text-neutral-500 mb-1.5 block">Sex <span className="text-red-500">*</span></label>
                                                            <div className="flex gap-4">
                                                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="c_sex" value="Male" checked={cd.sex === 'Male'} onChange={e => scd('sex', e.target.value)} className="accent-indigo-600" /><span className="text-xs text-neutral-600 dark:text-neutral-300">Male</span></label>
                                                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="c_sex" value="Female" checked={cd.sex === 'Female'} onChange={e => scd('sex', e.target.value)} className="accent-indigo-600" /><span className="text-xs text-neutral-600 dark:text-neutral-300">Female</span></label>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <InputGroup label="Date of Birth" type="date" value={cd.date_of_birth} onChange={e => scd('date_of_birth', e.target.value)} required error={cErr.date_of_birth} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <SelectGroup label="Religion" value={cd.religion} onChange={e => scd('religion', e.target.value)} options={['Roman Catholic', 'Islam', 'INC', 'Christian', 'Other']} error={cErr.religion} />
                                                <SelectGroup label="Blood Type" value={cd.blood_type} onChange={e => scd('blood_type', e.target.value)} options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']} error={cErr.blood_type} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-5 space-y-6">
                                        <SectionLabel icon={<MapPin className="size-4" />} label="Contact & Address" />
                                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">Contact Numbers</label>
                                                {cd.contact_numbers.map((num, idx) => (
                                                    <div key={idx} className="flex gap-2">
                                                        <input type="text" value={num} onChange={e => updateContactNumber(idx, e.target.value)} className="flex-1 w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="09XX-XXX-XXXX" />
                                                        {idx === 0 ? (
                                                            <button type="button" onClick={addContactNumber} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400"><Plus className="size-4" /></button>
                                                        ) : (
                                                            <button type="button" onClick={() => removeContactNumber(idx)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"><Trash2 className="size-4" /></button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <InputGroup label="Email Address" type="email" value={cd.email} onChange={e => scd('email', e.target.value)} placeholder="citizen@email.com" error={cErr.email} />
                                            <div className="pt-2">
                                                <InputGroup label="Personal Address" value={cd.personal_address} onChange={e => scd('personal_address', e.target.value)} placeholder="House No. / Street / Block" error={cErr.personal_address} />
                                            </div>
                                            <div className="pt-2">
                                                <SelectGroup label="Sitio / Zone" value={cd.sitio} onChange={e => scd('sitio', e.target.value)} options={sitioOptions} error={cErr.sitio} />
                                            </div>
                                            <div className="space-y-4 pt-2 border-t border-neutral-100 dark:border-neutral-700">
                                                <InputGroup label="Place of Birth" value={cd.place_of_birth} onChange={e => scd('place_of_birth', e.target.value)} placeholder="City / Municipality" error={cErr.place_of_birth} />
                                                <SelectGroup label="Civil Status" value={cd.civil_status} onChange={e => scd('civil_status', e.target.value)} options={['Single', 'Married', 'Widowed', 'Separated', 'Divorced']} error={cErr.civil_status} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 2: HOUSEHOLD & EMPLOYMENT */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <SectionLabel icon={<Home className="size-4" />} label="Household & Status" />
                                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-5">
                                            <div className="grid grid-cols-2 gap-4">
                                                <SelectGroup label="Socio-Economic Class" value={cd.socio_economic_class} onChange={e => scd('socio_economic_class', e.target.value)} options={['NHTS 4Ps', 'NHTS Non 4Ps', 'Non-NHTS']} className="col-span-2" />

                                                <div className="col-span-1 space-y-1.5">
                                                    <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">Household ID</label>
                                                    <div className="relative group">
                                                        <input
                                                            className={`w-full text-xs p-2.5 pl-9 rounded-lg border ${householdInfo ? 'border-green-500' : 'border-neutral-300'} dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-indigo-500/20 outline-none`}
                                                            placeholder="HH-1234"
                                                            value={searchHHQuery}
                                                            onChange={e => {
                                                                let val = e.target.value.toUpperCase();
                                                                if (!val.startsWith('HH-')) { val = val.startsWith('H') ? 'HH-' : 'HH-' + val.replace(/^HH-?/i, ''); }
                                                                const digits = val.substring(3).replace(/\D/g, '');
                                                                if (digits.length <= 4) setSearchHHQuery('HH-' + digits);
                                                            }}
                                                            onFocus={() => { if (!searchHHQuery) setSearchHHQuery('HH-'); }}
                                                        />
                                                        <div className="absolute left-2.5 top-2.5 text-neutral-400">
                                                            {isSearchingHH ? <Loader2 className="size-3.5 animate-spin" /> : householdInfo ? <CheckCircle className="size-3.5 text-green-500" /> : <Search className="size-3.5" />}
                                                        </div>
                                                    </div>
                                                </div>

                                                <SelectGroup label="Relation to Head" required={isCitizenRelationRequired} value={cd.relationship_to_head} onChange={e => scd('relationship_to_head', e.target.value)} options={['Daughter','Son','Head','Spouse','Father','Mother','Grandfather','Grandmother','Grandson','Granddaughter','Brother','Sister','Uncle','Aunt','Nephew','Niece','Cousin','Other']} error={cErr.relationship_to_head} />
                                            </div>

                                            {householdInfo && (
                                                <div className="bg-indigo-50/50 dark:bg-indigo-900/20 p-3 rounded border border-indigo-100 dark:border-indigo-800 text-xs">
                                                    <div className="font-bold text-indigo-700 dark:text-indigo-400 mb-2">Household found: {householdInfo.status}</div>
                                                    {householdInfo.members.map((m, i) => (
                                                        <div key={i} className="flex justify-between text-neutral-600 dark:text-neutral-300 py-0.5 border-b border-indigo-100 dark:border-indigo-800 last:border-0">
                                                            <span>{m.name}</span>
                                                            <span className="text-[10px] opacity-70">{m.relationship}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-lg border border-orange-100 dark:border-orange-900/30">
                                                <InputGroup label="NHTS / 4Ps Number" value={cd.nhts_number} onChange={e => scd('nhts_number', e.target.value)} placeholder="Enter ID if applicable" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <SectionLabel icon={<Briefcase className="size-4" />} label="Employment & Insurance" />
                                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-5">
                                            <SelectGroup label="Employment Status" value={cd.employment_status} onChange={e => scd('employment_status', e.target.value)} options={['Employed', 'Unemployed', 'Self-Employed', 'Student', 'Retired', 'Homemaker']} error={cErr.employment_status} />
                                            {['Employed', 'Self-Employed'].includes(cd.employment_status) && (
                                                <InputGroup label="Occupation" value={cd.occupation} onChange={e => scd('occupation', e.target.value)} placeholder="e.g. Teacher" />
                                            )}
                                            <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg border border-neutral-100 dark:border-neutral-700">
                                                <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">Government Employee?</span>
                                                <div className="flex gap-4">
                                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={cd.is_gov === true} onChange={() => scd('is_gov', true)} className="accent-indigo-600" /><span className="text-xs text-neutral-600 dark:text-neutral-300">Yes</span></label>
                                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={cd.is_gov === false} onChange={() => scd('is_gov', false)} className="accent-indigo-600" /><span className="text-xs text-neutral-600 dark:text-neutral-300">No</span></label>
                                                </div>
                                            </div>
                                            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-700 space-y-4">
                                                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400"><CreditCard className="size-4" /><span className="text-xs font-bold uppercase">PhilHealth</span></div>
                                                <InputGroup label="PhilHealth ID" value={cd.philhealth_id} onChange={e => scd('philhealth_id', e.target.value)} placeholder="00-000000000-0" />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <SelectGroup label="Category" value={cd.philhealth_category} onChange={e => scd('philhealth_category', e.target.value)} options={['Formal Economy Private', 'Formal Economy Government', 'Informal Economy', 'Indigent', 'Senior Citizen']} />
                                                    <SelectGroup label="Membership" value={cd.philhealth_membership} onChange={e => scd('philhealth_membership', e.target.value)} options={['Member', 'Dependent']} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 3: EDUCATION & HEALTH */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <SectionLabel icon={<GraduationCap className="size-4" />} label="Education" />
                                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-5">
                                            <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg border border-neutral-100 dark:border-neutral-700">
                                                <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">Currently Studying?</span>
                                                <div className="flex gap-4">
                                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={cd.is_studying === true} onChange={() => scd('is_studying', true)} className="accent-indigo-600" /><span className="text-xs text-neutral-600 dark:text-neutral-300">Yes</span></label>
                                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={cd.is_studying === false} onChange={() => scd('is_studying', false)} className="accent-indigo-600" /><span className="text-xs text-neutral-600 dark:text-neutral-300">No</span></label>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <SelectGroup label="Educational Level" value={cd.current_level} onChange={e => scd('current_level', e.target.value)} options={['College Graduate','College Undergraduate','Elementary Graduate','Elementary undergraduate','Junior High School Graduate','Junior High School Undergraduate','Senior High School Graduate','Senior High School Undergraduate','Kindergarten','No Formal Education','Postgraduate']} />
                                                {cd.is_studying && (
                                                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                                                        <InputGroup label="School Name" value={cd.school_name} onChange={e => scd('school_name', e.target.value)} placeholder="Current Institution" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-3 pt-2">
                                                <label className="text-xs font-bold text-neutral-500 uppercase">Educational History</label>
                                                <InputGroup label="Elementary" value={cd.elementary_name} onChange={e => scd('elementary_name', e.target.value)} placeholder="School Name" />
                                                <InputGroup label="High School" value={cd.highschool_name} onChange={e => scd('highschool_name', e.target.value)} placeholder="School Name" />
                                                <InputGroup label="Senior High" value={cd.senior_high_name} onChange={e => scd('senior_high_name', e.target.value)} placeholder="School Name" />
                                                <InputGroup label="College" value={cd.college_name} onChange={e => scd('college_name', e.target.value)} placeholder="School Name" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <SectionLabel icon={<Activity className="size-4" />} label="Vulnerability & Status" />
                                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-5">
                                            <SelectGroup label="Health Classification" value={cd.health_classification} onChange={e => scd('health_classification', e.target.value)} options={['Healthy','PWD','Hypertensive','Diabetic','Bedridden']} />
                                            <div className="space-y-3 bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg border border-neutral-100 dark:border-neutral-700">
                                                <div className="flex justify-between items-center"><span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Registered Voter?</span><div className="flex gap-3"><label className="cursor-pointer flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-300"><input type="radio" checked={cd.is_voter} onChange={() => scd('is_voter', true)} className="mr-1"/>Yes</label><label className="cursor-pointer flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-300"><input type="radio" checked={!cd.is_voter} onChange={() => scd('is_voter', false)} className="mr-1"/>No</label></div></div>
                                                <div className="flex justify-between items-center"><span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Indigenous People?</span><div className="flex gap-3"><label className="cursor-pointer flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-300"><input type="radio" checked={cd.is_ip} onChange={() => scd('is_ip', true)} className="mr-1"/>Yes</label><label className="cursor-pointer flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-300"><input type="radio" checked={!cd.is_ip} onChange={() => scd('is_ip', false)} className="mr-1"/>No</label></div></div>
                                                <div className="flex justify-between items-center"><span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Is Deceased?</span><div className="flex gap-3"><label className="cursor-pointer flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-300"><input type="radio" checked={cd.is_deceased} onChange={() => scd('is_deceased', true)} className="mr-1"/>Yes</label><label className="cursor-pointer flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-300"><input type="radio" checked={!cd.is_deceased} onChange={() => scd('is_deceased', false)} className="mr-1"/>No</label></div></div>
                                            </div>
                                            {cd.is_deceased && (
                                                <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg space-y-3">
                                                    <InputGroup label="Date of Death" type="date" value={cd.date_of_death} onChange={e => scd('date_of_death', e.target.value)} />
                                                    <InputGroup label="Cause of Death" value={cd.cause_of_death} onChange={e => scd('cause_of_death', e.target.value)} />
                                                </div>
                                            )}
                                            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-700 space-y-3">
                                                <div className="flex items-center gap-2 text-rose-500"><Heart className="size-4" /><span className="text-xs font-bold uppercase">Family Planning</span></div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <SelectGroup label="Method" value={cd.fp_method} onChange={e => scd('fp_method', e.target.value)} options={['Others','BTL','COC','Condom','DPT','Implant','Injectables','IUD','LAM','POP']} />
                                                    <SelectGroup label="Status" value={cd.fp_status} onChange={e => scd('fp_status', e.target.value)} options={['Changing Clinic','Changing Method','Current User','Dropout','New Acceptor','Restarter']} />
                                                    <InputGroup label="Start Date" type="date" value={cd.fp_start_date} onChange={e => scd('fp_start_date', e.target.value)} />
                                                    <InputGroup label="End Date" type="date" value={cd.fp_end_date} onChange={e => scd('fp_end_date', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </form>

                            <div className="p-5 bg-white dark:bg-[#0f172a] border-t border-neutral-200 dark:border-neutral-700 flex justify-end items-center shrink-0">
                                <button onClick={handleCitizenSubmit} disabled={cProc} className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg active:scale-95 disabled:opacity-50">
                                    {cProc ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
                                    {cProc ? 'Saving...' : 'Save Citizen Record'}
                                </button>
                            </div>
                        </>
                    )}

                    {/* ========== HOUSEHOLD TAB ========== */}
                    {activeTab === 'household' && (
                        <>
                            <div className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-thin scrollbar-thumb-orange-200 dark:scrollbar-thumb-orange-900 space-y-8">

                                {/* SECTION 1: HOME INFORMATION & PHOTO */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <SectionLabelOrange icon={<Home className="size-4" />} label="Home Information" />
                                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">
                                            <InputGroup label="Home Number" placeholder="Input House / Home Number" value={hd.house_number} onChange={e => shd('house_number', e.target.value)} error={hErr.house_number} />
                                            <InputGroup label="Home Address" placeholder="Input House / Home Address" required value={hd.home_address} onChange={e => shd('home_address', e.target.value)} error={hErr.home_address} />
                                            <div className="pt-2">
                                                <SelectGroupOrange label="Specific Sitio" required options={sitioOptions} value={hd.sitio} onChange={e => shd('sitio', e.target.value)} error={hErr.sitio} />
                                            </div>
                                            <SelectGroupOrange label="Ownership Status" required options={['Owned','Rented','Leased','Informal Settler']} value={hd.ownership_status} onChange={e => shd('ownership_status', e.target.value)} error={hErr.ownership_status} />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <SectionLabelOrange icon={<ImageIcon className="size-4" />} label="Household Image & Location" />
                                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">
                                            <div onClick={() => hhPhotoInputRef.current?.click()} className="w-full aspect-video bg-neutral-100 dark:bg-black/20 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600 flex flex-col items-center justify-center text-neutral-400 gap-2 hover:border-orange-400 transition-colors cursor-pointer group overflow-hidden relative">
                                                {hhPhotoPreview ? (
                                                    <>
                                                        <img src={hhPhotoPreview} alt="Household" className="absolute inset-0 w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera className="size-6 text-white" /></div>
                                                    </>
                                                ) : (
                                                    <><Camera className="size-8 group-hover:text-orange-500 transition-colors" /><span className="text-[10px] font-medium uppercase tracking-wide">Add Household Photo</span></>
                                                )}
                                            </div>
                                            <input ref={hhPhotoInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/jpg" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; hhPhotoFileRef.current = f; setHHPhotoPreview(URL.createObjectURL(f)); }} />
                                            <div className="grid grid-cols-2 gap-3">
                                                <button type="button" onClick={() => setIsHHPhotoOpen(true)} className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white p-2.5 rounded-lg shadow-sm text-xs font-bold uppercase tracking-wide transition-all"><Camera className="size-3.5" /> Take Photo</button>
                                                <button type="button" onClick={() => hhPhotoInputRef.current?.click()} className="flex items-center justify-center gap-2 bg-white border border-neutral-300 dark:bg-neutral-800 dark:border-neutral-600 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700 p-2.5 rounded-lg shadow-sm text-xs font-bold uppercase tracking-wide transition-all"><Upload className="size-3.5" /> Upload</button>
                                            </div>
                                            {hhPhotoPreview && (
                                                <button type="button" onClick={() => { setHHPhotoPreview(null); hhPhotoFileRef.current = null; if (hhPhotoInputRef.current) hhPhotoInputRef.current.value = ''; }} className="w-full flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:border-red-800 dark:bg-red-900/20 p-2 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all">
                                                    <X className="size-3" /> Remove Photo
                                                </button>
                                            )}
                                            <div className="pt-4 border-t border-dashed border-neutral-200 dark:border-neutral-700 space-y-4">
                                                <div className="flex gap-2 items-end">
                                                    <div className="flex-1">
                                                        <InputGroup label="Geographic Coordinates" placeholder="Lat, Long (Pin on Map)" value={hd.coordinates} readOnly icon={<MapPin className="size-3.5 text-neutral-400" />} />
                                                    </div>
                                                    <button type="button" onClick={() => setShowMap(true)} className="mb-[1px] p-2.5 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors" title="Open Map Picker">
                                                        <Crosshair className="size-4" />
                                                    </button>
                                                </div>
                                                <InputGroup label="Google Maps Embed Link" placeholder="Paste Google Maps Embed URL here..." value={hd.home_link} onChange={(e) => shd('home_link', e.target.value)} icon={<LinkIcon className="size-3.5 text-blue-500" />} error={hErr.home_link} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 2: ENVIRONMENTAL & DETAILS */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <SectionLabelOrange icon={<Droplets className="size-4" />} label="Environmental Information" />
                                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">
                                            <SelectGroupOrange label="Type of Water Source" required options={['Level 1 - Point Source','Level 2 - Communal Faucet','Level 3 - Individual Connection']} value={hd.water_type} onChange={e => shd('water_type', e.target.value)} error={hErr.water_type} />
                                            <SelectGroupOrange label="Toilet Type" required options={['A - Pour/flush type connected to septic tank','A - Pour/flush toilet connected to Sewerage System','C - Ventilated Pit (VIP) latrine','D - Water-sealed toilet','E - G - Without toilet','E - Overhung latrine','F - Open pit latrine']} value={hd.toilet_type} onChange={e => shd('toilet_type', e.target.value)} error={hErr.toilet_type} />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <SectionLabelOrange icon={<FileText className="size-4" />} label="Details" />
                                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1">
                                                    <InputGroup label="Date of Visit" type="date" value={hd.date_visited} onChange={e => shd('date_visited', e.target.value)} error={hErr.date_visited} />
                                                </div>
                                                <span className="text-[10px] text-neutral-400 italic mt-6">Date of Interview</span>
                                            </div>
                                            <InputGroup label="Interviewed By" placeholder="Full Name" value={hd.interviewer_name} onChange={e => shd('interviewer_name', e.target.value)} error={hErr.interviewer_name} />
                                            <InputGroup label="Reviewed By" placeholder="Full Name" value={hd.reviewer_name} onChange={e => shd('reviewer_name', e.target.value)} error={hErr.reviewer_name} />
                                            <p className="text-[10px] text-neutral-400 italic text-center mt-2 border-t border-dashed border-neutral-200 dark:border-neutral-700 pt-2">
                                                Note: Additional member details can be added in the Citizen Profile module.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 3: HOUSEHOLD MEMBERS */}
                                <div className="space-y-6">
                                    <SectionLabelOrange icon={<Users className="size-4" />} label="Household Members Assignment" />
                                    <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-6">
                                        <div className="space-y-1.5 w-full">
                                            <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">Search Citizens</label>
                                            <div className="relative group">
                                                <input
                                                    value={memberSearchQuery}
                                                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                                                    placeholder="Search by name or Citizen ID (e.g. CTZ-0001)..."
                                                    className="w-full text-xs p-2.5 pl-9 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                                />
                                                <div className="absolute left-3 top-2.5 text-neutral-400 group-focus-within:text-orange-500 transition-colors"><Search className="size-4" /></div>
                                            </div>
                                            {isSearchingMembers && memberSearchResults.length === 0 && (
                                                <div className="w-full mt-2 p-3 text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg">Searching...</div>
                                            )}
                                            {memberSearchResults.length > 0 && (
                                                <div className="w-full mt-2 bg-neutral-50 dark:bg-neutral-800/30 rounded-lg border border-neutral-200 dark:border-neutral-700 p-2 space-y-2 max-h-64 overflow-y-auto">
                                                    <p className="text-[10px] font-bold uppercase text-neutral-500 px-1 pt-1">Search Results</p>
                                                    {memberSearchResults.map((result) => (
                                                        <div key={result.id} className="p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm flex justify-between items-center">
                                                            <div>
                                                                <span className="font-bold text-neutral-800 dark:text-neutral-200 text-xs">{result.name}</span>
                                                                <span className="block text-[10px] text-neutral-500 mt-0.5">{result.uuid} • {result.sex || 'Unknown'} {result.age !== null ? `(${result.age} yrs)` : ''}</span>
                                                            </div>
                                                            {result.has_household ? (
                                                                <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 px-3 py-1.5 rounded font-bold uppercase tracking-wider">Assigned</span>
                                                            ) : (
                                                                <button type="button" onClick={(e) => { e.preventDefault(); if (result.has_household) return; setSelectedMembers(prev => prev.some(m => m.id === result.id) ? prev : [...prev, result]); setMemberSearchQuery(''); setMemberSearchResults([]); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-orange-600 text-white hover:bg-orange-700 active:scale-95 font-bold uppercase tracking-wider text-[10px] transition-all shadow-sm">
                                                                    <Plus className="size-3" /> Add
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">Assigned Members ({selectedMembers.length})</label>
                                            {selectedMembers.length === 0 ? (
                                                <div className="p-4 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-lg text-center text-xs text-neutral-400">No members assigned yet. Search and add citizens above.</div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {selectedMembers.map(member => (
                                                        <div key={member.id} className="flex justify-between items-center p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                                                            <div>
                                                                <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{member.name}</p>
                                                                <p className="text-[10px] text-neutral-500">{member.uuid}</p>
                                                            </div>
                                                            <button type="button" onClick={() => { Swal.fire({ title: 'Remove Member?', text: `Remove ${member.name} from this household?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#9ca3af', confirmButtonText: 'Yes, remove' }).then(r => { if (r.isConfirmed) setSelectedMembers(prev => prev.filter(m => m.id !== member.id)); }); }} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors">
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

                            <div className="p-5 bg-white dark:bg-[#0f172a] border-t border-neutral-200 dark:border-neutral-800 flex justify-end items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0">
                                <button onClick={handleHouseholdSubmit} disabled={hProc} className={`flex items-center gap-2 px-8 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-orange-600/20 active:scale-95 ${hProc ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <CheckCircle className="size-4" /> {hProc ? 'Saving...' : 'Save Household Record'}
                                </button>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </>
    );
}

// ---- Location Picker (Leaflet) ----
function LocationPicker({ onClose, onSelect }: { onClose: () => void; onSelect: (coords: string) => void }) {
    const [position, setPosition] = useState<[number, number] | null>(null);

    function MapClickHandler() {
        useMapEvents({ click(e) { setPosition([e.latlng.lat, e.latlng.lng]); } });
        return position ? <Marker position={position} /> : null;
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-[#1e293b] w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl border border-white/20 flex flex-col h-[75vh]">
                <div className="p-4 bg-orange-700 text-white flex justify-between items-center shrink-0">
                    <h3 className="text-sm font-bold uppercase tracking-wide flex items-center gap-2"><MapPin className="size-4" /> Pick Location on Map</h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full"><X className="size-5" /></button>
                </div>
                <div className="flex-1 relative w-full h-full z-0">
                    <MapContainer center={[10.3157, 123.8854]} zoom={13} scrollWheelZoom style={{ height: '100%', width: '100%', zIndex: 0 }}>
                        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
                        <input type="text" placeholder="Select a location to get coords" className="flex-1 md:w-64 text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none" value={position ? `${position[0].toFixed(6)}, ${position[1].toFixed(6)}` : ''} readOnly />
                        <button onClick={() => { if (position) onSelect(`${position[0].toFixed(6)}, ${position[1].toFixed(6)}`); }} disabled={!position} className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors">Confirm PIN</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ---- Helper Components ----

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="flex items-center gap-2 pb-2 border-b-2 border-indigo-900/10 dark:border-indigo-500/20">
            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded text-indigo-700 dark:text-indigo-400">{icon}</div>
            <h3 className="text-sm font-bold uppercase text-neutral-700 dark:text-neutral-200 tracking-wider">{label}</h3>
        </div>
    );
}

function SectionLabelOrange({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="flex items-center gap-2 pb-2 border-b-2 border-orange-900/10 dark:border-orange-500/20 text-orange-600">
            <div className="p-1.5 bg-white dark:bg-white/5 rounded shadow-sm border border-neutral-100 dark:border-neutral-700">{icon}</div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-orange-600 dark:text-neutral-200">{label}</h3>
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
        <div className={`space-y-1.5 ${className ?? ''}`}>
            {label && (
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative group">
                <input className={`w-full text-xs p-2.5 rounded-lg border ${error ? 'border-red-500' : 'border-neutral-300'} dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all`} {...props} />
                {icon && <div className="absolute right-3 top-2.5 text-neutral-400 group-focus-within:text-indigo-500 transition-colors">{icon}</div>}
            </div>
            {error && <p className="text-[10px] text-red-500">{error}</p>}
        </div>
    );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: string[];
    required?: boolean;
    error?: string;
    className?: string;
}

function SelectGroup({ label, options, required, className, error, ...props }: SelectProps) {
    return (
        <div className={`space-y-1.5 ${className ?? ''}`}>
            <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <select className={`w-full text-xs p-2.5 rounded-lg border ${error ? 'border-red-500' : 'border-neutral-300'} dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none transition-all cursor-pointer`} {...props} value={props.value ?? ''}>
                    <option value="">Select Option</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-neutral-400">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
            </div>
            {error && <p className="text-[10px] text-red-500">{error}</p>}
        </div>
    );
}

function SelectGroupOrange({ label, options, required, error, ...props }: SelectProps) {
    return (
        <div className="space-y-1.5 w-full">
            <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <select className={`w-full text-xs p-2.5 rounded-lg border ${error ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'} bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none appearance-none transition-all cursor-pointer hover:border-orange-300`} {...props} value={props.value ?? ''}>
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
