import { Head } from '@inertiajs/react';
import { AttemptsFilters } from '@/components/admin/attempts-filters';
import { AttemptsPagination } from '@/components/admin/attempts-pagination';
import { AttemptsTable } from '@/components/admin/attempts-table';
import { index } from '@/routes/admin/attempts';
import { dashboard } from '@/routes/admin';
import type {
    AdminAttemptFilters,
    CategorySelectOption,
    PaginatedAdminAttempts,
    SelectOption,
} from '@/types';

type Props = {
    attempts: PaginatedAdminAttempts;
    filters: AdminAttemptFilters;
    statusOptions: SelectOption[];
    quizOptions: SelectOption[];
    categoryOptions: CategorySelectOption[];
};

export default function AdminAttemptsIndex({
    attempts,
    filters,
    statusOptions,
    quizOptions,
    categoryOptions,
}: Props) {
    return (
        <>
            <Head title="Quiz Attempts" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Quiz Attempts
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Review submitted quiz attempts, scores, and pass/fail
                        results.
                    </p>
                </div>

                <AttemptsFilters
                    filters={filters}
                    statusOptions={statusOptions}
                    quizOptions={quizOptions}
                    categoryOptions={categoryOptions}
                />

                <AttemptsTable attempts={attempts} filters={filters} />

                <AttemptsPagination attempts={attempts} />
            </div>
        </>
    );
}

AdminAttemptsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Quiz Attempts',
            href: index(),
        },
    ],
};
