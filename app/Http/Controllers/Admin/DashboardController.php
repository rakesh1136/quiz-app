<?php

namespace App\Http\Controllers\Admin;

use App\Enums\QuizAttemptStatus;
use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function __invoke(): Response
    {
        $completedAttempts = QuizAttempt::query()
            ->whereIn('status', [
                QuizAttemptStatus::Submitted,
                QuizAttemptStatus::Completed,
            ]);

        $attemptsOverview = $this->attemptsOverview();
        $passedAttempts = (clone $completedAttempts)
            ->where('is_passed', true)
            ->count();
        $failedAttempts = (clone $completedAttempts)
            ->where('is_passed', false)
            ->count();
        $averageScore = (clone $completedAttempts)
            ->whereNotNull('percentage')
            ->avg('percentage');

        $recentAttempts = (clone $completedAttempts)
            ->with([
                'user:id,name',
                'quiz:id,title',
            ])
            ->whereNotNull('percentage')
            ->latest('completed_at')
            ->limit(5)
            ->get()
            ->map(fn (QuizAttempt $attempt) => [
                'id' => $attempt->id,
                'user' => $attempt->user?->name ?? 'Deleted user',
                'quiz' => $attempt->quiz?->title ?? 'Deleted quiz',
                'score' => (float) $attempt->score,
                'total_marks' => (float) $attempt->total_marks,
                'percentage' => (float) $attempt->percentage,
                'is_passed' => (bool) $attempt->is_passed,
                'completed_at' => $attempt->completed_at?->toISOString(),
            ])
            ->values();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'totalUsers' => User::query()->count(),
                'totalQuizzes' => Quiz::query()->count(),
                'totalAttempts' => QuizAttempt::query()->count(),
                'totalQuestions' => Question::query()->count(),
                'completedAttempts' => (clone $completedAttempts)->count(),
                'passedAttempts' => $passedAttempts,
                'failedAttempts' => $failedAttempts,
                'averageScore' => $averageScore === null
                    ? 0
                    : round((float) $averageScore, 1),
            ],
            'attemptsOverview' => $attemptsOverview,
            'performance' => [
                'passed' => $passedAttempts,
                'failed' => $failedAttempts,
            ],
            'recentAttempts' => $recentAttempts,
        ]);
    }

    /**
     * @return list<array{date: string, label: string, attempts: int}>
     */
    protected function attemptsOverview(): array
    {
        $start = now()->startOfDay()->subDays(6);
        $attemptCounts = QuizAttempt::query()
            ->whereBetween('created_at', [
                $start,
                now()->endOfDay(),
            ])
            ->get(['created_at'])
            ->countBy(fn (QuizAttempt $attempt) => $attempt->created_at?->toDateString());

        return collect(range(0, 6))
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
}
