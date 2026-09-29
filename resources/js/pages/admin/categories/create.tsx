import { Form, Head, Link } from '@inertiajs/react';
import { CategoryFormFields } from '@/components/admin/category-form-fields';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { create, index, store } from '@/routes/admin/categories';
import { dashboard } from '@/routes/admin';
import type { SelectOption } from '@/types';

type Props = {
    statusOptions: SelectOption[];
};

export default function AdminCategoriesCreate({ statusOptions }: Props) {
    return (
        <>
            <Head title="Add Category" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Add Category
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Create a new quiz category for the application.
                    </p>
                </div>

                <div className="w-full max-w-2xl rounded-xl border border-sidebar-border/70 p-6">
                    <Form action={store()} className="space-y-6">
                        {({ processing, errors }) => (
                            <>
                                <CategoryFormFields
                                    mode="create"
                                    errors={errors}
                                    statusOptions={statusOptions}
                                />

                                <div className="flex items-center justify-end gap-3">
                                    <Button variant="outline" asChild>
                                        <Link href={index()}>Cancel</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? <Spinner /> : null}
                                        Create Category
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </>
    );
}

AdminCategoriesCreate.layout = {
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
            title: 'Add Category',
            href: create(),
        },
    ],
};
