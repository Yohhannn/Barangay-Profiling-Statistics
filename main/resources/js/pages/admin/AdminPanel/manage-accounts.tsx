import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft, Search, Plus, Trash2, Shield, User,
    Edit3, X, UserCog, RefreshCw, Users, ChevronDown, ChevronRight,
    CheckSquare, Square, UserX, History,
} from 'lucide-react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { usePermission } from '@/hooks/use-permission';

/* ═══════════════════════════════════════════════════════════ TYPES ═══ */

interface UserAccount {
    id: number;
    userId: string;
    firstName: string;
    middleName: string;
    lastName: string;
    email: string | null;
    role: string;
    roleId?: number | null;
    permissions: number[];
    isActive: boolean;
    deleteReason?: string | null;
    lastLogin: string;
    lastActivity: string;
    dateEncoded: string;
    encodedBy: string;
    dateUpdated: string;
    updatedBy: string;
}

interface PermissionItem { perm_id: number; name: string; }
interface PermissionGroup { category: string; permissions: PermissionItem[]; }
interface RoleItem {
    role_id: number;
    name: string;
    description: string;
    permission_ids: number[];
}

type ActiveTab = 'active' | 'deactivated' | 'roles';

/* ══════════════════════════════════════════════════════ BREADCRUMBS ═══ */

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Panel', href: '/admin-panel' },
    { title: 'Manage Accounts', href: '/admin-panel/manage-accounts' },
];

/* ═══════════════════════════════════════════════════════════ PAGE ═══ */

