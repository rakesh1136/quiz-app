<?php

namespace Tests\Feature\Admin;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminExportReportsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_export_reports_page(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();
        $quiz = Quiz::factory()->create();

        QuizAttempt::factory()->passed()->create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'completed_at' => now(),
        ]);

        $response = $this->actingAs($admin)->get(route('admin.export-reports.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/export-reports/index')
            ->where('recordCount', 1)
            ->where('hasData', true)
            ->where('filters.report_type', 'quiz_attempts')
        );
    }

    public function test_export_filters_update_record_count(): void
    {
        $admin = User::factory()->admin()->create();
        $matchedUser = User::factory()->create();
        $otherUser = User::factory()->create();
        $category = QuizCategory::factory()->create(['name' => 'Laravel']);
        $quiz = Quiz::factory()->create([
            'title' => 'Laravel Basics',
            'category_id' => $category->id,
        ]);
        $otherQuiz = Quiz::factory()->create();

        QuizAttempt::factory()->passed()->create([
            'user_id' => $matchedUser->id,
            'quiz_id' => $quiz->id,
            'completed_at' => now()->setDate(2026, 8, 10),
            'percentage' => 90,
        ]);
        QuizAttempt::factory()->failed()->create([
            'user_id' => $matchedUser->id,
            'quiz_id' => $quiz->id,
            'completed_at' => now()->setDate(2026, 8, 12),
            'percentage' => 40,
        ]);
        QuizAttempt::factory()->passed()->create([
            'user_id' => $otherUser->id,
            'quiz_id' => $otherQuiz->id,
            'completed_at' => now()->setDate(2026, 8, 11),
            'percentage' => 85,
        ]);

        $response = $this->actingAs($admin)->get(route('admin.export-reports.index', [
            'report_type' => 'quiz_attempts',
            'date_from' => '2026-08-01',
            'date_to' => '2026-08-20',
            'user_id' => $matchedUser->id,
            'quiz_id' => $quiz->id,
            'category_id' => $category->id,
            'status' => 'passed',
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('recordCount', 1)
            ->where('hasData', true)
        );
    }

    public function test_admin_can_export_quiz_attempts_csv(): void
    {
        $admin = User::factory()->admin()->create([
            'name' => 'Rakesh Patel',
            'email' => 'rakesh@example.com',
        ]);
        $quiz = Quiz::factory()->create(['title' => 'PHP Basics']);

        QuizAttempt::factory()->passed()->create([
            'user_id' => $admin->id,
            'quiz_id' => $quiz->id,
            'score' => 8,
            'percentage' => 80,
            'correct_answers' => 8,
            'wrong_answers' => 1,
            'unanswered_questions' => 1,
            'started_at' => now()->subMinutes(10),
            'completed_at' => now()->subMinutes(2),
        ]);

        $response = $this->actingAs($admin)->get(route('admin.export-reports.export', [
            'report_type' => 'quiz_attempts',
            'format' => 'csv',
        ]));

        $response->assertOk();
        $response->assertHeader('content-disposition');
        $content = $response->streamedContent();
        $this->assertStringContainsString('User Name', $content);
        $this->assertStringContainsString('Rakesh Patel', $content);
        $this->assertStringContainsString('PHP Basics', $content);
        $this->assertStringContainsString('Passed', $content);
    }

    public function test_admin_can_export_user_performance_excel(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create(['name' => 'Export User']);
        $quiz = Quiz::factory()->create();

        QuizAttempt::factory()->passed()->create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'score' => 9,
            'percentage' => 90,
            'completed_at' => now(),
        ]);
        QuizAttempt::factory()->failed()->create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'score' => 2,
            'percentage' => 20,
            'completed_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($admin)->get(route('admin.export-reports.export', [
            'report_type' => 'user_performance',
            'format' => 'xlsx',
        ]));

        $response->assertOk();
        $this->assertStringContainsString(
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            (string) $response->headers->get('content-type'),
        );
        $this->assertNotEmpty($response->streamedContent());
    }

    public function test_admin_can_export_quiz_performance_csv(): void
    {
        $admin = User::factory()->admin()->create();
        $category = QuizCategory::factory()->create(['name' => 'PHP']);
        $quiz = Quiz::factory()->create([
            'title' => 'PHP Basics',
            'category_id' => $category->id,
        ]);
        $user = User::factory()->create();

        QuizAttempt::factory()->passed()->create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'score' => 8,
            'percentage' => 80,
            'started_at' => now()->subMinutes(12),
            'completed_at' => now()->subMinutes(2),
        ]);

        $response = $this->actingAs($admin)->get(route('admin.export-reports.export', [
            'report_type' => 'quiz_performance',
            'format' => 'csv',
        ]));

        $response->assertOk();
        $content = $response->streamedContent();
        $this->assertStringContainsString('Quiz Name', $content);
        $this->assertStringContainsString('PHP Basics', $content);
        $this->assertStringContainsString('Pass Rate', $content);
    }

    public function test_empty_filters_return_validation_error_on_export(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get(route('admin.export-reports.export', [
            'report_type' => 'quiz_attempts',
            'format' => 'csv',
            'status' => 'passed',
            'date_from' => '2099-01-01',
            'date_to' => '2099-01-31',
        ]));

        $response->assertStatus(422);
        $response->assertJson([
            'message' => 'No data available for the selected filters.',
        ]);
    }

    public function test_non_admin_cannot_access_export_reports(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('admin.export-reports.index'))
            ->assertForbidden();
    }
}
