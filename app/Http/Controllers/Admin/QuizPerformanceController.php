<?php

namespace App\Http\Controllers\Admin;

use App\Enums\QuizAttemptStatus;
use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizAttemptAnswer;
use App\Models\QuizCategory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class QuizPerformanceController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Quiz::class);

        $filters = $this->filtersFromRequest($request);
        $attemptsQuery = $this->filteredAttemptsQuery($filters);

        $totalAttempts = (clone $attemptsQuery)->count();
        $passedAttempts = (clone $attemptsQuery)->where('quiz_attempts.is_passed', true)->count();
        $averageScore = (clone $attemptsQuery)->avg('quiz_attempts.score');
        $averagePercentage = (clone $attemptsQuery)->avg('quiz_attempts.percentage');
        $totalParticipants = (int) (clone $attemptsQuery)
            ->selectRaw('COUNT(DISTINCT quiz_attempts.user_id) as total_participants')
            ->value('total_participants');
        $totalQuizzes = (int) (clone $attemptsQuery)
            ->selectRaw('COUNT(DISTINCT quiz_attempts.quiz_id) as total_quizzes')
            ->value('total_quizzes');

        $quizzes = Quiz::query()
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
            ->paginate(10)
            ->withQueryString()
            ->through(function ($row) {
                $total = (int) $row->total_attempts;
                $passed = (int) $row->passed_attempts;
                $failed = (int) $row->failed_attempts;

                return [
                    'id' => (int) $row->id,
                    'title' => (string) $row->title,
                    'category_name' => $row->category_name !== null
                        ? (string) $row->category_name
                        : null,
                    'total_attempts' => $total,
                    'total_participants' => (int) $row->total_participants,
                    'average_score' => round((float) $row->average_score, 2),
                    'average_percentage' => round((float) $row->average_percentage, 1),
                    'best_score' => round((float) $row->best_score, 2),
                    'pass_rate' => $total > 0
                        ? round(($passed / $total) * 100, 1)
                        : 0.0,
                    'fail_rate' => $total > 0
                        ? round(($failed / $total) * 100, 1)
                        : 0.0,
                    'average_completion_seconds' => $row->average_completion_seconds === null
                        ? 0
                        : max(0, (int) round((float) $row->average_completion_seconds)),
                ];
            });

        return Inertia::render('admin/quiz-performance/index', [
            'quizzes' => $quizzes,
            'filters' => $filters,
            'filterOptions' => [
                'categories' => $this->categoryFilterOptions(),
                'quizzes' => $this->quizFilterOptions(),
                'statuses' => $this->statusFilterOptions(),
            ],
            'stats' => [
                'totalQuizzes' => $totalQuizzes,
                'totalAttempts' => $totalAttempts,
                'totalParticipants' => $totalParticipants,
                'averageScore' => $averageScore === null
                    ? 0.0
                    : round((float) $averageScore, 2),
                'averagePercentage' => $averagePercentage === null
                    ? 0.0
                    : round((float) $averagePercentage, 1),
                'passRate' => $totalAttempts > 0
                    ? round(($passedAttempts / $totalAttempts) * 100, 1)
                    : 0.0,
            ],
            'hasData' => $totalQuizzes > 0,
        ]);
    }

    public function show(Request $request, Quiz $quiz): Response
    {
        Gate::authorize('view', $quiz);

        $filters = $this->detailFiltersFromRequest($request);
        $attemptsQuery = $this->filteredAttemptsQuery([
            ...$filters,
            'quiz_id' => (string) $quiz->id,
            'category_id' => 'all',
            'search' => '',
        ]);

        $quiz->load(['category:id,name']);
        $quiz->loadCount('questions');

        $totalAttempts = (clone $attemptsQuery)->count();
        $passedAttempts = (clone $attemptsQuery)->where('quiz_attempts.is_passed', true)->count();
        $failedAttempts = (clone $attemptsQuery)->where('quiz_attempts.is_passed', false)->count();
        $averageScore = (clone $attemptsQuery)->avg('quiz_attempts.score');
        $bestScore = (clone $attemptsQuery)->max('quiz_attempts.score');
        $lowestScore = (clone $attemptsQuery)->min('quiz_attempts.score');
        $averagePercentage = (clone $attemptsQuery)->avg('quiz_attempts.percentage');
        $totalParticipants = (int) (clone $attemptsQuery)
            ->selectRaw('COUNT(DISTINCT quiz_attempts.user_id) as total_participants')
            ->value('total_participants');
        $averageCompletionSeconds = $this->averageCompletionSeconds(clone $attemptsQuery);

        $questionPerformance = $this->questionPerformance($quiz, clone $attemptsQuery);
        $sortedByAccuracy = collect($questionPerformance)
            ->filter(fn (array $question) => $question['total_answers'] > 0)
            ->sortBy('accuracy_percentage')
            ->values();

        $recentAttempts = (clone $attemptsQuery)
            ->with(['user:id,name,email'])
            ->latest('quiz_attempts.completed_at')
            ->latest('quiz_attempts.id')
            ->paginate(5, ['*'], 'attempts_page')
            ->withQueryString()
            ->through(function (QuizAttempt $attempt) {
                $completionSeconds = null;

                if ($attempt->started_at !== null && $attempt->completed_at !== null) {
                    $completionSeconds = max(
                        0,
                        (int) $attempt->started_at->diffInSeconds($attempt->completed_at),
                    );
                }

                return [
                    'id' => $attempt->id,
                    'user_name' => $attempt->user?->name ?? 'Deleted user',
                    'user_email' => $attempt->user?->email,
                    'completed_at' => $attempt->completed_at?->toISOString(),
                    'score' => $attempt->score === null ? null : (float) $attempt->score,
                    'total_marks' => $attempt->total_marks === null
                        ? null
                        : (float) $attempt->total_marks,
                    'percentage' => $attempt->percentage === null
                        ? null
                        : (float) $attempt->percentage,
                    'correct_answers' => $attempt->correct_answers,
                    'wrong_answers' => $attempt->wrong_answers,
                    'unanswered_questions' => $attempt->unanswered_questions,
                    'completion_seconds' => $completionSeconds,
                    'is_passed' => $attempt->is_passed,
                    'status' => $attempt->is_passed === null
                        ? 'unknown'
                        : ($attempt->is_passed ? 'passed' : 'failed'),
                    'status_label' => $attempt->is_passed === null
                        ? '—'
                        : ($attempt->is_passed ? 'Passed' : 'Failed'),
                ];
            });

        $questionPaginator = $this->paginateCollection(
            collect($questionPerformance),
            10,
            max(1, (int) $request->integer('questions_page', 1)),
            'questions_page',
            $request,
        );

        return Inertia::render('admin/quiz-performance/show', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'category_name' => $quiz->category?->name,
                'questions_count' => $quiz->questions_count,
            ],
            'filters' => $filters,
            'stats' => [
                'totalAttempts' => $totalAttempts,
                'totalParticipants' => $totalParticipants,
                'averageScore' => $averageScore === null ? 0.0 : round((float) $averageScore, 2),
                'averagePercentage' => $averagePercentage === null
                    ? 0.0
                    : round((float) $averagePercentage, 1),
                'bestScore' => $bestScore === null ? 0.0 : round((float) $bestScore, 2),
                'lowestScore' => $lowestScore === null ? 0.0 : round((float) $lowestScore, 2),
                'passRate' => $totalAttempts > 0
                    ? round(($passedAttempts / $totalAttempts) * 100, 1)
                    : 0.0,
                'failRate' => $totalAttempts > 0
                    ? round(($failedAttempts / $totalAttempts) * 100, 1)
                    : 0.0,
                'averageCompletionSeconds' => $averageCompletionSeconds,
            ],
            'passFail' => [
                'passed' => $passedAttempts,
                'failed' => $failedAttempts,
            ],
            'attemptsTrend' => $this->attemptsTrend($filters, $quiz->id),
            'scorePerformance' => $this->scorePerformance(clone $attemptsQuery),
            'questionPerformance' => $questionPaginator,
            'mostDifficultQuestions' => $sortedByAccuracy->take(5)->values()->all(),
            'easiestQuestions' => $sortedByAccuracy->sortByDesc('accuracy_percentage')->take(5)->values()->all(),
            'recentAttempts' => $recentAttempts,
            'topPerformers' => $this->topPerformers(clone $attemptsQuery),
            'hasData' => $totalAttempts > 0,
            'backUrl' => route('admin.quiz-performance.index', $this->activeListingFilters($request)),
        ]);
    }

    /**
     * @return array{
     *     search: string,
     *     date_from: string,
     *     date_to: string,
     *     category_id: string,
     *     quiz_id: string,
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
            'category_id' => $this->optionalIdFilter($request->input('category_id')),
            'quiz_id' => $this->optionalIdFilter($request->input('quiz_id')),
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
     *     category_id?: string,
     *     quiz_id?: string,
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
     *     category_id?: string,
     *     quiz_id?: string,
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

        if (($filters['status'] ?? 'all') === 'passed') {
            $query->where('quiz_attempts.is_passed', true);
        } elseif (($filters['status'] ?? 'all') === 'failed') {
            $query->where('quiz_attempts.is_passed', false);
        }

        if (($filters['search'] ?? '') !== '') {
            $search = $filters['search'];

            $query->whereExists(function ($builder) use ($search): void {
                $builder->selectRaw('1')
                    ->from('quizzes')
                    ->whereColumn('quizzes.id', 'quiz_attempts.quiz_id')
                    ->where('quizzes.title', 'like', "%{$search}%");
            });
        }
    }

    private function averageCompletionSecondsSelect(): string
    {
        if (DB::connection()->getDriverName() === 'sqlite') {
            return 'AVG(CASE WHEN quiz_attempts.started_at IS NOT NULL AND quiz_attempts.completed_at IS NOT NULL THEN (strftime(\'%s\', quiz_attempts.completed_at) - strftime(\'%s\', quiz_attempts.started_at)) END)';
        }

        return 'AVG(CASE WHEN quiz_attempts.started_at IS NOT NULL AND quiz_attempts.completed_at IS NOT NULL THEN TIMESTAMPDIFF(SECOND, quiz_attempts.started_at, quiz_attempts.completed_at) END)';
    }

    /**
     * @param  Builder<QuizAttempt>  $query
     */
    private function averageCompletionSeconds(Builder $query): int
    {
        $attempts = $query
            ->whereNotNull('quiz_attempts.started_at')
            ->whereNotNull('quiz_attempts.completed_at')
            ->get(['quiz_attempts.started_at', 'quiz_attempts.completed_at']);

        if ($attempts->isEmpty()) {
            return 0;
        }

        $totalSeconds = $attempts->sum(function (QuizAttempt $attempt): int {
            if ($attempt->started_at === null || $attempt->completed_at === null) {
                return 0;
            }

            return max(0, (int) $attempt->started_at->diffInSeconds($attempt->completed_at));
        });

        return (int) round($totalSeconds / $attempts->count());
    }

    /**
     * @param  array{
     *     date_from: string,
     *     date_to: string,
     *     status: string
     * }  $filters
     * @return list<array{date: string, label: string, attempts: int}>
     */
    private function attemptsTrend(array $filters, int $quizId): array
    {
        $end = $filters['date_to'] !== ''
            ? Carbon::parse($filters['date_to'])->endOfDay()
            : now()->endOfDay();

        $start = $filters['date_from'] !== ''
            ? Carbon::parse($filters['date_from'])->startOfDay()
            : $end->copy()->subDays(29)->startOfDay();

        if ($start->greaterThan($end)) {
            [$start, $end] = [$end->copy()->startOfDay(), $start->copy()->endOfDay()];
        }

        $days = min(90, max(0, (int) $start->diffInDays($end)));

        $trendFilters = [
            ...$filters,
            'quiz_id' => (string) $quizId,
            'category_id' => 'all',
            'search' => '',
            'date_from' => $start->toDateString(),
            'date_to' => $end->toDateString(),
        ];

        $attemptCounts = $this->filteredAttemptsQuery($trendFilters)
            ->whereNotNull('quiz_attempts.completed_at')
            ->get(['quiz_attempts.completed_at'])
            ->countBy(fn (QuizAttempt $attempt) => $attempt->completed_at?->toDateString());

        return collect(range(0, $days))
            ->map(function (int $offset) use ($start, $attemptCounts): array {
                /** @var Carbon $date */
                $date = $start->copy()->addDays($offset);
                $dateKey = $date->toDateString();

                return [
                    'date' => $dateKey,
                    'label' => $date->format('M j'),
                    'attempts' => (int) $attemptCounts->get($dateKey, 0),
                ];
            })
            ->all();
    }

    /**
     * @param  Builder<QuizAttempt>  $query
     * @return list<array{
     *     id: int,
     *     label: string,
     *     date: string|null,
     *     date_label: string|null,
     *     percentage: float,
     *     score: float|null
     * }>
     */
    private function scorePerformance(Builder $query): array
    {
        return $query
            ->whereNotNull('quiz_attempts.completed_at')
            ->orderBy('quiz_attempts.completed_at')
            ->orderBy('quiz_attempts.id')
            ->get([
                'quiz_attempts.id',
                'quiz_attempts.completed_at',
                'quiz_attempts.percentage',
                'quiz_attempts.score',
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
            ])
            ->all();
    }

    /**
     * @param  Builder<QuizAttempt>  $attemptsQuery
     * @return list<array{
     *     id: int,
     *     number: int,
     *     question: string,
     *     total_answers: int,
     *     correct_answers: int,
     *     incorrect_answers: int,
     *     skipped_answers: int,
     *     accuracy_percentage: float
     * }>
     */
    private function questionPerformance(Quiz $quiz, Builder $attemptsQuery): array
    {
        $attemptIds = (clone $attemptsQuery)->pluck('quiz_attempts.id');

        $questions = $quiz->questions()
            ->with(['options:id,question_id,is_correct'])
            ->get(['questions.id', 'questions.question']);

        if ($questions->isEmpty()) {
            return [];
        }

        $answers = $attemptIds->isEmpty()
            ? collect()
            : QuizAttemptAnswer::query()
                ->whereIn('quiz_attempt_id', $attemptIds)
                ->whereIn('question_id', $questions->pluck('id'))
                ->get(['question_id', 'selected_option_id'])
                ->groupBy('question_id');

        $attemptCount = $attemptIds->count();

        return $questions
            ->values()
            ->map(function (Question $question, int $index) use ($answers, $attemptCount): array {
                $correctOptionId = $question->options->firstWhere('is_correct', true)?->id;
                $questionAnswers = $answers->get($question->id, collect());

                $correct = 0;
                $incorrect = 0;

                foreach ($questionAnswers as $answer) {
                    if ($answer->selected_option_id === null) {
                        continue;
                    }

                    if ($correctOptionId !== null && $answer->selected_option_id === $correctOptionId) {
                        $correct++;
                    } else {
                        $incorrect++;
                    }
                }

                $answered = $correct + $incorrect;
                $skipped = max(0, $attemptCount - $answered);
                $total = $correct + $incorrect + $skipped;

                return [
                    'id' => $question->id,
                    'number' => $index + 1,
                    'question' => $question->question,
                    'total_answers' => $total,
                    'correct_answers' => $correct,
                    'incorrect_answers' => $incorrect,
                    'skipped_answers' => $skipped,
                    'accuracy_percentage' => $answered > 0
                        ? round(($correct / $answered) * 100, 1)
                        : 0.0,
                ];
            })
            ->all();
    }

    /**
     * @param  Builder<QuizAttempt>  $query
     * @return list<array{
     *     id: int,
     *     name: string,
     *     email: string|null,
     *     attempts: int,
     *     best_score: float,
     *     average_percentage: float,
     *     pass_rate: float
     * }>
     */
    private function topPerformers(Builder $query): array
    {
        return $query
            ->join('users', 'users.id', '=', 'quiz_attempts.user_id')
            ->select([
                'users.id',
                'users.name',
                'users.email',
                DB::raw('COUNT(quiz_attempts.id) as attempts'),
                DB::raw('MAX(quiz_attempts.score) as best_score'),
                DB::raw('AVG(quiz_attempts.percentage) as average_percentage'),
                DB::raw('SUM(CASE WHEN quiz_attempts.is_passed = 1 THEN 1 ELSE 0 END) as passed_attempts'),
            ])
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderByDesc('average_percentage')
            ->orderByDesc('best_score')
            ->limit(5)
            ->get()
            ->map(function ($row) {
                $attempts = (int) $row->attempts;
                $passed = (int) $row->passed_attempts;

                return [
                    'id' => (int) $row->id,
                    'name' => (string) $row->name,
                    'email' => $row->email !== null ? (string) $row->email : null,
                    'attempts' => $attempts,
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
     * @template TKey of array-key
     * @template TValue
     *
     * @param  \Illuminate\Support\Collection<TKey, TValue>  $items
     * @return array{
     *     data: list<TValue>,
     *     current_page: int,
     *     last_page: int,
     *     per_page: int,
     *     total: int,
     *     from: int|null,
     *     to: int|null,
     *     links: list<array{url: string|null, label: string, active: bool}>
     * }
     */
    private function paginateCollection($items, int $perPage, int $page, string $pageName, Request $request): array
    {
        $total = $items->count();
        $lastPage = max(1, (int) ceil($total / $perPage));
        $page = min(max(1, $page), $lastPage);
        $offset = ($page - 1) * $perPage;
        $slice = $items->slice($offset, $perPage)->values();

        $query = $request->query();
        unset($query[$pageName]);

        $makeUrl = function (int $targetPage) use ($request, $pageName, $query): string {
            return $request->url().'?'.http_build_query([
                ...$query,
                $pageName => $targetPage,
            ]);
        };

        $links = [
            [
                'url' => $page > 1 ? $makeUrl($page - 1) : null,
                'label' => '&laquo; Previous',
                'active' => false,
            ],
        ];

        for ($i = 1; $i <= $lastPage; $i++) {
            $links[] = [
                'url' => $makeUrl($i),
                'label' => (string) $i,
                'active' => $i === $page,
            ];
        }

        $links[] = [
            'url' => $page < $lastPage ? $makeUrl($page + 1) : null,
            'label' => 'Next &raquo;',
            'active' => false,
        ];

        return [
            'data' => $slice->all(),
            'current_page' => $page,
            'last_page' => $lastPage,
            'per_page' => $perPage,
            'total' => $total,
            'from' => $total === 0 ? null : $offset + 1,
            'to' => $total === 0 ? null : min($offset + $perPage, $total),
            'links' => $links,
        ];
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function categoryFilterOptions(): array
    {
        return [
            ['value' => 'all', 'label' => 'All Categories'],
            ...QuizCategory::query()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (QuizCategory $category) => [
                    'value' => (string) $category->id,
                    'label' => $category->name,
                ])
                ->all(),
        ];
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function quizFilterOptions(): array
    {
        return [
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
