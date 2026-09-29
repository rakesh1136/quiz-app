import { Head, Link, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    CircleHelp,
    ClipboardList,
    Clock3,
    LayoutGrid,
    ListChecks,
    Trophy,
    XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as quizzesIndex } from '@/routes/quizzes';
import type { QuizAttemptResultPageData } from '@/types';

type Props = QuizAttemptResultPageData;

function formatMarks(value: number): string {
    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
}

function formatPercentage(value: number): string {
    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
}

export default function QuizAttemptResult({ quiz, attempt }: Props) {
    const { currentTeam } = usePage().props;
    const dashboardHref = currentTeam ? dashboard(currentTeam.slug) : quizzesIndex();
    const passed = attempt.is_passed;
    const stats = [
        {
            label: 'Total Questions',
            value: attempt.total_questions.toLocaleString(),
            icon: CircleHelp,
            tone: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
        },
        {
            label: 'Attempted',
            value: attempt.attempted_questions.toLocaleString(),
            icon: ListChecks,
            tone: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
        },
        {
            label: 'Correct',
            value: attempt.correct_answers.toLocaleString(),
            icon: CheckCircle2,
            tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        },
        {
            label: 'Wrong',
            value: attempt.wrong_answers.toLocaleString(),
            icon: XCircle,
            tone: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
        },
        {
            label: 'Unanswered',
            value: attempt.unanswered_questions.toLocaleString(),
            icon: ClipboardList,
            tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        },
    ];

    return (
        <>
            <Head title={`${quiz.title} — Result`} />

            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Quiz result</p>
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        {quiz.title}
                    </h1>
                </div>

                <Card
                    className={cn(
                        'overflow-hidden border',
                        passed
                            ? 'border-emerald-500/30'
                            : 'border-rose-500/30',
                    )}
                >
                    <CardContent className="flex flex-col items-center gap-5 px-6 py-10 text-center">
                        <span
                            className={cn(
                                'flex size-16 items-center justify-center rounded-full',
                                passed
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
                            )}
                        >
                            {passed ? (
                                <Trophy className="size-8" />
                            ) : (
                                <XCircle className="size-8" />
                            )}
                        </span>

                        <Badge
                            className={cn(
                                'px-3 py-1 text-sm font-semibold tracking-wide',
                                passed
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-600'
                                    : 'bg-rose-600 text-white hover:bg-rose-600',
                            )}
                        >
                            {passed ? 'PASSED' : 'FAILED'}
                        </Badge>

                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                                Score
                            </p>
                            <p className="font-semibold tracking-tight">
                                <span className="text-4xl sm:text-5xl">
                                    {formatMarks(attempt.obtained_marks)}
                                </span>
                                <span className="text-2xl text-muted-foreground">
                                    {' '}
                                    / {formatMarks(attempt.total_marks)}
                                </span>
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                            <span className="rounded-full bg-muted px-3 py-1 font-medium">
                                {formatPercentage(attempt.percentage)}%
                            </span>
                            <span className="text-muted-foreground">
                                Passing score {formatPercentage(quiz.passing_score)}%
                            </span>
                        </div>

                        {attempt.timed_out ? (
                            <p className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                                <Clock3 className="size-3.5" />
                                Time expired — this attempt was submitted
                                automatically.
                            </p>
                        ) : null}
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {stats.map((stat) => (
                        <Card key={stat.label} className="gap-0 py-4">
                            <CardContent className="flex flex-col items-start gap-2 px-4">
                                <span
                                    className={cn(
                                        'flex size-8 items-center justify-center rounded-lg',
                                        stat.tone,
                                    )}
                                >
                                    <stat.icon className="size-4" />
                                </span>
                                <p className="text-xs text-muted-foreground">
                                    {stat.label}
                                </p>
                                <p className="text-2xl font-semibold tracking-tight">
                                    {stat.value}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                    <Button variant="outline" asChild>
                        <Link href={quizzesIndex()} prefetch>
                            Back to Quizzes
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={dashboardHref} prefetch>
                            <LayoutGrid className="size-4" />
                            Go to Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </>
    );
}
