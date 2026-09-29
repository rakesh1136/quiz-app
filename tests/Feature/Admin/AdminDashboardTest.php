<?php

namespace Tests\Feature\Admin;

use App\Enums\QuizAttemptStatus;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_displays_database_statistics_and_attempt_data(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();
        $quiz = Quiz::factory()->published()->create();

        Question::factory()->create();

        QuizAttempt::query()->create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'status' => QuizAttemptStatus::Submitted,
            'started_at' => now()->subMinutes(10),
            'completed_at' => now()->subMinutes(5),
            'total_questions' => 1,
            'attempted_questions' => 1,
            'correct_answers' => 1,
            'wrong_answers' => 0,
            'unanswered_questions' => 0,
            'total_marks' => 1,
            'score' => 1,
            'percentage' => 100,
            'is_passed' => true,
        ]);

        QuizAttempt::query()->create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'status' => QuizAttemptStatus::Submitted,
            'started_at' => now()->subMinutes(8),
            'completed_at' => now()->subMinutes(2),
            'total_questions' => 1,
            'attempted_questions' => 1,
            'correct_answers' => 0,
            'wrong_answers' => 1,
            'unanswered_questions' => 0,
            'total_marks' => 1,
            'score' => 0,
            'percentage' => 0,
            'is_passed' => false,
        ]);

        QuizAttempt::query()->create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'status' => QuizAttemptStatus::InProgress,
            'started_at' => now(),
        ]);

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')
            ->where('stats.totalUsers', 2)
            ->where('stats.totalQuizzes', 1)
            ->where('stats.totalAttempts', 3)
            ->where('stats.totalQuestions', 1)
            ->where('stats.completedAttempts', 2)
            ->where('stats.passedAttempts', 1)
            ->where('stats.failedAttempts', 1)
            ->where('stats.averageScore', 50)
            ->has('attemptsOverview', 7)
            ->where('performance.passed', 1)
            ->where('performance.failed', 1)
            ->has('recentAttempts', 2)
            ->where('recentAttempts.0.user', $user->name)
            ->where('recentAttempts.0.quiz', $quiz->title)
            ->where('recentAttempts.0.is_passed', false)
        );
    }

    public function test_dashboard_handles_no_quiz_attempts(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')
            ->where('stats.totalAttempts', 0)
            ->where('stats.completedAttempts', 0)
            ->where('stats.passedAttempts', 0)
            ->where('stats.failedAttempts', 0)
            ->where('stats.averageScore', 0)
            ->has('attemptsOverview', 7)
            ->has('recentAttempts', 0)
        );
    }
}
