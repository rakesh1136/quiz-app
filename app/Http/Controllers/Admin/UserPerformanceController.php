<?php

namespace App\Http\Controllers\Admin;

use App\Enums\QuizAttemptStatus;
use App\Http\Controllers\Controller;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class UserPerformanceController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', User::class);

        $filters = $this->filtersFromRequest($request);
        $attemptsQuery = $this->filteredAttemptsQuery($filters);

        $totalAttempts = (clone $attemptsQuery)->count();
        $passedAttempts = (clone $attemptsQuery)->where('quiz_attempts.is_passed', true)->count();
        $failedAttempts = (clone $attemptsQuery)->where('quiz_attempts.is_passed', false)->count();
        $averageScore = (clone $attemptsQuery)->avg('quiz_attempts.score');
        $averagePercentage = (clone $attemptsQuery)->avg('quiz_attempts.percentage');
        $totalParticipants = (int) (clone $attemptsQuery)
            ->selectRaw('COUNT(DISTINCT quiz_attempts.user_id) as total_participants')
            ->value('total_participants');

        $users = User::query()
            ->select([
                'users.id',
                'users.name',
                'users.email',
                DB::raw('COUNT(quiz_attempts.id) as total_attempts'),
                DB::raw('SUM(CASE WHEN quiz_attempts.is_passed = 1 THEN 1 ELSE 0 END) as passed_attempts'),
                DB::raw('SUM(CASE WHEN quiz_attempts.is_passed = 0 THEN 1 ELSE 0 END) as failed_attempts'),
                DB::raw('AVG(quiz_attempts.score) as average_score'),
                DB::raw('MAX(quiz_attempts.score) as best_score'),
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
            ->paginate(10)
            ->withQueryString()
            ->through(function ($row) {
                $total = (int) $row->total_attempts;
                $passed = (int) $row->passed_attempts;

                return [
                    'id' => (int) $row->id,
                    'name' => (string) $row->name,
                    'email' => $row->email !== null ? (string) $row->email : null,
                    'total_attempts' => $total,
                    'passed_attempts' => $passed,
                    'failed_attempts' => (int) $row->failed_attempts,
                    'average_score' => round((float) $row->average_score, 2),
                    'best_score' => round((float) $row->best_score, 2),
                    'average_percentage' => round((float) $row->average_percentage, 1),
                    'pass_rate' => $total > 0
                        ? round(($passed / $total) * 100, 1)
                        : 0.0,
                    'last_attempt_at' => $row->last_attempt_at
                        ? Carbon::parse($row->last_attempt_at)->toISOString()
                        : null,
                ];
            });

        return Inertia::render('admin/user-performance/index', [
            'users' => $users,
            'filters' => $filters,
            'filterOptions' => [
                'users' => $this->userFilterOptions(),
                'statuses' => $this->statusFilterOptions(),
            ],
            'stats' => [
                'totalParticipants' => $totalParticipants,
                'totalAttempts' => $totalAttempts,
                'averageScore' => $averageScore === null
                    ? 0.0
                    : round((float) $averageScore, 2),
                'averagePercentage' => $averagePercentage === null
                    ? 0.0
                    : round((float) $averagePercentage, 1),
                'passRate' => $totalAttempts > 0
                    ? round(($passedAttempts / $totalAttempts) * 100, 1)
                    : 0.0,
                'failRate' => $totalAttempts > 0
                    ? round(($failedAttempts / $totalAttempts) * 100, 1)
                    : 0.0,
            ],
            'hasData' => $totalParticipants > 0,
        ]);
    }

    public function show(Request $request, User $user): Response
    {
        Gate::authorize('view', $user);

        $filters = $this->detailFiltersFromRequest($request);
        $attemptsQuery = $this->filteredAttemptsQuery([
            ...$filters,
            'user_id' => (string) $user->id,
            'search' => '',
        ]);

        $totalAttempts = (clone $attemptsQuery)->count();
        $passedAttempts = (clone $attemptsQuery)->where('quiz_attempts.is_passed', true)->count();
        $failedAttempts = (clone $attemptsQuery)->where('quiz_attempts.is_passed', false)->count();
        $averageScore = (clone $attemptsQuery)->avg('quiz_attempts.score');
        $bestScore = (clone $attemptsQuery)->max('quiz_attempts.score');
        $lowestScore = (clone $attemptsQuery)->min('quiz_attempts.score');
        $averagePercentage = (clone $attemptsQuery)->avg('quiz_attempts.percentage');
        $totalCorrect = (int) ((clone $attemptsQuery)->sum('quiz_attempts.correct_answers') ?? 0);
        $totalIncorrect = (int) ((clone $attemptsQuery)->sum('quiz_attempts.wrong_answers') ?? 0);
        $totalSkipped = (int) ((clone $attemptsQuery)->sum('quiz_attempts.unanswered_questions') ?? 0);
        $answeredQuestions = $totalCorrect + $totalIncorrect;
        $quizzesAttempted = (int) (clone $attemptsQuery)
            ->selectRaw('COUNT(DISTINCT quiz_attempts.quiz_id) as total_quizzes')
            ->value('total_quizzes');

        $quizPerformance = $this->quizPerformanceForUser(clone $attemptsQuery);
        $bestQuiz = collect($quizPerformance)->sortByDesc('average_percentage')->first();
        $weakestQuiz = collect($quizPerformance)->sortBy('average_percentage')->first();

        $recentAttempts = (clone $attemptsQuery)
            ->with([
                'quiz:id,title,category_id',
                'quiz.category:id,name',
            ])
            ->latest('quiz_attempts.completed_at')
            ->latest('quiz_attempts.id')
            ->paginate(5, ['*'], 'attempts_page')
            ->withQueryString()
            ->through(fn (QuizAttempt $attempt) => [
                'id' => $attempt->id,
                'quiz_id' => $attempt->quiz_id,
                'quiz_title' => $attempt->quiz?->title ?? 'Deleted quiz',
                'category_name' => $attempt->quiz?->category?->name,
                'completed_at' => $attempt->completed_at?->toISOString(),
                'score' => $attempt->score === null ? null : (float) $attempt->score,
                'total_marks' => $attempt->total_marks === null ? null : (float) $attempt->total_marks,
                'percentage' => $attempt->percentage === null ? null : (float) $attempt->percentage,
                'correct_answers' => $attempt->correct_answers,
                'wrong_answers' => $attempt->wrong_answers,
                'unanswered_questions' => $attempt->unanswered_questions,
                'is_passed' => $attempt->is_passed,
                'status' => $attempt->is_passed === null
                    ? 'unknown'
                    : ($attempt->is_passed ? 'passed' : 'failed'),
                'status_label' => $attempt->is_passed === null
                    ? '—'
                    : ($attempt->is_passed ? 'Passed' : 'Failed'),
            ]);

        $performanceTrend = (clone $attemptsQuery)
            ->whereNotNull('quiz_attempts.completed_at')
            ->orderBy('quiz_attempts.completed_at')
            ->orderBy('quiz_attempts.id')
            ->get([
                'quiz_attempts.id',
                'quiz_attempts.completed_at',
                'quiz_attempts.percentage',
                'quiz_attempts.score',
                'quiz_attempts.total_marks',
            ])
            ->values()
            ->map(fn (QuizAttempt $attempt, int $index) => [
                'id' => $attempt->id,
                'label' => 'Attempt '.($index + 1),
                'date' => $attempt->completed_at?->toDateString(),
                'date_label' => $attempt->completed_at?->format('M j'),
                'percentage' => $attempt->percentage === null
                    ? 0.0
                    : (float) $attempt->percentage,
                'score' => $attempt->score === null ? null : (float) $attempt->score,
                'total_marks' => $attempt->total_marks === null
                    ? null
                    : (float) $attempt->total_marks,
            ])
            ->all();

        $mostRecentAttempt = (clone $attemptsQuery)
            ->with(['quiz:id,title'])
            ->latest('quiz_attempts.completed_at')
            ->latest('quiz_attempts.id')
            ->first();

        return Inertia::render('admin/user-performance/show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'registered_at' => $user->created_at?->toISOString(),
            ],
            'filters' => $filters,
            'stats' => [
                'totalAttempts' => $totalAttempts,
                'passedAttempts' => $passedAttempts,
                'failedAttempts' => $failedAttempts,
                'averageScore' => $averageScore === null ? 0.0 : round((float) $averageScore, 2),
                'bestScore' => $bestScore === null ? 0.0 : round((float) $bestScore, 2),
                'lowestScore' => $lowestScore === null ? 0.0 : round((float) $lowestScore, 2),
                'averagePercentage' => $averagePercentage === null
                    ? 0.0
                    : round((float) $averagePercentage, 1),
                'passRate' => $totalAttempts > 0
                    ? round(($passedAttempts / $totalAttempts) * 100, 1)
                    : 0.0,
                'totalCorrectAnswers' => $totalCorrect,
                'totalIncorrectAnswers' => $totalIncorrect,
                'totalSkippedAnswers' => $totalSkipped,
                'quizzesAttempted' => $quizzesAttempted,
            ],
            'answerPerformance' => [
                'totalQuestionsAnswered' => $answeredQuestions,
                'correctAnswers' => $totalCorrect,
                'incorrectAnswers' => $totalIncorrect,
                'skippedAnswers' => $totalSkipped,
                'accuracyPercentage' => $answeredQuestions > 0
                    ? round(($totalCorrect / $answeredQuestions) * 100, 1)
                    : 0.0,
            ],
            'passFail' => [
                'passed' => $passedAttempts,
                'failed' => $failedAttempts,
            ],
            'performanceTrend' => $performanceTrend,
            'quizPerformance' => $quizPerformance,
            'recentAttempts' => $recentAttempts,
            'insights' => [
                'bestPerformingQuiz' => $bestQuiz === null
                    ? null
                    : [
                        'title' => $bestQuiz['title'],
                        'average_percentage' => $bestQuiz['average_percentage'],
                    ],
                'weakestPerformingQuiz' => $weakestQuiz === null
                    ? null
                    : [
                        'title' => $weakestQuiz['title'],
                        'average_percentage' => $weakestQuiz['average_percentage'],
                    ],
                'mostRecentAttempt' => $mostRecentAttempt === null
                    ? null
                    : [
                        'id' => $mostRecentAttempt->id,
                        'quiz_title' => $mostRecentAttempt->quiz?->title ?? 'Deleted quiz',
                        'completed_at' => $mostRecentAttempt->completed_at?->toISOString(),
                        'percentage' => $mostRecentAttempt->percentage === null
                            ? null
                            : (float) $mostRecentAttempt->percentage,
                    ],
                'totalQuizzesAttempted' => $quizzesAttempted,
            ],
            'hasData' => $totalAttempts > 0,
            'backUrl' => route('admin.user-performance.index', $this->activeListingFilters($request)),
        ]);
    }

    /**
     * @return array{
     *     search: string,
     *     date_from: string,
     *     date_to: string,
     *     user_id: string,
     *     status: string
     * }
     */
    private function filtersFromRequest(Request $request): array
    {
        $status = (string) $request->string('status', 'all');
        $allowedStatuses = ['all', 'passed', 'failed'];

        return [
            'search' => trim((string) $request->string('search')),
            'date_from' => $this->optionalDateFilter($request->input('date_from')),
            'date_to' => $this->optionalDateFilter($request->input('date_to')),
            'user_id' => $this->optionalIdFilter($request->input('user_id')),
            'status' => in_array($status, $allowedStatuses, true) ? $status : 'all',
        ];
    }

    /**
     * @return array{
     *     date_from: string,
     *     date_to: string,
     *     status: string
     * }
     */
    private function detailFiltersFromRequest(Request $request): array
    {
        $status = (string) $request->string('status', 'all');
        $allowedStatuses = ['all', 'passed', 'failed'];

        return [
            'date_from' => $this->optionalDateFilter($request->input('date_from')),
            'date_to' => $this->optionalDateFilter($request->input('date_to')),
            'status' => in_array($status, $allowedStatuses, true) ? $status : 'all',
        ];
    }

    /**
     * @return array<string, string>
     */
    private function activeListingFilters(Request $request): array
    {
        return array_filter(
            $this->filtersFromRequest($request),
            fn (string $value): bool => $value !== '' && $value !== 'all',
        );
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
     *     search?: string,
     *     date_from: string,
     *     date_to: string,
     *     user_id?: string,
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
     *     search?: string,
     *     date_from: string,
     *     date_to: string,
     *     user_id?: string,
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

        if (($filters['user_id'] ?? 'all') !== 'all') {
            $query->where('quiz_attempts.user_id', $filters['user_id']);
        }

        if (($filters['status'] ?? 'all') === 'passed') {
            $query->where('quiz_attempts.is_passed', true);
        } elseif (($filters['status'] ?? 'all') === 'failed') {
            $query->where('quiz_attempts.is_passed', false);
        }

        if (($filters['search'] ?? '') !== '') {
            $search = $filters['search'];

            $query->whereExists(function ($builder) use ($search): void {
                $builder->selectRaw('1')
                    ->from('users')
                    ->whereColumn('users.id', 'quiz_attempts.user_id')
                    ->where(function ($userQuery) use ($search): void {
                        $userQuery
                            ->where('users.name', 'like', "%{$search}%")
                            ->orWhere('users.email', 'like', "%{$search}%");
                    });
            });
        }
    }

    /**
     * @param  Builder<QuizAttempt>  $query
     * @return list<array{
     *     id: int,
     *     title: string,
     *     attempts: int,
     *     average_score: float,
     *     best_score: float,
     *     average_percentage: float,
     *     pass_rate: float
     * }>
     */
    private function quizPerformanceForUser(Builder $query): array
    {
        return $query
            ->join('quizzes', 'quizzes.id', '=', 'quiz_attempts.quiz_id')
            ->select([
                'quizzes.id',
                'quizzes.title',
                DB::raw('COUNT(quiz_attempts.id) as attempts'),
                DB::raw('AVG(quiz_attempts.score) as average_score'),
                DB::raw('MAX(quiz_attempts.score) as best_score'),
                DB::raw('AVG(quiz_attempts.percentage) as average_percentage'),
                DB::raw('SUM(CASE WHEN quiz_attempts.is_passed = 1 THEN 1 ELSE 0 END) as passed_attempts'),
            ])
            ->groupBy('quizzes.id', 'quizzes.title')
            ->orderByDesc('average_percentage')
            ->get()
            ->map(function ($row) {
                $attempts = (int) $row->attempts;
                $passed = (int) $row->passed_attempts;

                return [
                    'id' => (int) $row->id,
                    'title' => (string) $row->title,
                    'attempts' => $attempts,
                    'average_score' => round((float) $row->average_score, 2),
                    'best_score' => round((float) $row->best_score, 2),
                    'average_percentage' => round((float) $row->average_percentage, 1),
                    'pass_rate' => $attempts > 0
                        ? round(($passed / $attempts) * 100, 1)
                        : 0.0,
                ];
            })
            ->all();
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function userFilterOptions(): array
    {
        return [
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
        ];
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function statusFilterOptions(): array
    {
        return [
            ['value' => 'all', 'label' => 'All'],
            ['value' => 'passed', 'label' => 'Passed'],
            ['value' => 'failed', 'label' => 'Failed'],
        ];
    }
}
