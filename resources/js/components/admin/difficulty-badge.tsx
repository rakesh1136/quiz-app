import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AdminQuestion } from '@/types';

type Props = {
    difficulty: AdminQuestion['difficulty'];
    label: string;
    className?: string;
};

export function DifficultyBadge({ difficulty, label, className }: Props) {
    return (
        <Badge
            variant="outline"
            className={cn(
                difficulty === 'easy' &&
                    'border-emerald-600/40 bg-emerald-600/10 text-emerald-400',
                difficulty === 'medium' &&
                    'border-amber-500/40 bg-amber-500/10 text-amber-400',
                difficulty === 'hard' &&
                    'border-red-500/40 bg-red-500/10 text-red-400',
                className,
            )}
        >
            {label}
        </Badge>
    );
}
