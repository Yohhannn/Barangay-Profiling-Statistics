import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
    dashboard,
    citizenPanel,
    citizenRecords,
    statistics,
    institutions,
    transactions,
    adminPanel,
} from '@/routes';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    UserRound,
    BookOpen,
    ChartPie,
    Landmark,
    ConciergeBell,
    Shield,
} from 'lucide-react';
import AppLogo from './app-logo';
import { useMemo } from 'react';

/* ─────────────────────────────────────────────────────────────────────
 * Each nav entry declares which permissions allow it to appear.
 * The user needs at least ONE of the listed permissions to see the item.
 * An empty array [] means always visible to any authenticated user.
 * ───────────────────────────────────────────────────────────────────── */

interface GuardedNavItem extends NavItem {
    requiredPermissions: string[];
}

const allMainNavItems: GuardedNavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        requiredPermissions: ['View Dashboard'],
    },
    {
        title: 'Citizen Panel',
        href: citizenPanel(),
        icon: UserRound,
        requiredPermissions: [
            'View Citizen Profile',
            'Create Citizen Profile',
            'Update Citizen Profile',
            'Delete Citizen Profile',
            'View Household Profile',
            'Create Household Profile',
            'Update Household Profile',
            'Delete Household Profile',
        ],
    },
    {
        title: 'Citizen Records',
        href: citizenRecords(),
        icon: BookOpen,
        requiredPermissions: [
            'View Citizen History',
            'Create Citizen History',
            'Update Citizen History',
            'Delete Citizen History',
            'View Medical History',
            'Create Medical History',
            'Update Medical History',
            'Delete Medical History',
            'View Settlement History',
            'Create Settlement History',
            'Update Settlement History',
            'Delete Settlement History',
        ],
    },
    {
        title: 'Statistics',
        href: statistics(),
        icon: ChartPie,
        requiredPermissions: [
            'View Demographic',
            'View Neighborhood',
            'View Household',
            'View Education',
            'View Employment',
            'View Health',
            'View Business',
            'View Infrastructures',
        ],
    },
    {
        title: 'Institutions',
        href: institutions(),
        icon: Landmark,
        requiredPermissions: [
            'View Business',
            'Create Business',
            'Update Business',
            'Delete Business',
            'View Infrastructure',
            'Create Infrastructure',
            'Update Infrastructure',
            'Delete Infrastructure',
        ],
    },
    {
        title: 'Transactions',
        href: transactions(),
        icon: ConciergeBell,
        requiredPermissions: [
            'View Services',
            'Create Services',
            'Update Services',
            'Delete Services',
            'Export Services',
        ],
    },
];

const allAdminNavItems: GuardedNavItem[] = [
    {
        title: 'Admin Panel',
        href: adminPanel(),
        icon: Shield,
        requiredPermissions: [
            'View Account',
            'Create Account',
            'Update Account',
            'Deactivate Account',
            'Reactivate Account',
            'Create Role',
            'Update Role',
            'Delete Role',
            'View Archive',
            'Restore Archive',
            'View Audit Logs',
        ],
    },
];

/* ────────────────────────────────────────────────────────────── */

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;

    // Use a stable primitive key so useMemo updates correctly on permission changes
    const userPermissions: string[] = (auth?.user?.permissions as string[]) ?? [];
    const permKey = userPermissions.join(',');

    // Filter a list of guarded items — keep only those where the user has at least
    // one of the required permissions (or the list is empty = no restriction).
    const filterItems = (items: GuardedNavItem[]): NavItem[] =>
        items
            .filter(
                (item) =>
                    item.requiredPermissions.length === 0 ||
                    item.requiredPermissions.some((p) => userPermissions.includes(p)),
            )
            // Strip the requiredPermissions field before passing to NavMain
            .map(({ requiredPermissions: _stripped, ...rest }) => rest);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const mainNavItems: NavItem[] = useMemo(() => filterItems(allMainNavItems), [permKey]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const adminNavItems: NavItem[] = useMemo(() => filterItems(allAdminNavItems), [permKey]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* General navigation — each item only appears if the user
                    has at least one of its required permissions */}
                {mainNavItems.length > 0 && (
                    <NavMain items={mainNavItems} label="General" />
                )}

                {/* Admin section — completely hidden unless the user has
                    at least one admin-level permission */}
                {adminNavItems.length > 0 && (
                    <NavMain items={adminNavItems} label="Administrative Access" />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
