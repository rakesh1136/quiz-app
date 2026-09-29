import { Link } from '@inertiajs/react';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { index as quizzesIndex } from '@/routes/quizzes';

type Props = {
    size?: 'sm' | 'default' | 'lg';
    variant?: 'default' | 'outline' | 'secondary';
    className?: string;
};

export function ExploreQuizzesButton({
    size = 'default',
    variant = 'default',
    className,
}: Props) {
    return (
        <Button
            size={size}
            variant={variant}
            className={cn('gap-2', className)}
            asChild
            data-test="explore-quizzes-button"
        >
            <Link href={quizzesIndex()} prefetch>
                <Compass className="size-4" />
                Explore Quizzes
            </Link>
        </Button>
    );
}
