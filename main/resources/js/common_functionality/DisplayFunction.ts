
export function formatDisplayName(firstName: string, middleName: string | null, lastName: string): string {
    return `${lastName}, ${firstName}${middleName ? ' ' + middleName.charAt(0) + '.' : ''}`;
}