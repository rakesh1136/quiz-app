<?php

namespace Tests\Feature\Admin;

use App\Enums\QuizStatus;
use App\Enums\UserStatus;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\QuizCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminQuizManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_quizzes_index(): void
    {
        $admin = User::factory()->admin()->create();
        Quiz::factory()->count(2)->create();

        $response = $this->actingAs($admin)->get(route('admin.quizzes.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/quizzes/index')
            ->has('quizzes.data', 2)
        );
    }

    public function test_quizzes_index_can_search_and_filter(): void
    {
        $admin = User::factory()->admin()->create();
        $php = QuizCategory::factory()->create(['name' => 'PHP']);
        $react = QuizCategory::factory()->create(['name' => 'React']);

        Quiz::factory()->create([
            'title' => 'PHP Fundamentals',
            'category_id' => $php->id,
            'status' => QuizStatus::Published,
        ]);

        Quiz::factory()->create([
            'title' => 'React Basics',
            'category_id' => $react->id,
            'status' => QuizStatus::Draft,
        ]);

        $response = $this->actingAs($admin)->get(route('admin.quizzes.index', [
            'search' => 'PHP',
            'category_id' => $php->id,
            'status' => QuizStatus::Published->value,
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->has('quizzes.data', 1)
            ->where('quizzes.data.0.title', 'PHP Fundamentals')
        );
    }

    public function test_admin_can_create_draft_quiz_without_questions(): void
    {
        $admin = User::factory()->admin()->create();
        $category = QuizCategory::factory()->create(['status' => UserStatus::Active]);

        $response = $this->actingAs($admin)->post(route('admin.quizzes.store'), [
            'title' => 'Draft Quiz',
            'category_id' => $category->id,
            'description' => 'Draft description',
            'duration' => 20,
            'passing_score' => 60,
            'max_attempts' => 2,
            'status' => QuizStatus::Draft->value,
            'question_ids' => [],
        ]);

        $response->assertRedirect(route('admin.quizzes.index'));
        $this->assertDatabaseHas('quizzes', [
            'title' => 'Draft Quiz',
            'slug' => 'draft-quiz',
            'status' => QuizStatus::Draft->value,
        ]);
    }

    public function test_admin_cannot_publish_quiz_without_questions(): void
    {
        $admin = User::factory()->admin()->create();
        $category = QuizCategory::factory()->create(['status' => UserStatus::Active]);

        $response = $this->actingAs($admin)->post(route('admin.quizzes.store'), [
            'title' => 'Empty Published Quiz',
            'category_id' => $category->id,
            'duration' => 20,
            'passing_score' => 60,
            'max_attempts' => 1,
            'status' => QuizStatus::Published->value,
            'question_ids' => [],
        ]);

        $response->assertSessionHasErrors('question_ids');
    }

    public function test_admin_can_create_quiz_with_selected_questions(): void
    {
        $admin = User::factory()->admin()->create();
        $category = QuizCategory::factory()->create(['status' => UserStatus::Active]);
        $questions = Question::factory()->count(3)->create([
            'category_id' => $category->id,
            'status' => UserStatus::Active,
        ]);

        $response = $this->actingAs($admin)->post(route('admin.quizzes.store'), [
            'title' => 'PHP Fundamentals',
            'category_id' => $category->id,
            'description' => 'PHP quiz',
            'duration' => 20,
            'passing_score' => 60,
            'max_attempts' => 2,
            'status' => QuizStatus::Published->value,
            'question_ids' => $questions->pluck('id')->all(),
        ]);

        $response->assertRedirect(route('admin.quizzes.index'));

        $quiz = Quiz::query()->where('title', 'PHP Fundamentals')->first();

        $this->assertNotNull($quiz);
        $this->assertDatabaseCount('quiz_questions', 3);
        $this->assertSame(3, $quiz->questions()->count());
        $this->assertEquals(3.0, $quiz->totalMarks());
    }

    public function test_admin_can_update_quiz_and_reorder_questions(): void
    {
        $admin = User::factory()->admin()->create();
        $category = QuizCategory::factory()->create(['status' => UserStatus::Active]);
        $quiz = Quiz::factory()->create(['category_id' => $category->id]);
        $questions = Question::factory()->count(2)->create([
            'category_id' => $category->id,
            'status' => UserStatus::Active,
        ]);

        $quiz->questions()->sync([
            $questions[0]->id => ['question_order' => 0],
            $questions[1]->id => ['question_order' => 1],
        ]);

        $response = $this->actingAs($admin)->put(route('admin.quizzes.update', $quiz), [
            'title' => 'Updated Quiz Title',
            'category_id' => $category->id,
            'description' => 'Updated',
            'duration' => 30,
            'passing_score' => 70,
            'max_attempts' => 3,
            'status' => QuizStatus::Draft->value,
            'question_ids' => [$questions[1]->id, $questions[0]->id],
        ]);

        $response->assertRedirect(route('admin.quizzes.index'));

        $this->assertDatabaseHas('quizzes', [
            'id' => $quiz->id,
            'title' => 'Updated Quiz Title',
            'slug' => 'updated-quiz-title',
        ]);

        $this->assertDatabaseHas('quiz_questions', [
            'quiz_id' => $quiz->id,
            'question_id' => $questions[1]->id,
            'question_order' => 0,
        ]);
    }

    public function test_admin_can_publish_and_unpublish_quiz(): void
    {
        $admin = User::factory()->admin()->create();
        $category = QuizCategory::factory()->create(['status' => UserStatus::Active]);
        $quiz = Quiz::factory()->create([
            'category_id' => $category->id,
            'status' => QuizStatus::Draft,
        ]);
        $question = Question::factory()->create([
            'category_id' => $category->id,
            'status' => UserStatus::Active,
        ]);
        $quiz->questions()->sync([
            $question->id => ['question_order' => 0],
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.quizzes.publish', $quiz))
            ->assertRedirect(route('admin.quizzes.index'));

        $this->assertDatabaseHas('quizzes', [
            'id' => $quiz->id,
            'status' => QuizStatus::Published->value,
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.quizzes.unpublish', $quiz))
            ->assertRedirect(route('admin.quizzes.index'));

        $this->assertDatabaseHas('quizzes', [
            'id' => $quiz->id,
            'status' => QuizStatus::Draft->value,
        ]);
    }

    public function test_deleting_quiz_removes_pivot_but_keeps_questions(): void
    {
        $admin = User::factory()->admin()->create();
        $quiz = Quiz::factory()->create();
        $question = Question::factory()->create();
        $quiz->questions()->sync([
            $question->id => ['question_order' => 0],
        ]);

        $this->actingAs($admin)
            ->delete(route('admin.quizzes.destroy', $quiz))
            ->assertRedirect(route('admin.quizzes.index'));

        $this->assertDatabaseMissing('quizzes', ['id' => $quiz->id]);
        $this->assertDatabaseMissing('quiz_questions', ['quiz_id' => $quiz->id]);
        $this->assertDatabaseHas('questions', ['id' => $question->id]);
    }

    public function test_normal_user_cannot_access_quizzes(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('admin.quizzes.index'))
            ->assertForbidden();
    }
}
