import { Form, Head, Link } from '@inertiajs/react';
import { UserFormFields } from '@/components/admin/user-form-fields';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { edit, index, update } from '@/routes/admin/users';
import { dashboard } from '@/routes/admin';
import type { AdminUser, SelectOption } from '@/types';

type Props = {
    user: AdminUser;
    roleOptions: SelectOption[];
    statusOptions: SelectOption[];
};

export default function AdminUsersEdit({
    user,
    roleOptions,
    statusOptions,
}: Props) {
    return (
        <>
            <Head title={`Edit ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Edit User
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Update account details for {user.name}.
                    </p>
                </div>

                <div className="w-full max-w-2xl rounded-xl border border-sidebar-border/70 p-6">
                    <Form
                        action={update(user.id)}
                        resetOnSuccess={[
                            'password',
                            'password_confirmation',
                        ]}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <UserFormFields
                                    mode="edit"
                                    user={user}
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

AdminUsersEdit.layout = (props: Props) => ({
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
            title: 'Edit User',
            href: edit(props.user.id),
        },
    ],
});
