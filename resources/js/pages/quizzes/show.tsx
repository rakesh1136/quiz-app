import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BrainCircuit,
    CheckCircle2,
    Clock3,
    HelpCircle,
    ListChecks,
    MinusCircle,
    MousePointerClick,
    Play,
    RotateCcw,
    Send,
    Timer,
    Trophy,
    XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { index as quizzesIndex } from '@/routes/quizzes';
import { store as storeAttempt } from '@/routes/quizzes/attempts';
import type { UserQuizDetail } from '@/types';

type Props = {
    quiz: UserQuizDetail;
};

const instructions = [
    {
        text: 'Each question has four options.',
        icon: ListChecks,
        tone: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    },
    {
        text: 'Select one answer for each question.',
        icon: MousePointerClick,
        tone: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    },
    {
        text: 'Correct answer gives +1 mark.',
        icon: CheckCircle2,
        tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
        text: 'Wrong answer deducts 0.25 mark.',
        icon: XCircle,
        tone: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
    {
        text: 'Unanswered questions receive 0 marks.',
        icon: MinusCircle,
        tone: 'bg-muted text-muted-foreground',
    },
    {
        text: 'The quiz has a fixed time limit.',
        icon: Timer,
        tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    },
    {
        text: 'Submit the quiz before the timer expires.',
        icon: Send,
        tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
];

function formatPassingScore(score: number): string {
    return Number.isInteger(score) ? score.toString() : score.toFixed(0);
}

function formatMarks(marks: number): string {
    return Number.isInteger(marks) ? marks.toString() : marks.toFixed(2);
}

export default function QuizzesShow({ quiz }: Props) {
    const durationLabel = `${quiz.duration} ${quiz.duration === 1 ? 'Minute' : 'Minutes'}`;
    const questionsLabel = `${quiz.questions_count} ${quiz.questions_count === 1 ? 'Question' : 'Questions'}`;
    const marksLabel = `${formatMarks(quiz.total_marks)} Marks`;

    const summary = [
        {
            label: 'Questions',
            value: quiz.questions_count.toLocaleString(),
            icon: HelpCircle,
            tone: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
        },
        {
            label: 'Total Marks',
            value: formatMarks(quiz.total_marks),
            icon: Trophy,
            tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        },
        {
            label: 'Duration',
            value: durationLabel,
            icon: Clock3,
            tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
        },
        {
            label: 'Passing Score',
            value: `${formatPassingScore(quiz.passing_score)}%`,
            icon: CheckCircle2,
            tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        },
        {
            label: 'Max Attempts',
            value: quiz.max_attempts.toLocaleString(),
            icon: RotateCcw,
            tone: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
        },
    ];

    const heroChips = [
        { label: questionsLabel, icon: HelpCircle },
        { label: durationLabel, icon: Clock3 },
        { label: marksLabel, icon: Trophy },
    ];

    return (
        <>
            <Head title={quiz.title} />

            <div className="flex flex-col gap-6">
                <Button variant="ghost" size="sm" asChild className="w-fit">
                    <Link href={quizzesIndex()} prefetch>
                        <ArrowLeft className="size-4" />
                        Back to Quizzes
                    </Link>
                </Button>

                <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-indigo-500/15 via-violet-500/10 to-background p-6 shadow-sm sm:p-8">
                    <div className="absolute -top-16 -right-10 size-56 rounded-full bg-indigo-500/15 blur-3xl" />
                    <div className="absolute -bottom-24 -left-12 size-52 rounded-full bg-violet-500/10 blur-3xl" />

                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
                            <BrainCircuit className="size-7" />
                        </span>

                        <div className="min-w-0 flex-1">
                            <Badge className="border-indigo-500/20 bg-background/80 text-foreground shadow-sm backdrop-blur">
                                {quiz.category_name}
                            </Badge>

                            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
                                {quiz.title}
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                                {quiz.description?.trim() ||
                                    'No description available for this quiz.'}
                            </p>

                            <div className="mt-5 flex flex-wrap gap-2">
                                {heroChips.map(({ label, icon: Icon }) => (
                                    <span
                                        key={label}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
                                    >
                                        <Icon className="size-3.5 text-indigo-500" />
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <span className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                    <ListChecks className="size-5" />
                                </span>
                                Instructions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2.5">
                                {instructions.map(
                                    ({ text, icon: Icon, tone }) => (
                                        <li
                                            key={text}
                                            className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5"
                                        >
                                            <span
                                                className={cn(
                                                    'flex size-8 shrink-0 items-center justify-center rounded-lg',
                                                    tone,
                                                )}
                                            >
                                                <Icon className="size-4" />
                                            </span>
                                            <span className="text-sm leading-5 text-muted-foreground">
                                                {text}
                                            </span>
                                        </li>
                                    ),
                                )}
                            </ul>
                        </CardContent>
                    </Card>

                    <aside className="lg:col-span-2">
                        <div className="flex flex-col gap-4 lg:sticky lg:top-24">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Quiz Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="divide-y divide-border/60">
                                        {summary.map(
                                            ({
                                                label,
                                                value,
                                                icon: Icon,
                                                tone,
                                            }) => (
                                                <div
                                                    key={label}
                                                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                                                >
                                                    <span
                                                        className={cn(
                                                            'flex size-9 shrink-0 items-center justify-center rounded-lg',
                                                            tone,
                                                        )}
                                                    >
                                                        <Icon className="size-4" />
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {label}
                                                    </span>
                                                    <span className="ml-auto text-sm font-semibold">
                                                        {value}
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="relative overflow-hidden border-indigo-500/25 bg-gradient-to-br from-indigo-500/10 via-background to-background py-0">
                                <CardContent className="relative flex flex-col gap-4 p-5">
                                    <div>
                                        <h2 className="text-base font-semibold tracking-tight">
                                            Ready to begin?
                                        </h2>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            You will have {durationLabel.toLowerCase()}{' '}
                                            to answer {questionsLabel.toLowerCase()}.
                                        </p>
                                    </div>

                                    <Form
                                        {...storeAttempt.form(quiz.id)}
                                        className="flex flex-col gap-3"
                                    >
                                        {({ processing }) => (
                                            <>
                                                <Button
                                                    type="submit"
                                                    size="lg"
                                                    className="w-full bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
                                                    disabled={processing}
                                                    data-test="start-quiz-button"
                                                >
                                                    {processing ? (
                                                        <Spinner />
                                                    ) : (
                                                        <Play className="size-4" />
                                                    )}
                                                    {processing
                                                        ? 'Starting...'
                                                        : 'Start Quiz'}
                                                </Button>

                                                <p className="text-center text-xs text-muted-foreground">
                                                    Timer starts as soon as you
                                                    begin.
                                                </p>
                                            </>
                                        )}
                                    </Form>
                                </CardContent>
                            </Card>
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}
