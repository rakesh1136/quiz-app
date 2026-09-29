import { Head } from '@inertiajs/react';
import {
    Activity,
    Award,
    CheckCircle2,
    Clock3,
    Gauge,
    Percent,
    Trophy,
    Users,
    XCircle,
} from 'lucide-react';
import { ReportsFilters } from '@/components/admin/reports-filters';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard, reports } from '@/routes/admin';
import type {
    AdminReportAttemptsOverviewItem,
    AdminReportCategoryPerformanceItem,
    AdminReportFilterOptions,
    AdminReportFilters,
    AdminReportPassFail,
    AdminReportQuizPerformanceItem,
    AdminReportStats,
    AdminReportTopPerformer,
} from '@/types';

type Props = {
    filters: AdminReportFilters;
    filterOptions: AdminReportFilterOptions;
    stats: AdminReportStats;
    attemptsOverview: AdminReportAttemptsOverviewItem[];
    passFail: AdminReportPassFail;
    quizPerformance: AdminReportQuizPerformanceItem[];
    categoryPerformance: AdminReportCategoryPerformanceItem[];
    topPerformers: AdminReportTopPerformer[];
    hasData: boolean;
};

const PASSED_COLOR = '#10b981';
const FAILED_COLOR = '#f43f5e';
const BAR_COLOR = '#6366f1';
const PERF_COLOR = '#38bdf8';

