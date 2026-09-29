import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AdminQuiz } from '@/types';

type Props = {
    status: AdminQuiz['status'];
    label: string;
    className?: string;
};

export function QuizStatusBadge({ status, label, className }: Props) {
    return (
        <Badge
            variant="outline"
            className={cn(
                status === 'published' &&
                    'border-emerald-600/40 bg-emerald-600/10 text-emerald-400',
                status === 'draft' &&
                    'border-amber-500/40 bg-amber-500/10 text-amber-400',
                status === 'inactive' &&
                    'border-red-500/40 bg-red-500/10 text-red-400',
                className,
            )}
        >
            {label}
        </Badge>
    );
}
