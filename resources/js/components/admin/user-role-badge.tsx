import { Badge } from '@/components/ui/badge';
import type { AdminUser } from '@/types';

type Props = {
    role: AdminUser['role'];
    label: string;
};

export function UserRoleBadge({ role, label }: Props) {
    return (
        <Badge variant={role === 'admin' ? 'secondary' : 'outline'}>
            {label}
        </Badge>
    );
}
