import { useSidebar } from '@/components/ui/sidebar'; //
import AppLogoIcon from './app-logo-icon'; //

export default function AppLogo() {
    const { state } = useSidebar(); //
    const isCollapsed = state === 'collapsed'; //

    return (
        <>
            {/* Logo Container */}
            <div className="flex items-center gap-1.5">
                    <img
                        src="/logo/brgylogo.png"
                        alt="Barangay Logo"
                        className="size-8 object-contain"
                    />

            </div>

            {/* Text Labels: Only show when NOT collapsed.
            */}
            {!isCollapsed && (
                <div className="ml-2 grid flex-1 text-left leading-tight transition-all">
                    <span className="truncate font-black text-blue-600 text-sm tracking-tight">
                        MaPro
                    </span>
                    <span className="truncate text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                        Barangay Marigondon
                    </span>
                </div>
            )}
        </>
    );
}
