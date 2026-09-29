import { Form, Head, Link } from '@inertiajs/react';
import { UserFormFields } from '@/components/admin/user-form-fields';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { create, index, store } from '@/routes/admin/users';
import { dashboard } from '@/routes/admin';
import type { SelectOption } from '@/types';

type Props = {
    roleOptions: SelectOption[];
    statusOptions: SelectOption[];
};

export default function AdminUsersCreate({
    roleOptions,
    statusOptions,
}: Props) {
    return (
        <>
            <Head title="Add User" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Add User
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Create a new user account for the application.
                    </p>
                </div>

                <div className="w-full max-w-2xl rounded-xl border border-sidebar-border/70 p-6">
                    <Form
                        action={store()}
                        resetOnSuccess={[
                            'password',
                            'password_confirmation',
                        ]}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <UserFormFields
                                    mode="create"
                                    errors={errors}
                                    roleOptions={roleOptions}
                                    statusOptions={statusOptions}
                                />

                                <div className="flex items-center justify-end gap-3">
                                    <Button
                                        variant="outline"
                                        asChild
                                    >
                                        <Link href={index()}>Cancel</Link>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                    >
                                        {processing ? <Spinner /> : null}
                                        Create User
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

AdminUsersCreate.layout = {
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
            title: 'Add User',
            href: create(),
        },
    ],
};
