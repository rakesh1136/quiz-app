<?php

namespace App\Http\Controllers\Admin;

use App\Enums\QuizAttemptStatus;
use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __invoke(Request $request): Response
    {
        Gate::authorize('viewAny', QuizAttempt::class);

        $filters = $this->filtersFromRequest($request);
        $query = $this->filteredAttemptsQuery($filters);

        $totalAttempts = (clone $query)->count();
        $passedAttempts = (clone $query)->where('is_passed', true)->count();
        $failedAttempts = (clone $query)->where('is_passed', false)->count();
        $averageScore = (clone $query)->avg('percentage');
        $totalParticipants = (int) (clone $query)
            ->selectRaw('COUNT(DISTINCT quiz_attempts.user_id) as total_participants')
            ->value('total_participants');
        $averageCompletionSeconds = $this->averageCompletionSeconds(clone $query);

        $passRate = $totalAttempts > 0
            ? round(($passedAttempts / $totalAttempts) * 100, 1)
            : 0.0;
        $failRate = $totalAttempts > 0
            ? round(($failedAttempts / $totalAttempts) * 100, 1)
            : 0.0;

        return Inertia::render('admin/reports/index', [
            'filters' => $filters,
            'filterOptions' => [
                'quizzes' => $this->quizFilterOptions(),
                'categories' => $this->categoryFilterOptions(),
                'users' => $this->userFilterOptions(),
                'statuses' => $this->statusFilterOptions(),
            ],
            'stats' => [
                'totalAttempts' => $totalAttempts,
                'averageScore' => $averageScore === null
                    ? 0.0
                    : round((float) $averageScore, 1),
                'passRate' => $passRate,
                'failRate' => $failRate,
                'totalParticipants' => $totalParticipants,
                'averageCompletionSeconds' => $averageCompletionSeconds,
            ],
            'attemptsOverview' => $this->attemptsOverview($filters),
            'passFail' => [
                'passed' => $passedAttempts,
                'failed' => $failedAttempts,
            ],
            'quizPerformance' => $this->quizPerformance(clone $query),
            'categoryPerformance' => $this->categoryPerformance(clone $query),
            'topPerformers' => $this->topPerformers(clone $query),
            'hasData' => $totalAttempts > 0,
        ]);
    }

    /**
     * @return array{
     *     date_from: string,
     *     date_to: string,
     *     quiz_id: string,
     *     category_id: string,
     *     user_id: string,
     *     status: string
     * }
     */
    private function filtersFromRequest(Request $request): array
    {
        $status = (string) $request->string('status', 'all');
        $allowedStatuses = ['all', 'passed', 'failed'];

        return [
            'date_from' => $this->optionalDateFilter($request->input('date_from')),
            'date_to' => $this->optionalDateFilter($request->input('date_to')),
            'quiz_id' => $this->optionalIdFilter($request->input('quiz_id')),
            'category_id' => $this->optionalIdFilter($request->input('category_id')),
            'user_id' => $this->optionalIdFilter($request->input('user_id')),
            'status' => in_array($status, $allowedStatuses, true) ? $status : 'all',
        ];
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
     *     quiz_id: string,
     *     category_id: string,
     *     user_id: string,
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

        if ($filters['date_from'] !== '') {
            $query->whereDate('quiz_attempts.completed_at', '>=', $filters['date_from']);
        }

        if ($filters['date_to'] !== '') {
            $query->whereDate('quiz_attempts.completed_at', '<=', $filters['date_to']);
        }

        if ($filters['quiz_id'] !== 'all') {
            $query->where('quiz_attempts.quiz_id', $filters['quiz_id']);
        }

        if ($filters['category_id'] !== 'all') {
            $query->whereHas('quiz', function (Builder $builder) use ($filters): void {
                $builder->where('category_id', $filters['category_id']);
            });
        }

        if ($filters['user_id'] !== 'all') {
            $query->where('quiz_attempts.user_id', $filters['user_id']);
        }

        if ($filters['status'] === 'passed') {
            $query->where('quiz_attempts.is_passed', true);
        } elseif ($filters['status'] === 'failed') {
            $query->where('quiz_attempts.is_passed', false);
        }

        return $query;
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
     *     quiz_id: string,
     *     category_id: string,
     *     user_id: string,
     *     status: string
     * }  $filters
     * @return list<array{date: string, label: string, attempts: int}>
     */
    private function attemptsOverview(array $filters): array
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

        $overviewFilters = $filters;
        $overviewFilters['date_from'] = $start->toDateString();
        $overviewFilters['date_to'] = $end->toDateString();

        $attemptCounts = $this->filteredAttemptsQuery($overviewFilters)
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
     * @return list<array{id: int, title: string, average_score: float, attempts: int}>
     */
    private function quizPerformance(Builder $query): array
    {
        return $query
            ->join('quizzes', 'quizzes.id', '=', 'quiz_attempts.quiz_id')
            ->select([
                'quizzes.id',
                'quizzes.title',
                DB::raw('AVG(quiz_attempts.percentage) as average_score'),
                DB::raw('COUNT(quiz_attempts.id) as attempts'),
            ])
            ->groupBy('quizzes.id', 'quizzes.title')
            ->orderByDesc('average_score')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'id' => (int) $row->id,
                'title' => (string) $row->title,
                'average_score' => round((float) $row->average_score, 1),
                'attempts' => (int) $row->attempts,
            ])
            ->all();
    }

    /**
     * @param  Builder<QuizAttempt>  $query
     * @return list<array{id: int, name: string, average_score: float, attempts: int}>
     */
    private function categoryPerformance(Builder $query): array
    {
        return $query
            ->join('quizzes', 'quizzes.id', '=', 'quiz_attempts.quiz_id')
            ->join('quiz_categories', 'quiz_categories.id', '=', 'quizzes.category_id')
            ->select([
                'quiz_categories.id',
                'quiz_categories.name',
                DB::raw('AVG(quiz_attempts.percentage) as average_score'),
                DB::raw('COUNT(quiz_attempts.id) as attempts'),
            ])
            ->groupBy('quiz_categories.id', 'quiz_categories.name')
            ->orderByDesc('average_score')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'id' => (int) $row->id,
                'name' => (string) $row->name,
                'average_score' => round((float) $row->average_score, 1),
                'attempts' => (int) $row->attempts,
            ])
            ->all();
    }

    /**
     * @param  Builder<QuizAttempt>  $query
     * @return list<array{id: int, name: string, email: string|null, attempts: int, average_score: float, pass_rate: float}>
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
                DB::raw('AVG(quiz_attempts.percentage) as average_score'),
                DB::raw('SUM(CASE WHEN quiz_attempts.is_passed = 1 THEN 1 ELSE 0 END) as passed_attempts'),
            ])
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderByDesc('average_score')
            ->orderByDesc('attempts')
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
                    'average_score' => round((float) $row->average_score, 1),
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
    private function quizFilterOptions(): array
    {
        return [
            ['value' => 'all', 'label' => 'All Quizzes'],
            ...Quiz::query()
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
    private function userFilterOptions(): array
    {
        return [
            ['value' => 'all', 'label' => 'All Users'],
            ...User::query()
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
