<?php

namespace App\Services\Admin;

use App\Enums\QuizAttemptStatus;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ExportReportQueryService
{
    public const REPORT_QUIZ_ATTEMPTS = 'quiz_attempts';

    public const REPORT_USER_PERFORMANCE = 'user_performance';

    public const REPORT_QUIZ_PERFORMANCE = 'quiz_performance';

    /**
     * @return list<string>
     */
    public function reportTypes(): array
    {
        return [
            self::REPORT_QUIZ_ATTEMPTS,
            self::REPORT_USER_PERFORMANCE,
            self::REPORT_QUIZ_PERFORMANCE,
        ];
    }

    /**
     * @return array{
     *     report_type: string,
     *     date_from: string,
     *     date_to: string,
     *     user_id: string,
     *     quiz_id: string,
     *     category_id: string,
     *     status: string
     * }
     */
    public function filtersFromRequest(Request $request): array
    {
        $reportType = (string) $request->string('report_type', self::REPORT_QUIZ_ATTEMPTS);
        $status = (string) $request->string('status', 'all');
        $allowedStatuses = ['all', 'passed', 'failed'];

        return [
            'report_type' => in_array($reportType, $this->reportTypes(), true)
                ? $reportType
                : self::REPORT_QUIZ_ATTEMPTS,
            'date_from' => $this->optionalDateFilter($request->input('date_from')),
            'date_to' => $this->optionalDateFilter($request->input('date_to')),
            'user_id' => $this->optionalIdFilter($request->input('user_id')),
            'quiz_id' => $this->optionalIdFilter($request->input('quiz_id')),
            'category_id' => $this->optionalIdFilter($request->input('category_id')),
            'status' => in_array($status, $allowedStatuses, true) ? $status : 'all',
        ];
    }

    /**
     * @param  array{
     *     report_type: string,
     *     date_from: string,
     *     date_to: string,
     *     user_id: string,
     *     quiz_id: string,
     *     category_id: string,
     *     status: string
     * }  $filters
     */
    public function recordCount(array $filters): int
    {
        return match ($filters['report_type']) {
            self::REPORT_USER_PERFORMANCE => $this->userPerformanceRows($filters)->count(),
            self::REPORT_QUIZ_PERFORMANCE => $this->quizPerformanceRows($filters)->count(),
            default => $this->filteredAttemptsQuery($filters)->count(),
        };
    }

    /**
     * @param  array{
     *     report_type: string,
     *     date_from: string,
     *     date_to: string,
     *     user_id: string,
     *     quiz_id: string,
     *     category_id: string,
     *     status: string
     * }  $filters
     * @return list<array{label: string, value: string}>
     */
    public function filterSummary(array $filters): array
    {
        $reportLabels = [
            self::REPORT_QUIZ_ATTEMPTS => 'Quiz Attempts Report',
            self::REPORT_USER_PERFORMANCE => 'User Performance Report',
            self::REPORT_QUIZ_PERFORMANCE => 'Quiz Performance Report',
        ];

        $dateValue = 'All dates';
        if ($filters['date_from'] !== '' || $filters['date_to'] !== '') {
            $from = $filters['date_from'] !== ''
                ? Carbon::parse($filters['date_from'])->format('d/m/Y')
                : '…';
            $to = $filters['date_to'] !== ''
                ? Carbon::parse($filters['date_to'])->format('d/m/Y')
                : '…';
            $dateValue = "{$from} - {$to}";
        }

        $userLabel = 'All Users';
        if ($filters['user_id'] !== 'all') {
            $user = User::query()->find($filters['user_id']);
            $userLabel = $user
                ? ($user->email ? "{$user->name} ({$user->email})" : $user->name)
                : 'Unknown user';
        }

        $quizLabel = 'All Quizzes';
        if ($filters['quiz_id'] !== 'all') {
            $quiz = Quiz::query()->find($filters['quiz_id']);
            $quizLabel = $quiz?->title ?? 'Unknown quiz';
        }

        $categoryLabel = 'All Categories';
        if ($filters['category_id'] !== 'all') {
            $category = QuizCategory::query()->find($filters['category_id']);
            $categoryLabel = $category?->name ?? 'Unknown category';
        }

        $statusLabel = match ($filters['status']) {
            'passed' => 'Passed',
            'failed' => 'Failed',
            default => 'All',
        };

        return [
            ['label' => 'Report', 'value' => $reportLabels[$filters['report_type']] ?? 'Quiz Attempts Report'],
            ['label' => 'Date', 'value' => $dateValue],
            ['label' => 'User', 'value' => $userLabel],
            ['label' => 'Quiz', 'value' => $quizLabel],
            ['label' => 'Category', 'value' => $categoryLabel],
            ['label' => 'Result', 'value' => $statusLabel],
        ];
    }

    /**
     * @return array{
     *     reportTypes: list<array{value: string, label: string}>,
     *     users: list<array{value: string, label: string}>,
     *     quizzes: list<array{value: string, label: string}>,
     *     categories: list<array{value: string, label: string}>,
     *     statuses: list<array{value: string, label: string}>
     * }
     */
    public function filterOptions(): array
    {
        return [
            'reportTypes' => [
                ['value' => self::REPORT_QUIZ_ATTEMPTS, 'label' => 'Quiz Attempts Report'],
                ['value' => self::REPORT_USER_PERFORMANCE, 'label' => 'User Performance Report'],
                ['value' => self::REPORT_QUIZ_PERFORMANCE, 'label' => 'Quiz Performance Report'],
            ],
            'users' => [
                ['value' => 'all', 'label' => 'All Users'],
                ...User::query()
                    ->whereHas('quizAttempts', function (Builder $query): void {
                        $query->whereIn('status', [
                            QuizAttemptStatus::Submitted,
                            QuizAttemptStatus::Completed,
                        ])->whereNotNull('percentage');
                    })
                    ->orderBy('name')
                    ->get(['id', 'name', 'email'])
                    ->map(fn (User $user) => [
                        'value' => (string) $user->id,
                        'label' => $user->email
                            ? "{$user->name} ({$user->email})"
                            : $user->name,
                    ])
                    ->all(),
            ],
            'quizzes' => [
                ['value' => 'all', 'label' => 'All Quizzes'],
                ...Quiz::query()
                    ->whereHas('attempts', function (Builder $query): void {
                        $query->whereIn('status', [
                            QuizAttemptStatus::Submitted,
                            QuizAttemptStatus::Completed,
                        ])->whereNotNull('percentage');
                    })
                    ->orderBy('title')
                    ->get(['id', 'title'])
                    ->map(fn (Quiz $quiz) => [
                        'value' => (string) $quiz->id,
                        'label' => $quiz->title,
                    ])
                    ->all(),
            ],
            'categories' => [
                ['value' => 'all', 'label' => 'All Categories'],
                ...QuizCategory::query()
                    ->orderBy('name')
                    ->get(['id', 'name'])
                    ->map(fn (QuizCategory $category) => [
                        'value' => (string) $category->id,
                        'label' => $category->name,
                    ])
                    ->all(),
            ],
            'statuses' => [
                ['value' => 'all', 'label' => 'All'],
                ['value' => 'passed', 'label' => 'Passed'],
                ['value' => 'failed', 'label' => 'Failed'],
            ],
        ];
    }

    /**
     * Mirrors submitted/completed attempt listing used by Admin Attempts / Reports.
     *
     * @param  array{
     *     date_from: string,
     *     date_to: string,
     *     user_id: string,
     *     quiz_id: string,
     *     category_id: string,
     *     status: string
     * }  $filters
     * @return Collection<int, array<string, mixed>>
     */
    public function quizAttemptsRows(array $filters): Collection
    {
        return $this->filteredAttemptsQuery($filters)
            ->with([
                'user:id,name,email',
                'quiz:id,title,category_id',
                'quiz.category:id,name',
            ])
            ->orderByDesc('quiz_attempts.completed_at')
            ->orderByDesc('quiz_attempts.id')
            ->get()
            ->map(function (QuizAttempt $attempt) {
                $completionSeconds = null;

                if ($attempt->started_at !== null && $attempt->completed_at !== null) {
                    $completionSeconds = max(
                        0,
                        (int) $attempt->started_at->diffInSeconds($attempt->completed_at),
                    );
                }

                return [
                    'user_name' => $attempt->user?->name ?? 'Deleted user',
                    'user_email' => $attempt->user?->email,
                    'quiz_name' => $attempt->quiz?->title ?? 'Deleted quiz',
                    'category' => $attempt->quiz?->category?->name,
                    'attempt_date' => $attempt->completed_at?->format('Y-m-d H:i:s'),
                    'score' => $attempt->score === null ? null : round((float) $attempt->score, 2),
                    'percentage' => $attempt->percentage === null
                        ? null
                        : round((float) $attempt->percentage, 1),
                    'correct_answers' => $attempt->correct_answers,
                    'incorrect_answers' => $attempt->wrong_answers,
                    'skipped_answers' => $attempt->unanswered_questions,
                    'completion_time' => $this->formatDuration($completionSeconds),
                    'result' => $attempt->is_passed === null
                        ? '—'
                        : ($attempt->is_passed ? 'Passed' : 'Failed'),
                ];
            })
            ->values();
    }

    /**
     * Same aggregation logic as User Performance listing, plus lowest score from details.
     *
     * @param  array{
     *     date_from: string,
     *     date_to: string,
     *     user_id: string,
     *     quiz_id: string,
     *     category_id: string,
     *     status: string
     * }  $filters
     * @return Collection<int, array<string, mixed>>
     */
    public function userPerformanceRows(array $filters): Collection
    {
        return User::query()
            ->select([
                'users.id',
                'users.name',
                'users.email',
                DB::raw('COUNT(quiz_attempts.id) as total_attempts'),
                DB::raw('SUM(CASE WHEN quiz_attempts.is_passed = 1 THEN 1 ELSE 0 END) as passed_attempts'),
                DB::raw('SUM(CASE WHEN quiz_attempts.is_passed = 0 THEN 1 ELSE 0 END) as failed_attempts'),
                DB::raw('AVG(quiz_attempts.score) as average_score'),
                DB::raw('MAX(quiz_attempts.score) as best_score'),
                DB::raw('MIN(quiz_attempts.score) as lowest_score'),
                DB::raw('AVG(quiz_attempts.percentage) as average_percentage'),
                DB::raw('MAX(quiz_attempts.completed_at) as last_attempt_at'),
            ])
            ->join('quiz_attempts', 'quiz_attempts.user_id', '=', 'users.id')
            ->whereIn('quiz_attempts.status', [
                QuizAttemptStatus::Submitted,
                QuizAttemptStatus::Completed,
            ])
            ->whereNotNull('quiz_attempts.percentage')
            ->whereNotNull('quiz_attempts.is_passed')
            ->tap(fn (Builder $query) => $this->applyAttemptFilters($query, $filters))
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderByDesc('average_percentage')
            ->orderByDesc('total_attempts')
            ->get()
            ->map(function ($row) {
                $total = (int) $row->total_attempts;
                $passed = (int) $row->passed_attempts;

                return [
                    'user_name' => (string) $row->name,
                    'email' => $row->email !== null ? (string) $row->email : null,
                    'total_attempts' => $total,
                    'passed' => $passed,
                    'failed' => (int) $row->failed_attempts,
                    'average_score' => round((float) $row->average_score, 2),
                    'best_score' => round((float) $row->best_score, 2),
                    'lowest_score' => round((float) $row->lowest_score, 2),
                    'average_percentage' => round((float) $row->average_percentage, 1),
                    'pass_rate' => $total > 0
                        ? round(($passed / $total) * 100, 1)
                        : 0.0,
                    'last_attempt_date' => $row->last_attempt_at
                        ? Carbon::parse($row->last_attempt_at)->format('Y-m-d H:i:s')
                        : null,
                ];
            })
            ->values();
    }

    /**
     * Same aggregation logic as Quiz Performance listing, plus lowest score from details.
     *
     * @param  array{
     *     date_from: string,
     *     date_to: string,
     *     user_id: string,
     *     quiz_id: string,
     *     category_id: string,
     *     status: string
     * }  $filters
     * @return Collection<int, array<string, mixed>>
     */
    public function quizPerformanceRows(array $filters): Collection
    {
        return Quiz::query()
            ->select([
                'quizzes.id',
                'quizzes.title',
                'quizzes.category_id',
                'quiz_categories.name as category_name',
                DB::raw('COUNT(quiz_attempts.id) as total_attempts'),
                DB::raw('COUNT(DISTINCT quiz_attempts.user_id) as total_participants'),
                DB::raw('AVG(quiz_attempts.score) as average_score'),
                DB::raw('AVG(quiz_attempts.percentage) as average_percentage'),
                DB::raw('MAX(quiz_attempts.score) as best_score'),
                DB::raw('MIN(quiz_attempts.score) as lowest_score'),
                DB::raw('SUM(CASE WHEN quiz_attempts.is_passed = 1 THEN 1 ELSE 0 END) as passed_attempts'),
                DB::raw('SUM(CASE WHEN quiz_attempts.is_passed = 0 THEN 1 ELSE 0 END) as failed_attempts'),
                DB::raw($this->averageCompletionSecondsSelect().' as average_completion_seconds'),
            ])
            ->join('quiz_attempts', 'quiz_attempts.quiz_id', '=', 'quizzes.id')
            ->leftJoin('quiz_categories', 'quiz_categories.id', '=', 'quizzes.category_id')
            ->whereIn('quiz_attempts.status', [
                QuizAttemptStatus::Submitted,
                QuizAttemptStatus::Completed,
            ])
            ->whereNotNull('quiz_attempts.percentage')
            ->whereNotNull('quiz_attempts.is_passed')
            ->tap(fn (Builder $query) => $this->applyAttemptFilters($query, $filters))
            ->groupBy('quizzes.id', 'quizzes.title', 'quizzes.category_id', 'quiz_categories.name')
            ->orderByDesc('average_percentage')
            ->orderByDesc('total_attempts')
            ->get()
            ->map(function ($row) {
                $total = (int) $row->total_attempts;
                $passed = (int) $row->passed_attempts;
                $failed = (int) $row->failed_attempts;
                $completionSeconds = $row->average_completion_seconds === null
                    ? null
                    : max(0, (int) round((float) $row->average_completion_seconds));

                return [
                    'quiz_name' => (string) $row->title,
                    'category' => $row->category_name !== null
                        ? (string) $row->category_name
                        : null,
                    'total_attempts' => $total,
                    'total_participants' => (int) $row->total_participants,
                    'average_score' => round((float) $row->average_score, 2),
                    'average_percentage' => round((float) $row->average_percentage, 1),
                    'best_score' => round((float) $row->best_score, 2),
                    'lowest_score' => round((float) $row->lowest_score, 2),
                    'pass_rate' => $total > 0
                        ? round(($passed / $total) * 100, 1)
                        : 0.0,
                    'fail_rate' => $total > 0
                        ? round(($failed / $total) * 100, 1)
                        : 0.0,
                    'average_completion_time' => $this->formatDuration($completionSeconds),
                ];
            })
            ->values();
    }

    private function optionalDateFilter(mixed $value): string
    {
        if ($value === null || $value === '') {
            return '';
        }

        try {
            return Carbon::parse((string) $value)->toDateString();
        } catch (\Throwable) {
            return '';
        }
    }

    private function optionalIdFilter(mixed $value): string
    {
        if ($value === null || $value === '' || $value === 'all') {
            return 'all';
        }

        return ctype_digit((string) $value) ? (string) $value : 'all';
    }

    /**
     * @param  array{
     *     date_from: string,
     *     date_to: string,
     *     user_id: string,
     *     quiz_id: string,
     *     category_id: string,
     *     status: string
     * }  $filters
     * @return Builder<QuizAttempt>
     */
    private function filteredAttemptsQuery(array $filters): Builder
    {
        $query = QuizAttempt::query()
            ->whereIn('quiz_attempts.status', [
                QuizAttemptStatus::Submitted,
                QuizAttemptStatus::Completed,
            ])
            ->whereNotNull('quiz_attempts.percentage')
            ->whereNotNull('quiz_attempts.is_passed');

        $this->applyAttemptFilters($query, $filters);

        return $query;
    }

    /**
     * @param  Builder<Model>  $query
     * @param  array{
     *     date_from: string,
     *     date_to: string,
     *     user_id: string,
     *     quiz_id: string,
     *     category_id: string,
     *     status: string
     * }  $filters
     */
    private function applyAttemptFilters(Builder $query, array $filters): void
    {
        if (($filters['date_from'] ?? '') !== '') {
            $query->whereDate('quiz_attempts.completed_at', '>=', $filters['date_from']);
        }

        if (($filters['date_to'] ?? '') !== '') {
            $query->whereDate('quiz_attempts.completed_at', '<=', $filters['date_to']);
        }

        if (($filters['quiz_id'] ?? 'all') !== 'all') {
            $query->where('quiz_attempts.quiz_id', $filters['quiz_id']);
        }

        if (($filters['category_id'] ?? 'all') !== 'all') {
            $query->whereExists(function ($builder) use ($filters): void {
                $builder->selectRaw('1')
                    ->from('quizzes')
                    ->whereColumn('quizzes.id', 'quiz_attempts.quiz_id')
                    ->where('quizzes.category_id', $filters['category_id']);
            });
        }

        if (($filters['user_id'] ?? 'all') !== 'all') {
            $query->where('quiz_attempts.user_id', $filters['user_id']);
        }

        if (($filters['status'] ?? 'all') === 'passed') {
            $query->where('quiz_attempts.is_passed', true);
        } elseif (($filters['status'] ?? 'all') === 'failed') {
            $query->where('quiz_attempts.is_passed', false);
        }
    }

    private function averageCompletionSecondsSelect(): string
    {
        if (DB::connection()->getDriverName() === 'sqlite') {
            return 'AVG(CASE WHEN quiz_attempts.started_at IS NOT NULL AND quiz_attempts.completed_at IS NOT NULL THEN (strftime(\'%s\', quiz_attempts.completed_at) - strftime(\'%s\', quiz_attempts.started_at)) END)';
        }

        return 'AVG(CASE WHEN quiz_attempts.started_at IS NOT NULL AND quiz_attempts.completed_at IS NOT NULL THEN TIMESTAMPDIFF(SECOND, quiz_attempts.started_at, quiz_attempts.completed_at) END)';
    }

    private function formatDuration(?int $totalSeconds): string
    {
        if ($totalSeconds === null || $totalSeconds <= 0) {
            return '';
        }

        $hours = intdiv($totalSeconds, 3600);
        $minutes = intdiv($totalSeconds % 3600, 60);
        $seconds = $totalSeconds % 60;

        if ($hours > 0) {
            return sprintf('%dh %dm %ds', $hours, $minutes, $seconds);
        }

        if ($minutes > 0) {
            return $seconds > 0
                ? sprintf('%dm %ds', $minutes, $seconds)
                : sprintf('%dm', $minutes);
        }

        return sprintf('%ds', $seconds);
    }
}
