import { Link, router } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { UserStatusBadge } from '@/components/admin/user-status-badge';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { confirmDelete } from '@/lib/confirm-delete';
import { destroy, edit, show } from '@/routes/admin/categories';
import type {
    AdminCategory,
    AdminCategoryFilters,
    PaginatedAdminCategories,
} from '@/types';

type Props = {
    categories: PaginatedAdminCategories;
    filters: AdminCategoryFilters;
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

function truncate(text: string | null, length = 60): string {
    if (!text) {
        return '—';
    }

    return text.length > length ? `${text.slice(0, length)}...` : text;
}

export function CategoriesTable({ categories, filters }: Props) {
    const handleDelete = async (category: AdminCategory) => {
        const confirmed = await confirmDelete();

        if (!confirmed) {
            return;
        }

        router.delete(
            destroy.url(category.id, {
                query: filters,
            }),
            {
                preserveScroll: true,
            },
        );
    };

    if (categories.data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-sidebar-border/70 px-6 py-16 text-center">
                <p className="text-base font-medium">
                    {filters.search || filters.status !== 'all'
                        ? 'No categories match your search or filters.'
                        : 'No categories found.'}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                    Try adjusting your search or filters, or add a new
                    category.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-sidebar-border/70">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-sidebar-border/70 bg-muted/20">
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                ID
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                Name
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                Slug
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                Description
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                Created At
                            </th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.data.map((category) => (
                            <tr
                                key={category.id}
                                className="border-b border-sidebar-border/50 last:border-b-0 hover:bg-muted/10"
                            >
                                <td className="px-4 py-3 text-muted-foreground">
                                    #{category.id}
                                </td>
                                <td className="px-4 py-3 font-medium">
                                    {category.name}
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                    {category.slug}
                                </td>
                                <td className="max-w-xs px-4 py-3 text-muted-foreground">
                                    {truncate(category.description)}
                                </td>
                                <td className="px-4 py-3">
                                    <UserStatusBadge
                                        status={category.status}
                                        label={category.status_label}
                                    />
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {formatDate(category.created_at)}
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
                                                                category.id,
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
                                                                category.id,
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

                                            {category.can_delete ? (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    category,
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
                                            ) : (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled
                                                        >
                                                            <Trash2 className="size-4 text-muted-foreground" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Cannot delete category
                                                        with related questions
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
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
