<?php

namespace Tests\Feature\Admin;

use App\Models\Question;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizAttemptAnswer;
use App\Models\QuizCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminQuizPerformanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_quiz_performance_index(): void
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
            'started_at' => now()->subMinutes(20),
            'completed_at' => now()->subMinutes(5),
        ]);

        $response = $this->actingAs($admin)->get(route('admin.quiz-performance.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/quiz-performance/index')
            ->where('stats.totalQuizzes', 1)
            ->where('stats.totalAttempts', 1)
            ->has('quizzes.data', 1)
            ->where('quizzes.data.0.title', 'PHP Basics')
            ->where('hasData', true)
        );
    }

    public function test_quiz_performance_search_and_filters_work(): void
    {
        $admin = User::factory()->admin()->create();
        $php = QuizCategory::factory()->create(['name' => 'PHP']);
        $react = QuizCategory::factory()->create(['name' => 'React']);
        $phpQuiz = Quiz::factory()->create([
            'title' => 'Laravel Basics',
            'category_id' => $php->id,
        ]);
        $reactQuiz = Quiz::factory()->create([
            'title' => 'React Basics',
            'category_id' => $react->id,
        ]);
        $user = User::factory()->create();

        QuizAttempt::factory()->passed()->create([
            'user_id' => $user->id,
            'quiz_id' => $phpQuiz->id,
            'completed_at' => now()->setDate(2026, 8, 10),
            'percentage' => 90,
        ]);
        QuizAttempt::factory()->failed()->create([
            'user_id' => $user->id,
            'quiz_id' => $phpQuiz->id,
            'completed_at' => now()->setDate(2026, 8, 12),
            'percentage' => 40,
        ]);
        QuizAttempt::factory()->passed()->create([
            'user_id' => $user->id,
            'quiz_id' => $reactQuiz->id,
            'completed_at' => now()->setDate(2026, 8, 11),
            'percentage' => 85,
        ]);

        $response = $this->actingAs($admin)->get(route('admin.quiz-performance.index', [
            'search' => 'Laravel',
            'category_id' => $php->id,
            'quiz_id' => $phpQuiz->id,
            'date_from' => '2026-08-01',
            'date_to' => '2026-08-20',
            'status' => 'passed',
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('stats.totalQuizzes', 1)
            ->where('stats.totalAttempts', 1)
            ->has('quizzes.data', 1)
            ->where('quizzes.data.0.title', 'Laravel Basics')
        );
    }

    public function test_admin_can_view_quiz_performance_details_with_question_stats(): void
    {
        $admin = User::factory()->admin()->create();
        $category = QuizCategory::factory()->create(['name' => 'PHP']);
        $quiz = Quiz::factory()->create([
            'title' => 'PHP Basics',
            'category_id' => $category->id,
        ]);
        $user = User::factory()->create(['name' => 'Rakesh Patel']);

        $questions = Question::factory()->count(2)->create([
            'category_id' => $category->id,
        ]);

        $quiz->questions()->attach(
            $questions->values()->mapWithKeys(
                fn (Question $question, int $index) => [
                    $question->id => ['question_order' => $index + 1],
                ],
            )->all(),
        );

        $attempt = QuizAttempt::factory()->passed()->create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'score' => 1,
            'percentage' => 50,
            'correct_answers' => 1,
            'wrong_answers' => 0,
            'unanswered_questions' => 1,
            'started_at' => now()->subMinutes(15),
            'completed_at' => now()->subMinutes(5),
        ]);

        $correctOption = $questions[0]->options()->where('is_correct', true)->firstOrFail();

        QuizAttemptAnswer::create([
            'quiz_attempt_id' => $attempt->id,
            'question_id' => $questions[0]->id,
            'selected_option_id' => $correctOption->id,
        ]);

        $response = $this->actingAs($admin)->get(route('admin.quiz-performance.show', $quiz));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/quiz-performance/show')
            ->where('quiz.title', 'PHP Basics')
            ->where('stats.totalAttempts', 1)
            ->where('passFail.passed', 1)
            ->has('scorePerformance', 1)
            ->has('questionPerformance.data', 2)
            ->where('questionPerformance.data.0.correct_answers', 1)
            ->where('questionPerformance.data.1.skipped_answers', 1)
            ->has('recentAttempts.data', 1)
            ->where('recentAttempts.data.0.user_name', 'Rakesh Patel')
            ->has('topPerformers', 1)
            ->where('hasData', true)
        );
    }

    public function test_quiz_without_attempts_shows_empty_details(): void
    {
        $admin = User::factory()->admin()->create();
        $quiz = Quiz::factory()->create();

        $response = $this->actingAs($admin)->get(route('admin.quiz-performance.show', $quiz));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('hasData', false)
            ->where('stats.totalAttempts', 0)
            ->has('recentAttempts.data', 0)
        );
    }

    public function test_non_admin_cannot_access_quiz_performance(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('admin.quiz-performance.index'))
            ->assertForbidden();
    }
}
