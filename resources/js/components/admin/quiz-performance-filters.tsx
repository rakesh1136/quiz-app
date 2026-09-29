import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index as quizPerformanceIndex } from '@/routes/admin/quiz-performance';
import type {
    AdminQuizPerformanceFilterOptions,
    AdminQuizPerformanceFilters,
} from '@/types';

type Props = {
    filters: AdminQuizPerformanceFilters;
    filterOptions: AdminQuizPerformanceFilterOptions;
};

export function QuizPerformanceFilters({ filters, filterOptions }: Props) {
    const [search, setSearch] = useState(filters.search);

    useEffect(() => {
        setSearch(filters.search);
    }, [filters.search]);

    const applyFilters = (
        nextFilters: Partial<AdminQuizPerformanceFilters>,
    ) => {
        const query = {
            ...filters,
            ...nextFilters,
        };

        router.get(
            quizPerformanceIndex.url({
                query: {
                    search: query.search || undefined,
                    date_from: query.date_from || undefined,
                    date_to: query.date_to || undefined,
                    category_id:
                        query.category_id !== 'all'
                            ? query.category_id
                            : undefined,
                    quiz_id:
                        query.quiz_id !== 'all' ? query.quiz_id : undefined,
                    status: query.status !== 'all' ? query.status : undefined,
                },
            }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleSearchSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        applyFilters({ search });
    };

    const clearFilters = () => {
        router.get(
            quizPerformanceIndex.url(),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const hasActiveFilters =
        filters.search !== '' ||
        filters.date_from !== '' ||
        filters.date_to !== '' ||
        filters.category_id !== 'all' ||
        filters.quiz_id !== 'all' ||
        filters.status !== 'all';

    return (
        <div className="flex flex-col gap-4">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by quiz name..."
                    className="pl-9"
                />
            </form>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                        Date From
                    </label>
                    <Input
                        type="date"
                        value={filters.date_from}
                        onChange={(event) =>
                            applyFilters({ date_from: event.target.value })
                        }
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                        Date To
                    </label>
                    <Input
                        type="date"
                        value={filters.date_to}
                        onChange={(event) =>
                            applyFilters({ date_to: event.target.value })
                        }
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                        Category
                    </label>
                    <Select
                        value={filters.category_id}
                        onValueChange={(value) =>
                            applyFilters({ category_id: value })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            {filterOptions.categories.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                        Quiz
                    </label>
                    <Select
                        value={filters.quiz_id}
                        onValueChange={(value) =>
                            applyFilters({ quiz_id: value })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Quiz" />
                        </SelectTrigger>
                        <SelectContent>
                            {filterOptions.quizzes.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                        Result Status
                    </label>
                    <Select
                        value={filters.status}
                        onValueChange={(value) =>
                            applyFilters({ status: value })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {filterOptions.statuses.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {hasActiveFilters ? (
                <div className="flex justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={clearFilters}
                    >
                        <X className="size-4" />
                        Clear Filters
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
