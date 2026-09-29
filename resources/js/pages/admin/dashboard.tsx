import { Head } from '@inertiajs/react';
import {
    Activity,
    Award,
    CheckCircle2,
    ClipboardCheck,
    ClipboardList,
    Gauge,
    HelpCircle,
    Users,
    XCircle,
    Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes/admin';

type DashboardStats = {
    totalUsers: number;
    totalQuizzes: number;
    totalAttempts: number;
    totalQuestions: number;
    completedAttempts: number;
    passedAttempts: number;
    failedAttempts: number;
    averageScore: number;
};

type AttemptsOverviewItem = {
    date: string;
    label: string;
    attempts: number;
};

type RecentAttempt = {
    id: number;
    user: string;
    quiz: string;
    score: number;
    total_marks: number;
    percentage: number;
    is_passed: boolean;
    completed_at: string | null;
};

type Props = {
    stats: DashboardStats;
    attemptsOverview: AttemptsOverviewItem[];
    performance: {
        passed: number;
        failed: number;
    };
    recentAttempts: RecentAttempt[];
};

const statCards = [
    {
        key: 'totalUsers' as const,
        title: 'Total Users',
        description: 'Registered user accounts',
        icon: Users,
        tone: 'text-sky-500',
    },
    {
        key: 'totalQuizzes' as const,
        title: 'Total Quizzes',
        description: 'Quizzes created in the system',
        icon: ClipboardList,
        tone: 'text-indigo-500',
    },
    {
        key: 'totalAttempts' as const,
        title: 'Total Attempts',
        description: 'All quiz attempts started',
        icon: Zap,
        tone: 'text-violet-500',
    },
    {
        key: 'totalQuestions' as const,
        title: 'Total Questions',
        description: 'Questions in the question bank',
        icon: HelpCircle,
        tone: 'text-cyan-500',
    },
    {
        key: 'completedAttempts' as const,
        title: 'Completed Attempts',
        description: 'Submitted quiz attempts',
        icon: ClipboardCheck,
        tone: 'text-blue-500',
    },
    {
        key: 'passedAttempts' as const,
        title: 'Passed Attempts',
        description: 'Attempts meeting the pass score',
        icon: CheckCircle2,
        tone: 'text-emerald-500',
    },
    {
        key: 'failedAttempts' as const,
        title: 'Failed Attempts',
        description: 'Attempts below the pass score',
        icon: XCircle,
        tone: 'text-rose-500',
    },
    {
        key: 'averageScore' as const,
        title: 'Average Score',
        description: 'Average completed percentage',
        icon: Gauge,
        tone: 'text-amber-500',
        suffix: '%',
    },
];

function formatNumber(value: number): string {
    return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

function formatMarks(value: number): string {
    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
}

function formatDate(value: string | null): string {
    if (!value) {
        return '—';
    }

    const date = new Date(value);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    }

    return new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
    }).format(date);
}

const CHART_HEIGHT = 180;
const BAR_MAX_HEIGHT = 140;
const AXIS_WIDTH = 26;
const AXIS_GAP = 10;
const BAR_GAP = 6;

const PASSED_COLOR = '#10b981';
const FAILED_COLOR = '#f43f5e';
const BAR_COLOR = '#6366f1';

