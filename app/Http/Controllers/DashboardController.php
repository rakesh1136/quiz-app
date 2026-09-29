<?php

namespace App\Http\Controllers;

use App\Enums\QuizAttemptStatus;
use App\Enums\QuizStatus;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\TeamInvitation;
use App\Models\User;
use App\Services\QuizAttemptScorer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(protected QuizAttemptScorer $scorer) {}

    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $email = strtolower($user->email);

        $this->scorer->finalizePendingForUser($user->id);

        $pendingInvitations = TeamInvitation::query()
            ->with(['inviter', 'team'])
            ->whereRaw('LOWER(email) = ?', [$email])
            ->whereNull('accepted_at')
            ->where(fn ($query) => $query
                ->whereNull('expires_at')
                ->orWhere('expires_at', '>=', now()))
            ->latest()
            ->get()
            ->map(fn (TeamInvitation $invitation) => [
                'code' => $invitation->code,
                'inviterName' => $invitation->inviter->name,
                'team' => [
                    'name' => $invitation->team->name,
                    'slug' => $invitation->team->slug,
                ],
            ]);

        $publishedQuizzesQuery = Quiz::query()
            ->where('status', QuizStatus::Published);

        $featuredQuizzes = (clone $publishedQuizzesQuery)
            ->with('category:id,name')
            ->withCount('questions')
            ->latest()
            ->get()
            ->map(fn (Quiz $quiz) => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'slug' => $quiz->slug,
                'description' => $quiz->description,
                'duration' => $quiz->duration,
                'passing_score' => (float) $quiz->passing_score,
                'questions_count' => $quiz->questions_count,
                'category_name' => $quiz->category?->name ?? 'Uncategorized',
            ]);

        $finishedAttempts = QuizAttempt::query()
            ->where('user_id', $user->id)
            ->whereIn('status', [
                QuizAttemptStatus::Submitted,
                QuizAttemptStatus::Completed,
            ])
            ->whereNotNull('percentage');

        $averageScore = (clone $finishedAttempts)->avg('percentage');

        return Inertia::render('dashboard', [
            'pendingInvitations' => $pendingInvitations,
            'stats' => [
                'availableQuizzes' => (clone $publishedQuizzesQuery)->count(),
                'completedQuizzes' => (clone $finishedAttempts)->count(),
                'averageScore' => $averageScore === null ? 0 : (int) round((float) $averageScore),
                'passedQuizzes' => (clone $finishedAttempts)->where('is_passed', true)->count(),
            ],
            'featuredQuizzes' => $featuredQuizzes,
            'continueLearning' => $this->continueLearning($user),
            'recentActivity' => $this->recentActivity($user),
        ]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    protected function continueLearning(User $user): array
    {
        return QuizAttempt::query()
            ->with(['quiz:id,title,duration'])
            ->withCount([
                'answers as answered_count' => fn ($query) => $query->whereNotNull('selected_option_id'),
            ])
            ->where('user_id', $user->id)
            ->where('status', QuizAttemptStatus::InProgress)
            ->latest('id')
            ->limit(5)
            ->get()
            ->map(function (QuizAttempt $attempt): array {
                $attempt->loadMissing('quiz');

                return [
                    'id' => $attempt->id,
                    'quiz_id' => $attempt->quiz_id,
                    'quiz_title' => $attempt->quiz?->title ?? 'Deleted quiz',
                    'remaining_seconds' => $attempt->remainingSeconds(),
                    'answered_count' => (int) $attempt->answered_count,
                    'started_at' => $attempt->started_at?->toISOString(),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    protected function recentActivity(User $user): array
    {
        return QuizAttempt::query()
            ->with(['quiz:id,title'])
            ->where('user_id', $user->id)
            ->whereIn('status', [
                QuizAttemptStatus::Submitted,
                QuizAttemptStatus::Completed,
            ])
            ->whereNotNull('percentage')
            ->latest('completed_at')
            ->limit(5)
            ->get()
            ->map(fn (QuizAttempt $attempt) => [
                'id' => $attempt->id,
                'quiz_id' => $attempt->quiz_id,
                'quiz_title' => $attempt->quiz?->title ?? 'Deleted quiz',
                'obtained_marks' => (float) $attempt->score,
                'total_marks' => (float) $attempt->total_marks,
                'percentage' => (float) $attempt->percentage,
                'is_passed' => (bool) $attempt->is_passed,
                'completed_at' => $attempt->completed_at?->toISOString(),
            ])
            ->values()
            ->all();
    }
}
