import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { UserStatusBadge } from '@/components/admin/user-status-badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { confirmDelete } from '@/lib/confirm-delete';
import { destroy, edit, index, show } from '@/routes/admin/categories';
import { dashboard } from '@/routes/admin';
import type { AdminCategory } from '@/types';

type Props = {
    category: AdminCategory;
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

export default function AdminCategoriesShow({ category }: Props) {
    const handleDelete = async () => {
        const confirmed = await confirmDelete();

        if (!confirmed) {
            return;
        }

        router.delete(destroy.url(category.id));
    };

    return (
        <>
            <Head title={category.name} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={index()}>
                                <ArrowLeft className="size-4" />
                                Back to Categories
                            </Link>
                        </Button>

                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {category.name}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Category details and related information.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={edit(category.id)}>
                                <Pencil className="size-4" />
                                Edit Category
                            </Link>
                        </Button>

                        {category.can_delete ? (
                            <Button variant="destructive" onClick={handleDelete}>
                                <Trash2 className="size-4" />
                                Delete Category
                            </Button>
                        ) : null}
                    </div>
                </div>

                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle>Category Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Category Name
                            </p>
                            <p className="mt-1 font-medium">{category.name}</p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Slug
                            </p>
                            <p className="mt-1 font-mono text-sm">
                                {category.slug}
                            </p>
                        </div>

                        <div className="sm:col-span-2">
                            <p className="text-sm text-muted-foreground">
                                Description
                            </p>
                            <p className="mt-1 font-medium">
                                {category.description || '—'}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Status
                            </p>
                            <div className="mt-2">
                                <UserStatusBadge
                                    status={category.status}
                                    label={category.status_label}
                                />
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Questions
                            </p>
                            <p className="mt-1 font-medium">
                                {category.questions_count ?? 0}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Created At
                            </p>
                            <p className="mt-1 font-medium">
                                {formatDateTime(category.created_at)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Last Updated
                            </p>
                            <p className="mt-1 font-medium">
                                {formatDateTime(category.updated_at)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminCategoriesShow.layout = (props: Props) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Categories',
            href: index(),
        },
        {
            title: props.category.name,
            href: show(props.category.id),
        },
    ],
});
