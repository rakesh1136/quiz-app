export type BankQuestion = {
    id: number;
    question: string;
    category_id: number;
    category_name?: string | null;
    difficulty: 'easy' | 'medium' | 'hard';
    difficulty_label: string;
    marks: number;
    negative_marks: number;
    status: 'active' | 'inactive';
    status_label: string;
};

export type AdminQuizQuestion = {
    id: number;
    question: string;
    difficulty: 'easy' | 'medium' | 'hard';
    difficulty_label: string;
    marks: number;
    negative_marks: number;
    category_name?: string | null;
    status?: 'active' | 'inactive';
    question_order: number;
};

export type AdminQuiz = {
    id: number;
    title: string;
    slug: string;
    description?: string | null;
    category_id: number;
    category_name?: string | null;
    duration: number;
    passing_score: number;
    max_attempts: number;
    status: 'draft' | 'published' | 'inactive';
    status_label: string;
    questions_count: number;
    total_marks: number;
    created_at: string | null;
    updated_at?: string | null;
    question_ids?: number[];
    questions?: AdminQuizQuestion[];
};

export type AdminQuizFilters = {
    search: string;
    category_id: string;
    status: string;
    sort: string;
    direction: 'asc' | 'desc';
};

export type PaginatedAdminQuizzes = {
    data: AdminQuiz[];
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
