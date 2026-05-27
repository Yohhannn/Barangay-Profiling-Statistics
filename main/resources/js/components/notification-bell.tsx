import { Button } from '@/components/ui/button';
import { type Notification, type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import {
    Archive,
    Bell,
    Building2,
    CheckCheck,
    FileText,
    Heart,
    Home,
    Scale,
    Trash2,
    User,
    UserCheck,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
    transaction: {
        icon: <FileText className="h-4 w-4" />,
        color: 'text-blue-500',
    },
    citizen: {
        icon: <User className="h-4 w-4" />,
        color: 'text-indigo-500',
    },
    household: {
        icon: <Home className="h-4 w-4" />,
        color: 'text-cyan-500',
    },
    medical: {
        icon: <Heart className="h-4 w-4" />,
        color: 'text-red-500',
    },
    settlement: {
        icon: <Scale className="h-4 w-4" />,
        color: 'text-orange-500',
    },
    account: {
        icon: <UserCheck className="h-4 w-4" />,
        color: 'text-purple-500',
    },
    business: {
        icon: <Building2 className="h-4 w-4" />,
        color: 'text-yellow-600',
    },
    infrastructure: {
        icon: <Building2 className="h-4 w-4" />,
        color: 'text-slate-500',
    },
    archive: {
        icon: <Archive className="h-4 w-4" />,
        color: 'text-gray-500',
    },
};

function getTypeConfig(type: string) {
    return TYPE_CONFIG[type] ?? TYPE_CONFIG['citizen'];
}

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString();
}

export function NotificationBell() {
    const { unreadNotifications } = usePage<SharedData>().props;
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(unreadNotifications ?? 0);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/notifications', {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications ?? []);
                setUnreadCount(data.unreadCount ?? 0);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const pollUnreadCount = useCallback(async () => {
        try {
            const res = await fetch('/api/notifications/unread-count', {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (res.ok) {
                const data = await res.json();
                setUnreadCount(data.unreadCount ?? 0);
            }
        } catch {
            // silent
        }
    }, []);

    // Poll every 30s for unread count
    useEffect(() => {
        const id = setInterval(pollUnreadCount, 30000);
        return () => clearInterval(id);
    }, [pollUnreadCount]);

    // Sync with server-side initial value on page transitions
    useEffect(() => {
        setUnreadCount(unreadNotifications ?? 0);
    }, [unreadNotifications]);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(e.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const handleOpen = () => {
        const next = !open;
        setOpen(next);
        if (next) fetchNotifications();
    };

    const markRead = async (id: number) => {
        await fetch(`/api/notifications/${id}/read`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': getCsrf(),
                'X-Requested-With': 'XMLHttpRequest',
            },
        });
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
        setUnreadCount((c) => Math.max(0, c - 1));
    };

    const markAllRead = async () => {
        await fetch('/api/notifications/mark-all-read', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': getCsrf(),
                'X-Requested-With': 'XMLHttpRequest',
            },
        });
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const deleteNotification = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        await fetch(`/api/notifications/${id}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': getCsrf(),
                'X-Requested-With': 'XMLHttpRequest',
            },
        });
        const removed = notifications.find((n) => n.id === id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (removed && !removed.read) setUnreadCount((c) => Math.max(0, c - 1));
    };

    const handleNotificationClick = async (n: Notification) => {
        if (!n.read) await markRead(n.id);
        if (n.link) {
            setOpen(false);
            router.visit(n.link);
        }
    };

    const unreadItems = notifications.filter((n) => !n.read);
    const readItems = notifications.filter((n) => n.read);

    return (
        <div className="relative">
            <Button
                ref={buttonRef}
                variant="ghost"
                size="icon"
                className="group relative h-9 w-9 cursor-pointer"
                onClick={handleOpen}
                aria-label="Notifications"
            >
                <Bell className="!size-5 opacity-80 group-hover:opacity-100" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </Button>

            {open && (
                <div
                    ref={panelRef}
                    className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-sidebar-border/70 bg-background shadow-xl"
                    style={{ maxHeight: '480px', overflowY: 'auto' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-sidebar-border/50 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-semibold">Notifications</span>
                            {unreadCount > 0 && (
                                <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-900/40 dark:text-red-400">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    title="Mark all as read"
                                >
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    All read
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-sidebar-border border-t-foreground" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                            <Bell className="h-8 w-8 opacity-30" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        <div>
                            {unreadItems.length > 0 && (
                                <>
                                    <div className="px-4 pt-3 pb-1">
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            New
                                        </span>
                                    </div>
                                    {unreadItems.map((n) => (
                                        <NotificationItem
                                            key={n.id}
                                            notification={n}
                                            onClick={handleNotificationClick}
                                            onDelete={deleteNotification}
                                        />
                                    ))}
                                </>
                            )}
                            {readItems.length > 0 && (
                                <>
                                    <div className="px-4 pt-3 pb-1">
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            Earlier
                                        </span>
                                    </div>
                                    {readItems.map((n) => (
                                        <NotificationItem
                                            key={n.id}
                                            notification={n}
                                            onClick={handleNotificationClick}
                                            onDelete={deleteNotification}
                                        />
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function NotificationItem({
    notification: n,
    onClick,
    onDelete,
}: {
    notification: Notification;
    onClick: (n: Notification) => void;
    onDelete: (id: number, e: React.MouseEvent) => void;
}) {
    const cfg = getTypeConfig(n.type);

    return (
        <div
            onClick={() => onClick(n)}
            className={`group relative flex cursor-pointer gap-3 px-4 py-3 transition-colors hover:bg-accent/60 ${
                !n.read ? 'bg-accent/20' : ''
            }`}
        >
            {/* Unread dot */}
            {!n.read && (
                <span className="absolute left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-blue-500" />
            )}

            {/* Type icon */}
            <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent ${cfg.color}`}
            >
                {cfg.icon}
            </div>

            {/* Body */}
            <div className="min-w-0 flex-1">
                <p className={`text-sm leading-snug ${!n.read ? 'font-semibold' : 'font-medium'}`}>
                    {n.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    {n.message}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground/70">
                    {timeAgo(n.createdAt)}
                </p>
            </div>

            {/* Delete button */}
            <button
                onClick={(e) => onDelete(n.id, e)}
                className="invisible absolute right-2 top-2 rounded p-1 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:visible group-hover:opacity-100"
                title="Dismiss"
            >
                <Trash2 className="h-3 w-3" />
            </button>
        </div>
    );
}

function getCsrf(): string {
    return (
        (document.head.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? ''
    );
}
