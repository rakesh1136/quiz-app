import { Form, Head, Link } from '@inertiajs/react';
import { QuizFormFields } from '@/components/admin/quiz-form-fields';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { edit, index, update } from '@/routes/admin/quizzes';
import { dashboard } from '@/routes/admin';
import type {
    AdminQuiz,
    BankQuestion,
    CategorySelectOption,
    SelectOption,
} from '@/types';

type Props = {
    quiz: AdminQuiz;
    categoryOptions: CategorySelectOption[];
    statusOptions: SelectOption[];
    bankQuestions: BankQuestion[];
    difficultyOptions: SelectOption[];
    questionStatusOptions: SelectOption[];
};

export default function AdminQuizzesEdit({
    quiz,
    categoryOptions,
    statusOptions,
    bankQuestions,
    difficultyOptions,
    questionStatusOptions,
}: Props) {
    return (
        <>
            <Head title={`Edit ${quiz.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Edit Quiz
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Update quiz details, selected questions, and order.
                    </p>
                </div>

                <div className="w-full rounded-xl border border-sidebar-border/70 p-6">
                    <Form action={update(quiz.id)} className="space-y-6">
                        {({ processing, errors }) => (
                            <>
                                <QuizFormFields
                                    mode="edit"
                                    quiz={quiz}
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

AdminQuizzesEdit.layout = (props: Props) => ({
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
            title: 'Edit Quiz',
            href: edit(props.quiz.id),
        },
    ],
});
