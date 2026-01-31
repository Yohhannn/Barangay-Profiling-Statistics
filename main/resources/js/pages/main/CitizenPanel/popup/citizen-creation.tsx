import {
    X, Camera, Plus, Trash2, ScanFace,
    User, MapPin, Briefcase, GraduationCap, Activity, Home,
    CreditCard, Heart, CheckCircle, Search, Loader2
} from 'lucide-react';
import { useState, useEffect, FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import RegisterFace from './register-face';
import Swal from 'sweetalert2';

interface CitizenCreationProps {
    isOpen: boolean;
    onClose: () => void;
}

// Mock Data for Household Lookup
const mockHouseholdData: Record<string, { id: number; members: { name: string; relationship: string; address: string }[], status: string }> = {
    'HH-001': {
        id: 1,
        status: 'Owner',
        members: [
            { name: 'Roberto Cadulang', relationship: 'Head', address: 'Block 1, Lot 2, Cadulang 1' },
            { name: 'Maria Cadulang', relationship: 'Spouse', address: 'Block 1, Lot 2, Cadulang 1' },
        ]
    },
    'HH-002': {
        id: 2,
        status: 'Renter',
        members: [
            { name: 'Juan Dela Cruz', relationship: 'Head', address: 'Purok 3, Ibabao' },
        ]
    }
};

export default function CitizenCreation({ isOpen, onClose }: CitizenCreationProps) {

    // --- STATE FOR SITIOS ---
    const [sitioOptions, setSitioOptions] = useState<string[]>([]);

    // --- FETCH DATA ON MOUNT ---
    useEffect(() => {
        if (isOpen) { // Only fetch when modal opens
            fetch('/api/sitio-list')
                .then(res => res.json())
                .then(data => {
                    // Map the objects to just an array of names for the dropdown
                    const names = data.map((s: { sitio_name: string }) => s.sitio_name);
                    setSitioOptions(names);
                })
                .catch(err => console.error("Failed to load Sitios:", err));
        }
    }, [isOpen]);


    // --- Setup Inertia Form ---
    const { data, setData, post, processing, reset, errors } = useForm({
        // Personal
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        sex: 'Male',
        date_of_birth: '',
        place_of_birth: '',
        civil_status: '',
        religion: '',
        blood_type: '',

        // Contact & Address
        contact_numbers: [''],
        email: '',
        sitio: '',

        // Household
        household_id: '',
        relationship_to_head: '',
        socio_economic_class: '',
        nhts_number: '',

        // Employment
        employment_status: '',
        occupation: '',
        is_gov: false,

        // PhilHealth
        philhealth_id: '',
        philhealth_category: '',
        philhealth_membership: '',

        // Education
        is_studying: false,
        school_name: '',
        current_level: '',
        elementary_name: '',
        highschool_name: '',
        senior_high_name: '',
        college_name: '',

        // Health & Vulnerability
        health_classification: '',
        is_voter: false,
        is_ip: false,
        is_deceased: false,
        date_of_death: '',
        cause_of_death: '',

        // Family Planning
        fp_method: '',
        fp_status: '',
        fp_start_date: '',
        fp_end_date: '',
    });

    // --- Local UI State ---
    const [isFaceScanOpen, setIsFaceScanOpen] = useState(false);
    const [searchHHQuery, setSearchHHQuery] = useState('');
    const [householdInfo, setHouseholdInfo] = useState<{ members: { name: string; relationship: string; address: string }[], status: string } | null>(null);
    const [isSearchingHH, setIsSearchingHH] = useState(false);

    // --- Effects ---

    // Household Search Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchHHQuery.length >= 3) {
                setIsSearchingHH(true);
                setTimeout(() => {
                    const found = mockHouseholdData[searchHHQuery];
                    if (found) {
                        setHouseholdInfo(found);
                        setData('household_id', found.id.toString());
                    } else {
                        setHouseholdInfo(null);
                        setData('household_id', '');
                    }
                    setIsSearchingHH(false);
                }, 500);
            } else {
                setHouseholdInfo(null);
                setData('household_id', '');
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [searchHHQuery]);

    // Clear relationship if household is removed
    useEffect(() => {
        if (!data.household_id) {
            setData('relationship_to_head', '');
        }
    }, [data.household_id]);

    if (!isOpen) return null;

    // --- Handlers ---

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const finalData = {
            ...data,
            relationship_to_head: data.relationship_to_head || 'None'
        };

        post('/citizens/store', {
            data: finalData,
            onSuccess: () => {
                Swal.fire({ icon: 'success', title: 'Success', text: 'Citizen Record Created!' });
                reset();
                setSearchHHQuery('');
                setHouseholdInfo(null);
                onClose();
            },
            onError: (err) => {
                console.error(err);
                Swal.fire({ icon: 'error', title: 'Error', text: 'Please check the form for errors.' });
            }
        });
    };

    const updateContactNumber = (index: number, val: string) => {
        const newNums = [...data.contact_numbers];
        newNums[index] = val;
        setData('contact_numbers', newNums);
    };
    const addContactNumber = () => setData('contact_numbers', [...data.contact_numbers, '']);
    const removeContactNumber = (index: number) => {
        const newNums = data.contact_numbers.filter((_, i) => i !== index);
        setData('contact_numbers', newNums);
    };

    const isRelationRequired = !!data.household_id;

    return (
        <>
            <RegisterFace isOpen={isFaceScanOpen} onClose={() => setIsFaceScanOpen(false)} />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-[#F8F9FC] dark:bg-[#0f172a] w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-white/20">

                    {/* Header */}
                    <div className="relative bg-[#1e1b4b] text-white p-5 flex justify-between items-center overflow-hidden shrink-0">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <User className="w-32 h-32" />
                        </div>
                        <div className="z-10">
                            <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
                                <User className="size-5 text-indigo-400" />
                                Citizen Registration
                            </h2>
                            <p className="text-[10px] text-indigo-300 uppercase tracking-widest font-semibold mt-1">
                                New Record Entry
                            </p>
                        </div>
                        <button onClick={onClose} className="z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white">
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Scrollable Form Content */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-thin scrollbar-thumb-indigo-200 dark:scrollbar-thumb-indigo-900 space-y-8">

                        {/* SECTION 1: PERSONAL IDENTITY */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-7 space-y-6">
                                <SectionLabel icon={<User className="size-4" />} label="Personal Identity" />
                                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col sm:flex-row gap-6">
                                    <div className="flex flex-col gap-3 w-full sm:w-40 shrink-0">
                                        <div className="w-full aspect-[3/4] bg-neutral-100 dark:bg-black/20 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600 flex flex-col items-center justify-center text-neutral-400 gap-2 hover:border-indigo-400 transition-colors cursor-pointer group">
                                            <Camera className="size-8 group-hover:text-indigo-500 transition-colors" />
                                            <span className="text-[10px] font-medium uppercase tracking-wide">No Photo</span>
                                        </div>
                                        <button type="button" onClick={() => setIsFaceScanOpen(true)} className="w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 dark:border-indigo-800 p-2.5 rounded-lg transition-all text-[10px] font-bold uppercase tracking-wide shadow-sm mt-1">
                                            <ScanFace className="size-4" /> Register Face Data
                                        </button>
                                    </div>

                                    <div className="flex-1 grid grid-cols-2 gap-4">
                                        <InputGroup label="First Name" value={data.first_name} onChange={e => setData('first_name', e.target.value)} required error={errors.first_name} className="col-span-2" />
                                        <InputGroup label="Middle Name" value={data.middle_name} onChange={e => setData('middle_name', e.target.value)} error={errors.middle_name} />
                                        <InputGroup label="Suffix" value={data.suffix} onChange={e => setData('suffix', e.target.value)} placeholder="e.g. Jr." error={errors.suffix} />
                                        <InputGroup label="Last Name" value={data.last_name} onChange={e => setData('last_name', e.target.value)} required error={errors.last_name} className="col-span-2" />

                                        <div className="col-span-2 pt-2 border-t border-dashed border-neutral-200 dark:border-neutral-700 mt-2">
                                            <div className="flex gap-6">
                                                <div className="flex-1">
                                                    <label className="text-[10px] font-bold uppercase text-neutral-500 mb-1.5 block">Sex <span className="text-red-500">*</span></label>
                                                    <div className="flex gap-4">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input type="radio" name="sex" value="Male" checked={data.sex === 'Male'} onChange={e => setData('sex', e.target.value)} className="accent-indigo-600" />
                                                            <span className="text-xs text-neutral-600 dark:text-neutral-300">Male</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input type="radio" name="sex" value="Female" checked={data.sex === 'Female'} onChange={e => setData('sex', e.target.value)} className="accent-indigo-600" />
                                                            <span className="text-xs text-neutral-600 dark:text-neutral-300">Female</span>
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <InputGroup label="Date of Birth" type="date" value={data.date_of_birth} onChange={e => setData('date_of_birth', e.target.value)} required error={errors.date_of_birth} />
                                                </div>
                                            </div>
                                        </div>

                                        <SelectGroup
                                            label="Religion"
                                            value={data.religion}
                                            onChange={e => setData('religion', e.target.value)}
                                            options={['Roman Catholic', 'Islam', 'INC', 'Christian', 'Other']}
                                            error={errors.religion}
                                        />
                                        <SelectGroup
                                            label="Blood Type"
                                            value={data.blood_type}
                                            onChange={e => setData('blood_type', e.target.value)}
                                            options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']}
                                            error={errors.blood_type}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-5 space-y-6">
                                <SectionLabel icon={<MapPin className="size-4" />} label="Contact & Address" />
                                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">Contact Numbers</label>
                                        {data.contact_numbers.map((num, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={num}
                                                    onChange={e => updateContactNumber(idx, e.target.value)}
                                                    className="flex-1 w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                                    placeholder="09XX-XXX-XXXX"
                                                />
                                                {idx === 0 ? (
                                                    <button type="button" onClick={addContactNumber} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400"><Plus className="size-4" /></button>
                                                ) : (
                                                    <button type="button" onClick={() => removeContactNumber(idx)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"><Trash2 className="size-4" /></button>
                                                )}
                                            </div>
                                        ))}
                                        {errors.contact_numbers && <p className="text-[10px] text-red-500">{errors.contact_numbers}</p>}
                                    </div>

                                    <InputGroup label="Email Address" type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="citizen@email.com" error={errors.email} />

                                    <div className="pt-2">
                                        {/* Sitio Dropdown - Now uses locally fetched options */}
                                        <SelectGroup
                                            label="Sitio / Zone"
                                            value={data.sitio}
                                            onChange={e => setData('sitio', e.target.value)}
                                            options={sitioOptions}
                                            error={errors.sitio}
                                        />
                                    </div>
                                    <div className="space-y-4 pt-2 border-t border-neutral-100 dark:border-neutral-700">
                                        <InputGroup label="Place of Birth" value={data.place_of_birth} onChange={e => setData('place_of_birth', e.target.value)} placeholder="City / Municipality" error={errors.place_of_birth} />
                                        <SelectGroup
                                            label="Civil Status"
                                            value={data.civil_status}
                                            onChange={e => setData('civil_status', e.target.value)}
                                            options={['Single', 'Married', 'Widowed', 'Separated', 'Common Law']}
                                            error={errors.civil_status}
                                        />
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
                                        <SelectGroup label="Socio-Economic Class" value={data.socio_economic_class} onChange={e => setData('socio_economic_class', e.target.value)} options={['NHTS 4Ps', 'NHTS Non 4Ps', 'Non-NHTS']} className="col-span-2" />

                                        <div className="col-span-1 space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">Household ID</label>
                                            <div className="relative group">
                                                <input
                                                    className={`w-full text-xs p-2.5 pl-9 rounded-lg border ${householdInfo ? 'border-green-500' : 'border-neutral-300'} dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-indigo-500/20 outline-none`}
                                                    placeholder="e.g. HH-001"
                                                    value={searchHHQuery}
                                                    onChange={e => setSearchHHQuery(e.target.value)}
                                                />
                                                <div className="absolute left-2.5 top-2.5 text-neutral-400">
                                                    {isSearchingHH ? <Loader2 className="size-3.5 animate-spin" /> : householdInfo ? <CheckCircle className="size-3.5 text-green-500" /> : <Search className="size-3.5" />}
                                                </div>
                                            </div>
                                            {errors.household_id && <p className="text-[10px] text-red-500">Please select a valid household.</p>}
                                        </div>

                                        <SelectGroup
                                            label="Relation to Head"
                                            required={isRelationRequired}
                                            value={data.relationship_to_head}
                                            onChange={e => setData('relationship_to_head', e.target.value)}
                                            options={['Head', 'Spouse', 'Son', 'Daughter', 'Parent', 'Other']}
                                            error={errors.relationship_to_head}
                                        />
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
                                        <InputGroup label="NHTS / 4Ps Number" value={data.nhts_number} onChange={e => setData('nhts_number', e.target.value)} placeholder="Enter ID if applicable" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <SectionLabel icon={<Briefcase className="size-4" />} label="Employment & Insurance" />
                                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-5">
                                    <SelectGroup
                                        label="Employment Status"
                                        value={data.employment_status}
                                        onChange={e => setData('employment_status', e.target.value)}
                                        options={['Employed', 'Unemployed', 'Self-Employed', 'Student', 'Retired', 'Homemaker']}
                                        error={errors.employment_status}
                                    />

                                    {['Employed', 'Self-Employed'].includes(data.employment_status) && (
                                        <InputGroup label="Occupation" value={data.occupation} onChange={e => setData('occupation', e.target.value)} placeholder="e.g. Teacher" />
                                    )}

                                    <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg border border-neutral-100 dark:border-neutral-700">
                                        <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">Government Employee?</span>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={data.is_gov === true} onChange={() => setData('is_gov', true)} className="accent-indigo-600" /><span className="text-xs text-neutral-600 dark:text-neutral-300">Yes</span></label>
                                            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={data.is_gov === false} onChange={() => setData('is_gov', false)} className="accent-indigo-600" /><span className="text-xs text-neutral-600 dark:text-neutral-300">No</span></label>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-700 space-y-4">
                                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400"><CreditCard className="size-4" /><span className="text-xs font-bold uppercase">PhilHealth</span></div>
                                        <InputGroup label="PhilHealth ID" value={data.philhealth_id} onChange={e => setData('philhealth_id', e.target.value)} placeholder="00-000000000-0" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <SelectGroup label="Category" value={data.philhealth_category} onChange={e => setData('philhealth_category', e.target.value)} options={['Formal Economy Private', 'Formal Economy Government', 'Informal Economy', 'Indigent', 'Senior Citizen']} />
                                            <SelectGroup label="Membership" value={data.philhealth_membership} onChange={e => setData('philhealth_membership', e.target.value)} options={['Member', 'Dependent']} />
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
                                            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={data.is_studying === true} onChange={() => setData('is_studying', true)} className="accent-indigo-600" /><span className="text-xs text-neutral-600 dark:text-neutral-300">Yes</span></label>
                                            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={data.is_studying === false} onChange={() => setData('is_studying', false)} className="accent-indigo-600" /><span className="text-xs text-neutral-600 dark:text-neutral-300">No</span></label>
                                        </div>
                                    </div>

                                    {data.is_studying && (
                                        <div className="grid grid-cols-1 gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                                            <InputGroup label="School Name" value={data.school_name} onChange={e => setData('school_name', e.target.value)} />
                                            <SelectGroup label="Current Level" value={data.current_level} onChange={e => setData('current_level', e.target.value)} options={['Elementary', 'High School', 'Senior High', 'College', 'Vocational']} />
                                        </div>
                                    )}

                                    <div className="space-y-3 pt-2">
                                        <label className="text-xs font-bold text-neutral-500 uppercase">Educational History</label>
                                        <InputGroup label="Elementary" value={data.elementary_name} onChange={e => setData('elementary_name', e.target.value)} placeholder="School Name" />
                                        <InputGroup label="High School" value={data.highschool_name} onChange={e => setData('highschool_name', e.target.value)} placeholder="School Name" />
                                        <InputGroup label="Senior High" value={data.senior_high_name} onChange={e => setData('senior_high_name', e.target.value)} placeholder="School Name" />
                                        <InputGroup label="College" value={data.college_name} onChange={e => setData('college_name', e.target.value)} placeholder="School Name" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <SectionLabel icon={<Activity className="size-4" />} label="Vulnerability & Status" />
                                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-5">
                                    <SelectGroup label="Health Classification" value={data.health_classification} onChange={e => setData('health_classification', e.target.value)} options={['Healthy', 'PWD', 'Hypertensive', 'Diabetic', 'Bedridden']} />

                                    <div className="space-y-3 bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg border border-neutral-100 dark:border-neutral-700">
                                        <div className="flex justify-between items-center"><span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Registered Voter?</span><div className="flex gap-3"><label className="cursor-pointer flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-300"><input type="radio" checked={data.is_voter} onChange={() => setData('is_voter', true)} className="mr-1"/>Yes</label><label className="cursor-pointer flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-300"><input type="radio" checked={!data.is_voter} onChange={() => setData('is_voter', false)} className="mr-1"/>No</label></div></div>
                                        <div className="flex justify-between items-center"><span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Indigenous People?</span><div className="flex gap-3"><label className="cursor-pointer flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-300"><input type="radio" checked={data.is_ip} onChange={() => setData('is_ip', true)} className="mr-1"/>Yes</label><label className="cursor-pointer flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-300"><input type="radio" checked={!data.is_ip} onChange={() => setData('is_ip', false)} className="mr-1"/>No</label></div></div>
                                        <div className="flex justify-between items-center"><span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Is Deceased?</span><div className="flex gap-3"><label className="cursor-pointer flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-300"><input type="radio" checked={data.is_deceased} onChange={() => setData('is_deceased', true)} className="mr-1"/>Yes</label><label className="cursor-pointer flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-300"><input type="radio" checked={!data.is_deceased} onChange={() => setData('is_deceased', false)} className="mr-1"/>No</label></div></div>
                                    </div>

                                    {data.is_deceased && (
                                        <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg space-y-3">
                                            <InputGroup label="Date of Death" type="date" value={data.date_of_death} onChange={e => setData('date_of_death', e.target.value)} />
                                            <InputGroup label="Cause of Death" value={data.cause_of_death} onChange={e => setData('cause_of_death', e.target.value)} />
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-neutral-100 dark:border-neutral-700 space-y-3">
                                        <div className="flex items-center gap-2 text-rose-500"><Heart className="size-4" /><span className="text-xs font-bold uppercase">Family Planning</span></div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <SelectGroup label="Method" value={data.fp_method} onChange={e => setData('fp_method', e.target.value)} options={['Pills', 'IUD', 'Condom', 'Natural']} />
                                            <SelectGroup label="Status" value={data.fp_status} onChange={e => setData('fp_status', e.target.value)} options={['Active', 'Drop-out', 'New Acceptor']} />
                                            <InputGroup label="Start Date" type="date" value={data.fp_start_date} onChange={e => setData('fp_start_date', e.target.value)} />
                                            <InputGroup label="End Date" type="date" value={data.fp_end_date} onChange={e => setData('fp_end_date', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </form>

                    <div className="p-5 bg-white dark:bg-[#0f172a] border-t border-neutral-200 dark:border-neutral-700 flex justify-end items-center">
                        <button
                            onClick={handleSubmit}
                            disabled={processing}
                            className="flex items-center gap-2 px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            {processing ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
                            {processing ? 'Saving...' : 'Save Record'}
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}

// --- Helper Components ---

function SectionLabel({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <div className="flex items-center gap-2 pb-2 border-b-2 border-indigo-900/10 dark:border-indigo-500/20">
            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded text-indigo-700 dark:text-indigo-400">{icon}</div>
            <h3 className="text-sm font-bold uppercase text-neutral-700 dark:text-neutral-200 tracking-wider">{label}</h3>
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
        <div className={`space-y-1.5 ${className}`}>
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
}

function SelectGroup({ label, options, required, className, error, ...props }: SelectProps) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <select
                    className={`w-full text-xs p-2.5 rounded-lg border ${error ? 'border-red-500' : 'border-neutral-300'} dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none transition-all cursor-pointer`}
                    {...props}
                    value={props.value ?? ''}
                >
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
