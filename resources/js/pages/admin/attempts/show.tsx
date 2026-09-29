import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { AttemptQuestionReview } from '@/components/admin/attempt-question-review';
import { AttemptResultBadge } from '@/components/admin/attempt-result-badge';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { show } from '@/routes/admin/attempts';
import { dashboard } from '@/routes/admin';
import type { AdminAttempt, AdminAttemptReviewQuestion } from '@/types';

type Props = {
    attempt: AdminAttempt;
    questions: AdminAttemptReviewQuestion[];
    backUrl: string;
};

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
        month: 'long',
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

export default function AdminAttemptsShow({
    attempt,
    questions,
    backUrl,
}: Props) {
    return (
        <>
            <Head title={`Attempt #${attempt.id}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="space-y-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={backUrl}>
                            <ArrowLeft className="size-4" />
                            Back to Attempts
                        </Link>
                    </Button>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <Heading
                            variant="small"
                            title={attempt.quiz.title}
                            description={`Attempt summary for ${attempt.user.name}.`}
                        />

                        <AttemptResultBadge
                            status={attempt.status}
                            label={attempt.status_label}
                            className="self-start"
                        />
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Attempt Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <SummaryItem label="User">
                            <p>{attempt.user.name}</p>
                            {attempt.user.email ? (
                                <p className="text-sm text-muted-foreground">
                                    {attempt.user.email}
                                </p>
                            ) : null}
                        </SummaryItem>

                        <SummaryItem label="Quiz">
                            <p>{attempt.quiz.title}</p>
                            {attempt.quiz.category_name ? (
                                <p className="text-sm text-muted-foreground">
                                    {attempt.quiz.category_name}
                                </p>
                            ) : null}
                        </SummaryItem>

                        <SummaryItem label="Score">
                            <p className="tabular-nums">
                                {attempt.score === null ||
                                attempt.total_marks === null
                                    ? '—'
                                    : `${formatNumber(attempt.score)} / ${formatNumber(attempt.total_marks)}`}
                            </p>
                        </SummaryItem>

                        <SummaryItem label="Percentage">
                            <p className="tabular-nums">
                                {formatPercentage(attempt.percentage)}
                            </p>
                        </SummaryItem>

                        <SummaryItem label="Status">
                            <AttemptResultBadge
                                status={attempt.status}
                                label={attempt.status_label}
                            />
                        </SummaryItem>

                        <SummaryItem label="Total Questions">
                            <p className="tabular-nums">
                                {formatNumber(attempt.total_questions)}
                            </p>
                        </SummaryItem>

                        <SummaryItem label="Attempted">
                            <p className="tabular-nums">
                                {formatNumber(attempt.attempted_questions)}
                            </p>
                        </SummaryItem>

                        <SummaryItem label="Correct">
                            <p className="text-emerald-400 tabular-nums">
                                {formatNumber(attempt.correct_answers)}
                            </p>
                        </SummaryItem>

                        <SummaryItem label="Wrong">
                            <p className="text-rose-400 tabular-nums">
                                {formatNumber(attempt.wrong_answers)}
                            </p>
                        </SummaryItem>

                        <SummaryItem label="Unanswered">
                            <p className="text-muted-foreground tabular-nums">
                                {formatNumber(attempt.unanswered_questions)}
                            </p>
                        </SummaryItem>

                        <SummaryItem label="Started At">
                            <p className="text-sm">
                                {formatDateTime(attempt.started_at)}
                            </p>
                        </SummaryItem>

                        <SummaryItem label="Completed At">
                            <p className="text-sm">
                                {formatDateTime(attempt.completed_at)}
                            </p>
                        </SummaryItem>
                    </CardContent>
                </Card>

                <section className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">
                            Answer Review
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Question-wise selected answers, correct answers, and
                            awarded marks.
                        </p>
                    </div>

                    {questions.length > 0 ? (
                        <div className="space-y-4">
                            {questions.map((question) => (
                                <AttemptQuestionReview
                                    key={question.id}
                                    question={question}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-sidebar-border/70 px-6 py-12 text-center text-sm text-muted-foreground">
                            No questions are available for this attempt.
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}

AdminAttemptsShow.layout = (props: Props) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Quiz Attempts',
            href: props.backUrl,
        },
        {
            title: `Attempt #${props.attempt.id}`,
            href: show(props.attempt.id),
        },
    ],
});
