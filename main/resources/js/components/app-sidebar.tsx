import { NavFooter } from '@/components/nav-footer';
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
import { dashboard, citizenPanel, citizenRecords, statistics, institutions, transactions, activityLogs, archives, adminPanel } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    LayoutGrid,
    UserRound,
    Archive,
    ChartPie,
    Landmark,
    ConciergeBell,
    UserCircle,
    ShieldCheck,
    Shield,
    Logs,
    Users,
    Settings,
    ArchiveX,
} from 'lucide-react';
import AppLogo from './app-logo';

// General Navigation Items
const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Citizen Panel',
        href: citizenPanel(),
        icon: UserRound,
    },
    {
        title: 'Citizen Records',
        href: citizenRecords(),
        icon: Archive,
    },
    {
        title: 'Statistics',
        href: statistics(),
        icon: ChartPie,
    },
    {
        title: 'Institutions',
        href: institutions(),
        icon: Landmark,
    },
    {
        title: 'Transactions',
        href: transactions(),
        icon: ConciergeBell,
    },
];

// Administrative Access Items
const adminNavItems: NavItem[] = [
    {
        title: 'Admin Panel',
        href: adminPanel(), // Update with actual route helper when created
        icon: Shield,
    },
    {
        title: 'Activity Logs',
        href: activityLogs(), // Update with actual route helper when created
        icon: Logs,
    },
    {
        title: 'Archives',
        href: archives(), // Update with actual route helper when created
        icon: ArchiveX
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
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
                {/* General Group */}
                <NavMain items={mainNavItems} label="General" />

                {/* Administrative Access Group */}
                <NavMain items={adminNavItems} label="Administrative Access" />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
