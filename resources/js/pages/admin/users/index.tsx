import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { UsersFilters } from '@/components/admin/users-filters';
import { UsersPagination } from '@/components/admin/users-pagination';
import { UsersTable } from '@/components/admin/users-table';
import { Button } from '@/components/ui/button';
import { create, index } from '@/routes/admin/users';
import { dashboard } from '@/routes/admin';
import type {
    AdminUserFilters,
    PaginatedAdminUsers,
    SelectOption,
} from '@/types';

type Props = {
    users: PaginatedAdminUsers;
    filters: AdminUserFilters;
    roleOptions: SelectOption[];
    statusOptions: SelectOption[];
};

export default function AdminUsersIndex({
    users,
    filters,
    roleOptions,
    statusOptions,
}: Props) {
    return (
        <>
            <Head title="Users" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Users
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage user accounts in the application.
                        </p>
                    </div>

                    <Button asChild>
                        <Link href={create()}>
                            <Plus className="size-4" />
                            Add User
                        </Link>
                    </Button>
                </div>

                <UsersFilters
                    filters={filters}
                    roleOptions={roleOptions}
                    statusOptions={statusOptions}
                />

                <UsersTable users={users} filters={filters} />

                <UsersPagination users={users} />
            </div>
        </>
    );
}

AdminUsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Users',
            href: index(),
        },
    ],
};
