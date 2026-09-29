import { Link, router } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Pencil, Trash2 } from 'lucide-react';
import { UserRoleBadge } from '@/components/admin/user-role-badge';
import { UserStatusBadge } from '@/components/admin/user-status-badge';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { confirmDeleteUser } from '@/lib/confirm-delete';
import { destroy, edit, index, show } from '@/routes/admin/users';
import type { AdminUser, AdminUserFilters, PaginatedAdminUsers } from '@/types';

type Props = {
    users: PaginatedAdminUsers;
    filters: AdminUserFilters;
};

const sortableColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
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

function SortIcon({
    column,
    filters,
}: {
    column: string;
    filters: AdminUserFilters;
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

export function UsersTable({ users, filters }: Props) {
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

    const handleDelete = async (user: AdminUser) => {
        const confirmed = await confirmDeleteUser();

        if (!confirmed) {
            return;
        }

        router.delete(
            destroy.url(user.id, {
                query: filters,
            }),
            {
                preserveScroll: true,
            },
        );
    };

    if (users.data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-sidebar-border/70 px-6 py-16 text-center">
                <p className="text-base font-medium">
                    {filters.search ||
                    filters.role !== 'user' ||
                    filters.status !== 'all'
                        ? 'No users match your search or filters.'
                        : 'No users found.'}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                    Try adjusting your search or filters, or add a new user.
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
                            {sortableColumns.map((column) => (
                                <th
                                    key={column.key}
                                    className="px-4 py-3 text-left font-medium text-muted-foreground"
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleSort(column.key)}
                                        className="inline-flex items-center gap-2 hover:text-foreground"
                                    >
                                        {column.label}
                                        <SortIcon
                                            column={column.key}
                                            filters={filters}
                                        />
                                    </button>
                                </th>
                            ))}
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                Role
                            </th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.data.map((user) => (
                            <tr
                                key={user.id}
                                className="border-b border-sidebar-border/50 last:border-b-0 hover:bg-muted/10"
                            >
                                <td className="px-4 py-3 text-muted-foreground">
                                    #{user.id}
                                </td>
                                <td className="px-4 py-3 font-medium">
                                    {user.name}
                                </td>
                                <td className="px-4 py-3">{user.email}</td>
                                <td className="px-4 py-3">
                                    <UserStatusBadge
                                        status={user.status}
                                        label={user.status_label}
                                    />
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {formatDate(user.created_at)}
                                </td>
                                <td className="px-4 py-3">
                                    <UserRoleBadge
                                        role={user.role}
                                        label={user.role_label}
                                    />
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
                                                            href={show(user.id)}
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
                                                                user.id,
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

                                            {user.can_delete ? (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    user,
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
                                                        You cannot delete your
                                                        own account
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
