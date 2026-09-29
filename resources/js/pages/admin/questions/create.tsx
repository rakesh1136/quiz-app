import { Form, Head, Link } from '@inertiajs/react';
import { QuestionFormFields } from '@/components/admin/question-form-fields';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { create, index, store } from '@/routes/admin/questions';
import { dashboard } from '@/routes/admin';
import type { CategorySelectOption, SelectOption } from '@/types';

type Props = {
    categoryOptions: CategorySelectOption[];
    difficultyOptions: SelectOption[];
    statusOptions: SelectOption[];
};

export default function AdminQuestionsCreate({
    categoryOptions,
    difficultyOptions,
    statusOptions,
}: Props) {
    return (
        <>
            <Head title="Add Question" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Add Question
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Create a new question with four options for the
                        question bank.
                    </p>
                </div>

                <div className="w-full max-w-2xl rounded-xl border border-sidebar-border/70 p-6">
                    <Form action={store()} className="space-y-6">
                        {({ processing, errors }) => (
                            <>
                                <QuestionFormFields
                                    mode="create"
                                    errors={errors}
                                    categoryOptions={categoryOptions}
                                    difficultyOptions={difficultyOptions}
                                    statusOptions={statusOptions}
                                />

                                <div className="flex items-center justify-end gap-3">
                                    <Button variant="outline" asChild>
                                        <Link href={index()}>Cancel</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? <Spinner /> : null}
                                        Create Question
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

AdminQuestionsCreate.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Question Bank',
            href: index(),
        },
        {
            title: 'Add Question',
            href: create(),
        },
    ],
};