function formatNumber(value: number): string {
    return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

function formatDuration(totalSeconds: number): string {
    if (totalSeconds <= 0) {
        return '0m';
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

function AttemptsOverviewChart({
    data,
}: {
    data: AdminReportAttemptsOverviewItem[];
}) {
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

    if (data.length === 0) {
        return (
            <p className="py-10 text-center text-sm text-muted-foreground">
                No data available for the selected filters.
            </p>
        );
    }

    const barGap = data.length > 20 ? 2 : 4;
    const labelStep = Math.max(1, Math.ceil(data.length / 6));
    const labelIndexes = data
        .map((_, index) => index)
        .filter(
            (index) =>
                index === 0 ||
                index === data.length - 1 ||
                index % labelStep === 0,
        )
        .filter((index) => index !== data.length - 2 || data.length < 3);

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
                                    title={`${item.label}: ${item.attempts} attempt${item.attempts === 1 ? '' : 's'}`}
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

function PassFailChart({ passed, failed }: AdminReportPassFail) {
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
                    <p className="text-xs text-muted-foreground">
                        {formatNumber(passedPercentage)}%
                    </p>
                </div>
                <div className="rounded-xl border px-3 py-3 text-center">
                    <p className="text-xs text-muted-foreground">Failed</p>
                    <p className="mt-1 text-lg font-semibold text-rose-400 tabular-nums">
                        {failed}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {formatNumber(failedPercentage)}%
                    </p>
                </div>
            </div>
        </div>
    );
}

function HorizontalScoreChart({
    items,
    emptyLabel,
}: {
    items: Array<{ id: number; label: string; value: number; meta: string }>;
    emptyLabel: string;
}) {
    if (items.length === 0) {
        return (
            <p className="py-10 text-center text-sm text-muted-foreground">
                {emptyLabel}
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <div key={item.id} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                                {item.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {item.meta}
                            </p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold tabular-nums">
                            {formatNumber(item.value)}%
                        </span>
                    </div>
                    <div
                        style={{
                            height: 8,
                            borderRadius: 999,
                            backgroundColor: 'var(--muted)',
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                height: '100%',
                                width: `${Math.min(100, Math.max(0, item.value))}%`,
                                borderRadius: 999,
                                backgroundColor: PERF_COLOR,
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function AdminReportsIndex({
    filters,
    filterOptions,
    stats,
    attemptsOverview,
    passFail,
    quizPerformance,
    categoryPerformance,
    topPerformers,
    hasData,
}: Props) {
    const statCards = [
        {
            title: 'Total Attempts',
            value: formatNumber(stats.totalAttempts),
            description: 'Submitted attempts in range',
            icon: Activity,
            tone: 'text-indigo-400',
        },
        {
            title: 'Average Score',
            value: `${formatNumber(stats.averageScore)}%`,
            description: 'Mean percentage score',
            icon: Gauge,
            tone: 'text-amber-400',
        },
        {
            title: 'Pass Rate',
            value: `${formatNumber(stats.passRate)}%`,
            description: 'Passed attempts share',
            icon: CheckCircle2,
            tone: 'text-emerald-400',
        },
        {
            title: 'Fail Rate',
            value: `${formatNumber(stats.failRate)}%`,
            description: 'Failed attempts share',
            icon: XCircle,
            tone: 'text-rose-400',
        },
        {
            title: 'Total Participants',
            value: formatNumber(stats.totalParticipants),
            description: 'Unique users who submitted',
            icon: Users,
            tone: 'text-sky-400',
        },
        {
            title: 'Avg Completion Time',
            value: formatDuration(stats.averageCompletionSeconds),
            description: 'Started to completed average',
            icon: Clock3,
            tone: 'text-violet-400',
        },
    ];

    return (
        <>
            <Head title="Reports & Analytics" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Reports & Analytics
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Analyze submitted quiz attempts, performance trends, and
                        top users.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Percent className="size-5 text-primary" />
                            Filters
                        </CardTitle>
                        <CardDescription>
                            Combine date, quiz, category, user, and result
                            filters. All values are calculated on the server.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ReportsFilters
                            filters={filters}
                            filterOptions={filterOptions}
                        />
                    </CardContent>
                </Card>

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {statCards.map((card) => (
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
                                <div className="text-3xl font-bold tabular-nums">
                                    {card.value}
                                </div>
                                <CardDescription className="mt-1">
                                    {card.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                {!hasData ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <p className="text-base font-medium">
                                No data available for the selected filters.
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Try adjusting the date range or clearing one or
                                more filters.
                            </p>
                        </CardContent>
                    </Card>
                ) : null}

                <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Card className="min-w-0 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="size-5 text-indigo-400" />
                                Quiz Attempts Overview
                            </CardTitle>
                            <CardDescription>
                                Submitted attempts over the selected date range
                                (defaults to the last 30 days).
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AttemptsOverviewChart data={attemptsOverview} />
                        </CardContent>
                    </Card>

                    <Card className="min-w-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="size-5 text-amber-400" />
                                Pass vs Fail
                            </CardTitle>
                            <CardDescription>
                                Passed and failed submitted attempts for the
                                current filters.
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
                    <Card className="min-w-0">
                        <CardHeader>
                            <CardTitle>Quiz Performance</CardTitle>
                            <CardDescription>
                                Average percentage by quiz based on submitted
                                attempts.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <HorizontalScoreChart
                                emptyLabel="No data available for the selected filters."
                                items={quizPerformance.map((item) => ({
                                    id: item.id,
                                    label: item.title,
                                    value: item.average_score,
                                    meta: `${item.attempts} attempt${item.attempts === 1 ? '' : 's'}`,
                                }))}
                            />
                        </CardContent>
                    </Card>

                    <Card className="min-w-0">
                        <CardHeader>
                            <CardTitle>Category Performance</CardTitle>
                            <CardDescription>
                                Average percentage by category based on
                                submitted attempts.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <HorizontalScoreChart
                                emptyLabel="No data available for the selected filters."
                                items={categoryPerformance.map((item) => ({
                                    id: item.id,
                                    label: item.name,
                                    value: item.average_score,
                                    meta: `${item.attempts} attempt${item.attempts === 1 ? '' : 's'}`,
                                }))}
                            />
                        </CardContent>
                    </Card>
                </section>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="size-5 text-amber-400" />
                            Top Performers
                        </CardTitle>
                        <CardDescription>
                            Top 5 users by average percentage from submitted
                            attempts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {topPerformers.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[640px] border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b border-sidebar-border/70 text-left text-muted-foreground">
                                            <th className="px-3 py-3 font-medium">
                                                User
                                            </th>
                                            <th className="px-3 py-3 font-medium">
                                                Attempts
                                            </th>
                                            <th className="px-3 py-3 font-medium">
                                                Average Score
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
                                                <td className="px-3 py-3 font-medium tabular-nums">
                                                    {formatNumber(
                                                        user.average_score,
                                                    )}
                                                    %
                                                </td>
                                                <td className="px-3 py-3 tabular-nums">
                                                    {formatNumber(
                                                        user.pass_rate,
                                                    )}
                                                    %
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="py-10 text-center text-sm text-muted-foreground">
                                No data available for the selected filters.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminReportsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Reports & Analytics',
            href: reports(),
        },
    ],
};
