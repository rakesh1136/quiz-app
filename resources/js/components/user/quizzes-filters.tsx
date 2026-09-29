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
import { index as quizzesIndex } from '@/routes/quizzes';
import type { UserQuizCategoryOption, UserQuizFilters } from '@/types';

type Props = {
    filters: UserQuizFilters;
    categories: UserQuizCategoryOption[];
};

export function QuizzesFilters({ filters, categories }: Props) {
    const [search, setSearch] = useState(filters.search);

    useEffect(() => {
        setSearch(filters.search);
    }, [filters.search]);

    const applyFilters = (nextFilters: Partial<UserQuizFilters>) => {
        const searchValue =
            nextFilters.search !== undefined
                ? nextFilters.search
                : filters.search;
        const categoryValue =
            nextFilters.category !== undefined
                ? nextFilters.category
                : filters.category;

        router.get(
            quizzesIndex.url({
                query: {
                    search: searchValue || undefined,
                    category: categoryValue || undefined,
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
        applyFilters({ search: search.trim() });
    };

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

    const hasActiveFilters =
        filters.search !== '' || filters.category !== '';

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search quizzes..."
                    className="pl-9"
                    data-test="quizzes-search"
                />
            </form>

            <Select
                value={filters.category || 'all'}
                onValueChange={(value) =>
                    applyFilters({
                        category: value === 'all' ? '' : value,
                    })
                }
            >
                <SelectTrigger
                    className="w-full sm:w-[220px]"
                    data-test="quizzes-category-filter"
                >
                    <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {hasActiveFilters ? (
                <Button
                    type="button"
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full sm:w-auto"
                    data-test="clear-quiz-filters"
                >
                    <X className="size-4" />
                    Clear Filters
                </Button>
            ) : null}
        </div>
    );
}
