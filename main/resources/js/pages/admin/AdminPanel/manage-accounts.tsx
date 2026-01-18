import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft, Search, Plus, Trash2,
    Shield, User, Lock, Mail,
    Download, Edit3, X, SlidersHorizontal, UserCog
} from 'lucide-react';
import { useState, useMemo } from 'react';

// --- Types ---
interface UserAccount {
    id: number;
    userId: string;
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    role: 'Admin' | 'Staff' | 'Viewer';
    isActive: boolean;
    lastLogin: string;

    // Audit
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string;
    updatedBy: string;
}

// --- Mock Data ---
const mockAccounts: UserAccount[] = [
    {
        id: 1, userId: '1003', firstName: 'Maria', middleName: 'Santos', lastName: 'Reyes',
        email: 'maria.reyes@barangay.gov.ph', role: 'Admin', isActive: true,
        lastLogin: '2025-10-25 08:30 AM',
        dateEncoded: '2025-07-10', encodedBy: 'SYSTEM', dateUpdated: '2025-09-15', updatedBy: 'SYSTEM'
    },
    {
        id: 2, userId: '1004', firstName: 'Juan', middleName: 'Dela', lastName: 'Cruz',
        email: 'juan.cruz@barangay.gov.ph', role: 'Staff', isActive: true,
        lastLogin: '2025-10-24 05:45 PM',
        dateEncoded: '2025-08-15', encodedBy: 'ADMIN', dateUpdated: 'N/A', updatedBy: 'N/A'
    },
    {
        id: 3, userId: '1005', firstName: 'Pedro', middleName: 'Penduko', lastName: 'Magtanggol',
        email: 'pedro.m@barangay.gov.ph', role: 'Staff', isActive: false,
        lastLogin: '2025-09-30 10:00 AM',
        dateEncoded: '2025-08-20', encodedBy: 'ADMIN', dateUpdated: '2025-10-01', updatedBy: 'ADMIN'
    },
    {
        id: 4, userId: '1006', firstName: 'Ana', middleName: 'Marie', lastName: 'Lim',
        email: 'ana.lim@barangay.gov.ph', role: 'Viewer', isActive: true,
        lastLogin: '2025-10-25 09:15 AM',
        dateEncoded: '2025-09-01', encodedBy: 'ADMIN', dateUpdated: 'N/A', updatedBy: 'N/A'
    }
];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Panel', href: '/admin-panel' },
    { title: 'Manage Accounts', href: '/admin-panel/manage-accounts' },
];

