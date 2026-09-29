import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AdminAttempt } from '@/types';

type Props = {
    status: AdminAttempt['status'];
    label: string;
    className?: string;
};

export function AttemptResultBadge({ status, label, className }: Props) {
    return (
        <Badge
            variant="outline"
            className={cn(
                status === 'passed' &&
                    'border-emerald-600/40 bg-emerald-600/10 text-emerald-400',
                status === 'failed' &&
                    'border-rose-500/40 bg-rose-500/10 text-rose-400',
                status === 'unknown' &&
                    'border-muted-foreground/30 bg-muted/40 text-muted-foreground',
                className,
            )}
        >
            {label}
        </Badge>
    );
}
