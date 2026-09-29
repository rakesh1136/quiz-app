import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { CategoriesFilters } from '@/components/admin/categories-filters';
import { CategoriesPagination } from '@/components/admin/categories-pagination';
import { CategoriesTable } from '@/components/admin/categories-table';
import { Button } from '@/components/ui/button';
import { create, index } from '@/routes/admin/categories';
import { dashboard } from '@/routes/admin';
import type {
    AdminCategoryFilters,
    PaginatedAdminCategories,
    SelectOption,
} from '@/types';

type Props = {
    categories: PaginatedAdminCategories;
    filters: AdminCategoryFilters;
    statusOptions: SelectOption[];
};

export default function AdminCategoriesIndex({
    categories,
    filters,
    statusOptions,
}: Props) {
    return (
        <>
            <Head title="Categories" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Categories
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage quiz categories.
                        </p>
                    </div>

                    <Button asChild>
                        <Link href={create()}>
                            <Plus className="size-4" />
                            Add Category
                        </Link>
                    </Button>
                </div>

                <CategoriesFilters
                    filters={filters}
                    statusOptions={statusOptions}
                />

                <CategoriesTable
                    categories={categories}
                    filters={filters}
                />

                <CategoriesPagination categories={categories} />
            </div>
        </>
    );
}

AdminCategoriesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Categories',
            href: index(),
        },
    ],
};
