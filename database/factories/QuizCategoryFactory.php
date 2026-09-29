<?php

namespace Database\Factories;

use App\Enums\UserStatus;
use App\Models\QuizCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QuizCategory>
 */
class QuizCategoryFactory extends Factory
{
    protected $model = QuizCategory::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'name' => ucwords($name),
            'slug' => QuizCategory::generateUniqueSlug($name),
            'description' => fake()->optional()->sentence(),
            'status' => UserStatus::Active,
        ];
    }

    /**
     * Indicate that the category is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => UserStatus::Inactive,
        ]);
    }
}