function AttemptsChart({ data }: { data: AttemptsOverviewItem[] }) {
    const maximum = Math.max(1, ...data.map((item) => item.attempts));
    const ticks = Array.from(
        new Set([maximum, Math.ceil(maximum / 2), 0]),
    ).sort((first, second) => second - first);

    const topFor = (value: number) =>
        CHART_HEIGHT - (value / maximum) * BAR_MAX_HEIGHT;

    return (
        <div
            className="w-full"
            role="img"
            aria-label="Quiz attempts during the last seven days"
        >
            <div style={{ display: 'flex', gap: AXIS_GAP }}>
                <div
                    style={{
                        position: 'relative',
                        width: AXIS_WIDTH,
                        height: CHART_HEIGHT,
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
                        height: CHART_HEIGHT,
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
                            gap: BAR_GAP,
                        }}
                    >
                        {data.map((item) => {
                            const height =
                                item.attempts === 0
                                    ? 2
                                    : Math.max(
                                          6,
                                          (item.attempts / maximum) *
                                              BAR_MAX_HEIGHT,
                                      );

                            return (
                                <div
                                    key={item.date}
                                    title={`${item.label}: ${item.attempts} ${item.attempts === 1 ? 'attempt' : 'attempts'}`}
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
                                            maxWidth: 46,
                                            height,
                                            borderRadius: '6px 6px 0 0',
                                            backgroundColor:
                                                item.attempts > 0
                                                    ? BAR_COLOR
                                                    : 'var(--border)',
                                        }}
                                    />

                                    {item.attempts > 0 ? (
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
                                            {item.attempts}
                                        </span>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div
                style={{
                    display: 'flex',
                    gap: BAR_GAP,
                    marginTop: 8,
                    paddingLeft: AXIS_WIDTH + AXIS_GAP,
                }}
            >
                {data.map((item) => (
                    <span
                        key={item.date}
                        className="truncate text-center text-[11px] text-muted-foreground"
                        style={{ flex: 1, minWidth: 0 }}
                    >
                        {item.label}
                    </span>
                ))}
            </div>
        </div>
    );
}

function PerformanceChart({
    passed,
    failed,
}: {
    passed: number;
    failed: number;
}) {
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

    const legend = [
        {
            label: 'Passed',
            value: passed,
            percentage: passedPercentage,
            color: PASSED_COLOR,
        },
        {
            label: 'Failed',
            value: failed,
            percentage: failedPercentage,
            color: FAILED_COLOR,
        },
    ];

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
                        Completed
                    </span>
                </div>
            </div>

            <div
                className="w-full space-y-3"
                style={{ minWidth: 0, maxWidth: 260 }}
            >
                {legend.map((item) => (
                    <div
                        key={item.label}
                        className="rounded-xl border px-4 py-3"
                        style={{ minWidth: 0 }}
                    >
                        <div className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span
                                    style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: 999,
                                        backgroundColor: item.color,
                                        display: 'inline-block',
                                    }}
                                />
                                {item.label}
                            </span>
                            <span className="text-sm font-semibold tabular-nums">
                                {item.value}
                                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                    {formatNumber(item.percentage)}%
                                </span>
                            </span>
                        </div>
                        <div
                            style={{
                                marginTop: 8,
                                height: 6,
                                borderRadius: 999,
                                backgroundColor: 'var(--muted)',
                                overflow: 'hidden',
                            }}
                        >
                            <div
                                style={{
                                    height: '100%',
                                    borderRadius: 999,
                                    width: `${item.percentage}%`,
                                    backgroundColor: item.color,
                                }}
                            />
                        </div>
                    </div>
                ))}

                {total === 0 ? (
                    <p className="text-center text-xs text-muted-foreground">
                        No completed attempts yet.
                    </p>
                ) : null}
            </div>
        </div>
    );
}

export default function AdminDashboard({
    stats,
    attemptsOverview,
    performance,
    recentAttempts,
}: Props) {
    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Overview of your quiz application.
                    </p>
                </div>

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statCards.map(
                        ({
                            key,
                            title,
                            description,
                            icon: Icon,
                            tone,
                            suffix,
                        }) => (
                            <Card key={key}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {title}
                                    </CardTitle>
                                    <Icon
                                        className={cn(
                                            'size-4 text-muted-foreground',
                                            tone,
                                        )}
                                    />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold tabular-nums">
                                        {formatNumber(stats[key])}
                                        {suffix}
                                    </div>
                                    <CardDescription className="mt-1">
                                        {description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ),
                    )}
                </section>

                <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Card className="flex min-w-0 flex-col lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="size-5 text-primary" />
                                Quiz Attempts Overview
                            </CardTitle>
                            <CardDescription>
                                Attempts started during the last 7 days
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex min-w-0 flex-1 items-center">
                            <AttemptsChart data={attemptsOverview} />
                        </CardContent>
                    </Card>

                    <Card className="flex min-w-0 flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="size-5 text-amber-500" />
                                Quiz Performance
                            </CardTitle>
                            <CardDescription>
                                Passed and failed submitted attempts
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex min-w-0 flex-1 items-center justify-center">
                            <PerformanceChart
                                passed={performance.passed}
                                failed={performance.failed}
                            />
                        </CardContent>
                    </Card>
                </section>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle>Recent Quiz Attempts</CardTitle>
                            <CardDescription>
                                Latest 5 submitted quiz attempts
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled
                            title="Quiz Attempts module is not available yet"
                        >
                            View All Attempts
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {recentAttempts.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-180 text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="px-3 py-3 font-medium">
                                                User
                                            </th>
                                            <th className="px-3 py-3 font-medium">
                                                Quiz
                                            </th>
                                            <th className="px-3 py-3 font-medium">
                                                Score
                                            </th>
                                            <th className="px-3 py-3 font-medium">
                                                Percentage
                                            </th>
                                            <th className="px-3 py-3 font-medium">
                                                Status
                                            </th>
                                            <th className="px-3 py-3 font-medium">
                                                Date
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentAttempts.map((attempt) => (
                                            <tr
                                                key={attempt.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="px-3 py-4 font-medium">
                                                    {attempt.user}
                                                </td>
                                                <td className="px-3 py-4">
                                                    {attempt.quiz}
                                                </td>
                                                <td className="px-3 py-4 tabular-nums">
                                                    {formatMarks(attempt.score)}{' '}
                                                    /{' '}
                                                    {formatMarks(
                                                        attempt.total_marks,
                                                    )}
                                                </td>
                                                <td className="px-3 py-4 tabular-nums">
                                                    {formatNumber(
                                                        attempt.percentage,
                                                    )}
                                                    %
                                                </td>
                                                <td className="px-3 py-4">
                                                    <Badge
                                                        className={cn(
                                                            attempt.is_passed
                                                                ? 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15 dark:text-emerald-400'
                                                                : 'bg-rose-500/15 text-rose-600 hover:bg-rose-500/15 dark:text-rose-400',
                                                        )}
                                                    >
                                                        {attempt.is_passed
                                                            ? 'Passed'
                                                            : 'Failed'}
                                                    </Badge>
                                                </td>
                                                <td className="px-3 py-4 text-muted-foreground">
                                                    {formatDate(
                                                        attempt.completed_at,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
                                <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                    <ClipboardCheck className="size-5" />
                                </span>
                                <p className="text-sm text-muted-foreground">
                                    No submitted quiz attempts yet.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
