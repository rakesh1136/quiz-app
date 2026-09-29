export type UserDashboardStats = {
    availableQuizzes: number;
    completedQuizzes: number;
    averageScore: number;
    passedQuizzes: number;
};

export type FeaturedQuiz = {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    duration: number;
    passing_score: number;
    questions_count: number;
    category_name: string;
};

export type DashboardContinueLearningItem = {
    id: number;
    quiz_id: number;
    quiz_title: string;
    remaining_seconds: number;
    answered_count: number;
    started_at: string | null;
};

export type DashboardRecentActivityItem = {
    id: number;
    quiz_id: number;
    quiz_title: string;
    obtained_marks: number;
    total_marks: number;
    percentage: number;
    is_passed: boolean;
    completed_at: string | null;
};

export type UserAttemptSummary = {
    id: number;
    quiz_id: number;
    quiz_title: string;
    status: string;
    started_at: string | null;
    completed_at: string | null;
    obtained_marks: number | null;
    total_marks: number | null;
    percentage: number | null;
    is_passed: boolean | null;
    remaining_seconds: number | null;
};

export type PaginatedUserAttempts = {
    data: UserAttemptSummary[];
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
