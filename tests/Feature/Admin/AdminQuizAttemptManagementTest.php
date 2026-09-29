<?php

namespace Tests\Feature\Admin;

use App\Enums\QuizAttemptStatus;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizAttemptAnswer;
use App\Models\QuizCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminQuizAttemptManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_attempts_index(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create(['name' => 'Rakesh Patel']);
        $quiz = Quiz::factory()->create(['title' => 'PHP Basics']);

        QuizAttempt::factory()->passed()->create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
        ]);

        QuizAttempt::factory()->create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'status' => QuizAttemptStatus::InProgress,
        ]);

        $response = $this->actingAs($admin)->get(route('admin.attempts.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/attempts/index')
            ->has('attempts.data', 1)
            ->where('attempts.data.0.user.name', 'Rakesh Patel')
            ->where('attempts.data.0.quiz.title', 'PHP Basics')
            ->where('attempts.data.0.status', 'passed')
        );
    }

    public function test_attempts_index_can_search_by_user_and_quiz(): void
    {
        $admin = User::factory()->admin()->create();
        $matchedUser = User::factory()->create([
            'name' => 'Rakesh Patel',
            'email' => 'rakesh@example.com',
        ]);
        $otherUser = User::factory()->create(['name' => 'Other User']);

        $matchedQuiz = Quiz::factory()->create(['title' => 'Laravel Basics']);
        $otherQuiz = Quiz::factory()->create(['title' => 'React Hooks']);

        QuizAttempt::factory()->passed()->create([
            'user_id' => $matchedUser->id,
            'quiz_id' => $matchedQuiz->id,
        ]);
        QuizAttempt::factory()->failed()->create([
            'user_id' => $otherUser->id,
            'quiz_id' => $otherQuiz->id,
        ]);

        $response = $this->actingAs($admin)->get(route('admin.attempts.index', [
            'search' => 'Rakesh',
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->has('attempts.data', 1)
            ->where('attempts.data.0.user.name', 'Rakesh Patel')
        );

        $response = $this->actingAs($admin)->get(route('admin.attempts.index', [
            'search' => 'Laravel',
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->has('attempts.data', 1)
            ->where('attempts.data.0.quiz.title', 'Laravel Basics')
        );
    }

    public function test_attempts_index_filters_work_together(): void
    {
        $admin = User::factory()->admin()->create();
        $category = QuizCategory::factory()->create(['name' => 'PHP']);
        $otherCategory = QuizCategory::factory()->create(['name' => 'React']);

        $user = User::factory()->create(['name' => 'Rakesh Patel']);
        $quiz = Quiz::factory()->create([
            'title' => 'PHP Basics',
            'category_id' => $category->id,
        ]);
        $otherQuiz = Quiz::factory()->create([
            'title' => 'React Hooks',
            'category_id' => $otherCategory->id,
        ]);

        QuizAttempt::factory()->passed()->create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
        ]);
        QuizAttempt::factory()->failed()->create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
        ]);
        QuizAttempt::factory()->passed()->create([
            'user_id' => $user->id,
            'quiz_id' => $otherQuiz->id,
        ]);

        $response = $this->actingAs($admin)->get(route('admin.attempts.index', [
            'search' => 'Rakesh',
            'status' => 'passed',
            'quiz_id' => $quiz->id,
            'category_id' => $category->id,
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->has('attempts.data', 1)
            ->where('attempts.data.0.quiz.title', 'PHP Basics')
            ->where('attempts.data.0.status', 'passed')
        );
    }

    public function test_admin_can_view_attempt_summary(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create(['name' => 'Rakesh Patel']);
        $quiz = Quiz::factory()->create(['title' => 'PHP Basics']);

        $attempt = QuizAttempt::factory()->passed()->create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
        ]);

        $response = $this->actingAs($admin)->get(route('admin.attempts.show', $attempt));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/attempts/show')
            ->where('attempt.id', $attempt->id)
            ->where('attempt.user.name', 'Rakesh Patel')
            ->where('attempt.quiz.title', 'PHP Basics')
            ->where('attempt.status', 'passed')
            ->where('attempt.score', 8.5)
            ->where('attempt.percentage', 85)
        );
    }

    public function test_admin_attempt_review_shows_correct_wrong_and_unanswered_answers(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create(['name' => 'Rakesh Patel']);
        $quiz = Quiz::factory()->create(['title' => 'PHP Basics']);

        $questions = Question::factory()->count(3)->create([
            'marks' => 1,
            'negative_marks' => 0.25,
        ]);

        $quiz->questions()->attach(
            $questions->values()->mapWithKeys(
                fn (Question $question, int $index) => [
                    $question->id => ['question_order' => $index + 1],
                ],
            )->all(),
        );

        $attempt = QuizAttempt::factory()->submitted([
            'total_questions' => 3,
            'attempted_questions' => 2,
            'correct_answers' => 1,
            'wrong_answers' => 1,
            'unanswered_questions' => 1,
            'total_marks' => 3,
            'score' => 0.75,
            'percentage' => 25,
            'is_passed' => false,
        ])->create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
        ]);

        $correctOption = $questions[0]->options()->where('is_correct', true)->firstOrFail();
        $wrongOption = $questions[1]->options()->where('is_correct', false)->firstOrFail();

        QuizAttemptAnswer::create([
            'quiz_attempt_id' => $attempt->id,
            'question_id' => $questions[0]->id,
            'selected_option_id' => $correctOption->id,
        ]);
        QuizAttemptAnswer::create([
            'quiz_attempt_id' => $attempt->id,
            'question_id' => $questions[1]->id,
            'selected_option_id' => $wrongOption->id,
        ]);

        $response = $this->actingAs($admin)->get(route('admin.attempts.show', [
            'attempt' => $attempt,
            'search' => 'Rakesh',
            'status' => 'failed',
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/attempts/show')
            ->has('questions', 3)
            ->where('questions.0.status', 'correct')
            ->where('questions.0.marks_awarded', 1)
            ->where('questions.0.selected_option_id', $correctOption->id)
            ->where('questions.0.correct_option_id', $correctOption->id)
            ->where('questions.1.status', 'wrong')
            ->where('questions.1.marks_awarded', -0.25)
            ->where('questions.1.selected_option_id', $wrongOption->id)
            ->where('questions.2.status', 'unanswered')
            ->where('questions.2.marks_awarded', 0)
            ->where('questions.2.selected_option_id', null)
            ->where('attempt.score', 0.75)
            ->where('attempt.percentage', 25)
            ->where('attempt.status', 'failed')
            ->where('backUrl', route('admin.attempts.index', [
                'search' => 'Rakesh',
                'status' => 'failed',
            ]))
        );
    }

    public function test_in_progress_attempts_are_not_viewable(): void
    {
        $admin = User::factory()->admin()->create();
        $attempt = QuizAttempt::factory()->create();

        $response = $this->actingAs($admin)->get(route('admin.attempts.show', $attempt));

        $response->assertNotFound();
    }

    public function test_non_admin_cannot_access_attempts(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('admin.attempts.index'))
            ->assertForbidden();
    }
}
