import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Award,
    CheckCircle2,
    CircleHelp,
    Eye,
    Gauge,
    Lightbulb,
    ListChecks,
    Trophy,
    XCircle,
} from 'lucide-react';
import { AttemptResultBadge } from '@/components/admin/attempt-result-badge';
import { UserPerformancePagination } from '@/components/admin/user-performance-pagination';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { dashboard } from '@/routes/admin';
import { show as attemptShow } from '@/routes/admin/attempts';
import {
    index as userPerformanceIndex,
    show as userPerformanceShow,
} from '@/routes/admin/user-performance';
import type {
    AdminUserAnswerPerformance,
    AdminUserPerformanceDetailFilters,
    AdminUserPerformanceDetailStats,
    AdminUserPerformanceInsights,
    AdminUserPerformanceTrendItem,
    AdminUserQuizPerformanceItem,
    PaginatedAdminUserRecentAttempts,
} from '@/types';

type Props = {
    user: {
        id: number;
        name: string;
        email: string | null;
        registered_at: string | null;
    };
    filters: AdminUserPerformanceDetailFilters;
    stats: AdminUserPerformanceDetailStats;
    answerPerformance: AdminUserAnswerPerformance;
    passFail: { passed: number; failed: number };
    performanceTrend: AdminUserPerformanceTrendItem[];
    quizPerformance: AdminUserQuizPerformanceItem[];
    recentAttempts: PaginatedAdminUserRecentAttempts;
    insights: AdminUserPerformanceInsights;
    hasData: boolean;
    backUrl: string;
};

const PASSED_COLOR = '#10b981';
const FAILED_COLOR = '#f43f5e';
const TREND_COLOR = '#6366f1';

function formatNumber(value: number | null | undefined): string {
    if (value === null || value === undefined) {
        return '—';
    }

    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
}

function formatPercentage(value: number | null | undefined): string {
    if (value === null || value === undefined) {
        return '—';
    }

    return `${Number.isInteger(value) ? value.toString() : value.toFixed(1)}%`;
}

