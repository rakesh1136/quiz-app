export type AdminExportReportFilters = {
    report_type: string;
    date_from: string;
    date_to: string;
    user_id: string;
    quiz_id: string;
    category_id: string;
    status: string;
};

export type AdminExportReportFilterOptions = {
    reportTypes: Array<{ value: string; label: string }>;
    users: Array<{ value: string; label: string }>;
    quizzes: Array<{ value: string; label: string }>;
    categories: Array<{ value: string; label: string }>;
    statuses: Array<{ value: string; label: string }>;
};

export type AdminExportFilterSummaryItem = {
    label: string;
    value: string;
};
