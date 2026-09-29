import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Award,
    CheckCircle2,
    CircleHelp,
    Clock3,
    Eye,
    Gauge,
    Percent,
    Trophy,
    Users,
    XCircle,
    Zap,
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
    index as quizPerformanceIndex,
    show as quizPerformanceShow,
} from '@/routes/admin/quiz-performance';
import type {
    AdminQuizAttemptsTrendItem,
    AdminQuizPerformanceDetailFilters,
    AdminQuizPerformanceDetailStats,
    AdminQuizQuestionPerformanceItem,
    AdminQuizScorePerformanceItem,
    AdminQuizTopPerformer,
    PaginatedAdminQuizQuestionPerformance,
    PaginatedAdminQuizRecentAttempts,
} from '@/types';

type Props = {
    quiz: {
        id: number;
        title: string;
        description: string | null;
        category_name: string | null;
        questions_count: number;
    };
    filters: AdminQuizPerformanceDetailFilters;
    stats: AdminQuizPerformanceDetailStats;
    passFail: { passed: number; failed: number };
    attemptsTrend: AdminQuizAttemptsTrendItem[];
    scorePerformance: AdminQuizScorePerformanceItem[];
    questionPerformance: PaginatedAdminQuizQuestionPerformance;
    mostDifficultQuestions: AdminQuizQuestionPerformanceItem[];
    easiestQuestions: AdminQuizQuestionPerformanceItem[];
    recentAttempts: PaginatedAdminQuizRecentAttempts;
    topPerformers: AdminQuizTopPerformer[];
    hasData: boolean;
    backUrl: string;
};

const PASSED_COLOR = '#10b981';
const FAILED_COLOR = '#f43f5e';
const BAR_COLOR = '#6366f1';
const SCORE_COLOR = '#38bdf8';

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

