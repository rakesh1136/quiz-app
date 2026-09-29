import { Form, Head, Link } from '@inertiajs/react';
import { CategoryFormFields } from '@/components/admin/category-form-fields';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { edit, index, update } from '@/routes/admin/categories';
import { dashboard } from '@/routes/admin';
import type { AdminCategory, SelectOption } from '@/types';

type Props = {
    category: AdminCategory;
    statusOptions: SelectOption[];
};

export default function AdminCategoriesEdit({
    category,
    statusOptions,
}: Props) {
    return (
        <>
            <Head title={`Edit ${category.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Edit Category
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Update details for {category.name}.
                    </p>
                </div>

                <div className="w-full max-w-2xl rounded-xl border border-sidebar-border/70 p-6">
                    <Form
                        action={update(category.id)}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <CategoryFormFields
                                    mode="edit"
                                    category={category}
                                    errors={errors}
                                    statusOptions={statusOptions}
                                />

                                <div className="flex items-center justify-end gap-3">
                                    <Button variant="outline" asChild>
                                        <Link href={index()}>Cancel</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? <Spinner /> : null}
                                        Save Changes
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

AdminCategoriesEdit.layout = (props: Props) => ({
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
            title: 'Edit Category',
            href: edit(props.category.id),
        },
    ],
});
