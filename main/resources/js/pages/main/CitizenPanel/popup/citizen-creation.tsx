import {
    X, Camera, Upload, CheckCircle,
    User, MapPin, Briefcase, GraduationCap, Activity, Home,
    CreditCard, Heart, Plus, Trash2, ScanFace, Users, Info
} from 'lucide-react';
import { useState, useEffect } from 'react';
import RegisterFace from './register-face';

interface CitizenCreationProps {
    isOpen: boolean;
    onClose: () => void;
}

// Mock Data for Household Lookup (Status removed from individual members)
const mockHouseholdData: Record<string, { members: { name: string; relationship: string; address: string }[], status: string }> = {
    'HH-001': {
        status: 'Owner',
        members: [
            { name: 'Roberto Cadulang', relationship: 'Head', address: 'Block 1, Lot 2, Cadulang 1' },
            { name: 'Maria Cadulang', relationship: 'Spouse', address: 'Block 1, Lot 2, Cadulang 1' },
            { name: 'Jose Cadulang', relationship: 'Son', address: 'Block 1, Lot 2, Cadulang 1' },
        ]
    },
    'HH-002': {
        status: 'Renter',
        members: [
            { name: 'Juan Dela Cruz', relationship: 'Head', address: 'Purok 3, Ibabao' },
        ]
    }
};

