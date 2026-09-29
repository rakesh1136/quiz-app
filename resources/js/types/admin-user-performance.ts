export type AdminUserPerformanceFilters = {
    search: string;
    date_from: string;
    date_to: string;
    user_id: string;
    status: string;
};

export type AdminUserPerformanceDetailFilters = {
    date_from: string;
    date_to: string;
    status: string;
};

export type AdminUserPerformanceFilterOptions = {
    users: Array<{ value: string; label: string }>;
    statuses: Array<{ value: string; label: string }>;
};

export type AdminUserPerformanceStats = {
    totalParticipants: number;
    totalAttempts: number;
    averageScore: number;
    averagePercentage: number;
    passRate: number;
    failRate: number;
};

export type AdminUserPerformanceRow = {
    id: number;
    name: string;
    email: string | null;
    total_attempts: number;
    passed_attempts: number;
    failed_attempts: number;
    average_score: number;
    best_score: number;
    average_percentage: number;
    pass_rate: number;
    last_attempt_at: string | null;
};

export type PaginatedAdminUserPerformance = {
    data: AdminUserPerformanceRow[];
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

export type AdminUserPerformanceDetailStats = {
    totalAttempts: number;
    passedAttempts: number;
    failedAttempts: number;
    averageScore: number;
    bestScore: number;
    lowestScore: number;
    averagePercentage: number;
    passRate: number;
    totalCorrectAnswers: number;
    totalIncorrectAnswers: number;
    totalSkippedAnswers: number;
    quizzesAttempted: number;
};

export type AdminUserAnswerPerformance = {
    totalQuestionsAnswered: number;
    correctAnswers: number;
    incorrectAnswers: number;
    skippedAnswers: number;
    accuracyPercentage: number;
};

export type AdminUserPerformanceTrendItem = {
    id: number;
    label: string;
    date: string | null;
    date_label: string | null;
    percentage: number;
    score: number | null;
    total_marks: number | null;
};

export type AdminUserQuizPerformanceItem = {
    id: number;
    title: string;
    attempts: number;
    average_score: number;
    best_score: number;
    average_percentage: number;
    pass_rate: number;
};

export type AdminUserRecentAttempt = {
    id: number;
    quiz_id: number;
    quiz_title: string;
    category_name?: string | null;
    completed_at: string | null;
    score: number | null;
    total_marks: number | null;
    percentage: number | null;
    correct_answers: number | null;
    wrong_answers: number | null;
    unanswered_questions: number | null;
    is_passed: boolean | null;
    status: 'passed' | 'failed' | 'unknown';
    status_label: string;
};

export type PaginatedAdminUserRecentAttempts = {
    data: AdminUserRecentAttempt[];
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

export type AdminUserPerformanceInsights = {
    bestPerformingQuiz: {
        title: string;
        average_percentage: number;
    } | null;
    weakestPerformingQuiz: {
        title: string;
        average_percentage: number;
    } | null;
    mostRecentAttempt: {
        id: number;
        quiz_title: string;
        completed_at: string | null;
        percentage: number | null;
    } | null;
    totalQuizzesAttempted: number;
};
