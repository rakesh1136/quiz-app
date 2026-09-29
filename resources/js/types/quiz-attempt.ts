export type AttemptQuestionOption = {
    id: number;
    option_text: string;
};

export type AttemptQuestion = {
    id: number;
    question: string;
    options: AttemptQuestionOption[];
};

export type QuizAttemptPageData = {
    quiz: {
        id: number;
        title: string;
        duration: number;
    };
    attempt: {
        id: number;
        status: string;
        started_at: string | null;
        expires_at: string | null;
        duration_seconds: number;
        remaining_seconds: number;
    };
    questions: AttemptQuestion[];
    answers: Record<string, number | null>;
};

export type QuizAttemptResultPageData = {
    quiz: {
        id: number;
        title: string;
        passing_score: number;
    };
    attempt: {
        id: number;
        status: string;
        completed_at: string | null;
        timed_out: boolean;
        total_questions: number;
        attempted_questions: number;
        correct_answers: number;
        wrong_answers: number;
        unanswered_questions: number;
        total_marks: number;
        obtained_marks: number;
        percentage: number;
        is_passed: boolean;
    };
};
