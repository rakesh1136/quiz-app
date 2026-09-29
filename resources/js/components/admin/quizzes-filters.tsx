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
import { index } from '@/routes/admin/quizzes';
import type { AdminQuizFilters, CategorySelectOption, SelectOption } from '@/types';

type Props = {
    filters: AdminQuizFilters;
    categoryOptions: CategorySelectOption[];
    statusOptions: SelectOption[];
};

export function QuizzesFilters({
    filters,
    categoryOptions,
    statusOptions,
}: Props) {
    const [search, setSearch] = useState(filters.search);

    useEffect(() => {
        setSearch(filters.search);
    }, [filters.search]);

    const applyFilters = (nextFilters: Partial<AdminQuizFilters>) => {
        router.get(
            index.url({
                query: {
                    ...filters,
                    ...nextFilters,
                    page: undefined,
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
            index.url(),
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
        filters.category_id !== 'all' ||
        filters.status !== 'all';

    return (
        <div className="flex flex-col gap-4">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search quizzes..."
                    className="pl-9"
                />
            </form>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <Select
                    value={filters.category_id}
                    onValueChange={(value) =>
                        applyFilters({ category_id: value })
                    }
                >
                    <SelectTrigger className="w-full lg:w-[180px]">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.status}
                    onValueChange={(value) => applyFilters({ status: value })}
                >
                    <SelectTrigger className="w-full lg:w-[160px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {hasActiveFilters ? (
                    <Button type="button" variant="outline" onClick={clearFilters}>
                        <X className="size-4" />
                        Clear Filters
                    </Button>
                ) : null}
            </div>
        </div>
    );
}
