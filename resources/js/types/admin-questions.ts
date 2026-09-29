export type AdminQuestionOption = {
    id?: number;
    option_text: string;
    is_correct: boolean;
    sort_order: number;
    label: string;
};

export type AdminQuestion = {
    id: number;
    category_id: number;
    category_name?: string | null;
    question: string;
    difficulty: 'easy' | 'medium' | 'hard';
    difficulty_label: string;
    marks: number;
    negative_marks: number;
    explanation?: string | null;
    status: 'active' | 'inactive';
    status_label: string;
    created_at: string | null;
    updated_at?: string | null;
    correct_option_index: number;
    options: AdminQuestionOption[];
};

export type AdminQuestionFilters = {
    search: string;
    category_id: string;
    difficulty: string;
    status: string;
    sort: string;
    direction: 'asc' | 'desc';
};

export type PaginatedAdminQuestions = {
    data: AdminQuestion[];
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

export type CategorySelectOption = {
    value: string;
    label: string;
};
