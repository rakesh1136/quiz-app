<?php

namespace Database\Factories;

use App\Enums\QuizStatus;
use App\Models\Quiz;
use App\Models\QuizCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Quiz>
 */
class QuizFactory extends Factory
{
    protected $model = Quiz::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'category_id' => QuizCategory::factory(),
            'title' => fake()->unique()->sentence(3),
            'description' => fake()->optional()->paragraph(),
            'duration' => fake()->randomElement([15, 20, 30, 45]),
            'passing_score' => fake()->randomElement([50, 60, 70]),
            'max_attempts' => fake()->numberBetween(1, 3),
            'status' => QuizStatus::Draft,
        ];
    }

    public function published(): static
    {
        return $this->state(fn () => [
            'status' => QuizStatus::Published,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn () => [
            'status' => QuizStatus::Inactive,
        ]);
    }
}
