import { Clock3, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
    remainingSeconds: number;
    totalSeconds: number;
};

export function formatRemaining(seconds: number): string {
    const safeSeconds = Math.max(0, seconds);
    const minutes = Math.floor(safeSeconds / 60);
    const rest = safeSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

export function QuizTimer({ remainingSeconds, totalSeconds }: Props) {
    const isCritical = remainingSeconds < 60;
    const isWarning = !isCritical && remainingSeconds < 300;
    const elapsedRatio =
        totalSeconds > 0
            ? Math.min(1, Math.max(0, remainingSeconds / totalSeconds))
            : 0;

    return (
        <div
            className={cn(
                'flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
                isCritical
                    ? 'border-rose-500/40 bg-rose-500/10'
                    : isWarning
                      ? 'border-amber-500/40 bg-amber-500/10'
                      : 'border-border/70 bg-muted/40',
            )}
            data-test="quiz-timer"
            aria-live="polite"
        >
            <span
                className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg',
                    isCritical
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        : isWarning
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : 'bg-primary/10 text-primary',
                )}
            >
                {isCritical || isWarning ? (
                    <TriangleAlert className="size-4" />
                ) : (
                    <Clock3 className="size-4" />
                )}
            </span>

            <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Time remaining</p>
                <p
                    className={cn(
                        'font-mono text-xl font-semibold tabular-nums',
                        isCritical
                            ? 'text-rose-600 dark:text-rose-400'
                            : isWarning
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-foreground',
                    )}
                >
                    {formatRemaining(remainingSeconds)}
                </p>
            </div>

            <div className="hidden w-28 sm:block">
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                        className={cn(
                            'h-full rounded-full transition-all duration-1000 ease-linear',
                            isCritical
                                ? 'bg-rose-500'
                                : isWarning
                                  ? 'bg-amber-500'
                                  : 'bg-primary',
                        )}
                        style={{ width: `${elapsedRatio * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
