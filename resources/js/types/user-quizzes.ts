export type UserQuiz = {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    duration: number;
    passing_score: number;
    max_attempts: number;
    questions_count: number;
    category_name: string;
    category_slug?: string | null;
};

export type UserQuizDetail = UserQuiz & {
    total_marks: number;
};

export type UserQuizFilters = {
    search: string;
    category: string;
};

export type UserQuizCategoryOption = {
    value: string;
    label: string;
};

export type PaginatedUserQuizzes = {
    data: UserQuiz[];
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
