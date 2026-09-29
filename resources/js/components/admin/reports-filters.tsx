import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { reports } from '@/routes/admin';
import type { AdminReportFilterOptions, AdminReportFilters } from '@/types';

type Props = {
    filters: AdminReportFilters;
    filterOptions: AdminReportFilterOptions;
};

export function ReportsFilters({ filters, filterOptions }: Props) {
    const applyFilters = (nextFilters: Partial<AdminReportFilters>) => {
        const query = {
            ...filters,
            ...nextFilters,
        };

        router.get(
            reports.url({
                query: {
                    date_from: query.date_from || undefined,
                    date_to: query.date_to || undefined,
                    quiz_id:
                        query.quiz_id !== 'all' ? query.quiz_id : undefined,
                    category_id:
                        query.category_id !== 'all'
                            ? query.category_id
                            : undefined,
                    user_id:
                        query.user_id !== 'all' ? query.user_id : undefined,
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

    const clearFilters = () => {
        router.get(
            reports.url(),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const hasActiveFilters =
        filters.date_from !== '' ||
        filters.date_to !== '' ||
        filters.quiz_id !== 'all' ||
        filters.category_id !== 'all' ||
        filters.user_id !== 'all' ||
        filters.status !== 'all';

    return (
        <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
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
                        User
                    </label>
                    <Select
                        value={filters.user_id}
                        onValueChange={(value) =>
                            applyFilters({ user_id: value })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="User" />
                        </SelectTrigger>
                        <SelectContent>
                            {filterOptions.users.map((option) => (
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
            ) : (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Search className="size-3.5" />
                    Filters update statistics and charts from the database.
                </p>
            )}
        </div>
    );
}
