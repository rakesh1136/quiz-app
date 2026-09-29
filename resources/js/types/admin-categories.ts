export type AdminCategory = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    status: 'active' | 'inactive';
    status_label: string;
    created_at: string | null;
    updated_at?: string | null;
    questions_count?: number;
    can_delete: boolean;
};

export type AdminCategoryFilters = {
    search: string;
    status: string;
    sort: string;
    direction: 'asc' | 'desc';
};

export type PaginatedAdminCategories = {
    data: AdminCategory[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
};
