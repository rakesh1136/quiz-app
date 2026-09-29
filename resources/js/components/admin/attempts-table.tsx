import { Link } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { AttemptResultBadge } from '@/components/admin/attempt-result-badge';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { show } from '@/routes/admin/attempts';
import type { AdminAttemptFilters, PaginatedAdminAttempts } from '@/types';

type Props = {
    attempts: PaginatedAdminAttempts;
    filters: AdminAttemptFilters;
};

function formatNumber(value: number | null): string {
    if (value === null) {
        return '—';
    }

    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
}

function formatPercentage(value: number | null): string {
    if (value === null) {
        return '—';
    }

    return `${Number.isInteger(value) ? value.toString() : value.toFixed(1)}%`;
}

function formatDateTime(value: string | null): string {
    if (!value) {
        return '—';
    }

    return new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(new Date(value));
}

export function AttemptsTable({ attempts, filters }: Props) {
    if (attempts.data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-sidebar-border/70 px-6 py-16 text-center">
                <p className="text-base font-medium">
                    {filters.search ||
                    filters.status !== 'all' ||
                    filters.quiz_id !== 'all' ||
                    filters.category_id !== 'all'
                        ? 'No quiz attempts match your search or filters.'
                        : 'No quiz attempts found.'}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                    Submitted quiz attempts will appear here once users complete
                    quizzes.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-sidebar-border/70">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-sidebar-border/70 bg-muted/20">
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                User
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                Quiz
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                Total Questions
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                Attempted
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                Score
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                Percentage
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                Completed At
                            </th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {attempts.data.map((attempt) => (
                            <tr
                                key={attempt.id}
                                className="border-b border-sidebar-border/50 last:border-b-0 hover:bg-muted/10"
                            >
                                <td className="px-4 py-3">
                                    <div className="font-medium">
                                        {attempt.user.name}
                                    </div>
                                    {attempt.user.email ? (
                                        <div className="text-xs text-muted-foreground">
                                            {attempt.user.email}
                                        </div>
                                    ) : null}
                                </td>
                                <td className="max-w-xs px-4 py-3">
                                    <div className="font-medium">
                                        {attempt.quiz.title}
                                    </div>
                                    {attempt.quiz.category_name ? (
                                        <div className="text-xs text-muted-foreground">
                                            {attempt.quiz.category_name}
                                        </div>
                                    ) : null}
                                </td>
                                <td className="px-4 py-3 tabular-nums">
                                    {formatNumber(attempt.total_questions)}
                                </td>
                                <td className="px-4 py-3 tabular-nums">
                                    {formatNumber(attempt.attempted_questions)}
                                </td>
                                <td className="px-4 py-3 font-medium tabular-nums">
                                    {attempt.score === null ||
                                    attempt.total_marks === null
                                        ? '—'
                                        : `${formatNumber(attempt.score)} / ${formatNumber(attempt.total_marks)}`}
                                </td>
                                <td className="px-4 py-3 tabular-nums">
                                    {formatPercentage(attempt.percentage)}
                                </td>
                                <td className="px-4 py-3">
                                    <AttemptResultBadge
                                        status={attempt.status}
                                        label={attempt.status_label}
                                    />
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {formatDateTime(attempt.completed_at)}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={show(
                                                                attempt.id,
                                                                {
                                                                    query: filters,
                                                                },
                                                            )}
                                                            prefetch
                                                        >
                                                            <Eye className="size-4" />
                                                            <span className="sr-only">
                                                                View
                                                            </span>
                                                        </Link>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    View
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
