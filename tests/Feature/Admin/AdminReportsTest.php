<?php

namespace Tests\Feature\Admin;

use App\Enums\QuizAttemptStatus;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminReportsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_reports_page(): void
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
            'completed_at' => now()->subDay(),
            'started_at' => now()->subDay()->subMinutes(12),
            'percentage' => 85,
            'score' => 8.5,
            'total_marks' => 10,
        ]);

        QuizAttempt::factory()->failed()->create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'completed_at' => now()->subDays(2),
            'started_at' => now()->subDays(2)->subMinutes(8),
            'percentage' => 40,
            'score' => 4,
            'total_marks' => 10,
        ]);

        QuizAttempt::factory()->create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'status' => QuizAttemptStatus::InProgress,
        ]);

        $response = $this->actingAs($admin)->get(route('admin.reports'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/reports/index')
            ->where('stats.totalAttempts', 2)
            ->where('stats.totalParticipants', 1)
            ->where('passFail.passed', 1)
            ->where('passFail.failed', 1)
            ->has('attemptsOverview')
            ->has('quizPerformance', 1)
            ->has('categoryPerformance', 1)
            ->has('topPerformers', 1)
            ->where('hasData', true)
        );
    }

    public function test_reports_filters_work_together(): void
    {
        $admin = User::factory()->admin()->create();
        $matchedUser = User::factory()->create(['name' => 'Rakesh Patel']);
        $otherUser = User::factory()->create(['name' => 'Other User']);

        $phpCategory = QuizCategory::factory()->create(['name' => 'PHP']);
        $reactCategory = QuizCategory::factory()->create(['name' => 'React']);

        $phpQuiz = Quiz::factory()->create([
            'title' => 'PHP Basics',
            'category_id' => $phpCategory->id,
        ]);
        $reactQuiz = Quiz::factory()->create([
            'title' => 'React Basics',
            'category_id' => $reactCategory->id,
        ]);

        QuizAttempt::factory()->passed()->create([
            'user_id' => $matchedUser->id,
            'quiz_id' => $phpQuiz->id,
            'completed_at' => now()->setDate(2026, 8, 10),
            'percentage' => 90,
        ]);
        QuizAttempt::factory()->failed()->create([
            'user_id' => $matchedUser->id,
            'quiz_id' => $phpQuiz->id,
            'completed_at' => now()->setDate(2026, 8, 12),
            'percentage' => 40,
        ]);
        QuizAttempt::factory()->passed()->create([
            'user_id' => $otherUser->id,
            'quiz_id' => $reactQuiz->id,
            'completed_at' => now()->setDate(2026, 8, 11),
            'percentage' => 80,
        ]);

        $response = $this->actingAs($admin)->get(route('admin.reports', [
            'date_from' => '2026-08-01',
            'date_to' => '2026-08-17',
            'quiz_id' => $phpQuiz->id,
            'category_id' => $phpCategory->id,
            'user_id' => $matchedUser->id,
            'status' => 'passed',
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('stats.totalAttempts', 1)
            ->where('passFail.passed', 1)
            ->where('passFail.failed', 0)
            ->where('quizPerformance.0.title', 'PHP Basics')
            ->where('topPerformers.0.name', 'Rakesh Patel')
            ->where('hasData', true)
        );
    }

    public function test_reports_empty_filters_return_zero_stats(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get(route('admin.reports', [
            'date_from' => '2099-01-01',
            'date_to' => '2099-01-31',
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('stats.totalAttempts', 0)
            ->where('stats.averageScore', 0)
            ->where('stats.passRate', 0)
            ->where('stats.failRate', 0)
            ->where('stats.totalParticipants', 0)
            ->where('hasData', false)
            ->has('quizPerformance', 0)
            ->has('topPerformers', 0)
        );
    }

    public function test_non_admin_cannot_access_reports(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('admin.reports'))
            ->assertForbidden();
    }
}
