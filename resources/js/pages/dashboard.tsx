import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    BookOpenCheck,
    CheckCircle2,
    ClipboardList,
    PlayCircle,
    Sparkles,
    Target,
    Trophy,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import PendingInvitationsModal from '@/components/pending-invitations-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExploreQuizzesButton } from '@/components/user/explore-quizzes-button';
import { FeaturedQuizCard } from '@/components/user/featured-quiz-card';
import { StatCard } from '@/components/user/stat-card';
import { formatRemaining } from '@/components/user/quiz-timer';
import { cn } from '@/lib/utils';
import {
    result as attemptResult,
    show as attemptShow,
} from '@/routes/quizzes/attempts';
import { index as attemptsIndex } from '@/routes/attempts';
import type {
    DashboardContinueLearningItem,
    DashboardInvitation,
    DashboardRecentActivityItem,
    FeaturedQuiz,
    UserDashboardStats,
} from '@/types';

type Props = {
    pendingInvitations?: DashboardInvitation[];
    stats: UserDashboardStats;
    featuredQuizzes?: FeaturedQuiz[];
    continueLearning?: DashboardContinueLearningItem[];
    recentActivity?: DashboardRecentActivityItem[];
};

function greeting(): string {
    const hour = new Date().getHours();

    if (hour < 12) {
        return 'Good morning';
    }

    if (hour < 17) {
        return 'Good afternoon';
    }

    return 'Good evening';
}

function formatScore(value: number): string {
    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
}

function formatActivityDate(value: string | null): string {
    if (!value) {
        return '';
    }

    return new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
        hour12: false,
    }).format(new Date(value));
}

export default function Dashboard({
    pendingInvitations = [],
    stats,
    featuredQuizzes = [],
    continueLearning = [],
    recentActivity = [],
}: Props) {
    const { auth } = usePage().props;
    const [showInvitations, setShowInvitations] = useState(
        pendingInvitations.length > 0,
    );

    const firstName = auth.user.name.trim().split(/\s+/u)[0];

    return (
        <>
            <Head title="Dashboard" />
            <PendingInvitationsModal
                invitations={pendingInvitations}
                open={pendingInvitations.length > 0 && showInvitations}
                onOpenChange={setShowInvitations}
            />

            <div className="flex flex-col gap-6">
                <section className="overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-background p-6 shadow-sm sm:p-8">
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        {greeting()}, {firstName}! 👋
                    </h1>
                    <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
                        Ready to test your knowledge and improve your skills?
                    </p>
                    <div className="mt-5">
                        <ExploreQuizzesButton size="lg" />
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={ClipboardList}
                        label="Available Quizzes"
                        value={stats.availableQuizzes.toLocaleString()}
                        description="Ready to start"
                    />
                    <StatCard
                        icon={BookOpenCheck}
                        label="Completed Quizzes"
                        value={stats.completedQuizzes.toLocaleString()}
                        description="Attempts you finished"
                        accentClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    />
                    <StatCard
                        icon={Target}
                        label="Average Score"
                        value={`${stats.averageScore}%`}
                        description="Across all attempts"
                        accentClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    />
                    <StatCard
                        icon={CheckCircle2}
                        label="Passed Quizzes"
                        value={stats.passedQuizzes.toLocaleString()}
                        description="Above the passing score"
                        accentClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    />
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            <Sparkles className="size-5" />
                        </span>
                        <div>
                            <h2 className="text-xl font-semibold tracking-tight">
                                Featured Quizzes
                            </h2>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                                Test your knowledge with our latest quizzes.
                            </p>
                        </div>
                    </div>

                    {featuredQuizzes.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {featuredQuizzes.map((quiz) => (
                                <FeaturedQuizCard key={quiz.id} quiz={quiz} />
                            ))}
                        </div>
                    ) : (
                        <Card className="py-5">
                            <CardContent className="px-5">
                                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center">
                                    <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                        <ClipboardList className="size-5" />
                                    </span>
                                    <p className="text-sm text-muted-foreground">
                                        No quizzes available yet.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </section>

                <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Card className="py-5">
                        <CardContent className="px-5">
                            <h2 className="text-base font-semibold tracking-tight">
                                Continue Learning
                            </h2>

                            {continueLearning.length > 0 ? (
                                <div className="mt-4 flex flex-col gap-3">
                                    {continueLearning.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex flex-col gap-3 rounded-xl border border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">
                                                    {item.quiz_title}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {item.answered_count}{' '}
                                                    answered ·{' '}
                                                    {formatRemaining(
                                                        item.remaining_seconds,
                                                    )}{' '}
                                                    left
                                                </p>
                                            </div>
                                            <Button size="sm" asChild>
                                                <Link
                                                    href={attemptShow.url({
                                                        quiz: item.quiz_id,
                                                        attempt: item.id,
                                                    })}
                                                    prefetch
                                                >
                                                    Continue
                                                </Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-4 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center">
                                    <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                        <PlayCircle className="size-5" />
                                    </span>
                                    <p className="text-sm text-muted-foreground">
                                        You haven&apos;t started any quizzes
                                        yet.
                                    </p>
                                    <ExploreQuizzesButton size="sm" />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="py-5">
                        <CardContent className="px-5">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-base font-semibold tracking-tight">
                                    Recent Activity
                                </h2>
                                {recentActivity.length > 0 ? (
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={attemptsIndex()} prefetch>
                                            View all
                                        </Link>
                                    </Button>
                                ) : null}
                            </div>

                            {recentActivity.length > 0 ? (
                                <div className="mt-4 flex flex-col gap-3">
                                    {recentActivity.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={attemptResult.url({
                                                quiz: item.quiz_id,
                                                attempt: item.id,
                                            })}
                                            prefetch
                                            className="flex items-start gap-3 rounded-xl border border-border/70 p-4 transition-colors hover:bg-muted/40"
                                        >
                                            <span
                                                className={cn(
                                                    'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg',
                                                    item.is_passed
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
                                                )}
                                            >
                                                {item.is_passed ? (
                                                    <Trophy className="size-4" />
                                                ) : (
                                                    <XCircle className="size-4" />
                                                )}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="truncate font-medium">
                                                        {item.quiz_title}
                                                    </p>
                                                    <Badge
                                                        className={cn(
                                                            'px-1.5 py-0 text-[10px] font-semibold tracking-wide',
                                                            item.is_passed
                                                                ? 'bg-emerald-600 text-white hover:bg-emerald-600'
                                                                : 'bg-rose-600 text-white hover:bg-rose-600',
                                                        )}
                                                    >
                                                        {item.is_passed
                                                            ? 'PASSED'
                                                            : 'FAILED'}
                                                    </Badge>
                                                </div>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {formatScore(
                                                        item.obtained_marks,
                                                    )}{' '}
                                                    /{' '}
                                                    {formatScore(
                                                        item.total_marks,
                                                    )}{' '}
                                                    ·{' '}
                                                    {formatScore(
                                                        item.percentage,
                                                    )}
                                                    %
                                                    {item.completed_at
                                                        ? ` · ${formatActivityDate(item.completed_at)}`
                                                        : ''}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-4 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center">
                                    <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                        <Activity className="size-5" />
                                    </span>
                                    <p className="text-sm text-muted-foreground">
                                        No recent activity.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>
            </div>
        </>
    );
}
