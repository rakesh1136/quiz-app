import { Link, router } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Eye,
    Pencil,
    Trash2,
} from 'lucide-react';
import { DifficultyBadge } from '@/components/admin/difficulty-badge';
import { UserStatusBadge } from '@/components/admin/user-status-badge';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { confirmDelete } from '@/lib/confirm-delete';
import { destroy, edit, index, show } from '@/routes/admin/questions';
import type {
    AdminQuestion,
    AdminQuestionFilters,
    PaginatedAdminQuestions,
} from '@/types';

type Props = {
    questions: PaginatedAdminQuestions;
    filters: AdminQuestionFilters;
};

const sortableColumns = [
    { key: 'id', label: 'ID' },
    { key: 'category_id', label: 'Category' },
    { key: 'difficulty', label: 'Difficulty' },
    { key: 'marks', label: 'Marks' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Created At' },
] as const;

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

function truncate(text: string, length = 80): string {
    return text.length > length ? `${text.slice(0, length)}...` : text;
}

function SortIcon({
    column,
    filters,
}: {
    column: string;
    filters: AdminQuestionFilters;
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
    filters: AdminQuestionFilters;
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

export function QuestionsTable({ questions, filters }: Props) {
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

    const handleDelete = async (question: AdminQuestion) => {
        const confirmed = await confirmDelete();

        if (!confirmed) {
            return;
        }

        router.delete(
            destroy.url(question.id, {
                query: filters,
            }),
            {
                preserveScroll: true,
            },
        );
    };

    if (questions.data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-sidebar-border/70 px-6 py-16 text-center">
                <p className="text-base font-medium">
                    {filters.search ||
                    filters.category_id !== 'all' ||
                    filters.difficulty !== 'all' ||
                    filters.status !== 'all'
                        ? 'No questions match your search or filters.'
                        : 'No questions found.'}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                    Try adjusting your search or filters, or add a new question.
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
                            <SortableHeader
                                column="id"
                                label="ID"
                                filters={filters}
                                onSort={handleSort}
                            />
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                Question
                            </th>
                            <SortableHeader
                                column="category_id"
                                label="Category"
                                filters={filters}
                                onSort={handleSort}
                            />
                            <SortableHeader
                                column="difficulty"
                                label="Difficulty"
                                filters={filters}
                                onSort={handleSort}
                            />
                            <SortableHeader
                                column="marks"
                                label="Marks"
                                filters={filters}
                                onSort={handleSort}
                            />
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                Negative Marks
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
                        {questions.data.map((question) => (
                            <tr
                                key={question.id}
                                className="border-b border-sidebar-border/50 last:border-b-0 hover:bg-muted/10"
                            >
                                <td className="px-4 py-3 text-muted-foreground">
                                    #{question.id}
                                </td>
                                <td className="max-w-xs px-4 py-3">
                                    {truncate(question.question)}
                                </td>
                                <td className="px-4 py-3">
                                    {question.category_name}
                                </td>
                                <td className="px-4 py-3">
                                    <DifficultyBadge
                                        difficulty={question.difficulty}
                                        label={question.difficulty_label}
                                    />
                                </td>
                                <td className="px-4 py-3">{question.marks}</td>
                                <td className="px-4 py-3">
                                    {question.negative_marks}
                                </td>
                                <td className="px-4 py-3">
                                    <UserStatusBadge
                                        status={question.status}
                                        label={question.status_label}
                                    />
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {formatDate(question.created_at)}
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
                                                            href={show(
                                                                question.id,
                                                            )}
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
                                                            href={edit(
                                                                question.id,
                                                            )}
                                                        >
                                                            <Pencil className="size-4" />
                                                        </Link>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Edit
                                                </TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(
                                                                question,
                                                            )
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
