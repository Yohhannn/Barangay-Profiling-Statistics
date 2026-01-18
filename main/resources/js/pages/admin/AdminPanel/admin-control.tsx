import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft, Plus, Edit3, Trash2,
    MapPin, Building, FileText, History, Stethoscope,
    Search, X, Check, AlertCircle
} from 'lucide-react';
import { useState, useMemo } from 'react';

// --- Types ---
interface SimpleType { id: number; name: string; }

// --- Mock Data ---
const initialSitios: SimpleType[] = [
    { id: 1, name: 'Cadulang 1' }, { id: 2, name: 'Cadulang 2' },
    { id: 3, name: 'Cambiohan' }, { id: 4, name: 'Chocolate Hills' },
    { id: 5, name: 'Hawaiian 1' }, { id: 6, name: 'Hawaiian 2' },
    { id: 7, name: 'Ikaseg' }, { id: 8, name: 'Ibabao' },
    { id: 9, name: 'Kalubihan' }, { id: 10, name: 'Kaisid' },
    { id: 11, name: 'Kolo' }, { id: 12, name: 'Limogmog' },
    { id: 13, name: 'Likoan' }
];

const initialInfraTypes: SimpleType[] = [
    { id: 1, name: 'Barangay Hall' }, { id: 2, name: 'Health Center' },
    { id: 3, name: 'Daycare Center' }, { id: 4, name: 'Basketball Court' },
    { id: 5, name: 'Multi-purpose Hall' }, { id: 6, name: 'Chapel' }
];

const initialTransactionTypes: SimpleType[] = [
    { id: 1, name: 'Barangay Clearance' }, { id: 2, name: 'Business Permit' },
    { id: 3, name: 'Complaint' }, { id: 4, name: 'Indigency' },
    { id: 5, name: 'Residency' }, { id: 6, name: 'Cedula' }
];

const initialHistoryTypes: SimpleType[] = [
    { id: 1, name: 'Complaint' }, { id: 2, name: 'Violation' },
    { id: 3, name: 'Settlement' }, { id: 4, name: 'Summon' }
];

const initialMedicalTypes: SimpleType[] = [
    { id: 1, name: 'Hypertension' }, { id: 2, name: 'Diabetes' },
    { id: 3, name: 'Tuberculosis' }, { id: 4, name: 'Surgery' },
    { id: 5, name: 'Dengue' }, { id: 6, name: 'COVID-19' },
    { id: 7, name: 'Prenatal' }
];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Panel', href: '/admin-panel' },
    { title: 'Admin Controls', href: '/admin-panel/admin-control' },
];

