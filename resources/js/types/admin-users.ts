export type AdminUser = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
    role_label: string;
    status: 'active' | 'inactive';
    status_label: string;
    created_at: string | null;
    updated_at?: string | null;
    email_verified_at?: string | null;
    can_delete: boolean;
};

export type AdminUserFilters = {
    search: string;
    role: string;
    status: string;
    sort: string;
    direction: 'asc' | 'desc';
};

export type SelectOption = {
    value: string;
    label: string;
};

export type PaginatedAdminUsers = {
    data: AdminUser[];
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