export default function ManageAccounts({
    accounts = [],
    deletedAccounts = [],
    roles = [],
    allPermissions = [],
}: {
    accounts: UserAccount[];
    deletedAccounts: UserAccount[];
    roles: RoleItem[];
    allPermissions: PermissionGroup[];
}) {
    const { can } = usePermission();
    const { auth } = usePage<{ auth: { user: { sys_id: number } } }>().props;
    const isSelf = (user: UserAccount | null) => !!user && user.id === auth?.user?.sys_id;

    const [activeTab, setActiveTab]           = useState<ActiveTab>('active');

    const [selectedUser, setSelectedUser]     = useState<UserAccount | null>(null);
    const [searchQuery, setSearchQuery]       = useState('');
    const [filterRole, setFilterRole]         = useState('All');

    /* ── modals ── */
    const [isCreateOpen, setIsCreateOpen]         = useState(false);
    const [isUpdateOpen, setIsUpdateOpen]         = useState(false);
    const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
    const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
    const [isUpdateRoleOpen, setIsUpdateRoleOpen] = useState(false);
    const [selectedRole, setSelectedRole]         = useState<RoleItem | null>(null);

    /* ── form state ── */
    const blankCreate = { sys_fname: '', sys_mname: '', sys_lname: '', email: '', sys_password: '', permissions: [] as number[] };
    const blankUpdate = { sys_fname: '', sys_mname: '', sys_lname: '', email: '', sys_password: '', permissions: [] as number[] };
    const blankRole   = { name: '', description: '', permissions: [] as number[] };
    const blankDeact  = { delete_reason: '' };

    const [createData, setCreateData]     = useState(blankCreate);
    const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
    const [createLoading, setCreateLoading] = useState(false);

    const [updateData, setUpdateData]     = useState(blankUpdate);
    const [updateErrors, setUpdateErrors] = useState<Record<string, string>>({});
    const [updateLoading, setUpdateLoading] = useState(false);

    const [deactData, setDeactData]     = useState(blankDeact);
    const [deactErrors, setDeactErrors] = useState<Record<string, string>>({});
    const [deactLoading, setDeactLoading] = useState(false);

    const [roleData, setRoleData]     = useState(blankRole);
    const [roleErrors, setRoleErrors] = useState<Record<string, string>>({});
    const [roleLoading, setRoleLoading] = useState(false);

    /* ── sync selected user after page reload ── */
    useEffect(() => {
        if (accounts.length > 0) {
            if (!selectedUser) { setSelectedUser(accounts[0]); return; }
            const found = accounts.find(a => a.id === selectedUser.id);
            setSelectedUser(found ?? accounts[0]);
        } else {
            setSelectedUser(null);
        }
    }, [accounts]);

    /* ═══════════════════════════════════════════════ FILTER LOGIC ═══ */

    const filteredAccounts = useMemo(() => {
        return accounts.filter(u => {
            const name = `${u.firstName} ${u.lastName}`.toLowerCase();
            const matches = name.includes(searchQuery.toLowerCase())
                || u.userId.includes(searchQuery)
                || (u.email ?? '').toLowerCase().includes(searchQuery.toLowerCase());
            const roleMatch = filterRole === 'All' || u.role === filterRole;
            return matches && roleMatch;
        });
    }, [accounts, searchQuery, filterRole]);

    const allRoleNames = useMemo(() => ['All', ...Array.from(new Set(accounts.map(a => a.role)))], [accounts]);

    /* ═══════════════════════════════════════ PERMISSION HELPERS ═══ */

    const applyRole = useCallback((roleId: string, setter: (fn: (prev: any) => any) => void) => {
        const role = roles.find(r => r.role_id === Number(roleId));
        setter(prev => ({ ...prev, permissions: role ? [...role.permission_ids] : [] }));
    }, [roles]);

    /* ═══════════════════════════════════════════════ HANDLERS ═══════ */

    const handleSelectUser = (user: UserAccount) => {
        setSelectedUser(user);
        axios.post(`/admin-panel/manage-accounts/${user.id}/log-view`).catch(() => {});
    };

    /* ── Create ── */
    const openCreate = () => { setCreateData(blankCreate); setCreateErrors({}); setIsCreateOpen(true); };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true); setCreateErrors({});
        router.post('/admin-panel/manage-accounts', createData as any, {
            onSuccess: () => {
                Swal.fire({ icon: 'success', title: 'Account Registered', text: 'Staff account created successfully.', confirmButtonColor: '#4f46e5' });
                setIsCreateOpen(false); setCreateData(blankCreate);
            },
            onError: (errors) => {
                setCreateErrors(errors as any);
                Swal.fire({ icon: 'error', title: 'Registration Failed', text: 'Please fix the errors and try again.', confirmButtonColor: '#ef4444' });
            },
            onFinish: () => setCreateLoading(false),
        });
    };

    /* ── Update ── */
    const openUpdate = () => {
        if (!selectedUser) return;
        setUpdateData({
            sys_fname: selectedUser.firstName,
            sys_mname: selectedUser.middleName,
            sys_lname: selectedUser.lastName,
            email: selectedUser.email ?? '',
            sys_password: '',
            permissions: [...selectedUser.permissions],
        });
        setUpdateErrors({}); setIsUpdateOpen(true);
    };

    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        setUpdateLoading(true); setUpdateErrors({});
        router.put(`/admin-panel/manage-accounts/${selectedUser.id}`, updateData as any, {
            onSuccess: () => {
                Swal.fire({ icon: 'success', title: 'Account Updated', text: 'Staff account updated successfully.', confirmButtonColor: '#4f46e5' });
                setIsUpdateOpen(false);
            },
            onError: (errors) => {
                setUpdateErrors(errors as any);
                Swal.fire({ icon: 'error', title: 'Update Failed', text: 'Please fix the errors and try again.', confirmButtonColor: '#ef4444' });
            },
            onFinish: () => setUpdateLoading(false),
        });
    };

    /* ── Deactivate ── */
    const openDeactivate = (user: UserAccount) => { setSelectedUser(user); setDeactData(blankDeact); setDeactErrors({}); setIsDeactivateOpen(true); };

    const handleDeactivateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        setDeactLoading(true); setDeactErrors({});
        router.delete(`/admin-panel/manage-accounts/${selectedUser.id}`, {
            data: deactData,
            onSuccess: () => {
                Swal.fire({ icon: 'success', title: 'Account Deactivated', confirmButtonColor: '#4f46e5' });
                setIsDeactivateOpen(false);
            },
            onError: (errors) => setDeactErrors(errors as any),
            onFinish: () => setDeactLoading(false),
        });
    };

    /* ── Restore ── */
    const handleRestore = (user: UserAccount) => {
        Swal.fire({
            icon: 'question', title: 'Restore Account?',
            text: `Restore access for ${user.firstName} ${user.lastName}?`,
            showCancelButton: true, confirmButtonText: 'Restore', confirmButtonColor: '#10b981',
        }).then(res => {
            if (res.isConfirmed) {
                router.post(`/admin-panel/manage-accounts/${user.id}/restore`, {}, {
                    onSuccess: () => Swal.fire({ icon: 'success', title: 'Account Restored', confirmButtonColor: '#10b981' }),
                });
            }
        });
    };

    /* ── Create Role ── */
    const openCreateRole = () => { setRoleData(blankRole); setRoleErrors({}); setIsCreateRoleOpen(true); };

    const handleCreateRoleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setRoleLoading(true); setRoleErrors({});
        router.post('/admin-panel/roles', roleData as any, {
            onSuccess: () => {
                Swal.fire({ icon: 'success', title: 'Role Created', confirmButtonColor: '#4f46e5' });
                setIsCreateRoleOpen(false); setRoleData(blankRole);
            },
            onError: (errors) => setRoleErrors(errors as any),
            onFinish: () => setRoleLoading(false),
        });
    };

    /* ── Update Role ── */
    const openUpdateRole = (role: RoleItem) => {
        setSelectedRole(role);
        setRoleData({ name: role.name, description: role.description, permissions: [...role.permission_ids] });
        setRoleErrors({}); setIsUpdateRoleOpen(true);
    };

    const handleUpdateRoleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRole) return;
        setRoleLoading(true); setRoleErrors({});
        router.put(`/admin-panel/roles/${selectedRole.role_id}`, roleData as any, {
            onSuccess: () => {
                Swal.fire({ icon: 'success', title: 'Role Updated', confirmButtonColor: '#4f46e5' });
                setIsUpdateRoleOpen(false);
            },
            onError: (errors) => setRoleErrors(errors as any),
            onFinish: () => setRoleLoading(false),
        });
    };

    /* ── Delete Role ── */
    const handleDeleteRole = (role: RoleItem) => {
        Swal.fire({
            icon: 'warning', title: `Delete "${role.name}"?`,
            text: 'This will permanently remove the role. Existing accounts keep their permissions.',
            showCancelButton: true, confirmButtonText: 'Delete', confirmButtonColor: '#ef4444',
        }).then(res => {
            if (res.isConfirmed) {
                router.delete(`/admin-panel/roles/${role.role_id}`, {
                    onSuccess: () => Swal.fire({ icon: 'success', title: 'Role Deleted', confirmButtonColor: '#4f46e5' }),
                });
            }
        });
    };

    /* ═══════════════════════════════════════════════════════ RENDER ═══ */

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Accounts" />

            <div className="flex flex-col h-[calc(100vh-4rem)] p-4 lg:p-6 gap-4 overflow-hidden max-w-[1920px] mx-auto w-full">

                {/* Header bar */}
                <div className="flex items-center gap-4 pb-2 border-b border-sidebar-border/60">
                    <Link href="/admin-panel" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <ArrowLeft className="size-6 text-neutral-600 dark:text-neutral-300" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                            Admin Panel: <span className="text-indigo-600 dark:text-indigo-400">Manage Accounts</span>
                        </h1>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800/50 p-1 rounded-xl w-fit shrink-0">
                    {([
                        { key: 'active',      label: 'Active Staff', icon: Users,  count: accounts.length },
                        { key: 'deactivated', label: 'Deactivated',  icon: UserX,  count: deletedAccounts.length },
                        { key: 'roles',       label: 'Roles',        icon: Shield, count: roles.length },
                    ] as const).map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                activeTab === tab.key
                                    ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                            }`}
                        >
                            <tab.icon className="size-3.5" />
                            {tab.label}
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                                activeTab === tab.key ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
                            }`}>{tab.count}</span>
                        </button>
                    ))}
                </div>

                {/* ══════════════════════════════════════ TAB: ACTIVE ══════ */}
                {activeTab === 'active' && (
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                        {/* Left: List */}
                        <div className="lg:col-span-4 flex flex-col gap-4 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm overflow-hidden">

                            {/* List header */}
                            <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/20 border-b border-sidebar-border/60 space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xs font-bold text-white bg-neutral-900 dark:bg-indigo-600 py-1 px-3 rounded-md uppercase tracking-wider">
                                            Staff List
                                        </h2>
                                        {can('Create Account') && (
                                            <button
                                                onClick={openCreate}
                                                className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white p-1 rounded-md transition-colors shadow-sm"
                                                title="Register New Staff Account"
                                            >
                                                <Plus className="size-4" />
                                            </button>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-neutral-400 font-mono">TOTAL: {filteredAccounts.length}</span>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Search name, ID, email..."
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-sidebar-border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    />
                                </div>

                                <select
                                    value={filterRole}
                                    onChange={e => setFilterRole(e.target.value)}
                                    className="w-full text-xs p-2 rounded-lg border border-sidebar-border bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    {allRoleNames.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>

                            {/* Account list */}
                            <div className="flex-1 overflow-auto">
                                <div className="flex flex-col">
                                    {filteredAccounts.length > 0 ? (
                                        filteredAccounts.map(user => (
                                            <div
                                                key={user.id}
                                                onClick={() => handleSelectUser(user)}
                                                className={`
                                                    group cursor-pointer p-4 border-b border-sidebar-border/50 border-l-4 transition-all duration-200
                                                    ${selectedUser?.id === user.id
                                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-indigo-500'
                                                        : 'border-l-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:border-l-indigo-200'}
                                                `}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className={`font-bold text-sm ${selectedUser?.id === user.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-neutral-900 dark:text-neutral-100'}`}>
                                                            {user.lastName}, {user.firstName}
                                                        </h3>
                                                        <p className="text-xs text-neutral-500 font-mono mt-0.5">{user.userId}</p>
                                                    </div>
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                                                        {user.role}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-neutral-400 text-xs">
                                            No accounts found matching your filters.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Detail */}
                        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
                            {selectedUser ? (
                                <div className="flex-1 bg-white dark:bg-sidebar rounded-2xl border border-sidebar-border/60 shadow-sm flex flex-col overflow-hidden">

                                    {/* Top header */}
                                    <div className="p-6 border-b border-sidebar-border/60 bg-neutral-50/50 dark:bg-neutral-900/30">
                                        <div className="flex items-start gap-5">
                                            {/* Avatar */}
                                            <div className="w-24 h-24 shrink-0 bg-white dark:bg-neutral-800 rounded-xl border border-sidebar-border flex items-center justify-center shadow-sm">
                                                <span className="text-3xl font-black text-neutral-300">
                                                    {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                                                </span>
                                            </div>

                                            {/* Name block */}
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                                            {selectedUser.firstName} {selectedUser.middleName ? selectedUser.middleName + ' ' : ''}{selectedUser.lastName}
                                                        </h1>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded">
                                                                {selectedUser.userId}
                                                            </span>
                                                            <span className="text-xs font-bold px-2 py-0.5 rounded border bg-green-50 text-green-600 border-green-100">
                                                                ACTIVE
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {can('Update Account') && !isSelf(selectedUser) && (
                                                        <button onClick={openUpdate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all hover:shadow-md">
                                                            <Edit3 className="size-3.5" /> Edit Account
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Badge row */}
                                                <div className="flex flex-wrap gap-2 mt-4">
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800">
                                                        {selectedUser.role}
                                                    </span>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800">
                                                        {selectedUser.permissions.length} Permissions
                                                    </span>
                                                    {selectedUser.email && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                                                            {selectedUser.email}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Scrollable details */}
                                    <div className="flex-1 overflow-y-auto p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                                            {/* Account Info */}
                                            <div className="col-span-1 space-y-4">
                                                <SectionHeader icon={<User className="size-4" />} title="Account Info" />
                                                <div className="bg-neutral-50 dark:bg-neutral-900/20 rounded-xl p-4 border border-sidebar-border space-y-3">
                                                    <InfoItem label="Email" value={selectedUser.email ?? 'Not set'} />
                                                    <InfoItem label="Role" value={selectedUser.role} highlight />
                                                    <InfoItem label="Account ID" value={selectedUser.userId} />
                                                </div>
                                            </div>

                                            {/* Activity */}
                                            <div className="col-span-1 space-y-4">
                                                <SectionHeader icon={<History className="size-4" />} title="Activity" />
                                                <div className="bg-neutral-50 dark:bg-neutral-900/20 rounded-xl p-4 border border-sidebar-border space-y-3">
                                                    <InfoItem label="Date Registered" value={selectedUser.dateEncoded} />
                                                    <InfoItem label="Last Login" value={selectedUser.lastLogin} />
                                                    <InfoItem label="Last Activity" value={selectedUser.lastActivity} />
                                                </div>
                                            </div>

                                            {/* Permissions — full row */}
                                            <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-4">
                                                <SectionHeader icon={<Shield className="size-4" />} title={`Assigned Permissions (${selectedUser.permissions.length})`} />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {allPermissions.map(group => {
                                                        const granted = group.permissions.filter(p => selectedUser.permissions.includes(p.perm_id));
                                                        if (granted.length === 0) return null;
                                                        return (
                                                            <div key={group.category} className="bg-neutral-50 dark:bg-neutral-900/20 rounded-xl p-4 border border-sidebar-border">
                                                                <p className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider mb-2">{group.category}</p>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {granted.map(p => (
                                                                        <span key={p.perm_id} className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                                                                            {p.name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    {/* Footer audit */}
                                    <div className="p-4 border-t border-sidebar-border/60 bg-neutral-50 dark:bg-neutral-900/50 flex flex-col md:flex-row justify-between items-start md:items-center text-[10px] text-neutral-400 font-mono gap-4">
                                        <div className="space-y-1">
                                            <div className="flex gap-2">
                                                <span className="font-bold w-28">DATE REGISTERED:</span>
                                                <span>{selectedUser.dateEncoded}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="font-bold w-28">LAST LOGIN:</span>
                                                <span>{selectedUser.lastLogin}</span>
                                            </div>
                                        </div>
                                        {can('Delete Account') && !isSelf(selectedUser) && (
                                            <button
                                                onClick={() => openDeactivate(selectedUser)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                                            >
                                                <Trash2 className="size-3" /> Deactivate Account
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-sidebar-border rounded-2xl bg-neutral-50/50 text-neutral-400">
                                    <UserCog className="size-12 mb-2 opacity-20" />
                                    <p>Select an account from the list to view full profile</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════ TAB: DEACTIVATED ══════ */}
                {activeTab === 'deactivated' && (
                    <div className="flex-1 bg-white dark:bg-sidebar border border-sidebar-border/60 shadow-sm rounded-2xl overflow-hidden flex flex-col">
                        <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/20 border-b border-sidebar-border/60 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xs font-bold text-white bg-neutral-900 dark:bg-red-700 py-1 px-3 rounded-md uppercase tracking-wider">
                                    Deactivated Accounts
                                </h2>
                            </div>
                            <span className="text-[10px] text-neutral-400 font-mono">TOTAL: {deletedAccounts.length}</span>
                        </div>

                        {deletedAccounts.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
                                <UserX className="size-12 mb-2 opacity-20" />
                                <p className="text-sm">No deactivated accounts</p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-sidebar-border text-[10px] uppercase text-neutral-500 tracking-wider sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-bold">ID</th>
                                            <th className="px-4 py-3 text-left font-bold">Full Name</th>
                                            <th className="px-4 py-3 text-left font-bold">Email</th>
                                            <th className="px-4 py-3 text-left font-bold">Role</th>
                                            <th className="px-4 py-3 text-left font-bold">Reason</th>
                                            <th className="px-4 py-3 text-center font-bold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-sidebar-border/50">
                                        {deletedAccounts.map(user => (
                                            <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                                                <td className="px-4 py-3 font-mono text-xs text-neutral-500">{user.userId}</td>
                                                <td className="px-4 py-3">
                                                    <div className="font-bold text-neutral-900 dark:text-neutral-100">{user.lastName}, {user.firstName}</div>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-neutral-500">{user.email ?? <span className="italic text-neutral-400">—</span>}</td>
                                                <td className="px-4 py-3">
                                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">{user.role}</span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-red-500 max-w-xs truncate">{user.deleteReason ?? '—'}</td>
                                                <td className="px-4 py-3 text-center">
                                                    {can('Update Account') && (
                                                        <button
                                                            onClick={() => handleRestore(user)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                                                        >
                                                            <RefreshCw className="size-3" /> Restore
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ══════════════════════════════════════ TAB: ROLES ══════ */}
                {activeTab === 'roles' && (
                    <div className="flex-1 bg-white dark:bg-sidebar border border-sidebar-border/60 shadow-sm rounded-2xl overflow-hidden flex flex-col">
                        <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/20 border-b border-sidebar-border/60 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xs font-bold text-white bg-neutral-900 dark:bg-violet-600 py-1 px-3 rounded-md uppercase tracking-wider">
                                    Role Management
                                </h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-neutral-400 font-mono">TOTAL: {roles.length}</span>
                                <button
                                    onClick={openCreateRole}
                                    className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white p-1 rounded-md transition-colors shadow-sm"
                                    title="Create New Role"
                                >
                                    <Plus className="size-4" />
                                </button>
                            </div>
                        </div>

                        {roles.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
                                <Shield className="size-12 mb-2 opacity-20" />
                                <p className="text-sm">No roles defined</p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-sidebar-border text-[10px] uppercase text-neutral-500 tracking-wider sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-bold">Role Name</th>
                                            <th className="px-4 py-3 text-left font-bold">Description</th>
                                            <th className="px-4 py-3 text-center font-bold">Permissions</th>
                                            <th className="px-4 py-3 text-center font-bold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-sidebar-border/50">
                                        {roles.map(role => (
                                            <tr key={role.role_id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{role.name}</span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-neutral-500 max-w-sm">{role.description || '—'}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="font-mono text-sm font-bold text-neutral-700 dark:text-neutral-300">{role.permission_ids.length}</span>
                                                    <span className="text-[10px] text-neutral-400 ml-1">perms</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button onClick={() => openUpdateRole(role)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors" title="Edit">
                                                            <Edit3 className="size-3.5" />
                                                        </button>
                                                        <button onClick={() => handleDeleteRole(role)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors" title="Delete">
                                                            <Trash2 className="size-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════ MODALS ═══════ */}

            {/* CREATE ACCOUNT MODAL */}
            <AccountModal
                open={isCreateOpen}
                title="Register New Staff Account"
                subtitle="Account ID will be auto-generated"
                onClose={() => { setIsCreateOpen(false); setCreateData(blankCreate); }}
                onSubmit={handleCreateSubmit}
                loading={createLoading}
                submitLabel="Register Account"
                submitColor="bg-green-600 hover:bg-green-700"
                data={createData}
                errors={createErrors}
                onChange={(key, val) => setCreateData(prev => ({ ...prev, [key]: val }))}
                roles={roles}
                allPermissions={allPermissions}
                showPassword
                showIdField={false}
                onRoleSelect={roleId => applyRole(roleId, setCreateData)}
            />

            {/* UPDATE ACCOUNT MODAL */}
            <AccountModal
                open={isUpdateOpen && !!selectedUser}
                title="Edit Staff Account"
                subtitle={selectedUser ? `Editing: ${selectedUser.firstName} ${selectedUser.lastName} (ID: ${selectedUser.userId})` : ''}
                onClose={() => { setIsUpdateOpen(false); }}
                onSubmit={handleUpdateSubmit}
                loading={updateLoading}
                submitLabel="Save Changes"
                submitColor="bg-blue-600 hover:bg-blue-700"
                data={updateData}
                errors={updateErrors}
                onChange={(key, val) => setUpdateData(prev => ({ ...prev, [key]: val }))}
                roles={roles}
                allPermissions={allPermissions}
                showPassword
                passwordOptional
                showIdField={false}
                onRoleSelect={roleId => applyRole(roleId, setUpdateData)}
            />

            {/* DEACTIVATE MODAL */}
            {isDeactivateOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#0f172a] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                        <div className="bg-red-950 text-white p-5 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold flex items-center gap-2"><Trash2 className="size-5 text-red-400" /> Deactivate Account</h2>
                                <p className="text-[10px] text-red-300 mt-1 uppercase tracking-wider">{selectedUser.firstName} {selectedUser.lastName} ({selectedUser.userId})</p>
                            </div>
                            <button onClick={() => setIsDeactivateOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"><X className="size-5" /></button>
                        </div>
                        <form onSubmit={handleDeactivateSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">Reason for Deactivation <span className="text-red-500">*</span></label>
                                <textarea
                                    rows={3}
                                    value={deactData.delete_reason}
                                    onChange={e => setDeactData({ delete_reason: e.target.value })}
                                    placeholder="State the reason..."
                                    className={`w-full text-xs p-2.5 rounded-lg border resize-none ${deactErrors.delete_reason ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'} bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none`}
                                />
                                {deactErrors.delete_reason && <p className="text-[10px] text-red-500">{deactErrors.delete_reason}</p>}
                            </div>
                            <div className="pt-2 flex gap-2 justify-end">
                                <button type="button" onClick={() => setIsDeactivateOpen(false)} className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">Cancel</button>
                                <button type="submit" disabled={deactLoading} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-all">
                                    {deactLoading ? 'Deactivating...' : 'Deactivate'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CREATE ROLE MODAL */}
            <RoleModal
                open={isCreateRoleOpen}
                title="Create New Role"
                onClose={() => { setIsCreateRoleOpen(false); setRoleData(blankRole); }}
                onSubmit={handleCreateRoleSubmit}
                loading={roleLoading}
                submitLabel="Create Role"
                data={roleData}
                errors={roleErrors}
                onChange={(key, val) => setRoleData(prev => ({ ...prev, [key]: val }))}
                allPermissions={allPermissions}
            />

            {/* UPDATE ROLE MODAL */}
            <RoleModal
                open={isUpdateRoleOpen}
                title={`Edit Role: ${selectedRole?.name ?? ''}`}
                onClose={() => { setIsUpdateRoleOpen(false); }}
                onSubmit={handleUpdateRoleSubmit}
                loading={roleLoading}
                submitLabel="Save Role"
                data={roleData}
                errors={roleErrors}
                onChange={(key, val) => setRoleData(prev => ({ ...prev, [key]: val }))}
                allPermissions={allPermissions}
            />
        </AppLayout>
    );
}

/* ═════════════════════════════════════════════════ SUB-COMPONENTS ═══ */

function SectionHeader({ icon, title }: { icon: React.ReactNode, title: string }) {
    return (
        <div className="flex items-center gap-2 pb-1 border-b border-sidebar-border/50">
            <span className="text-neutral-400">{icon}</span>
            <h3 className="text-xs font-bold uppercase text-neutral-600 dark:text-neutral-300 tracking-wider">{title}</h3>
        </div>
    );
}

function InfoItem({ label, value, highlight = false }: { label: string, value: string | number, highlight?: boolean }) {
    return (
        <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">{label}</span>
            <span className={`text-sm truncate font-medium ${highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-800 dark:text-neutral-200'}`}>
                {value}
            </span>
        </div>
    );
}

/* ── Permissions Checkbox Selector ── */

function PermissionsSelector({
    allPermissions,
    selected,
    onChange,
}: {
    allPermissions: PermissionGroup[];
    selected: number[];
    onChange: (ids: number[]) => void;
}) {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const toggle = (permId: number) => {
        onChange(selected.includes(permId) ? selected.filter(id => id !== permId) : [...selected, permId]);
    };

    const toggleCategory = (group: PermissionGroup) => {
        const catIds = group.permissions.map(p => p.perm_id);
        const allSel = catIds.every(id => selected.includes(id));
        onChange(allSel ? selected.filter(id => !catIds.includes(id)) : [...new Set([...selected, ...catIds])]);
    };

    const toggleExpanded = (cat: string) => setExpanded(prev => ({ ...prev, [cat]: !prev[cat] }));

    return (
        <div className="space-y-2">
            {allPermissions.map(group => {
                const catIds = group.permissions.map(p => p.perm_id);
                const allSel = catIds.every(id => selected.includes(id));
                const someSel = catIds.some(id => selected.includes(id)) && !allSel;
                const isExp = expanded[group.category] !== false;

                return (
                    <div key={group.category} className="border border-sidebar-border rounded-xl overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 cursor-pointer" onClick={() => toggleExpanded(group.category)}>
                            <input
                                type="checkbox"
                                checked={allSel}
                                ref={el => { if (el) el.indeterminate = someSel; }}
                                onChange={() => toggleCategory(group)}
                                onClick={e => e.stopPropagation()}
                                className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">{group.category}</span>
                            <span className="text-[9px] text-neutral-400 font-mono">{catIds.filter(id => selected.includes(id)).length}/{catIds.length}</span>
                            {isExp ? <ChevronDown className="size-3.5 text-neutral-400" /> : <ChevronRight className="size-3.5 text-neutral-400" />}
                        </div>
                        {isExp && (
                            <div className="p-2 grid grid-cols-2 gap-1 bg-white dark:bg-neutral-900/20">
                                {group.permissions.map(perm => (
                                    <label key={perm.perm_id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(perm.perm_id)}
                                            onChange={() => toggle(perm.perm_id)}
                                            className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className={`text-[10px] font-medium transition-colors ${selected.includes(perm.perm_id) ? 'text-indigo-700 dark:text-indigo-400' : 'text-neutral-600 dark:text-neutral-400'}`}>
                                            {perm.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* ── Account Modal (Create / Update) ── */

interface AccountModalProps {
    open: boolean;
    title: string;
    subtitle: string;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    submitLabel: string;
    submitColor: string;
    data: Record<string, any>;
    errors: Record<string, string>;
    onChange: (key: string, val: any) => void;
    roles: RoleItem[];
    allPermissions: PermissionGroup[];
    showPassword?: boolean;
    passwordOptional?: boolean;
    showIdField?: boolean;
    onRoleSelect: (roleId: string) => void;
}

function AccountModal({
    open, title, subtitle, onClose, onSubmit, loading, submitLabel, submitColor,
    data, errors, onChange, roles, allPermissions, showPassword, passwordOptional, onRoleSelect,
}: AccountModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#0f172a] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] border border-white/20">
                <div className="relative bg-[#1e1b4b] text-white p-5 flex justify-between items-center shrink-0 rounded-t-2xl">
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2"><UserCog className="size-5 text-indigo-400" />{title}</h2>
                        {subtitle && <p className="text-[10px] text-indigo-300 mt-1 uppercase tracking-wider">{subtitle}</p>}
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"><X className="size-5" /></button>
                </div>

                <form onSubmit={onSubmit} className="overflow-y-auto flex-1 p-6 space-y-5">
                    <div>
                        <p className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider mb-3">Basic Information</p>
                        <div className="grid grid-cols-3 gap-3">
                            <InputGroup label="First Name *" value={data.sys_fname} onChange={e => onChange('sys_fname', e.target.value)} placeholder="First Name" error={errors.sys_fname} />
                            <InputGroup label="Middle Name" value={data.sys_mname} onChange={e => onChange('sys_mname', e.target.value)} placeholder="(Optional)" error={errors.sys_mname} />
                            <InputGroup label="Last Name *" value={data.sys_lname} onChange={e => onChange('sys_lname', e.target.value)} placeholder="Last Name" error={errors.sys_lname} />
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                            <InputGroup label="Email Address" type="email" value={data.email} onChange={e => onChange('email', e.target.value)} placeholder="email@example.com (Optional)" error={errors.email} />
                            {showPassword && (
                                <InputGroup label={passwordOptional ? 'New Password (leave blank to keep)' : 'Password *'} type="password" value={data.sys_password} onChange={e => onChange('sys_password', e.target.value)} placeholder={passwordOptional ? 'Leave blank to keep current' : 'At least 6 characters'} error={errors.sys_password} />
                            )}
                        </div>
                    </div>

                    <hr className="border-sidebar-border" />

                    <div>
                        <p className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider mb-2">Quick Role Preset <span className="font-normal text-neutral-400 normal-case">(optional — auto-fills permissions below)</span></p>
                        <select
                            className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            onChange={e => onRoleSelect(e.target.value)}
                            defaultValue=""
                        >
                            <option value="">— Select a role to auto-fill permissions —</option>
                            {roles.map(r => <option key={r.role_id} value={r.role_id}>{r.name}{r.description ? ` — ${r.description}` : ''}</option>)}
                        </select>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider flex items-center gap-1.5">
                                <Shield className="size-3.5" /> Permissions <span className="font-normal text-neutral-400 normal-case">({data.permissions?.length ?? 0} selected)</span>
                            </p>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => onChange('permissions', allPermissions.flatMap(g => g.permissions.map(p => p.perm_id)))} className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1"><CheckSquare className="size-3" /> All</button>
                                <button type="button" onClick={() => onChange('permissions', [])} className="text-[10px] text-red-500 hover:underline flex items-center gap-1"><Square className="size-3" /> None</button>
                            </div>
                        </div>
                        {errors.permissions && <p className="text-[10px] text-red-500 mb-2">{errors.permissions}</p>}
                        <PermissionsSelector
                            allPermissions={allPermissions}
                            selected={data.permissions ?? []}
                            onChange={ids => onChange('permissions', ids)}
                        />
                    </div>
                </form>

                <div className="p-4 border-t border-sidebar-border flex justify-end gap-2 shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">Cancel</button>
                    <button onClick={onSubmit} disabled={loading} className={`px-6 py-2 ${submitColor} text-white rounded-lg text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-all`}>
                        {loading ? 'Saving...' : submitLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Role Modal ── */

interface RoleModalProps {
    open: boolean;
    title: string;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    submitLabel: string;
    data: Record<string, any>;
    errors: Record<string, string>;
    onChange: (key: string, val: any) => void;
    allPermissions: PermissionGroup[];
}

function RoleModal({ open, title, onClose, onSubmit, loading, submitLabel, data, errors, onChange, allPermissions }: RoleModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#0f172a] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] border border-white/20">
                <div className="bg-[#1e1b4b] text-white p-5 flex justify-between items-center shrink-0 rounded-t-2xl">
                    <h2 className="text-lg font-bold flex items-center gap-2"><Shield className="size-5 text-indigo-400" />{title}</h2>
                    <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"><X className="size-5" /></button>
                </div>

                <form onSubmit={onSubmit} className="overflow-y-auto flex-1 p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <InputGroup label="Role Name *" value={data.name} onChange={e => onChange('name', e.target.value)} placeholder="e.g. SUPERVISOR" error={errors.name} />
                        <InputGroup label="Description" value={data.description} onChange={e => onChange('description', e.target.value)} placeholder="Brief description" error={errors.description} />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider flex items-center gap-1.5">
                                <Shield className="size-3.5" /> Permissions ({data.permissions?.length ?? 0} selected)
                            </p>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => onChange('permissions', allPermissions.flatMap(g => g.permissions.map(p => p.perm_id)))} className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1"><CheckSquare className="size-3" /> All</button>
                                <button type="button" onClick={() => onChange('permissions', [])} className="text-[10px] text-red-500 hover:underline flex items-center gap-1"><Square className="size-3" /> None</button>
                            </div>
                        </div>
                        {errors.permissions && <p className="text-[10px] text-red-500 mb-2">{errors.permissions}</p>}
                        <PermissionsSelector
                            allPermissions={allPermissions}
                            selected={data.permissions ?? []}
                            onChange={ids => onChange('permissions', ids)}
                        />
                    </div>
                </form>

                <div className="p-4 border-t border-sidebar-border flex justify-end gap-2 shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">Cancel</button>
                    <button onClick={onSubmit} disabled={loading} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-all">
                        {loading ? 'Saving...' : submitLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Shared Input ── */

function InputGroup({
    label, value, onChange, placeholder = '', type = 'text', error,
}: {
    label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string; type?: string; error?: string;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wide">{label}</label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full text-xs p-2.5 rounded-lg border ${error ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800'} text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all`}
            />
            {error && <p className="text-[10px] text-red-500">{error}</p>}
        </div>
    );
}
