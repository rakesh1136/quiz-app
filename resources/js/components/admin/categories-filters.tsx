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
import { index } from '@/routes/admin/categories';
import type { AdminCategoryFilters, SelectOption } from '@/types';

type Props = {
    filters: AdminCategoryFilters;
    statusOptions: SelectOption[];
};

export function CategoriesFilters({ filters, statusOptions }: Props) {
    const [search, setSearch] = useState(filters.search);

    useEffect(() => {
        setSearch(filters.search);
    }, [filters.search]);

    const applyFilters = (nextFilters: Partial<AdminCategoryFilters>) => {
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
        filters.search !== '' || filters.status !== 'all';

    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <form
                onSubmit={handleSearchSubmit}
                className="relative flex-1"
            >
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search categories..."
                    className="pl-9"
                />
            </form>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Select
                    value={filters.status}
                    onValueChange={(value) =>
                        applyFilters({ status: value })
                    }
                >
                    <SelectTrigger className="w-full sm:w-[160px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map((option) => (
                            <SelectItem
                                key={option.value}
                                value={option.value}
                            >
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
                    >
                        <X className="size-4" />
                        Clear Filters
                    </Button>
                ) : null}
            </div>
        </div>
    );
}
