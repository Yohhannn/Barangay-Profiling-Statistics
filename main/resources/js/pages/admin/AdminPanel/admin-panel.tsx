import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Panel',
        href: '/admin-panel',
    },
];

export default function AdminPanel() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Panel" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    {/* Add your Profile Content Here */}
                    <div className="p-6">
                        <h1 className="text-2xl font-bold">Admin Panel</h1>
                        <p className="text-muted-foreground">Overview of all administrative interfaces.</p>
                    </div>
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}
