export type AdminQuizPerformanceFilters = {
    search: string;
    date_from: string;
    date_to: string;
    category_id: string;
    quiz_id: string;
    status: string;
};

export type AdminQuizPerformanceDetailFilters = {
    date_from: string;
    date_to: string;
    status: string;
};

export type AdminQuizPerformanceFilterOptions = {
    categories: Array<{ value: string; label: string }>;
    quizzes: Array<{ value: string; label: string }>;
    statuses: Array<{ value: string; label: string }>;
};

export type AdminQuizPerformanceStats = {
    totalQuizzes: number;
    totalAttempts: number;
    totalParticipants: number;
    averageScore: number;
    averagePercentage: number;
    passRate: number;
};

export type AdminQuizPerformanceRow = {
    id: number;
    title: string;
    category_name: string | null;
    total_attempts: number;
    total_participants: number;
    average_score: number;
    average_percentage: number;
    best_score: number;
    pass_rate: number;
    fail_rate: number;
    average_completion_seconds: number;
};

export type PaginatedAdminQuizPerformance = {
    data: AdminQuizPerformanceRow[];
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

export type AdminQuizPerformanceDetailStats = {
    totalAttempts: number;
    totalParticipants: number;
    averageScore: number;
    averagePercentage: number;
    bestScore: number;
    lowestScore: number;
    passRate: number;
    failRate: number;
    averageCompletionSeconds: number;
};

export type AdminQuizAttemptsTrendItem = {
    date: string;
    label: string;
    attempts: number;
};

export type AdminQuizScorePerformanceItem = {
    id: number;
    label: string;
    date: string | null;
    date_label: string | null;
    percentage: number;
    score: number | null;
};

export type AdminQuizQuestionPerformanceItem = {
    id: number;
    number: number;
    question: string;
    total_answers: number;
    correct_answers: number;
    incorrect_answers: number;
    skipped_answers: number;
    accuracy_percentage: number;
};

export type PaginatedAdminQuizQuestionPerformance = {
    data: AdminQuizQuestionPerformanceItem[];
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

export type AdminQuizRecentAttempt = {
    id: number;
    user_name: string;
    user_email: string | null;
    completed_at: string | null;
    score: number | null;
    total_marks: number | null;
    percentage: number | null;
    correct_answers: number | null;
    wrong_answers: number | null;
    unanswered_questions: number | null;
    completion_seconds: number | null;
    is_passed: boolean | null;
    status: 'passed' | 'failed' | 'unknown';
    status_label: string;
};

export type PaginatedAdminQuizRecentAttempts = {
    data: AdminQuizRecentAttempt[];
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

export type AdminQuizTopPerformer = {
    id: number;
    name: string;
    email: string | null;
    attempts: number;
    best_score: number;
    average_percentage: number;
    pass_rate: number;
};
