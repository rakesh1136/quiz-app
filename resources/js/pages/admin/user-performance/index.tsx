import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    Eye,
    Gauge,
    Percent,
    Trophy,
    Users,
    XCircle,
    Zap,
} from 'lucide-react';
import { UserPerformanceFilters } from '@/components/admin/user-performance-filters';
import { UserPerformancePagination } from '@/components/admin/user-performance-pagination';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { dashboard } from '@/routes/admin';
import {
    index as userPerformanceIndex,
    show as userPerformanceShow,
} from '@/routes/admin/user-performance';
import type {
    AdminUserPerformanceFilterOptions,
    AdminUserPerformanceFilters,
    AdminUserPerformanceStats,
    PaginatedAdminUserPerformance,
} from '@/types';

type Props = {
    users: PaginatedAdminUserPerformance;
    filters: AdminUserPerformanceFilters;
    filterOptions: AdminUserPerformanceFilterOptions;
    stats: AdminUserPerformanceStats;
    hasData: boolean;
};

function formatNumber(value: number): string {
    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
}

function formatPercentage(value: number): string {
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

export default function AdminUserPerformanceIndex({
    users,
    filters,
    filterOptions,
    stats,
    hasData,
}: Props) {
    const statCards = [
        {
            title: 'Total Participants',
            value: formatNumber(stats.totalParticipants),
            description: 'Users with matching attempts',
            icon: Users,
            tone: 'text-sky-400',
        },
        {
            title: 'Total Attempts',
            value: formatNumber(stats.totalAttempts),
            description: 'Submitted attempts in filters',
            icon: Zap,
            tone: 'text-indigo-400',
        },
        {
            title: 'Average Score',
            value: formatNumber(stats.averageScore),
            description: 'Mean obtained marks',
            icon: Gauge,
            tone: 'text-amber-400',
        },
        {
            title: 'Average Percentage',
            value: formatPercentage(stats.averagePercentage),
            description: 'Mean attempt percentage',
            icon: Percent,
            tone: 'text-violet-400',
        },
        {
            title: 'Overall Pass Rate',
            value: formatPercentage(stats.passRate),
            description: 'Passed attempts share',
            icon: CheckCircle2,
            tone: 'text-emerald-400',
        },
        {
            title: 'Overall Fail Rate',
            value: formatPercentage(stats.failRate),
            description: 'Failed attempts share',
            icon: XCircle,
            tone: 'text-rose-400',
        },
    ];

    return (
        <>
            <Head title="User Performance" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        User Performance
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Review participant results, pass rates, and score trends
                        across submitted quiz attempts.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="size-5 text-primary" />
                            Filters
                        </CardTitle>
                        <CardDescription>
                            Search and filter performance data. Statistics and
                            the table update from the database.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UserPerformanceFilters
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
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-sidebar-border/70 px-6 py-16 text-center">
                        <p className="text-base font-medium">
                            No data available for the selected filters.
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Try adjusting search or filters to find users with
                            submitted attempts.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-hidden rounded-xl border border-sidebar-border/70">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1100px] border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b border-sidebar-border/70 bg-muted/20">
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                User
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                Email
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                Total Attempts
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                Passed
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                Failed
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                Average Score
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                Best Score
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                Average Percentage
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                Pass Rate
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                Last Attempt
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.data.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="border-b border-sidebar-border/50 last:border-b-0 hover:bg-muted/10"
                                            >
                                                <td className="px-4 py-3 font-medium">
                                                    {user.name}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {user.email ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 tabular-nums">
                                                    {user.total_attempts}
                                                </td>
                                                <td className="px-4 py-3 text-emerald-400 tabular-nums">
                                                    {user.passed_attempts}
                                                </td>
                                                <td className="px-4 py-3 text-rose-400 tabular-nums">
                                                    {user.failed_attempts}
                                                </td>
                                                <td className="px-4 py-3 tabular-nums">
                                                    {formatNumber(
                                                        user.average_score,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 tabular-nums">
                                                    {formatNumber(
                                                        user.best_score,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 font-medium tabular-nums">
                                                    {formatPercentage(
                                                        user.average_percentage,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 tabular-nums">
                                                    {formatPercentage(
                                                        user.pass_rate,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {formatDateTime(
                                                        user.last_attempt_at,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
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
                                                                            href={userPerformanceShow.url(
                                                                                user.id,
                                                                                {
                                                                                    query: {
                                                                                        date_from:
                                                                                            filters.date_from ||
                                                                                            undefined,
                                                                                        date_to:
                                                                                            filters.date_to ||
                                                                                            undefined,
                                                                                        status:
                                                                                            filters.status !==
                                                                                            'all'
                                                                                                ? filters.status
                                                                                                : undefined,
                                                                                    },
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
                                                                    View Details
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

                        <UserPerformancePagination paginator={users} />
                    </>
                )}
            </div>
        </>
    );
}

AdminUserPerformanceIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'User Performance',
            href: userPerformanceIndex(),
        },
    ],
};
