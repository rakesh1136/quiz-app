import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { QuestionsFilters } from '@/components/admin/questions-filters';
import { QuestionsPagination } from '@/components/admin/questions-pagination';
import { QuestionsTable } from '@/components/admin/questions-table';
import { Button } from '@/components/ui/button';
import { create, index } from '@/routes/admin/questions';
import { dashboard } from '@/routes/admin';
import type {
    AdminQuestionFilters,
    CategorySelectOption,
    PaginatedAdminQuestions,
    SelectOption,
} from '@/types';

type Props = {
    questions: PaginatedAdminQuestions;
    filters: AdminQuestionFilters;
    categoryOptions: CategorySelectOption[];
    difficultyOptions: SelectOption[];
    statusOptions: SelectOption[];
};

export default function AdminQuestionsIndex({
    questions,
    filters,
    categoryOptions,
    difficultyOptions,
    statusOptions,
}: Props) {
    return (
        <>
            <Head title="Question Bank" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Question Bank
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage and organize questions for quizzes.
                        </p>
                    </div>

                    <Button asChild>
                        <Link href={create()}>
                            <Plus className="size-4" />
                            Add Question
                        </Link>
                    </Button>
                </div>

                <QuestionsFilters
                    filters={filters}
                    categoryOptions={categoryOptions}
                    difficultyOptions={difficultyOptions}
                    statusOptions={statusOptions}
                />

                <QuestionsTable questions={questions} filters={filters} />

                <QuestionsPagination questions={questions} />
            </div>
        </>
    );
}

AdminQuestionsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Question Bank',
            href: index(),
        },
    ],
};
