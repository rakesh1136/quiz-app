import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExploreQuizzesButton } from '@/components/user/explore-quizzes-button';
import { formatRemaining } from '@/components/user/quiz-timer';
import { cn } from '@/lib/utils';
import {
    result as attemptResult,
    show as attemptShow,
} from '@/routes/quizzes/attempts';
import type { PaginatedUserAttempts } from '@/types';

type Props = {
    attempts: PaginatedUserAttempts;
};

function formatScore(value: number | null): string {
    if (value === null) {
        return '—';
    }

    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
}

function formatDate(value: string | null): string {
    if (!value) {
        return '—';
    }

    return new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
        hour12: false,
    }).format(new Date(value));
}

export default function QuizAttemptsIndex({ attempts }: Props) {
    const { from, to, total, links, data } = attempts;
    const previousLink = links[0]?.url;
    const nextLink = links[links.length - 1]?.url;
    const pageLinks = links.slice(1, -1);

    return (
        <>
            <Head title="My Attempts" />

            <div className="flex flex-col gap-6">
                <section className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        My Attempts
                    </h1>
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Review your in-progress and completed quiz attempts.
                    </p>
                </section>

                {data.length > 0 ? (
                    <>
                        <div className="flex flex-col gap-3">
                            {data.map((attempt) => {
                                const inProgress =
                                    attempt.status === 'in_progress';

                                return (
                                    <Card key={attempt.id} className="py-0">
                                        <CardContent className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="min-w-0 space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="truncate text-base font-semibold tracking-tight">
                                                        {attempt.quiz_title}
                                                    </h2>
                                                    {inProgress ? (
                                                        <Badge variant="secondary">
                                                            In progress
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            className={cn(
                                                                'px-1.5 py-0 text-[10px] font-semibold tracking-wide',
                                                                attempt.is_passed
                                                                    ? 'bg-emerald-600 text-white hover:bg-emerald-600'
                                                                    : 'bg-rose-600 text-white hover:bg-rose-600',
                                                            )}
                                                        >
                                                            {attempt.is_passed
                                                                ? 'PASSED'
                                                                : 'FAILED'}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {inProgress
                                                        ? `${formatRemaining(attempt.remaining_seconds ?? 0)} remaining`
                                                        : `${formatScore(attempt.obtained_marks)} / ${formatScore(attempt.total_marks)} · ${formatScore(attempt.percentage)}%`}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {inProgress
                                                        ? `Started ${formatDate(attempt.started_at)}`
                                                        : `Completed ${formatDate(attempt.completed_at)}`}
                                                </p>
                                            </div>

                                            <Button asChild>
                                                <Link
                                                    href={
                                                        inProgress
                                                            ? attemptShow.url({
                                                                  quiz: attempt.quiz_id,
                                                                  attempt:
                                                                      attempt.id,
                                                              })
                                                            : attemptResult.url(
                                                                  {
                                                                      quiz: attempt.quiz_id,
                                                                      attempt:
                                                                          attempt.id,
                                                                  },
                                                              )
                                                    }
                                                    prefetch
                                                >
                                                    {inProgress
                                                        ? 'Continue'
                                                        : 'View Result'}
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {total > 0 && links.length > 0 ? (
                            <div className="flex flex-col gap-4 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-muted-foreground">
                                    {from && to
                                        ? `Showing ${from}–${to} of ${total} attempts`
                                        : `Showing ${total} attempts`}
                                </p>
                                <div className="flex items-center gap-1">
                                    {previousLink ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link
                                                href={previousLink}
                                                preserveState
                                                preserveScroll
                                            >
                                                <ChevronLeft className="size-4" />
                                                Previous
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled
                                        >
                                            <ChevronLeft className="size-4" />
                                            Previous
                                        </Button>
                                    )}

                                    <div className="hidden items-center gap-1 sm:flex">
                                        {pageLinks.map((link) => (
                                            <Button
                                                key={`${link.label}-${link.url}`}
                                                variant={
                                                    link.active
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                className="min-w-9"
                                                asChild={Boolean(link.url)}
                                                disabled={!link.url}
                                            >
                                                {link.url ? (
                                                    <Link
                                                        href={link.url}
                                                        preserveState
                                                        preserveScroll
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                ) : (
                                                    <span
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                )}
                                            </Button>
                                        ))}
                                    </div>

                                    {nextLink ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link
                                                href={nextLink}
                                                preserveState
                                                preserveScroll
                                            >
                                                Next
                                                <ChevronRight className="size-4" />
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled
                                        >
                                            Next
                                            <ChevronRight className="size-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </>
                ) : (
                    <Card className="py-5">
                        <CardContent className="px-5">
                            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
                                <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                    <ClipboardList className="size-5" />
                                </span>
                                <p className="text-sm text-muted-foreground">
                                    You haven&apos;t attempted any quizzes yet.
                                </p>
                                <ExploreQuizzesButton size="sm" />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
