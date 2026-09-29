import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AdminUser } from '@/types';

type Props = {
    status: AdminUser['status'];
    label: string;
    className?: string;
};

export function UserStatusBadge({ status, label, className }: Props) {
    return (
        <Badge
            variant={status === 'active' ? 'default' : 'destructive'}
            className={cn(
                status === 'active' &&
                    'border-transparent bg-emerald-600/90 text-white hover:bg-emerald-600/90',
                className,
            )}
        >
            {label}
        </Badge>
    );
}
