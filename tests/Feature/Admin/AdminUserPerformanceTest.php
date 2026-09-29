<?php

namespace Tests\Feature\Admin;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminUserPerformanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_user_performance_index(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create([
            'name' => 'Rakesh Patel',
            'email' => 'rakesh@example.com',
        ]);
        $quiz = Quiz::factory()->create(['title' => 'PHP Basics']);

        QuizAttempt::factory()->passed()->create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'score' => 8.5,
            'percentage' => 85,
            'completed_at' => now()->subDay(),
        ]);
        QuizAttempt::factory()->failed()->create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'score' => 3,
            'percentage' => 30,
            'completed_at' => now()->subDays(2),
        ]);

        $response = $this->actingAs($admin)->get(route('admin.user-performance.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/user-performance/index')
            ->where('stats.totalParticipants', 1)
            ->where('stats.totalAttempts', 2)
            ->has('users.data', 1)
            ->where('users.data.0.name', 'Rakesh Patel')
            ->where('users.data.0.passed_attempts', 1)
            ->where('users.data.0.failed_attempts', 1)
            ->where('hasData', true)
        );
    }

    public function test_user_performance_search_and_filters_work(): void
    {
        $admin = User::factory()->admin()->create();
        $matched = User::factory()->create([
            'name' => 'Rakesh Patel',
            'email' => 'rakesh@example.com',
        ]);
        $other = User::factory()->create([
            'name' => 'Other User',
            'email' => 'other@example.com',
        ]);
        $quiz = Quiz::factory()->create();

        QuizAttempt::factory()->passed()->create([
            'user_id' => $matched->id,
            'quiz_id' => $quiz->id,
            'completed_at' => now()->setDate(2026, 8, 10),
            'percentage' => 90,
        ]);
        QuizAttempt::factory()->failed()->create([
            'user_id' => $matched->id,
            'quiz_id' => $quiz->id,
            'completed_at' => now()->setDate(2026, 8, 12),
            'percentage' => 40,
        ]);
        QuizAttempt::factory()->passed()->create([
            'user_id' => $other->id,
            'quiz_id' => $quiz->id,
            'completed_at' => now()->setDate(2026, 8, 11),
            'percentage' => 80,
        ]);

        $response = $this->actingAs($admin)->get(route('admin.user-performance.index', [
            'search' => 'Rakesh',
            'date_from' => '2026-08-01',
            'date_to' => '2026-08-20',
            'status' => 'passed',
            'user_id' => $matched->id,
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('stats.totalParticipants', 1)
            ->where('stats.totalAttempts', 1)
            ->has('users.data', 1)
            ->where('users.data.0.name', 'Rakesh Patel')
            ->where('users.data.0.passed_attempts', 1)
        );
    }

    public function test_admin_can_view_user_performance_details(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create(['name' => 'Rakesh Patel']);
        $category = QuizCategory::factory()->create(['name' => 'PHP']);
        $quiz = Quiz::factory()->create([
            'title' => 'PHP Basics',
            'category_id' => $category->id,
        ]);

        QuizAttempt::factory()->passed()->create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'score' => 8.5,
            'percentage' => 85,
            'correct_answers' => 9,
            'wrong_answers' => 1,
            'unanswered_questions' => 0,
            'completed_at' => now()->subDay(),
        ]);
        QuizAttempt::factory()->failed()->create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'score' => 2,
            'percentage' => 20,
            'correct_answers' => 2,
            'wrong_answers' => 5,
            'unanswered_questions' => 3,
            'completed_at' => now()->subDays(3),
        ]);

        $response = $this->actingAs($admin)->get(route('admin.user-performance.show', $user));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/user-performance/show')
            ->where('user.name', 'Rakesh Patel')
            ->where('stats.totalAttempts', 2)
            ->where('stats.passedAttempts', 1)
            ->where('stats.failedAttempts', 1)
            ->where('answerPerformance.correctAnswers', 11)
            ->where('answerPerformance.incorrectAnswers', 6)
            ->where('answerPerformance.skippedAnswers', 3)
            ->has('performanceTrend', 2)
            ->has('quizPerformance', 1)
            ->has('recentAttempts.data', 2)
            ->where('insights.bestPerformingQuiz.title', 'PHP Basics')
            ->where('hasData', true)
        );
    }

    public function test_user_without_attempts_shows_empty_details(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();

        $response = $this->actingAs($admin)->get(route('admin.user-performance.show', $user));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('hasData', false)
            ->where('stats.totalAttempts', 0)
            ->has('recentAttempts.data', 0)
        );
    }

    public function test_non_admin_cannot_access_user_performance(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('admin.user-performance.index'))
            ->assertForbidden();
    }
}
