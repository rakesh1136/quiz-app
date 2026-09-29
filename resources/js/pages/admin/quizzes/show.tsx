import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { DifficultyBadge } from '@/components/admin/difficulty-badge';
import { QuizStatusBadge } from '@/components/admin/quiz-status-badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { confirmDelete } from '@/lib/confirm-delete';
import { destroy, edit, index, show } from '@/routes/admin/quizzes';
import { dashboard } from '@/routes/admin';
import type { AdminQuiz } from '@/types';

type Props = {
    quiz: AdminQuiz;
};

function formatDateTime(value: string | null | undefined): string {
    if (!value) {
        return '—';
    }

    return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

export default function AdminQuizzesShow({ quiz }: Props) {
    const handleDelete = async () => {
        const confirmed = await confirmDelete();

        if (!confirmed) {
            return;
        }

        router.delete(destroy.url(quiz.id));
    };

    return (
        <>
            <Head title={quiz.title} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={index()}>
                                <ArrowLeft className="size-4" />
                                Back to Quizzes
                            </Link>
                        </Button>

                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {quiz.title}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Quiz details and assigned questions.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={edit(quiz.id)}>
                                <Pencil className="size-4" />
                                Edit Quiz
                            </Link>
                        </Button>

                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="size-4" />
                            Delete Quiz
                        </Button>
                    </div>
                </div>

                <Card className="max-w-4xl">
                    <CardHeader>
                        <CardTitle>Quiz Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Category
                            </p>
                            <p className="mt-1 font-medium">
                                {quiz.category_name}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Status
                            </p>
                            <div className="mt-2">
                                <QuizStatusBadge
                                    status={quiz.status}
                                    label={quiz.status_label}
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <p className="text-sm text-muted-foreground">
                                Description
                            </p>
                            <p className="mt-1 font-medium whitespace-pre-wrap">
                                {quiz.description || '—'}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Duration
                            </p>
                            <p className="mt-1 font-medium">
                                {quiz.duration} minutes
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Passing Score
                            </p>
                            <p className="mt-1 font-medium">
                                {quiz.passing_score}%
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Maximum Attempts
                            </p>
                            <p className="mt-1 font-medium">
                                {quiz.max_attempts}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total Questions
                            </p>
                            <p className="mt-1 font-medium">
                                {quiz.questions_count}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total Marks
                            </p>
                            <p className="mt-1 font-medium">
                                {quiz.total_marks}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">Slug</p>
                            <p className="mt-1 font-mono text-sm">
                                {quiz.slug}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Created At
                            </p>
                            <p className="mt-1 font-medium">
                                {formatDateTime(quiz.created_at)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Last Updated
                            </p>
                            <p className="mt-1 font-medium">
                                {formatDateTime(quiz.updated_at)}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="max-w-4xl">
                    <CardHeader>
                        <CardTitle>Questions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {!quiz.questions || quiz.questions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No questions assigned to this quiz.
                            </p>
                        ) : (
                            quiz.questions.map((question, index) => (
                                <div
                                    key={question.id}
                                    className="rounded-lg border border-sidebar-border/70 px-4 py-3"
                                >
                                    <p className="font-medium">
                                        {index + 1}. {question.question}
                                    </p>
                                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                        <span>{question.category_name}</span>
                                        <DifficultyBadge
                                            difficulty={question.difficulty}
                                            label={question.difficulty_label}
                                        />
                                        <span>{question.marks} mark</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminQuizzesShow.layout = (props: Props) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Quizzes',
            href: index(),
        },
        {
            title: props.quiz.title,
            href: show(props.quiz.id),
        },
    ],
});
