import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: any; // Temporarily use any or update your User type interface
    showEmail?: boolean;
}) {
    const getInitials = useInitials();

    // Create the name string manually from the database fields
    const fullName = `${user.sys_fname} ${user.sys_lname}`;

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={user.avatar} alt={fullName} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {/* Pass the manually created name instead of user.name */}
                    {getInitials(fullName)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{fullName}</span>
                {/* ... rest of your code */}
            </div>
        </>
    );
}
