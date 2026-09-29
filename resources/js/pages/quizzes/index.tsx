import { Head, router } from '@inertiajs/react';
import { ClipboardList, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QuizzesFilters } from '@/components/user/quizzes-filters';
import { QuizzesPagination } from '@/components/user/quizzes-pagination';
import { UserQuizCard } from '@/components/user/user-quiz-card';
import { index as quizzesIndex } from '@/routes/quizzes';
import type {
    PaginatedUserQuizzes,
    UserQuizCategoryOption,
    UserQuizFilters,
} from '@/types';

type Props = {
    quizzes: PaginatedUserQuizzes;
    filters: UserQuizFilters;
    categories: UserQuizCategoryOption[];
};

export default function QuizzesIndex({
    quizzes,
    filters,
    categories,
}: Props) {
    const hasActiveFilters =
        filters.search !== '' || filters.category !== '';

    const clearFilters = () => {
        router.get(
            quizzesIndex.url(),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return (
        <>
            <Head title="Explore Quizzes" />

            <div className="flex flex-col gap-6">
                <section className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        Explore Quizzes
                    </h1>
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Choose a quiz and test your knowledge.
                    </p>
                </section>

                <QuizzesFilters filters={filters} categories={categories} />

                {quizzes.data.length > 0 ? (
                    <>
                        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {quizzes.data.map((quiz) => (
                                <UserQuizCard key={quiz.id} quiz={quiz} />
                            ))}
                        </section>

                        <QuizzesPagination quizzes={quizzes} />
                    </>
                ) : (
                    <Card className="py-5">
                        <CardContent className="px-5">
                            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
                                <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                    {hasActiveFilters ? (
                                        <SearchX className="size-5" />
                                    ) : (
                                        <ClipboardList className="size-5" />
                                    )}
                                </span>
                                <p className="text-sm text-muted-foreground">
                                    {hasActiveFilters
                                        ? 'No quizzes found matching your criteria.'
                                        : 'No quizzes available yet.'}
                                </p>
                                {hasActiveFilters ? (
                                    <Button
                                        variant="outline"
                                        onClick={clearFilters}
                                        data-test="empty-clear-quiz-filters"
                                    >
                                        Clear Filters
                                    </Button>
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