function formatDuration(totalSeconds: number | null | undefined): string {
    if (
        totalSeconds === null ||
        totalSeconds === undefined ||
        totalSeconds <= 0
    ) {
        return '—';
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
        return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
    }

    return `${seconds}s`;
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

function AttemptsTrendChart({ data }: { data: AdminQuizAttemptsTrendItem[] }) {
    const chartHeight = 180;
    const barMaxHeight = 140;
    const axisWidth = 26;
    const axisGap = 10;
    const maximum = Math.max(1, ...data.map((item) => item.attempts));
    const ticks = Array.from(
        new Set([maximum, Math.ceil(maximum / 2), 0]),
    ).sort((first, second) => second - first);
    const topFor = (value: number) =>
        chartHeight - (value / maximum) * barMaxHeight;
    const barGap = data.length > 20 ? 2 : 4;
    const labelStep = Math.max(1, Math.ceil(data.length / 6));
    const labelIndexes = data
        .map((_, index) => index)
        .filter(
            (index) =>
                index === 0 ||
                index === data.length - 1 ||
                index % labelStep === 0,
        );

    if (data.length === 0) {
        return (
            <p className="py-10 text-center text-sm text-muted-foreground">
                No performance data available for this quiz.
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
                            {tick}
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
                            gap: barGap,
                        }}
                    >
                        {data.map((item) => {
                            const height =
                                item.attempts === 0
                                    ? 2
                                    : Math.max(
                                          6,
                                          (item.attempts / maximum) *
                                              barMaxHeight,
                                      );

                            return (
                                <div
                                    key={item.date}
                                    title={`${item.label}: ${item.attempts}`}
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
                                            maxWidth: 28,
                                            height,
                                            borderRadius: '4px 4px 0 0',
                                            backgroundColor:
                                                item.attempts > 0
                                                    ? BAR_COLOR
                                                    : 'var(--border)',
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div
                style={{
                    position: 'relative',
                    height: 16,
                    marginTop: 8,
                    marginLeft: axisWidth + axisGap,
                }}
            >
                {labelIndexes.map((index) => {
                    const isFirst = index === 0;
                    const isLast = index === data.length - 1;
                    const position = ((index + 0.5) / data.length) * 100;

                    return (
                        <span
                            key={data[index].date}
                            className="text-[10px] whitespace-nowrap text-muted-foreground"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: isLast ? undefined : `${position}%`,
                                right: isLast ? 0 : undefined,
                                transform:
                                    isFirst || isLast
                                        ? undefined
                                        : 'translateX(-50%)',
                                lineHeight: 1.4,
                            }}
                        >
                            {data[index].label}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}

function ScorePerformanceChart({
    data,
}: {
    data: AdminQuizScorePerformanceItem[];
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
                No performance data available for this quiz.
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
                                            backgroundColor: SCORE_COLOR,
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

function QuestionListCard({
    title,
    description,
    items,
}: {
    title: string;
    description: string;
    items: AdminQuizQuestionPerformanceItem[];
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                {items.length > 0 ? (
                    <div className="space-y-3">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="rounded-lg border border-sidebar-border/60 px-4 py-3"
                            >
                                <p className="text-sm font-medium">
                                    Q{item.number}. {item.question}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                    <span>Answers: {item.total_answers}</span>
                                    <span className="text-emerald-400">
                                        Correct: {item.correct_answers}
                                    </span>
                                    <span className="text-rose-400">
                                        Incorrect: {item.incorrect_answers}
                                    </span>
                                    <span>
                                        Accuracy:{' '}
                                        {formatPercentage(
                                            item.accuracy_percentage,
                                        )}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                        No question performance data available.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

export default function AdminQuizPerformanceShow({
    quiz,
    filters,
    stats,
    passFail,
    attemptsTrend,
    scorePerformance,
    questionPerformance,
    mostDifficultQuestions,
    easiestQuestions,
    recentAttempts,
    topPerformers,
    hasData,
    backUrl,
}: Props) {
    const applyFilters = (
        nextFilters: Partial<AdminQuizPerformanceDetailFilters>,
    ) => {
        const query = {
            ...filters,
            ...nextFilters,
        };

        router.get(
            quizPerformanceShow.url(quiz.id, {
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
            title: 'Total Attempts',
            value: formatNumber(stats.totalAttempts),
            icon: Zap,
            tone: 'text-indigo-400',
        },
        {
            title: 'Total Participants',
            value: formatNumber(stats.totalParticipants),
            icon: Users,
            tone: 'text-sky-400',
        },
        {
            title: 'Average Score',
            value: formatNumber(stats.averageScore),
            icon: Gauge,
            tone: 'text-amber-400',
        },
        {
            title: 'Average Percentage',
            value: formatPercentage(stats.averagePercentage),
            icon: Percent,
            tone: 'text-violet-400',
        },
        {
            title: 'Best Score',
            value: formatNumber(stats.bestScore),
            icon: Trophy,
            tone: 'text-emerald-400',
        },
        {
            title: 'Pass Rate',
            value: formatPercentage(stats.passRate),
            icon: CheckCircle2,
            tone: 'text-emerald-400',
        },
        {
            title: 'Fail Rate',
            value: formatPercentage(stats.failRate),
            icon: XCircle,
            tone: 'text-rose-400',
        },
        {
            title: 'Avg Completion Time',
            value: formatDuration(stats.averageCompletionSeconds),
            icon: Clock3,
            tone: 'text-cyan-400',
        },
    ];

    return (
        <>
            <Head title={`${quiz.title} — Performance`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="space-y-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={backUrl}>
                            <ArrowLeft className="size-4" />
                            Back to Quiz Performance
                        </Link>
                    </Button>

                    <Heading
                        variant="small"
                        title={quiz.title}
                        description="Detailed quiz performance based on submitted attempts."
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Quiz Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <SummaryItem label="Quiz Name">
                            {quiz.title}
                        </SummaryItem>
                        <SummaryItem label="Category">
                            {quiz.category_name ?? '—'}
                        </SummaryItem>
                        <SummaryItem label="Total Questions">
                            <span className="tabular-nums">
                                {formatNumber(quiz.questions_count)}
                            </span>
                        </SummaryItem>
                        <SummaryItem label="Total Attempts">
                            <span className="tabular-nums">
                                {formatNumber(stats.totalAttempts)}
                            </span>
                        </SummaryItem>
                        <SummaryItem label="Total Participants">
                            <span className="tabular-nums">
                                {formatNumber(stats.totalParticipants)}
                            </span>
                        </SummaryItem>
                        <SummaryItem label="Average Score">
                            <span className="tabular-nums">
                                {formatNumber(stats.averageScore)}
                            </span>
                        </SummaryItem>
                        <SummaryItem label="Average Percentage">
                            <span className="tabular-nums">
                                {formatPercentage(stats.averagePercentage)}
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
                        <SummaryItem label="Pass Rate">
                            <span className="text-emerald-400 tabular-nums">
                                {formatPercentage(stats.passRate)}
                            </span>
                        </SummaryItem>
                        <SummaryItem label="Fail Rate">
                            <span className="text-rose-400 tabular-nums">
                                {formatPercentage(stats.failRate)}
                            </span>
                        </SummaryItem>
                        <SummaryItem label="Avg Completion Time">
                            {formatDuration(stats.averageCompletionSeconds)}
                        </SummaryItem>
                        {quiz.description ? (
                            <div className="sm:col-span-2 lg:col-span-4">
                                <SummaryItem label="Description">
                                    <p className="text-sm leading-relaxed font-normal">
                                        {quiz.description}
                                    </p>
                                </SummaryItem>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Detail Filters</CardTitle>
                        <CardDescription>
                            Narrow this quiz’s performance by date range and
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
                                No performance data available for this quiz.
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Submitted attempts for this quiz will appear
                                here.
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
                                    <CardTitle>Quiz Attempts Trend</CardTitle>
                                    <CardDescription>
                                        Submitted attempts over the selected
                                        date range (defaults to the last 30
                                        days).
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <AttemptsTrendChart data={attemptsTrend} />
                                </CardContent>
                            </Card>

                            <Card className="min-w-0">
                                <CardHeader>
                                    <CardTitle>Pass vs Fail</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <PassFailChart
                                        passed={passFail.passed}
                                        failed={passFail.failed}
                                    />
                                </CardContent>
                            </Card>
                        </section>

                        <Card>
                            <CardHeader>
                                <CardTitle>Score Performance</CardTitle>
                                <CardDescription>
                                    Percentage score for each submitted attempt
                                    over time.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScorePerformanceChart
                                    data={scorePerformance}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CircleHelp className="size-5 text-sky-400" />
                                    Question Performance
                                </CardTitle>
                                <CardDescription>
                                    Accuracy based on actual attempt answers for
                                    this quiz.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {questionPerformance.data.length > 0 ? (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[900px] border-collapse text-sm">
                                                <thead>
                                                    <tr className="border-b border-sidebar-border/70 text-left text-muted-foreground">
                                                        <th className="px-3 py-3 font-medium">
                                                            Question
                                                        </th>
                                                        <th className="px-3 py-3 font-medium">
                                                            Total Answers
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
                                                            Accuracy
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {questionPerformance.data.map(
                                                        (question) => (
                                                            <tr
                                                                key={
                                                                    question.id
                                                                }
                                                                className="border-b border-sidebar-border/50 last:border-b-0"
                                                            >
                                                                <td className="max-w-md px-3 py-3">
                                                                    <span className="font-medium">
                                                                        Q
                                                                        {
                                                                            question.number
                                                                        }
                                                                        .
                                                                    </span>{' '}
                                                                    {
                                                                        question.question
                                                                    }
                                                                </td>
                                                                <td className="px-3 py-3 tabular-nums">
                                                                    {
                                                                        question.total_answers
                                                                    }
                                                                </td>
                                                                <td className="px-3 py-3 text-emerald-400 tabular-nums">
                                                                    {
                                                                        question.correct_answers
                                                                    }
                                                                </td>
                                                                <td className="px-3 py-3 text-rose-400 tabular-nums">
                                                                    {
                                                                        question.incorrect_answers
                                                                    }
                                                                </td>
                                                                <td className="px-3 py-3 text-muted-foreground tabular-nums">
                                                                    {
                                                                        question.skipped_answers
                                                                    }
                                                                </td>
                                                                <td className="px-3 py-3 font-medium tabular-nums">
                                                                    {formatPercentage(
                                                                        question.accuracy_percentage,
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <UserPerformancePagination
                                            paginator={questionPerformance}
                                            resourceLabel="questions"
                                        />
                                    </>
                                ) : (
                                    <p className="py-8 text-center text-sm text-muted-foreground">
                                        No question performance data available.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <QuestionListCard
                                title="Most Difficult Questions"
                                description="Lowest accuracy based on actual user answers."
                                items={mostDifficultQuestions}
                            />
                            <QuestionListCard
                                title="Easiest Questions"
                                description="Highest accuracy based on actual user answers."
                                items={easiestQuestions}
                            />
                        </section>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="size-5 text-amber-400" />
                                    Top Performers
                                </CardTitle>
                                <CardDescription>
                                    Top 5 users for this quiz by average
                                    percentage.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {topPerformers.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[700px] border-collapse text-sm">
                                            <thead>
                                                <tr className="border-b border-sidebar-border/70 text-left text-muted-foreground">
                                                    <th className="px-3 py-3 font-medium">
                                                        User
                                                    </th>
                                                    <th className="px-3 py-3 font-medium">
                                                        Attempts
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
                                                {topPerformers.map((user) => (
                                                    <tr
                                                        key={user.id}
                                                        className="border-b border-sidebar-border/50 last:border-b-0"
                                                    >
                                                        <td className="px-3 py-3">
                                                            <div className="font-medium">
                                                                {user.name}
                                                            </div>
                                                            {user.email ? (
                                                                <div className="text-xs text-muted-foreground">
                                                                    {user.email}
                                                                </div>
                                                            ) : null}
                                                        </td>
                                                        <td className="px-3 py-3 tabular-nums">
                                                            {user.attempts}
                                                        </td>
                                                        <td className="px-3 py-3 tabular-nums">
                                                            {formatNumber(
                                                                user.best_score,
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3 font-medium tabular-nums">
                                                            {formatPercentage(
                                                                user.average_percentage,
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3 tabular-nums">
                                                            {formatPercentage(
                                                                user.pass_rate,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="py-8 text-center text-sm text-muted-foreground">
                                        No top performers available.
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
                                            <table className="w-full min-w-[1100px] border-collapse text-sm">
                                                <thead>
                                                    <tr className="border-b border-sidebar-border/70 text-left text-muted-foreground">
                                                        <th className="px-3 py-3 font-medium">
                                                            User
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
                                                            Completion Time
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
                                                                <td className="px-3 py-3">
                                                                    <div className="font-medium">
                                                                        {
                                                                            attempt.user_name
                                                                        }
                                                                    </div>
                                                                    {attempt.user_email ? (
                                                                        <div className="text-xs text-muted-foreground">
                                                                            {
                                                                                attempt.user_email
                                                                            }
                                                                        </div>
                                                                    ) : null}
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
                                                                <td className="px-3 py-3 tabular-nums">
                                                                    {formatDuration(
                                                                        attempt.completion_seconds,
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

AdminQuizPerformanceShow.layout = (props: Props) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Quiz Performance',
            href: props.backUrl || quizPerformanceIndex(),
        },
        {
            title: props.quiz.title,
            href: quizPerformanceShow(props.quiz.id),
        },
    ],
});
