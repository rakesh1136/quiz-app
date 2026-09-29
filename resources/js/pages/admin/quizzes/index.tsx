import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { QuizzesFilters } from '@/components/admin/quizzes-filters';
import { QuizzesPagination } from '@/components/admin/quizzes-pagination';
import { QuizzesTable } from '@/components/admin/quizzes-table';
import { Button } from '@/components/ui/button';
import { create, index } from '@/routes/admin/quizzes';
import { dashboard } from '@/routes/admin';
import type {
    AdminQuizFilters,
    CategorySelectOption,
    PaginatedAdminQuizzes,
    SelectOption,
} from '@/types';

type Props = {
    quizzes: PaginatedAdminQuizzes;
    filters: AdminQuizFilters;
    categoryOptions: CategorySelectOption[];
    statusOptions: SelectOption[];
};

export default function AdminQuizzesIndex({
    quizzes,
    filters,
    categoryOptions,
    statusOptions,
}: Props) {
    return (
        <>
            <Head title="Quizzes" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Quizzes
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Create and manage quizzes using questions from the
                            Question Bank.
                        </p>
                    </div>

                    <Button asChild>
                        <Link href={create()}>
                            <Plus className="size-4" />
                            Add Quiz
                        </Link>
                    </Button>
                </div>

                <QuizzesFilters
                    filters={filters}
                    categoryOptions={categoryOptions}
                    statusOptions={statusOptions}
                />

                <QuizzesTable quizzes={quizzes} filters={filters} />

                <QuizzesPagination quizzes={quizzes} />
            </div>
        </>
    );
}

AdminQuizzesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Quizzes',
            href: index(),
        },
    ],
};