export default function CitizenCreation({ isOpen, onClose }: CitizenCreationProps) {
    // --- State for Dynamic Logic ---
    const [contactNumbers, setContactNumbers] = useState<string[]>(['']);
    const [employmentStatus, setEmploymentStatus] = useState('');
    const [isDeceased, setIsDeceased] = useState(false);

    // Education State
    const [isStudying, setIsStudying] = useState(false);

    // Face Scan Modal State
    const [isFaceScanOpen, setIsFaceScanOpen] = useState(false);

    // Household Logic
    const [householdId, setHouseholdId] = useState('HH-');
    const [householdInfo, setHouseholdInfo] = useState<{ members: { name: string; relationship: string; address: string }[], status: string } | null>(null);

    useEffect(() => {
        // Simple lookup simulation
        if (mockHouseholdData[householdId]) {
            setHouseholdInfo(mockHouseholdData[householdId]);
        } else {
            setHouseholdInfo(null);
        }
    }, [householdId]);

    if (!isOpen) return null;

    // --- Handlers ---
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form Submitted");
        onClose();
        // Reset state
        setContactNumbers(['']);
        setEmploymentStatus('');
        setIsDeceased(false);
        setIsStudying(false);
        setHouseholdId('HH-');
        setHouseholdInfo(null);
    };

    const addContactNumber = () => setContactNumbers([...contactNumbers, '']);

    const removeContactNumber = (index: number) => {
        const newNumbers = [...contactNumbers];
        newNumbers.splice(index, 1);
        setContactNumbers(newNumbers);
    };

    const updateContactNumber = (index: number, value: string) => {
        const newNumbers = [...contactNumbers];
        newNumbers[index] = value;
        setContactNumbers(newNumbers);
    };

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
                    <div className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-thin scrollbar-thumb-indigo-200 dark:scrollbar-thumb-indigo-900 space-y-8">

                        {/* SECTION 1: PERSONAL IDENTITY (Same as before) */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-7 space-y-6">
                                <SectionLabel icon={<User className="size-4" />} label="Personal Identity" />
                                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col sm:flex-row gap-6">
                                    <div className="flex flex-col gap-3 w-full sm:w-40 shrink-0">
                                        <div className="w-full aspect-[3/4] bg-neutral-100 dark:bg-black/20 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600 flex flex-col items-center justify-center text-neutral-400 gap-2 hover:border-indigo-400 transition-colors cursor-pointer group">
                                            <Camera className="size-8 group-hover:text-indigo-500 transition-colors" />
                                            <span className="text-[10px] font-medium uppercase tracking-wide">No Photo</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button className="flex items-center justify-center bg-[#1e1b4b] hover:bg-indigo-800 text-white p-2 rounded-lg transition-colors" title="Take Photo"><Camera className="size-4" /></button>
                                            <button className="flex items-center justify-center bg-white border border-neutral-300 hover:bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-600 dark:text-white p-2 rounded-lg transition-colors" title="Upload"><Upload className="size-4" /></button>
                                        </div>
                                        <button onClick={() => setIsFaceScanOpen(true)} className="w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800 p-2.5 rounded-lg transition-all text-[10px] font-bold uppercase tracking-wide shadow-sm mt-1 group">
                                            <ScanFace className="size-4 group-hover:scale-110 transition-transform" /> Register Face Data
                                        </button>
                                    </div>
                                    <div className="flex-1 grid grid-cols-2 gap-4">
                                        <InputGroup label="First Name" placeholder="Given Name" required className="col-span-2" />
                                        <InputGroup label="Middle Name" placeholder="Middle Name" />
                                        <InputGroup label="Suffix" placeholder="e.g. Jr." />
                                        <InputGroup label="Last Name" placeholder="Family Name" required className="col-span-2" />
                                        <div className="col-span-2 pt-2 border-t border-dashed border-neutral-200 dark:border-neutral-700 mt-2">
                                            <div className="flex gap-6">
                                                <div className="flex-1">
                                                    <label className="text-[10px] font-bold uppercase text-neutral-500 mb-1.5 block">Sex <span className="text-red-500">*</span></label>
                                                    <div className="flex gap-4">
                                                        <RadioOption name="sex" label="Male" />
                                                        <RadioOption name="sex" label="Female" />
                                                    </div>
                                                </div>
                                                <div className="flex-1"><InputGroup label="Date of Birth" type="date" required /></div>
                                            </div>
                                        </div>
                                        <SelectGroup label="Religion" required options={['Roman Catholic', 'Islam', 'INC', 'Christian', 'Other']} />
                                        <SelectGroup label="Blood Type" options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']} />
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-5 space-y-6">
                                <SectionLabel icon={<MapPin className="size-4" />} label="Contact & Address" />
                                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">Contact Numbers <span className="text-red-500">*</span></label>
                                        {contactNumbers.map((num, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <div className="relative group flex-1">
                                                    <input type="text" placeholder="09XX-XXX-XXXX" value={num} onChange={(e) => updateContactNumber(idx, e.target.value)} className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                                                    <div className="absolute right-3 top-2.5 text-neutral-400 group-focus-within:text-indigo-500 transition-colors"><PhoneIcon /></div>
                                                </div>
                                                {idx === 0 ? (
                                                    <button onClick={addContactNumber} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200"><Plus className="size-4" /></button>
                                                ) : (
                                                    <button onClick={() => removeContactNumber(idx)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"><Trash2 className="size-4" /></button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <InputGroup label="Email Address" placeholder="citizen@email.com" type="email" />
                                    <div className="pt-2">
                                        <SelectGroup label="Sitio / Zone" required options={['Cadulang 1', 'Cadulang 2', 'Ibabao', 'Proper', 'Kawayan']} />
                                        <p className="text-[10px] text-indigo-500 font-medium mt-1 text-right italic">* Verified Marigondon Zone</p>
                                    </div>
                                    <div className="space-y-4 pt-2 border-t border-neutral-100 dark:border-neutral-700">
                                        <InputGroup label="House No. / Street" placeholder="Specific Address details" />
                                        <InputGroup label="Place of Birth" placeholder="City / Municipality" />
                                        <SelectGroup label="Civil Status" required options={['Single', 'Married', 'Widowed', 'Separated', 'Common Law']} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: SOCIO ECO & WORK - MODIFIED */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* Left Column - Household Logic Updated */}
                            <div className="space-y-6">
                                <SectionLabel icon={<Home className="size-4" />} label="Household & Status" />

                                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <SelectGroup label="Socio-Economic Class" options={['NHTS 4Ps', 'NHTS Non 4Ps', 'Non-NHTS']} className="col-span-2" />

                                        {/* HOUSEHOLD ID with Default Value and Lookup */}
                                        <div className="col-span-1">
                                            <InputGroup
                                                label="Household ID"
                                                placeholder="HH-XXXX"
                                                value={householdId}
                                                onChange={(e) => setHouseholdId(e.target.value)}
                                            />
                                        </div>

                                        <SelectGroup label="Relationship to Head" required options={['Head', 'Spouse', 'Son', 'Daughter', 'Parent', 'Other']} />
                                    </div>

                                    {/* HOUSEHOLD MEMBERS PREVIEW */}
                                    {householdInfo && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="flex items-center justify-between gap-2 mb-2 px-1">
                                                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                                    <Users className="size-3.5" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Household Members</span>
                                                </div>
                                                {/* Household Status Badge */}
                                                <div className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded text-[10px] font-bold border border-green-200 dark:border-green-800">
                                                    <Info className="size-3" />
                                                    {householdInfo.status}
                                                </div>
                                            </div>
                                            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-lg overflow-hidden">
                                                <table className="w-full text-[10px] text-left">
                                                    <thead className="bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold uppercase">
                                                    <tr>
                                                        <th className="px-3 py-2">Name</th>
                                                        <th className="px-3 py-2">Relation</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-indigo-100 dark:divide-indigo-800/50">
                                                    {householdInfo.members.map((member, idx) => (
                                                        <tr key={idx} className="text-neutral-600 dark:text-neutral-300">
                                                            <td className="px-3 py-1.5 font-medium">{member.name}</td>
                                                            <td className="px-3 py-1.5">{member.relationship}</td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                                <div className="px-3 py-1.5 bg-white dark:bg-neutral-800 border-t border-indigo-100 dark:border-indigo-900/30 text-[10px] text-neutral-500 italic">
                                                    Address: {householdInfo.members[0].address}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase">Poverty Status</span>
                                        </div>
                                        <InputGroup label="NHTS / 4Ps Number" placeholder="Enter ID if applicable" />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Work Info (Same as before) */}
                            <div className="space-y-6">
                                <SectionLabel icon={<Briefcase className="size-4" />} label="Employment & Insurance" />
                                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-5">
                                    <div className="grid grid-cols-1 gap-4">
                                        <SelectGroup
                                            label="Employment Status"
                                            required
                                            options={['Employed', 'Unemployed', 'Self-Employed', 'Student', 'Retired']}
                                            onChange={(e) => setEmploymentStatus(e.target.value)}
                                        />
                                        {['Employed', 'Self-Employed', 'Retired'].includes(employmentStatus) && (
                                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                                <InputGroup label="Occupation" placeholder="e.g. Teacher, Driver" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between bg-neutral-50 dark:bg-black/20 p-3 rounded-lg border border-neutral-100 dark:border-neutral-700">
                                        <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">Government Employee?</span>
                                        <div className="flex gap-4">
                                            <RadioOption name="gov" label="Yes" />
                                            <RadioOption name="gov" label="No" defaultChecked />
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-700 space-y-4">
                                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                            <CreditCard className="size-4" />
                                            <span className="text-xs font-bold uppercase tracking-wider">PhilHealth Info</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputGroup label="PhilHealth ID" placeholder="00-000000000-0" className="col-span-2" />
                                            <SelectGroup label="Category" options={['Formal', 'Informal', 'Indigent', 'Senior']} />
                                            <SelectGroup label="Membership" options={['Member', 'Dependent']} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: ACADEMIC & OTHER (Same as before) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <SectionLabel icon={<GraduationCap className="size-4" />} label="Education & Health" />
                                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-5">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between bg-neutral-50 dark:bg-black/20 p-3 rounded-lg border border-neutral-100 dark:border-neutral-700">
                                            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">Is Currently Studying?</span>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                    <input type="radio" name="studying" onChange={() => setIsStudying(true)} className="peer sr-only" />
                                                    <div className="w-4 h-4 border-2 border-neutral-300 rounded-full peer-checked:border-indigo-600 peer-checked:bg-indigo-600 transition-all" />
                                                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300 group-hover:text-indigo-600 transition-colors">Yes</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                    <input type="radio" name="studying" defaultChecked onChange={() => setIsStudying(false)} className="peer sr-only" />
                                                    <div className="w-4 h-4 border-2 border-neutral-300 rounded-full peer-checked:border-indigo-600 peer-checked:bg-indigo-600 transition-all" />
                                                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300 group-hover:text-indigo-600 transition-colors">No</span>
                                                </label>
                                            </div>
                                        </div>
                                        {isStudying && (
                                            <div className="grid grid-cols-1 gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-900/30 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <InputGroup label="School Name" placeholder="Current School Name" />
                                                <SelectGroup label="Current Level" options={['Elementary', 'High School', 'Senior High', 'College', 'Vocational']} />
                                            </div>
                                        )}
                                        <div className="space-y-3 pt-2">
                                            <label className="text-xs font-bold text-neutral-500 uppercase">Educational History (School Names)</label>
                                            <div className="grid grid-cols-1 gap-3 p-3 bg-neutral-50 dark:bg-black/20 rounded-lg border border-neutral-100 dark:border-neutral-700">
                                                <InputGroup label="Elementary" placeholder="School Name (Optional)" />
                                                <InputGroup label="High School" placeholder="School Name (Optional)" />
                                                <InputGroup label="Senior High" placeholder="School Name (Optional)" />
                                                <InputGroup label="College" placeholder="School Name (Optional)" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-neutral-100 dark:border-neutral-700 space-y-3">
                                        <div className="flex items-center gap-2 text-rose-500"><Heart className="size-4" /><span className="text-xs font-bold uppercase tracking-wider">Family Planning</span></div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <SelectGroup label="Method" options={['Pills', 'IUD', 'Condom', 'Natural', 'None']} />
                                            <SelectGroup label="Status" options={['Active', 'Drop-out', 'New Acceptor']} />
                                            <InputGroup type="date" label="Start Date" />
                                            <InputGroup type="date" label="End Date" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Other Info */}
                            <div className="space-y-6">
                                <SectionLabel icon={<Activity className="size-4" />} label="Vulnerability & Status" />
                                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-5">
                                    <SelectGroup label="Health Classification" options={['Healthy', 'PWD', 'Hypertensive', 'Diabetic', 'Bedridden']} />
                                    <div className="space-y-3 bg-neutral-50 dark:bg-black/20 p-4 rounded-lg border border-neutral-100 dark:border-neutral-700">
                                        <div className="flex justify-between items-center"><span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Registered Voter?</span><div className="flex gap-3"><RadioOption name="voter" label="Yes" /><RadioOption name="voter" label="No" defaultChecked /></div></div>
                                        <div className="flex justify-between items-center"><span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Indigenous People (IP)?</span><div className="flex gap-3"><RadioOption name="ip" label="Yes" /><RadioOption name="ip" label="No" defaultChecked /></div></div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Is Deceased?</span>
                                            <div className="flex gap-3">
                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                    <input type="radio" name="deceased" onChange={() => setIsDeceased(true)} className="peer sr-only" />
                                                    <div className="w-4 h-4 border-2 border-neutral-300 rounded-full peer-checked:border-indigo-600 peer-checked:bg-indigo-600 transition-all" />
                                                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300 group-hover:text-indigo-600 transition-colors">Yes</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                    <input type="radio" name="deceased" defaultChecked onChange={() => setIsDeceased(false)} className="peer sr-only" />
                                                    <div className="w-4 h-4 border-2 border-neutral-300 rounded-full peer-checked:border-indigo-600 peer-checked:bg-indigo-600 transition-all" />
                                                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300 group-hover:text-indigo-600 transition-colors">No</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    {isDeceased && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                                            <label className="text-[10px] font-bold uppercase text-red-500">Deceased Details</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                <InputGroup type="date" label="Date of Death" className="col-span-1" />
                                                <input type="text" placeholder="Cause of Death" className="col-span-2 w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-red-500/20 outline-none transition-all" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="p-5 bg-white dark:bg-[#0f172a] border-t border-neutral-200 dark:border-neutral-800 flex justify-end items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0">
                        <button onClick={handleSubmit} className="flex items-center gap-2 px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-green-600/20 active:scale-95">
                            <CheckCircle className="size-4" /> Save Record
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}

// --- Reusable Helper Components (Keep existing) ---
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
}

function InputGroup({ label, className, icon, required, ...props }: InputProps) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && (
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative group">
                <input className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" {...props} />
                {icon && <div className="absolute right-3 top-2.5 text-neutral-400 group-focus-within:text-indigo-500 transition-colors">{icon}</div>}
            </div>
        </div>
    );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: string[];
    required?: boolean;
}

function SelectGroup({ label, options, required, className, ...props }: SelectProps) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <select className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none transition-all cursor-pointer hover:border-indigo-300" {...props}>
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

function RadioOption({ name, label, defaultChecked }: { name: string, label: string, defaultChecked?: boolean }) {
    return (
        <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center">
                <input type="radio" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
                <div className="w-4 h-4 border-2 border-neutral-300 rounded-full peer-checked:border-indigo-600 peer-checked:bg-indigo-600 transition-all"></div>
                <div className="absolute inset-0 flex items-center justify-center scale-0 peer-checked:scale-100 transition-transform">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
            </div>
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300 group-hover:text-indigo-600 transition-colors">{label}</span>
        </label>
    );
}

// Icons
const PhoneIcon = () => (
    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);
