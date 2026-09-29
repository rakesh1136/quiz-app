import { Form, Head, Link } from '@inertiajs/react';
import { QuizFormFields } from '@/components/admin/quiz-form-fields';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { create, index, store } from '@/routes/admin/quizzes';
import { dashboard } from '@/routes/admin';
import type {
    BankQuestion,
    CategorySelectOption,
    SelectOption,
} from '@/types';

type Props = {
    categoryOptions: CategorySelectOption[];
    statusOptions: SelectOption[];
    bankQuestions: BankQuestion[];
    difficultyOptions: SelectOption[];
    questionStatusOptions: SelectOption[];
};

export default function AdminQuizzesCreate({
    categoryOptions,
    statusOptions,
    bankQuestions,
    difficultyOptions,
    questionStatusOptions,
}: Props) {
    return (
        <>
            <Head title="Add Quiz" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Add Quiz
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Create a quiz and select questions from the Question
                        Bank.
                    </p>
                </div>

                <div className="w-full rounded-xl border border-sidebar-border/70 p-6">
                    <Form action={store()} className="space-y-6">
                        {({ processing, errors }) => (
                            <>
                                <QuizFormFields
                                    mode="create"
                                    errors={errors}
                                    categoryOptions={categoryOptions}
                                    statusOptions={statusOptions}
                                    bankQuestions={bankQuestions}
                                    difficultyOptions={difficultyOptions}
                                    questionStatusOptions={
                                        questionStatusOptions
                                    }
                                />

                                <div className="flex items-center justify-end gap-3">
                                    <Button variant="outline" asChild>
                                        <Link href={index()}>Cancel</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? <Spinner /> : null}
                                        Create Quiz
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

AdminQuizzesCreate.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Quizzes',
            href: index(),
        },
        {
            title: 'Add Quiz',
            href: create(),
        },
    ],
};
