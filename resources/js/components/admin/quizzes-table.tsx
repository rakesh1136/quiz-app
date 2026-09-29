import { Link, router } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Eye,
    Pencil,
    Send,
    Trash2,
    Undo2,
} from 'lucide-react';
import { QuizStatusBadge } from '@/components/admin/quiz-status-badge';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { confirmAction, confirmDelete } from '@/lib/confirm-delete';
import {
    destroy,
    edit,
    index,
    publish,
    show,
    unpublish,
} from '@/routes/admin/quizzes';
import type {
    AdminQuiz,
    AdminQuizFilters,
    PaginatedAdminQuizzes,
} from '@/types';

type Props = {
    quizzes: PaginatedAdminQuizzes;
    filters: AdminQuizFilters;
};

function formatDate(value: string | null): string {
    if (!value) {
        return '—';
    }

    return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(value));
}

function SortIcon({
    column,
    filters,
}: {
    column: string;
    filters: AdminQuizFilters;
}) {
    if (filters.sort !== column) {
        return <ArrowUpDown className="size-3.5 text-muted-foreground" />;
    }

    return filters.direction === 'asc' ? (
        <ArrowUp className="size-3.5" />
    ) : (
        <ArrowDown className="size-3.5" />
    );
}

function SortableHeader({
    column,
    label,
    filters,
    onSort,
}: {
    column: string;
    label: string;
    filters: AdminQuizFilters;
    onSort: (column: string) => void;
}) {
    return (
        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
            <button
                type="button"
                onClick={() => onSort(column)}
                className="inline-flex items-center gap-2 hover:text-foreground"
            >
                {label}
                <SortIcon column={column} filters={filters} />
            </button>
        </th>
    );
}

export function QuizzesTable({ quizzes, filters }: Props) {
    const handleSort = (column: string) => {
        const direction =
            filters.sort === column && filters.direction === 'asc'
                ? 'desc'
                : 'asc';

        router.get(
            index.url({
                query: {
                    ...filters,
                    sort: column,
                    direction,
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

    const handleDelete = async (quiz: AdminQuiz) => {
        const confirmed = await confirmDelete();

        if (!confirmed) {
            return;
        }

        router.delete(
            destroy.url(quiz.id, {
                query: filters,
            }),
            {
                preserveScroll: true,
            },
        );
    };

    const handlePublish = async (quiz: AdminQuiz) => {
        const confirmed = await confirmAction({
            title: 'Publish this quiz?',
            text: 'Students will be able to take this quiz once published.',
            confirmButtonText: 'Publish',
        });

        if (!confirmed) {
            return;
        }

        router.patch(
            publish.url(quiz.id, {
                query: filters,
            }),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const handleUnpublish = async (quiz: AdminQuiz) => {
        const confirmed = await confirmAction({
            title: 'Unpublish this quiz?',
            text: 'The quiz will be moved back to draft status.',
            confirmButtonText: 'Unpublish',
            confirmButtonColor: '#f59e0b',
        });

        if (!confirmed) {
            return;
        }

        router.patch(
            unpublish.url(quiz.id, {
                query: filters,
            }),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    if (quizzes.data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-sidebar-border/70 px-6 py-16 text-center">
                <p className="text-base font-medium">
                    {filters.search ||
                    filters.category_id !== 'all' ||
                    filters.status !== 'all'
                        ? 'No quizzes match your search or filters.'
                        : 'No quizzes found.'}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                    Try adjusting your search or filters, or add a new quiz.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-sidebar-border/70">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-sidebar-border/70 bg-muted/20">
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                ID
                            </th>
                            <SortableHeader
                                column="title"
                                label="Title"
                                filters={filters}
                                onSort={handleSort}
                            />
                            <SortableHeader
                                column="category_id"
                                label="Category"
                                filters={filters}
                                onSort={handleSort}
                            />
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                Questions
                            </th>
                            <SortableHeader
                                column="duration"
                                label="Duration"
                                filters={filters}
                                onSort={handleSort}
                            />
                            <SortableHeader
                                column="passing_score"
                                label="Passing Score"
                                filters={filters}
                                onSort={handleSort}
                            />
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                Max Attempts
                            </th>
                            <SortableHeader
                                column="status"
                                label="Status"
                                filters={filters}
                                onSort={handleSort}
                            />
                            <SortableHeader
                                column="created_at"
                                label="Created At"
                                filters={filters}
                                onSort={handleSort}
                            />
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {quizzes.data.map((quiz) => (
                            <tr
                                key={quiz.id}
                                className="border-b border-sidebar-border/50 last:border-b-0 hover:bg-muted/10"
                            >
                                <td className="px-4 py-3 text-muted-foreground">
                                    #{quiz.id}
                                </td>
                                <td className="max-w-xs px-4 py-3 font-medium">
                                    {quiz.title}
                                </td>
                                <td className="px-4 py-3">
                                    {quiz.category_name}
                                </td>
                                <td className="px-4 py-3">
                                    {quiz.questions_count}
                                </td>
                                <td className="px-4 py-3">
                                    {quiz.duration} min
                                </td>
                                <td className="px-4 py-3">
                                    {quiz.passing_score}%
                                </td>
                                <td className="px-4 py-3">
                                    {quiz.max_attempts}
                                </td>
                                <td className="px-4 py-3">
                                    <QuizStatusBadge
                                        status={quiz.status}
                                        label={quiz.status_label}
                                    />
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {formatDate(quiz.created_at)}
                                </td>
                                <td className="px-4 py-3">
                                    <TooltipProvider>
                                        <div className="flex items-center justify-end gap-1">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={show(quiz.id)}
                                                        >
                                                            <Eye className="size-4" />
                                                        </Link>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    View
                                                </TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={edit(quiz.id)}
                                                        >
                                                            <Pencil className="size-4" />
                                                        </Link>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Edit
                                                </TooltipContent>
                                            </Tooltip>

                                            {quiz.status === 'draft' ||
                                            quiz.status === 'inactive' ? (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handlePublish(
                                                                    quiz,
                                                                )
                                                            }
                                                        >
                                                            <Send className="size-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Publish
                                                    </TooltipContent>
                                                </Tooltip>
                                            ) : null}

                                            {quiz.status === 'published' ? (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleUnpublish(
                                                                    quiz,
                                                                )
                                                            }
                                                        >
                                                            <Undo2 className="size-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Unpublish
                                                    </TooltipContent>
                                                </Tooltip>
                                            ) : null}

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(quiz)
                                                        }
                                                    >
                                                        <Trash2 className="size-4 text-destructive" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Delete
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TooltipProvider>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