export default function AdminControl() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Controls" />

            <div className="flex flex-col h-full min-h-[90vh] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">

                {/* --- Header Bar --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-sidebar-border/60">
                    <div className="flex items-center gap-4">
                        <Link href="/admin-panel" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                            <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                                Admin Panel: <span className="text-blue-600 dark:text-blue-400">System Controls</span>
                            </h1>
                            <p className="text-xs text-neutral-500">Manage drop-down options, categories, and system classifications.</p>
                        </div>
                    </div>
                </div>

                {/* --- Instructions --- */}
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="size-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>System Configuration:</strong> Adding or removing items here will instantly update the available options in forms throughout the system (e.g., Citizen Profiling, Transaction Requests).
                    </div>
                </div>

                {/* --- Main Content Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 flex-1">

                    <ControlCard
                        title="Sitio List"
                        icon={<MapPin className="size-5" />}
                        initialData={initialSitios}
                        themeColor="red"
                    />

                    <ControlCard
                        title="Infrastructure Types"
                        icon={<Building className="size-5" />}
                        initialData={initialInfraTypes}
                        themeColor="blue"
                    />

                    <ControlCard
                        title="Transaction Types"
                        icon={<FileText className="size-5" />}
                        initialData={initialTransactionTypes}
                        themeColor="violet"
                    />

                    <ControlCard
                        title="History Types"
                        icon={<History className="size-5" />}
                        initialData={initialHistoryTypes}
                        themeColor="amber"
                    />

                    <ControlCard
                        title="Medical Types"
                        icon={<Stethoscope className="size-5" />}
                        initialData={initialMedicalTypes}
                        themeColor="rose"
                    />

                </div>
            </div>
        </AppLayout>
    );
}

// --- Interactive Control Card Component ---
interface ControlCardProps {
    title: string;
    icon: React.ReactNode;
    initialData: SimpleType[];
    themeColor: 'red' | 'blue' | 'violet' | 'amber' | 'rose';
}

function ControlCard({ title, icon, initialData, themeColor }: ControlCardProps) {
    const [data, setData] = useState(initialData);
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Color Maps
    const colors = {
        red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-red-200 selection:bg-red-100',
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 selection:bg-blue-100',
        violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400 border-violet-200 selection:bg-violet-100',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 selection:bg-amber-100',
        rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 border-rose-200 selection:bg-rose-100',
    };

    const activeColor = colors[themeColor];

    const filteredData = useMemo(() => {
        return data.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
    }, [data, search]);

    const handleAdd = () => {
        const newName = prompt(`Enter new ${title} name:`);
        if (newName) {
            const newId = Math.max(...data.map(d => d.id), 0) + 1;
            setData([...data, { id: newId, name: newName }]);
        }
    };

    const handleEdit = () => {
        if (!selectedId) return;
        const item = data.find(d => d.id === selectedId);
        if (item) {
            const newName = prompt('Edit name:', item.name);
            if (newName) {
                setData(data.map(d => d.id === selectedId ? { ...d, name: newName } : d));
            }
        }
    };

    const handleDelete = () => {
        if (!selectedId) return;
        if (confirm('Are you sure you want to remove this item? This may affect existing records.')) {
            setData(data.filter(d => d.id !== selectedId));
            setSelectedId(null);
        }
    };

    return (
        <div className="flex flex-col bg-white dark:bg-sidebar border border-sidebar-border rounded-2xl shadow-sm overflow-hidden h-full max-h-[500px] transition-all hover:shadow-md">

            {/* Header */}
            <div className="flex flex-col border-b border-sidebar-border bg-white dark:bg-sidebar z-10">
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${activeColor}`}>
                            {icon}
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">{title}</h3>
                            <p className="text-[10px] text-neutral-400 font-medium">{data.length} items registered</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setIsSearchOpen(!isSearchOpen);
                            setSearch('');
                        }}
                        className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900' : 'text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}
                    >
                        {isSearchOpen ? <X className="size-4" /> : <Search className="size-4" />}
                    </button>
                </div>

                {/* Search Bar (Collapsible) */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSearchOpen ? 'max-h-12 border-t border-sidebar-border' : 'max-h-0'}`}>
                    <input
                        type="text"
                        placeholder={`Search ${title}...`}
                        className="w-full h-12 px-4 text-xs bg-neutral-50/50 dark:bg-neutral-900/50 focus:outline-none focus:bg-white dark:focus:bg-black transition-colors"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700">
                <table className="w-full text-sm text-left">
                    <thead className="text-[10px] uppercase text-neutral-500 bg-neutral-50 dark:bg-neutral-900/50 sticky top-0 z-10 backdrop-blur-sm border-b border-sidebar-border">
                    <tr>
                        <th className="px-4 py-2.5 font-bold w-16 text-center">ID</th>
                        <th className="px-4 py-2.5 font-bold">Description</th>
                        <th className="px-4 py-2.5 w-10"></th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-sidebar-border/50">
                    {filteredData.length > 0 ? (
                        filteredData.map((item) => {
                            const isSelected = selectedId === item.id;
                            return (
                                <tr
                                    key={item.id}
                                    onClick={() => setSelectedId(isSelected ? null : item.id)}
                                    className={`
                                            cursor-pointer transition-colors duration-150 group
                                            ${isSelected
                                        ? `${activeColor.split(' ')[0]} dark:bg-opacity-10`
                                        : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/30'}
                                        `}
                                >
                                    <td className="px-4 py-2.5 text-center font-mono text-xs text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300">
                                        {item.id}
                                    </td>
                                    <td className={`px-4 py-2.5 font-medium transition-colors ${isSelected ? 'text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-400'}`}>
                                        {item.name}
                                    </td>
                                    <td className="px-4 py-2.5 text-center">
                                        {isSelected && <Check className="size-3.5 text-green-600" />}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={3} className="px-4 py-8 text-center text-xs text-neutral-400 italic">
                                No records found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Action Footer */}
            <div className="p-3 border-t border-sidebar-border bg-neutral-50/50 dark:bg-neutral-900/30 flex gap-2 justify-between">
                <button
                    onClick={handleAdd}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-neutral-800 border border-sidebar-border hover:bg-green-50 hover:border-green-200 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400 text-neutral-600 dark:text-neutral-300 text-[10px] font-bold uppercase rounded-lg shadow-sm transition-all active:scale-95"
                >
                    <Plus className="size-3.5" /> Add New
                </button>

                <div className="flex gap-2 flex-1">
                    <button
                        onClick={handleEdit}
                        disabled={!selectedId}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border text-[10px] font-bold uppercase rounded-lg shadow-sm transition-all
                            ${selectedId
                            ? 'bg-white dark:bg-neutral-800 border-sidebar-border hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 cursor-pointer active:scale-95'
                            : 'bg-neutral-100 dark:bg-neutral-900 border-transparent text-neutral-300 cursor-not-allowed'}
                        `}
                    >
                        <Edit3 className="size-3.5" /> Edit
                    </button>

                    <button
                        onClick={handleDelete}
                        disabled={!selectedId}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border text-[10px] font-bold uppercase rounded-lg shadow-sm transition-all
                            ${selectedId
                            ? 'bg-white dark:bg-neutral-800 border-sidebar-border hover:bg-red-50 hover:border-red-200 hover:text-red-600 cursor-pointer active:scale-95'
                            : 'bg-neutral-100 dark:bg-neutral-900 border-transparent text-neutral-300 cursor-not-allowed'}
                        `}
                    >
                        <Trash2 className="size-3.5" /> Del
                    </button>
                </div>
            </div>
        </div>
    );
}
