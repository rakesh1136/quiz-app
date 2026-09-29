import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { UserRoleBadge } from '@/components/admin/user-role-badge';
import { UserStatusBadge } from '@/components/admin/user-status-badge';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { confirmDeleteUser } from '@/lib/confirm-delete';
import { destroy, edit, index, show } from '@/routes/admin/users';
import { dashboard } from '@/routes/admin';
import type { AdminUser } from '@/types';

type Props = {
    user: AdminUser;
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

export default function AdminUsersShow({ user }: Props) {
    const handleDelete = async () => {
        const confirmed = await confirmDeleteUser();

        if (!confirmed) {
            return;
        }

        router.delete(destroy.url(user.id));
    };

    return (
        <>
            <Head title={user.name} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={index()}>
                                <ArrowLeft className="size-4" />
                                Back to Users
                            </Link>
                        </Button>

                        <Heading
                            variant="small"
                            title={user.name}
                            description="User account details and activity information."
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={edit(user.id)}>
                                <Pencil className="size-4" />
                                Edit User
                            </Link>
                        </Button>

                        {user.can_delete ? (
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                            >
                                <Trash2 className="size-4" />
                                Delete User
                            </Button>
                        ) : null}
                    </div>
                </div>

                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle>User Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Name
                            </p>
                            <p className="mt-1 font-medium">{user.name}</p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Email
                            </p>
                            <p className="mt-1 font-medium">{user.email}</p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Role
                            </p>
                            <div className="mt-2">
                                <UserRoleBadge
                                    role={user.role}
                                    label={user.role_label}
                                />
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Status
                            </p>
                            <div className="mt-2">
                                <UserStatusBadge
                                    status={user.status}
                                    label={user.status_label}
                                />
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Registration Date
                            </p>
                            <p className="mt-1 font-medium">
                                {formatDateTime(user.created_at)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Last Updated
                            </p>
                            <p className="mt-1 font-medium">
                                {formatDateTime(user.updated_at)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminUsersShow.layout = (props: Props) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Users',
            href: index(),
        },
        {
            title: props.user.name,
            href: show(props.user.id),
        },
    ],
});
