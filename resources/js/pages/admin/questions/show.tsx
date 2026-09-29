import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Check, Pencil, Trash2 } from 'lucide-react';
import { DifficultyBadge } from '@/components/admin/difficulty-badge';
import { UserStatusBadge } from '@/components/admin/user-status-badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { confirmDelete } from '@/lib/confirm-delete';
import { destroy, edit, index, show } from '@/routes/admin/questions';
import { dashboard } from '@/routes/admin';
import type { AdminQuestion } from '@/types';

type Props = {
    question: AdminQuestion;
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

export default function AdminQuestionsShow({ question }: Props) {
    const handleDelete = async () => {
        const confirmed = await confirmDelete();

        if (!confirmed) {
            return;
        }

        router.delete(destroy.url(question.id));
    };

    return (
        <>
            <Head title={`Question #${question.id}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={index()}>
                                <ArrowLeft className="size-4" />
                                Back to Question Bank
                            </Link>
                        </Button>

                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Question Details
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                View complete question information and options.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={edit(question.id)}>
                                <Pencil className="size-4" />
                                Edit Question
                            </Link>
                        </Button>

                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="size-4" />
                            Delete Question
                        </Button>
                    </div>
                </div>

                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle>Question #{question.id}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Category
                            </p>
                            <p className="mt-1 font-medium">
                                {question.category_name}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Question
                            </p>
                            <p className="mt-1 font-medium whitespace-pre-wrap">
                                {question.question}
                            </p>
                        </div>

                        <div className="grid gap-3">
                            <p className="text-sm text-muted-foreground">
                                Options
                            </p>
                            {question.options.map((option) => (
                                <div
                                    key={option.id ?? option.sort_order}
                                    className="flex items-start gap-2 rounded-lg border border-sidebar-border/70 px-4 py-3"
                                >
                                    <span className="font-medium">
                                        {option.label}.
                                    </span>
                                    <span className="flex-1">
                                        {option.option_text}
                                    </span>
                                    {option.is_correct ? (
                                        <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-500">
                                            <Check className="size-4" />
                                            Correct
                                        </span>
                                    ) : null}
                                </div>
                            ))}
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Difficulty
                                </p>
                                <div className="mt-2">
                                    <DifficultyBadge
                                        difficulty={question.difficulty}
                                        label={question.difficulty_label}
                                    />
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Status
                                </p>
                                <div className="mt-2">
                                    <UserStatusBadge
                                        status={question.status}
                                        label={question.status_label}
                                    />
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Marks
                                </p>
                                <p className="mt-1 font-medium">
                                    {question.marks}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Negative Marks
                                </p>
                                <p className="mt-1 font-medium">
                                    {question.negative_marks}
                                </p>
                            </div>

                            <div className="sm:col-span-2">
                                <p className="text-sm text-muted-foreground">
                                    Explanation
                                </p>
                                <p className="mt-1 font-medium whitespace-pre-wrap">
                                    {question.explanation || '—'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Created At
                                </p>
                                <p className="mt-1 font-medium">
                                    {formatDateTime(question.created_at)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Last Updated
                                </p>
                                <p className="mt-1 font-medium">
                                    {formatDateTime(question.updated_at)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminQuestionsShow.layout = (props: Props) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Question Bank',
            href: index(),
        },
        {
            title: `Question #${props.question.id}`,
            href: show(props.question.id),
        },
    ],
});