function formatDateTime(value: string | null | undefined): string {
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

function SummaryItem({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-lg border border-sidebar-border/60 bg-muted/10 px-4 py-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <div className="mt-1 font-medium">{children}</div>
        </div>
    );
}

function PassFailChart({ passed, failed }: { passed: number; failed: number }) {
    const total = passed + failed;
    const passedPercentage = total > 0 ? (passed / total) * 100 : 0;
    const failedPercentage = total > 0 ? (failed / total) * 100 : 0;
    const size = 176;
    const strokeWidth = 20;
    const center = size / 2;
    const radius = center - strokeWidth / 2 - 2;
    const circumference = 2 * Math.PI * radius;
    const passedLength = (passedPercentage / 100) * circumference;
    const failedLength = (failedPercentage / 100) * circumference;

    return (
        <div
            className="flex w-full flex-col items-center gap-5"
            style={{ minWidth: 0 }}
        >
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: size,
                    aspectRatio: '1 / 1',
                }}
            >
                <svg
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${size} ${size}`}
                    style={{ display: 'block', transform: 'rotate(-90deg)' }}
                    role="img"
                    aria-label={`${passed} passed and ${failed} failed attempts`}
                >
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="var(--muted)"
                        strokeWidth={strokeWidth}
                    />
                    {failed > 0 ? (
                        <circle
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="none"
                            stroke={FAILED_COLOR}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${failedLength} ${Math.max(0, circumference - failedLength)}`}
                            strokeDashoffset={-passedLength}
                        />
                    ) : null}
                    {passed > 0 ? (
                        <circle
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="none"
                            stroke={PASSED_COLOR}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${passedLength} ${Math.max(0, circumference - passedLength)}`}
                        />
                    ) : null}
                </svg>
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <span className="text-3xl font-bold tabular-nums">
                        {total}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        Attempts
                    </span>
                </div>
            </div>

            <div className="grid w-full max-w-xs grid-cols-2 gap-3">
                <div className="rounded-xl border px-3 py-3 text-center">
                    <p className="text-xs text-muted-foreground">Passed</p>
                    <p className="mt-1 text-lg font-semibold text-emerald-400 tabular-nums">
                        {passed}
                    </p>
                </div>
                <div className="rounded-xl border px-3 py-3 text-center">
                    <p className="text-xs text-muted-foreground">Failed</p>
                    <p className="mt-1 text-lg font-semibold text-rose-400 tabular-nums">
                        {failed}
                    </p>
                </div>
            </div>
        </div>
    );
}

function PerformanceTrendChart({
    data,
}: {
    data: AdminUserPerformanceTrendItem[];
}) {
    const chartHeight = 180;
    const barMaxHeight = 140;
    const axisWidth = 34;
    const axisGap = 10;
    const maximum = Math.max(100, ...data.map((item) => item.percentage));
    const ticks = [maximum, Math.round(maximum / 2), 0];
    const topFor = (value: number) =>
        chartHeight - (value / maximum) * barMaxHeight;

    if (data.length === 0) {
        return (
            <p className="py-10 text-center text-sm text-muted-foreground">
                No performance data available for this user.
            </p>
        );
    }

    return (
        <div className="w-full" style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', gap: axisGap }}>
                <div
                    style={{
                        position: 'relative',
                        width: axisWidth,
                        height: chartHeight,
                        flexShrink: 0,
                    }}
                >
                    {ticks.map((tick) => (
                        <span
                            key={tick}
                            className="text-[11px] text-muted-foreground tabular-nums"
                            style={{
                                position: 'absolute',
                                right: 0,
                                top: topFor(tick),
                                transform: 'translateY(-50%)',
                                lineHeight: 1,
                            }}
                        >
                            {tick}%
                        </span>
                    ))}
                </div>

                <div
                    style={{
                        position: 'relative',
                        flex: 1,
                        minWidth: 0,
                        height: chartHeight,
                    }}
                >
                    {ticks.map((tick) => (
                        <div
                            key={tick}
                            style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: topFor(tick),
                                borderTopWidth: 1,
                                borderTopStyle: tick === 0 ? 'solid' : 'dashed',
                                borderTopColor: 'var(--border)',
                            }}
                        />
                    ))}

                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'flex-end',
                            gap: 8,
                        }}
                    >
                        {data.map((item) => {
                            const height = Math.max(
                                6,
                                (item.percentage / maximum) * barMaxHeight,
                            );

                            return (
                                <div
                                    key={item.id}
                                    title={`${item.label}: ${formatPercentage(item.percentage)}`}
                                    style={{
                                        position: 'relative',
                                        flex: 1,
                                        minWidth: 0,
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'flex-end',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '100%',
                                            maxWidth: 42,
                                            height,
                                            borderRadius: '6px 6px 0 0',
                                            backgroundColor: TREND_COLOR,
                                        }}
                                    />
                                    <span
                                        className="text-[11px] font-semibold tabular-nums"
                                        style={{
                                            position: 'absolute',
                                            left: '50%',
                                            bottom: height + 6,
                                            transform: 'translateX(-50%)',
                                            lineHeight: 1,
                                        }}
                                    >
                                        {formatNumber(item.percentage)}%
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div
                style={{
                    display: 'flex',
                    gap: 8,
                    marginTop: 8,
                    paddingLeft: axisWidth + axisGap,
                }}
            >
                {data.map((item) => (
                    <div
                        key={item.id}
                        className="min-w-0 flex-1 text-center text-[11px] text-muted-foreground"
                    >
                        <div className="truncate">{item.label}</div>
                        <div className="truncate">{item.date_label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AdminUserPerformanceShow({
    user,
    filters,
    stats,
    answerPerformance,
    passFail,
    performanceTrend,
    quizPerformance,
    recentAttempts,
    insights,
    hasData,
    backUrl,
}: Props) {
    const applyFilters = (
        nextFilters: Partial<AdminUserPerformanceDetailFilters>,
    ) => {
        const query = {
            ...filters,
            ...nextFilters,
        };

        router.get(
            userPerformanceShow.url(user.id, {
                query: {
                    date_from: query.date_from || undefined,
                    date_to: query.date_to || undefined,
                    status: query.status !== 'all' ? query.status : undefined,
                },
            }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const overviewCards = [
        {
            title: 'Total Quizzes Attempted',
            value: formatNumber(stats.quizzesAttempted),
            icon: ListChecks,
            tone: 'text-sky-400',
        },
        {
            title: 'Passed Quizzes',
            value: formatNumber(stats.passedAttempts),
            icon: CheckCircle2,
            tone: 'text-emerald-400',
        },
        {
            title: 'Failed Quizzes',
            value: formatNumber(stats.failedAttempts),
            icon: XCircle,
            tone: 'text-rose-400',
        },
        {
            title: 'Average Score',
            value: formatNumber(stats.averageScore),
            icon: Gauge,
            tone: 'text-amber-400',
        },
        {
            title: 'Best Score',
            value: formatNumber(stats.bestScore),
            icon: Trophy,
            tone: 'text-indigo-400',
        },
        {
            title: 'Average Percentage',
            value: formatPercentage(stats.averagePercentage),
            icon: Award,
            tone: 'text-violet-400',
        },
        {
            title: 'Pass Rate',
            value: formatPercentage(stats.passRate),
            icon: CheckCircle2,
            tone: 'text-emerald-400',
        },
    ];

    return (
        <>
            <Head title={`${user.name} — Performance`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="space-y-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={backUrl}>
                            <ArrowLeft className="size-4" />
                            Back to User Performance
                        </Link>
                    </Button>

                    <Heading
                        variant="small"
                        title={user.name}
                        description="Detailed quiz performance based on submitted attempts."
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>User Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <SummaryItem label="User Name">{user.name}</SummaryItem>
                        <SummaryItem label="Email">
                            {user.email ?? '—'}
                        </SummaryItem>
                        <SummaryItem label="Registration Date">
                            <span className="text-sm">
                                {formatDateTime(user.registered_at)}
                            </span>
                        </SummaryItem>
                        <SummaryItem label="Total Attempts">
                            <span className="tabular-nums">
                                {formatNumber(stats.totalAttempts)}
                            </span>
                        </SummaryItem>
                        <SummaryItem label="Passed">
                            <span className="text-emerald-400 tabular-nums">
                                {formatNumber(stats.passedAttempts)}
                            </span>
                        </SummaryItem>
                        <SummaryItem label="Failed">
                            <span className="text-rose-400 tabular-nums">
                                {formatNumber(stats.failedAttempts)}
                            </span>
                        </SummaryItem>
                        <SummaryItem label="Average Score">
                            <span className="tabular-nums">
                                {formatNumber(stats.averageScore)}
                            </span>
                        </SummaryItem>
                        <SummaryItem label="Best Score">
                            <span className="tabular-nums">
                                {formatNumber(stats.bestScore)}
                            </span>
                        </SummaryItem>
                        <SummaryItem label="Lowest Score">
                            <span className="tabular-nums">
                                {formatNumber(stats.lowestScore)}
                            </span>
                        </SummaryItem>
                        <SummaryItem label="Average Percentage">
                            <span className="tabular-nums">
                                {formatPercentage(stats.averagePercentage)}
                            </span>
                        </SummaryItem>
                        <SummaryItem label="Pass Rate">
                            <span className="tabular-nums">
                                {formatPercentage(stats.passRate)}
                            </span>
                        </SummaryItem>
                        <SummaryItem label="Correct Answers">
                            <span className="text-emerald-400 tabular-nums">
                                {formatNumber(stats.totalCorrectAnswers)}
                            </span>
                        </SummaryItem>
                        <SummaryItem label="Incorrect Answers">
                            <span className="text-rose-400 tabular-nums">
                                {formatNumber(stats.totalIncorrectAnswers)}
                            </span>
                        </SummaryItem>
                        <SummaryItem label="Skipped Answers">
                            <span className="text-muted-foreground tabular-nums">
                                {formatNumber(stats.totalSkippedAnswers)}
                            </span>
                        </SummaryItem>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Detail Filters</CardTitle>
                        <CardDescription>
                            Narrow this user’s performance by date range and
                            result status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">
                                Date From
                            </label>
                            <Input
                                type="date"
                                value={filters.date_from}
                                onChange={(event) =>
                                    applyFilters({
                                        date_from: event.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">
                                Date To
                            </label>
                            <Input
                                type="date"
                                value={filters.date_to}
                                onChange={(event) =>
                                    applyFilters({
                                        date_to: event.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">
                                Result Status
                            </label>
                            <Select
                                value={filters.status}
                                onValueChange={(value) =>
                                    applyFilters({ status: value })
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="passed">
                                        Passed
                                    </SelectItem>
                                    <SelectItem value="failed">
                                        Failed
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {!hasData ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <p className="text-base font-medium">
                                No performance data available for this user.
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Submitted quiz attempts for this user will
                                appear here.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {overviewCards.map((card) => (
                                <Card key={card.title}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            {card.title}
                                        </CardTitle>
                                        <card.icon
                                            className={`size-4 text-muted-foreground ${card.tone}`}
                                        />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold tabular-nums">
                                            {card.value}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </section>

                        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                            <Card className="min-w-0 lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Performance Trend</CardTitle>
                                    <CardDescription>
                                        Percentage score for each submitted
                                        attempt over time.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <PerformanceTrendChart
                                        data={performanceTrend}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="min-w-0">
                                <CardHeader>
                                    <CardTitle>Pass vs Fail</CardTitle>
                                    <CardDescription>
                                        Passed and failed submitted attempts.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <PassFailChart
                                        passed={passFail.passed}
                                        failed={passFail.failed}
                                    />
                                </CardContent>
                            </Card>
                        </section>

                        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CircleHelp className="size-5 text-sky-400" />
                                        Answer Performance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-3 sm:grid-cols-2">
                                    <SummaryItem label="Total Questions Answered">
                                        <span className="tabular-nums">
                                            {formatNumber(
                                                answerPerformance.totalQuestionsAnswered,
                                            )}
                                        </span>
                                    </SummaryItem>
                                    <SummaryItem label="Correct Answers">
                                        <span className="text-emerald-400 tabular-nums">
                                            {formatNumber(
                                                answerPerformance.correctAnswers,
                                            )}
                                        </span>
                                    </SummaryItem>
                                    <SummaryItem label="Incorrect Answers">
                                        <span className="text-rose-400 tabular-nums">
                                            {formatNumber(
                                                answerPerformance.incorrectAnswers,
                                            )}
                                        </span>
                                    </SummaryItem>
                                    <SummaryItem label="Skipped Answers">
                                        <span className="text-muted-foreground tabular-nums">
                                            {formatNumber(
                                                answerPerformance.skippedAnswers,
                                            )}
                                        </span>
                                    </SummaryItem>
                                    <SummaryItem label="Accuracy Percentage">
                                        <span className="tabular-nums">
                                            {formatPercentage(
                                                answerPerformance.accuracyPercentage,
                                            )}
                                        </span>
                                    </SummaryItem>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lightbulb className="size-5 text-amber-400" />
                                        Performance Insights
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-3 sm:grid-cols-2">
                                    <SummaryItem label="Best Performing Quiz">
                                        {insights.bestPerformingQuiz ? (
                                            <>
                                                <p>
                                                    {
                                                        insights
                                                            .bestPerformingQuiz
                                                            .title
                                                    }
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatPercentage(
                                                        insights
                                                            .bestPerformingQuiz
                                                            .average_percentage,
                                                    )}
                                                </p>
                                            </>
                                        ) : (
                                            '—'
                                        )}
                                    </SummaryItem>
                                    <SummaryItem label="Weakest Performing Quiz">
                                        {insights.weakestPerformingQuiz ? (
                                            <>
                                                <p>
                                                    {
                                                        insights
                                                            .weakestPerformingQuiz
                                                            .title
                                                    }
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatPercentage(
                                                        insights
                                                            .weakestPerformingQuiz
                                                            .average_percentage,
                                                    )}
                                                </p>
                                            </>
                                        ) : (
                                            '—'
                                        )}
                                    </SummaryItem>
                                    <SummaryItem label="Most Recent Attempt">
                                        {insights.mostRecentAttempt ? (
                                            <>
                                                <p>
                                                    {
                                                        insights
                                                            .mostRecentAttempt
                                                            .quiz_title
                                                    }
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDateTime(
                                                        insights
                                                            .mostRecentAttempt
                                                            .completed_at,
                                                    )}
                                                    {' · '}
                                                    {formatPercentage(
                                                        insights
                                                            .mostRecentAttempt
                                                            .percentage,
                                                    )}
                                                </p>
                                            </>
                                        ) : (
                                            '—'
                                        )}
                                    </SummaryItem>
                                    <SummaryItem label="Total Quizzes Attempted">
                                        <span className="tabular-nums">
                                            {formatNumber(
                                                insights.totalQuizzesAttempted,
                                            )}
                                        </span>
                                    </SummaryItem>
                                </CardContent>
                            </Card>
                        </section>

                        <Card>
                            <CardHeader>
                                <CardTitle>Quiz Performance</CardTitle>
                                <CardDescription>
                                    Aggregated results for each quiz this user
                                    attempted.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {quizPerformance.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[760px] border-collapse text-sm">
                                            <thead>
                                                <tr className="border-b border-sidebar-border/70 text-left text-muted-foreground">
                                                    <th className="px-3 py-3 font-medium">
                                                        Quiz Name
                                                    </th>
                                                    <th className="px-3 py-3 font-medium">
                                                        Attempts
                                                    </th>
                                                    <th className="px-3 py-3 font-medium">
                                                        Average Score
                                                    </th>
                                                    <th className="px-3 py-3 font-medium">
                                                        Best Score
                                                    </th>
                                                    <th className="px-3 py-3 font-medium">
                                                        Average Percentage
                                                    </th>
                                                    <th className="px-3 py-3 font-medium">
                                                        Pass Rate
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {quizPerformance.map((quiz) => (
                                                    <tr
                                                        key={quiz.id}
                                                        className="border-b border-sidebar-border/50 last:border-b-0"
                                                    >
                                                        <td className="px-3 py-3 font-medium">
                                                            {quiz.title}
                                                        </td>
                                                        <td className="px-3 py-3 tabular-nums">
                                                            {quiz.attempts}
                                                        </td>
                                                        <td className="px-3 py-3 tabular-nums">
                                                            {formatNumber(
                                                                quiz.average_score,
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3 tabular-nums">
                                                            {formatNumber(
                                                                quiz.best_score,
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3 font-medium tabular-nums">
                                                            {formatPercentage(
                                                                quiz.average_percentage,
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3 tabular-nums">
                                                            {formatPercentage(
                                                                quiz.pass_rate,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="py-8 text-center text-sm text-muted-foreground">
                                        No quiz performance data available.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Quiz Attempts</CardTitle>
                                <CardDescription>
                                    Latest submitted attempts with a link to the
                                    existing attempt review page.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {recentAttempts.data.length > 0 ? (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[980px] border-collapse text-sm">
                                                <thead>
                                                    <tr className="border-b border-sidebar-border/70 text-left text-muted-foreground">
                                                        <th className="px-3 py-3 font-medium">
                                                            Quiz
                                                        </th>
                                                        <th className="px-3 py-3 font-medium">
                                                            Category
                                                        </th>
                                                        <th className="px-3 py-3 font-medium">
                                                            Attempt Date
                                                        </th>
                                                        <th className="px-3 py-3 font-medium">
                                                            Score
                                                        </th>
                                                        <th className="px-3 py-3 font-medium">
                                                            Percentage
                                                        </th>
                                                        <th className="px-3 py-3 font-medium">
                                                            Correct
                                                        </th>
                                                        <th className="px-3 py-3 font-medium">
                                                            Incorrect
                                                        </th>
                                                        <th className="px-3 py-3 font-medium">
                                                            Skipped
                                                        </th>
                                                        <th className="px-3 py-3 font-medium">
                                                            Result
                                                        </th>
                                                        <th className="px-3 py-3 text-right font-medium">
                                                            Action
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {recentAttempts.data.map(
                                                        (attempt) => (
                                                            <tr
                                                                key={attempt.id}
                                                                className="border-b border-sidebar-border/50 last:border-b-0"
                                                            >
                                                                <td className="px-3 py-3 font-medium">
                                                                    {
                                                                        attempt.quiz_title
                                                                    }
                                                                </td>
                                                                <td className="px-3 py-3 text-muted-foreground">
                                                                    {attempt.category_name ??
                                                                        '—'}
                                                                </td>
                                                                <td className="px-3 py-3 text-muted-foreground">
                                                                    {formatDateTime(
                                                                        attempt.completed_at,
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-3 tabular-nums">
                                                                    {attempt.score ===
                                                                        null ||
                                                                    attempt.total_marks ===
                                                                        null
                                                                        ? '—'
                                                                        : `${formatNumber(attempt.score)} / ${formatNumber(attempt.total_marks)}`}
                                                                </td>
                                                                <td className="px-3 py-3 tabular-nums">
                                                                    {formatPercentage(
                                                                        attempt.percentage,
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-3 text-emerald-400 tabular-nums">
                                                                    {formatNumber(
                                                                        attempt.correct_answers,
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-3 text-rose-400 tabular-nums">
                                                                    {formatNumber(
                                                                        attempt.wrong_answers,
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-3 text-muted-foreground tabular-nums">
                                                                    {formatNumber(
                                                                        attempt.unanswered_questions,
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-3">
                                                                    <AttemptResultBadge
                                                                        status={
                                                                            attempt.status
                                                                        }
                                                                        label={
                                                                            attempt.status_label
                                                                        }
                                                                    />
                                                                </td>
                                                                <td className="px-3 py-3">
                                                                    <div className="flex justify-end">
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger
                                                                                    asChild
                                                                                >
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        asChild
                                                                                    >
                                                                                        <Link
                                                                                            href={attemptShow(
                                                                                                attempt.id,
                                                                                            )}
                                                                                            prefetch
                                                                                        >
                                                                                            <Eye className="size-4" />
                                                                                            <span className="sr-only">
                                                                                                View
                                                                                                Attempt
                                                                                            </span>
                                                                                        </Link>
                                                                                    </Button>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    View
                                                                                    Attempt
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <UserPerformancePagination
                                            paginator={recentAttempts}
                                            resourceLabel="attempts"
                                        />
                                    </>
                                ) : (
                                    <p className="py-8 text-center text-sm text-muted-foreground">
                                        No recent quiz attempts found.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </>
    );
}

AdminUserPerformanceShow.layout = (props: Props) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'User Performance',
            href: props.backUrl || userPerformanceIndex(),
        },
        {
            title: props.user.name,
            href: userPerformanceShow(props.user.id),
        },
    ],
});
