<?php

namespace Tests\Feature\Admin;

use App\Enums\QuestionDifficulty;
use App\Enums\UserStatus;
use App\Models\Question;
use App\Models\QuizCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminQuestionManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_questions_index(): void
    {
        $admin = User::factory()->admin()->create();
        Question::factory()->count(3)->create();

        $response = $this->actingAs($admin)->get(route('admin.questions.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/questions/index')
            ->has('questions.data', 3)
        );
    }

    public function test_questions_index_can_search_by_question_text(): void
    {
        $admin = User::factory()->admin()->create();
        Question::factory()->create(['question' => 'What is Laravel Service Container?']);
        Question::factory()->create(['question' => 'What is React useState hook?']);

        $response = $this->actingAs($admin)->get(route('admin.questions.index', [
            'search' => 'Laravel',
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->has('questions.data', 1)
            ->where('questions.data.0.question', 'What is Laravel Service Container?')
        );
    }

    public function test_questions_index_can_filter_by_category_difficulty_and_status(): void
    {
        $admin = User::factory()->admin()->create();
        $laravel = QuizCategory::factory()->create(['name' => 'Laravel']);
        $react = QuizCategory::factory()->create(['name' => 'React']);

        Question::factory()->create([
            'category_id' => $laravel->id,
            'question' => 'Laravel middleware question?',
            'difficulty' => QuestionDifficulty::Hard,
            'status' => UserStatus::Active,
        ]);

        Question::factory()->create([
            'category_id' => $react->id,
            'question' => 'React hooks question?',
            'difficulty' => QuestionDifficulty::Easy,
            'status' => UserStatus::Inactive,
        ]);

        $response = $this->actingAs($admin)->get(route('admin.questions.index', [
            'category_id' => $laravel->id,
            'difficulty' => QuestionDifficulty::Hard->value,
            'status' => UserStatus::Active->value,
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->has('questions.data', 1)
            ->where('questions.data.0.question', 'Laravel middleware question?')
        );
    }

    public function test_admin_can_create_question_with_four_options(): void
    {
        $admin = User::factory()->admin()->create();
        $category = QuizCategory::factory()->create(['status' => UserStatus::Active]);

        $response = $this->actingAs($admin)->post(route('admin.questions.store'), [
            'category_id' => $category->id,
            'question' => 'What is Laravel Service Container?',
            'options' => [
                ['option_text' => 'Blade'],
                ['option_text' => 'Service Container'],
                ['option_text' => 'Middleware'],
                ['option_text' => 'Eloquent'],
            ],
            'correct_option_index' => 1,
            'difficulty' => QuestionDifficulty::Medium->value,
            'marks' => 2,
            'negative_marks' => 0.5,
            'explanation' => 'The service container manages dependencies.',
            'status' => UserStatus::Active->value,
        ]);

        $response->assertRedirect(route('admin.questions.index'));

        $question = Question::query()->where('question', 'What is Laravel Service Container?')->first();

        $this->assertNotNull($question);
        $this->assertDatabaseCount('question_options', 4);
        $this->assertDatabaseHas('question_options', [
            'question_id' => $question->id,
            'option_text' => 'Service Container',
            'is_correct' => true,
        ]);
    }

    public function test_admin_cannot_create_question_with_duplicate_options(): void
    {
        $admin = User::factory()->admin()->create();
        $category = QuizCategory::factory()->create(['status' => UserStatus::Active]);

        $response = $this->actingAs($admin)->post(route('admin.questions.store'), [
            'category_id' => $category->id,
            'question' => 'Duplicate options question?',
            'options' => [
                ['option_text' => 'Same'],
                ['option_text' => 'Same'],
                ['option_text' => 'Different'],
                ['option_text' => 'Another'],
            ],
            'correct_option_index' => 0,
            'difficulty' => QuestionDifficulty::Easy->value,
            'marks' => 1,
            'negative_marks' => 0,
            'status' => UserStatus::Active->value,
        ]);

        $response->assertSessionHasErrors('options');
    }

    public function test_admin_cannot_create_question_with_inactive_category(): void
    {
        $admin = User::factory()->admin()->create();
        $category = QuizCategory::factory()->inactive()->create();

        $response = $this->actingAs($admin)->post(route('admin.questions.store'), [
            'category_id' => $category->id,
            'question' => 'Inactive category question?',
            'options' => [
                ['option_text' => 'A'],
                ['option_text' => 'B'],
                ['option_text' => 'C'],
                ['option_text' => 'D'],
            ],
            'correct_option_index' => 0,
            'difficulty' => QuestionDifficulty::Easy->value,
            'marks' => 1,
            'negative_marks' => 0,
            'status' => UserStatus::Active->value,
        ]);

        $response->assertSessionHasErrors('category_id');
    }

    public function test_admin_can_update_question_and_change_correct_answer(): void
    {
        $admin = User::factory()->admin()->create();
        $question = Question::factory()->create();
        $options = $question->options()->orderBy('sort_order')->get();

        $response = $this->actingAs($admin)->put(route('admin.questions.update', $question), [
            'category_id' => $question->category_id,
            'question' => 'Updated question text?',
            'options' => [
                ['option_text' => 'Updated A'],
                ['option_text' => 'Updated B'],
                ['option_text' => 'Updated C'],
                ['option_text' => 'Updated D'],
            ],
            'correct_option_index' => 2,
            'difficulty' => QuestionDifficulty::Hard->value,
            'marks' => 3,
            'negative_marks' => 1,
            'explanation' => 'Updated explanation',
            'status' => UserStatus::Inactive->value,
        ]);

        $response->assertRedirect(route('admin.questions.index'));

        $this->assertDatabaseHas('questions', [
            'id' => $question->id,
            'question' => 'Updated question text?',
            'difficulty' => QuestionDifficulty::Hard->value,
            'status' => UserStatus::Inactive->value,
        ]);

        $this->assertDatabaseHas('question_options', [
            'id' => $options[2]->id,
            'option_text' => 'Updated C',
            'is_correct' => true,
        ]);
    }

    public function test_admin_can_view_question_details(): void
    {
        $admin = User::factory()->admin()->create();
        $question = Question::factory()->create();

        $response = $this->actingAs($admin)->get(route('admin.questions.show', $question));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/questions/show')
            ->where('question.id', $question->id)
            ->has('question.options', 4)
        );
    }

    public function test_admin_can_delete_question_and_options(): void
    {
        $admin = User::factory()->admin()->create();
        $question = Question::factory()->create();
        $optionIds = $question->options()->pluck('id')->all();

        $response = $this->actingAs($admin)->delete(route('admin.questions.destroy', $question));

        $response->assertRedirect(route('admin.questions.index'));
        $this->assertDatabaseMissing('questions', ['id' => $question->id]);

        foreach ($optionIds as $optionId) {
            $this->assertDatabaseMissing('question_options', ['id' => $optionId]);
        }
    }

    public function test_category_show_displays_real_question_count(): void
    {
        $admin = User::factory()->admin()->create();
        $category = QuizCategory::factory()->create();
        Question::factory()->count(2)->create(['category_id' => $category->id]);

        $response = $this->actingAs($admin)->get(route('admin.categories.show', $category));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('category.questions_count', 2)
        );
    }

    public function test_normal_user_cannot_access_question_bank(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('admin.questions.index'))
            ->assertForbidden();
    }
}
