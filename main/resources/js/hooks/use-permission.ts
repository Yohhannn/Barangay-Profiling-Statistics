import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

/**
 * Hook to check permissions for the currently logged-in user.
 *
 * const { can, hasAny } = usePermission();
 * can('Delete Citizen Profile')    → boolean
 * hasAny(['Create Services', 'Update Services'])  → boolean
 */
export function usePermission() {
    const { auth } = usePage<SharedData>().props;
    const permissions: string[] = (auth?.user?.permissions as string[]) ?? [];

    const can = (permission: string): boolean => permissions.includes(permission);

    const hasAny = (perms: string[]): boolean =>
        perms.some((p) => permissions.includes(p));

    const hasAll = (perms: string[]): boolean =>
        perms.every((p) => permissions.includes(p));

    return { can, hasAny, hasAll, permissions };
}
