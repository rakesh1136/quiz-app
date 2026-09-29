<?php

namespace Database\Factories;

use App\Enums\QuestionDifficulty;
use App\Enums\UserStatus;
use App\Models\Question;
use App\Models\QuizCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Question>
 */
class QuestionFactory extends Factory
{
    protected $model = Question::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'category_id' => QuizCategory::factory(),
            'question' => fake()->sentence().'?',
            'difficulty' => fake()->randomElement(QuestionDifficulty::cases()),
            'marks' => fake()->randomElement([1, 2, 3, 5]),
            'negative_marks' => fake()->randomElement([0, 0.25, 0.5, 1]),
            'explanation' => fake()->optional()->sentence(),
            'status' => UserStatus::Active,
        ];
    }

    /**
     * Configure the model factory.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (Question $question) {
            $labels = ['Option A', 'Option B', 'Option C', 'Option D'];
            $correctIndex = fake()->numberBetween(0, 3);

            foreach ($labels as $index => $label) {
                $question->options()->create([
                    'option_text' => $label.' for '.$question->question,
                    'is_correct' => $index === $correctIndex,
                    'sort_order' => $index,
                ]);
            }
        });
    }
}
