export type AdminAttemptUser = {
    id: number | null;
    name: string;
    email: string | null;
};

export type AdminAttemptQuiz = {
    id: number | null;
    title: string;
    category_name?: string | null;
    passing_score?: number | null;
};

export type AdminAttempt = {
    id: number;
    user: AdminAttemptUser;
    quiz: AdminAttemptQuiz;
    total_questions: number | null;
    attempted_questions: number | null;
    score: number | null;
    total_marks: number | null;
    percentage: number | null;
    is_passed: boolean | null;
    status: 'passed' | 'failed' | 'unknown';
    status_label: string;
    completed_at: string | null;
    correct_answers?: number | null;
    wrong_answers?: number | null;
    unanswered_questions?: number | null;
    started_at?: string | null;
};

export type AdminAttemptReviewOption = {
    id: number;
    label: string;
    text: string;
    is_selected: boolean;
    is_correct: boolean;
};

export type AdminAttemptReviewQuestion = {
    id: number;
    number: number;
    text: string;
    status: 'correct' | 'wrong' | 'unanswered';
    status_label: string;
    marks_awarded: number;
    marks: number;
    negative_marks: number;
    selected_option_id: number | null;
    correct_option_id: number | null;
    options: AdminAttemptReviewOption[];
};

export type AdminAttemptFilters = {
    search: string;
    status: string;
    quiz_id: string;
    category_id: string;
};

export type PaginatedAdminAttempts = {
    data: AdminAttempt[];
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