export default function ManageAccounts() {
    const [selectedUser, setSelectedUser] = useState<UserAccount | null>(mockAccounts[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterRole, setFilterRole] = useState('All');

    // Filter Logic
    const filteredAccounts = useMemo(() => {
        return mockAccounts.filter(user => {
            const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
            const matchesSearch =
                fullName.includes(searchQuery.toLowerCase()) ||
                user.userId.includes(searchQuery) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesRole = filterRole === 'All' || user.role === filterRole;

            return matchesSearch && matchesRole;
        });
    }, [searchQuery, filterRole]);

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to deactivate/remove this account?')) {
            console.log('Deleted account:', id);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Accounts" />

            <div className="flex flex-col h-[calc(100vh-4rem)] p-4 lg:p-6 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">

                {/* --- Header Bar --- */}
                <div className="flex items-center justify-between pb-2 border-b border-sidebar-border/60">
                    <div className="flex items-center gap-4">
                        <Link href="/admin-panel" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                            <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                                Admin Panel: <span className="text-purple-600 dark:text-purple-400">Manage Accounts</span>
                            </h1>
                        </div>
                    </div>
                    {/* Export Button */}
                    <button className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">
                        <Download className="size-4" /> Export List
                    </button>
                </div>

                {/* --- Main Content Split --- */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                    {/* === LEFT COLUMN: List (Spans 4) === */}
                    <div className="lg:col-span-4 flex flex-col gap-4 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm overflow-hidden">

                        {/* List Header */}
                        <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/20 border-b border-sidebar-border/60 space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xs font-bold text-white bg-neutral-900 dark:bg-purple-600 py-1 px-3 rounded-md uppercase tracking-wider">
                                        Staff Accounts
                                    </h2>
                                    {/* REGISTER BUTTON */}
                                    <button className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white p-1 rounded-md transition-colors shadow-sm" title="Register New Account">
                                        <Plus className="size-4" />
                                    </button>
                                </div>
                                <span className="text-[10px] text-neutral-400 font-mono">
                                    TOTAL: {filteredAccounts.length}
                                </span>
                            </div>

                            {/* Search & Filter */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                                    <input
                                        type="text"
                                        placeholder="Search User ID, Name..."
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`p-2 rounded-lg border border-sidebar-border transition-colors ${showFilters ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-white hover:bg-neutral-50 text-neutral-500'}`}
                                >
                                    {showFilters ? <X className="size-4" /> : <SlidersHorizontal className="size-4" />}
                                </button>
                            </div>

                            {/* Filter Dropdown */}
                            {showFilters && (
                                <div className="pt-2 border-t border-sidebar-border/50 animate-in slide-in-from-top-2">
                                    <select
                                        className="w-full text-xs p-2 rounded-lg border border-sidebar-border bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-purple-500/20"
                                        value={filterRole}
                                        onChange={(e) => setFilterRole(e.target.value)}
                                    >
                                        <option value="All">All Roles</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Staff">Staff</option>
                                        <option value="Viewer">Viewer</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* List Content */}
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-800/50 sticky top-0 z-10 backdrop-blur-sm">
                                <tr>
                                    <th className="px-4 py-3 font-semibold border-b border-sidebar-border w-16">ID</th>
                                    <th className="px-4 py-3 font-semibold border-b border-sidebar-border">Name</th>
                                    <th className="px-4 py-3 font-semibold border-b border-sidebar-border text-right">Role</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/50">
                                {filteredAccounts.map((user) => (
                                    <tr
                                        key={user.id}
                                        onClick={() => setSelectedUser(user)}
                                        className={`
                                                cursor-pointer transition-all hover:bg-purple-50 dark:hover:bg-purple-900/10
                                                ${selectedUser?.id === user.id ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-l-purple-500' : 'border-l-4 border-l-transparent'}
                                            `}
                                    >
                                        <td className="px-4 py-3 font-mono text-xs text-neutral-500">{user.userId}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-neutral-900 dark:text-neutral-100">{user.lastName}, {user.firstName}</div>
                                            <div className="text-[10px] text-neutral-500">{user.email}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getRoleColor(user.role)}`}>
                                                        {user.role}
                                                    </span>
                                                {/* TRASH ICON */}
                                                <button
                                                    onClick={(e) => handleDelete(e, user.id)}
                                                    className="text-neutral-300 hover:text-red-500 transition-colors p-1"
                                                >
                                                    <Trash2 className="size-3" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* === RIGHT COLUMN: Details (Spans 8) === */}
                    <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">

                        {/* Detail Content */}
                        {selectedUser ? (
                            <div className="flex-1 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm flex flex-col overflow-hidden">

                                {/* 1. Details Header */}
                                <div className="bg-neutral-50 dark:bg-neutral-900/20 border-b border-sidebar-border p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/20">
                                                <UserCog className="size-8 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                                    {selectedUser.firstName} {selectedUser.middleName} {selectedUser.lastName}
                                                </h2>
                                                <div className="flex items-center gap-2 mt-1 text-sm text-neutral-500">
                                                    <span className="font-mono bg-white dark:bg-black/20 border px-1.5 rounded text-xs">
                                                        ID: {selectedUser.userId}
                                                    </span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-2 ${getStatusColor(selectedUser.isActive)}`}>
                                                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* EDIT BUTTON (Blue) */}
                                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all hover:shadow-md">
                                            <Edit3 className="size-3.5" /> Update Account
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 bg-white dark:bg-sidebar border border-sidebar-border rounded-xl p-5 shadow-sm">
                                        <InfoRow label="First Name" value={selectedUser.firstName} />
                                        <InfoRow label="Middle Name" value={selectedUser.middleName} />
                                        <InfoRow label="Last Name" value={selectedUser.lastName} />
                                        <InfoRow label="User Role" value={selectedUser.role} highlight />
                                    </div>

                                    {/* Contact & Security */}
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="flex items-center gap-4 p-4 border border-sidebar-border rounded-xl bg-neutral-50/30">
                                            <Mail className="size-5 text-neutral-400" />
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-neutral-500 uppercase">Email Address</span>
                                                <span className="text-sm font-medium">{selectedUser.email}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 border border-sidebar-border rounded-xl bg-neutral-50/30">
                                            <Shield className="size-5 text-neutral-400" />
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-neutral-500 uppercase">Last Login</span>
                                                <span className="text-sm font-medium font-mono">{selectedUser.lastLogin}</span>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* Footer Audit */}
                                <div className="p-4 border-t border-sidebar-border/60 bg-neutral-50 dark:bg-neutral-900/50 flex flex-col md:flex-row justify-between items-start md:items-center text-[10px] text-neutral-400 font-mono gap-4">
                                    <div className="space-y-1">
                                        <div className="flex gap-2">
                                            <span className="font-bold w-20">DATE ENCODED:</span>
                                            <span>{selectedUser.dateEncoded}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="font-bold w-20">ENCODED BY:</span>
                                            <span>{selectedUser.encodedBy}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <span className="font-bold">DATE UPDATED:</span>
                                            <span>{selectedUser.dateUpdated}</span>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <span className="font-bold">UPDATED BY:</span>
                                            <span>{selectedUser.updatedBy}</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-sidebar-border rounded-2xl bg-neutral-50/50 text-neutral-400">
                                <UserCog className="size-12 mb-2 opacity-20" />
                                <p>Select an account to view details</p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

// --- Reusable ---

function InfoRow({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) {
    return (
        <div className="flex justify-between border-b border-sidebar-border/50 pb-1">
            <span className="text-neutral-500 font-medium text-sm">{label}:</span>
            <span className={`font-semibold text-sm ${highlight ? 'text-purple-600 dark:text-purple-400 font-mono' : 'text-neutral-900 dark:text-neutral-100'}`}>
                {value}
            </span>
        </div>
    );
}

function getRoleColor(role: string) {
    switch (role) {
        case 'Admin': return 'bg-red-100 text-red-700';
        case 'Staff': return 'bg-blue-100 text-blue-700';
        default: return 'bg-neutral-100 text-neutral-600';
    }
}

function getStatusColor(isActive: boolean) {
    return isActive
        ? 'bg-green-100 text-green-700 border-green-200'
        : 'bg-neutral-200 text-neutral-600 border-neutral-300';
}
