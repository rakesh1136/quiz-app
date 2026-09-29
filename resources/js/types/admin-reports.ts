export type AdminReportFilters = {
    date_from: string;
    date_to: string;
    quiz_id: string;
    category_id: string;
    user_id: string;
    status: string;
};

export type AdminReportFilterOptions = {
    quizzes: Array<{ value: string; label: string }>;
    categories: Array<{ value: string; label: string }>;
    users: Array<{ value: string; label: string }>;
    statuses: Array<{ value: string; label: string }>;
};

export type AdminReportStats = {
    totalAttempts: number;
    averageScore: number;
    passRate: number;
    failRate: number;
    totalParticipants: number;
    averageCompletionSeconds: number;
};

export type AdminReportAttemptsOverviewItem = {
    date: string;
    label: string;
    attempts: number;
};

export type AdminReportPassFail = {
    passed: number;
    failed: number;
};

export type AdminReportQuizPerformanceItem = {
    id: number;
    title: string;
    average_score: number;
    attempts: number;
};

export type AdminReportCategoryPerformanceItem = {
    id: number;
    name: string;
    average_score: number;
    attempts: number;
};

export type AdminReportTopPerformer = {
    id: number;
    name: string;
    email: string | null;
    attempts: number;
    average_score: number;
    pass_rate: number;
};
