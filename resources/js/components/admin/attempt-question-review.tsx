import { CheckCircle2, CircleMinus, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { AdminAttemptReviewQuestion } from '@/types';

type Props = {
    question: AdminAttemptReviewQuestion;
};

const statusStyles = {
    correct: {
        icon: CheckCircle2,
        card: 'border-emerald-500/35',
        badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
        accent: 'text-emerald-400',
    },
    wrong: {
        icon: XCircle,
        card: 'border-rose-500/35',
        badge: 'border-rose-500/40 bg-rose-500/10 text-rose-400',
        accent: 'text-rose-400',
    },
    unanswered: {
        icon: CircleMinus,
        card: 'border-sidebar-border/70',
        badge: 'border-muted-foreground/30 bg-muted/40 text-muted-foreground',
        accent: 'text-muted-foreground',
    },
} as const;

function formatMarks(value: number): string {
    if (value === 0) {
        return '0';
    }

    const absolute = Number.isInteger(Math.abs(value))
        ? Math.abs(value).toString()
        : Math.abs(value).toFixed(2).replace(/0+$/, '').replace(/\.$/, '');

    return `${value > 0 ? '+' : '-'}${absolute}`;
}

export function AttemptQuestionReview({ question }: Props) {
    const styles = statusStyles[question.status];
    const StatusIcon = styles.icon;
    const selectedOption = question.options.find(
        (option) => option.id === question.selected_option_id,
    );
    const correctOption = question.options.find(
        (option) => option.id === question.correct_option_id,
    );

    return (
        <Card className={cn('overflow-hidden', styles.card)}>
            <CardHeader className="gap-4 border-b border-sidebar-border/60">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Question {question.number}
                        </p>
                        <h3 className="mt-1 text-base leading-relaxed font-semibold">
                            {question.text}
                        </h3>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <Badge
                            variant="outline"
                            className={cn('gap-1.5', styles.badge)}
                        >
                            <StatusIcon className="size-3.5" />
                            {question.status_label}
                        </Badge>
                        <span
                            className={cn(
                                'text-sm font-semibold tabular-nums',
                                styles.accent,
                            )}
                        >
                            {formatMarks(question.marks_awarded)}
                        </span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2">
                    {question.options.map((option) => (
                        <div
                            key={option.id}
                            className={cn(
                                'flex min-w-0 items-start gap-3 rounded-lg border px-4 py-3',
                                option.is_correct
                                    ? 'border-emerald-500/45 bg-emerald-500/8'
                                    : option.is_selected
                                      ? 'border-rose-500/45 bg-rose-500/8'
                                      : 'border-sidebar-border/60 bg-muted/10',
                            )}
                        >
                            <span
                                className={cn(
                                    'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                                    option.is_correct
                                        ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400'
                                        : option.is_selected
                                          ? 'border-rose-500/50 bg-rose-500/15 text-rose-400'
                                          : 'border-sidebar-border text-muted-foreground',
                                )}
                            >
                                {option.label}
                            </span>
                            <span className="min-w-0 flex-1 text-sm leading-relaxed">
                                {option.text}
                            </span>
                            <div className="flex shrink-0 flex-col items-end gap-1">
                                {option.is_correct ? (
                                    <span className="text-[11px] font-medium text-emerald-400">
                                        Correct
                                    </span>
                                ) : null}
                                {option.is_selected ? (
                                    <span className="text-[11px] font-medium text-sky-400">
                                        Selected
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid gap-3 rounded-lg bg-muted/20 p-4 sm:grid-cols-3">
                    <div>
                        <p className="text-xs text-muted-foreground">
                            User Answer
                        </p>
                        <p
                            className={cn(
                                'mt-1 text-sm font-medium',
                                question.status === 'unanswered' &&
                                    'text-muted-foreground',
                            )}
                        >
                            {selectedOption
                                ? `${selectedOption.label}. ${selectedOption.text}`
                                : 'Not Answered'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">
                            Correct Answer
                        </p>
                        <p className="mt-1 text-sm font-medium text-emerald-400">
                            {correctOption
                                ? `${correctOption.label}. ${correctOption.text}`
                                : 'Not configured'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">
                            Marks Awarded
                        </p>
                        <p
                            className={cn(
                                'mt-1 text-sm font-semibold tabular-nums',
                                styles.accent,
                            )}
                        >
                            {formatMarks(question.marks_awarded)}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
