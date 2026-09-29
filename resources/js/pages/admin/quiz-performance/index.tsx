import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    ClipboardList,
    Clock3,
    Eye,
    Gauge,
    Percent,
    Users,
    Zap,
} from 'lucide-react';
import { QuizPerformanceFilters } from '@/components/admin/quiz-performance-filters';
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
    index as quizPerformanceIndex,
    show as quizPerformanceShow,
} from '@/routes/admin/quiz-performance';
import type {
    AdminQuizPerformanceFilterOptions,
    AdminQuizPerformanceFilters,
    AdminQuizPerformanceStats,
    PaginatedAdminQuizPerformance,
} from '@/types';

type Props = {
    quizzes: PaginatedAdminQuizPerformance;
    filters: AdminQuizPerformanceFilters;
    filterOptions: AdminQuizPerformanceFilterOptions;
    stats: AdminQuizPerformanceStats;
    hasData: boolean;
};

function formatNumber(value: number): string {
    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
}

function formatPercentage(value: number): string {
    return `${Number.isInteger(value) ? value.toString() : value.toFixed(1)}%`;
}

function formatDuration(totalSeconds: number): string {
    if (totalSeconds <= 0) {
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

export default function AdminQuizPerformanceIndex({
    quizzes,
    filters,
    filterOptions,
    stats,
    hasData,
}: Props) {
    const statCards = [
        {
            title: 'Total Quizzes',
            value: formatNumber(stats.totalQuizzes),
            description: 'Quizzes with matching attempts',
            icon: ClipboardList,
            tone: 'text-indigo-400',
        },
        {
            title: 'Total Attempts',
            value: formatNumber(stats.totalAttempts),
            description: 'Submitted attempts in filters',
            icon: Zap,
            tone: 'text-violet-400',
        },
        {
            title: 'Total Participants',
            value: formatNumber(stats.totalParticipants),
            description: 'Unique users who submitted',
            icon: Users,
            tone: 'text-sky-400',
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
            tone: 'text-cyan-400',
        },
        {
            title: 'Overall Pass Rate',
            value: formatPercentage(stats.passRate),
            description: 'Passed attempts share',
            icon: CheckCircle2,
            tone: 'text-emerald-400',
        },
    ];

    return (
        <>
            <Head title="Quiz Performance" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Quiz Performance
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Analyze quiz results, question difficulty, and
                        participant outcomes from submitted attempts.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>
                            Search and filter quiz performance. Statistics and
                            the table update from the database.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <QuizPerformanceFilters
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
                            Try adjusting search or filters to find quizzes with
                            submitted attempts.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-hidden rounded-xl border border-sidebar-border/70">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1200px] border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b border-sidebar-border/70 bg-muted/20">
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                Quiz
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                Category
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                Total Attempts
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                Total Participants
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                Average Score
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                Average Percentage
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                Best Score
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                Pass Rate
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                Fail Rate
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                Avg Completion Time
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quizzes.data.map((quiz) => (
                                            <tr
                                                key={quiz.id}
                                                className="border-b border-sidebar-border/50 last:border-b-0 hover:bg-muted/10"
                                            >
                                                <td className="px-4 py-3 font-medium">
                                                    {quiz.title}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {quiz.category_name ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 tabular-nums">
                                                    {quiz.total_attempts}
                                                </td>
                                                <td className="px-4 py-3 tabular-nums">
                                                    {quiz.total_participants}
                                                </td>
                                                <td className="px-4 py-3 tabular-nums">
                                                    {formatNumber(
                                                        quiz.average_score,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 font-medium tabular-nums">
                                                    {formatPercentage(
                                                        quiz.average_percentage,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 tabular-nums">
                                                    {formatNumber(
                                                        quiz.best_score,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-emerald-400 tabular-nums">
                                                    {formatPercentage(
                                                        quiz.pass_rate,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-rose-400 tabular-nums">
                                                    {formatPercentage(
                                                        quiz.fail_rate,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center gap-1.5 tabular-nums">
                                                        <Clock3 className="size-3.5 text-muted-foreground" />
                                                        {formatDuration(
                                                            quiz.average_completion_seconds,
                                                        )}
                                                    </span>
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
                                                                            href={quizPerformanceShow.url(
                                                                                quiz.id,
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

                        <UserPerformancePagination
                            paginator={quizzes}
                            resourceLabel="quizzes"
                        />
                    </>
                )}
            </div>
        </>
    );
}

AdminQuizPerformanceIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Quiz Performance',
            href: quizPerformanceIndex(),
        },
    ],
};
