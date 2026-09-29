import { Form, Head, Link } from '@inertiajs/react';
import { QuestionFormFields } from '@/components/admin/question-form-fields';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { edit, index, update } from '@/routes/admin/questions';
import { dashboard } from '@/routes/admin';
import type {
    AdminQuestion,
    CategorySelectOption,
    SelectOption,
} from '@/types';

type Props = {
    question: AdminQuestion;
    categoryOptions: CategorySelectOption[];
    difficultyOptions: SelectOption[];
    statusOptions: SelectOption[];
};

export default function AdminQuestionsEdit({
    question,
    categoryOptions,
    difficultyOptions,
    statusOptions,
}: Props) {
    return (
        <>
            <Head title={`Edit Question #${question.id}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Edit Question
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Update question details and options.
                    </p>
                </div>

                <div className="w-full max-w-2xl rounded-xl border border-sidebar-border/70 p-6">
                    <Form
                        action={update(question.id)}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <QuestionFormFields
                                    mode="edit"
                                    question={question}
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

AdminQuestionsEdit.layout = (props: Props) => ({
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
            title: 'Edit Question',
            href: edit(props.question.id),
        },
    ],
});
