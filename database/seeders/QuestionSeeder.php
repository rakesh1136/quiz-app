<?php

namespace Database\Seeders;

use App\Enums\QuestionDifficulty;
use App\Enums\UserStatus;
use App\Models\Question;
use App\Models\QuizCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class QuestionSeeder extends Seeder
{
    private const MARKS = 1;

    private const NEGATIVE_MARKS = 0.25;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /** @var array<string, array<int, array<string, mixed>>> $questionsBySlug */
        $questionsBySlug = require __DIR__.'/data/demo_questions.php';

        foreach ($questionsBySlug as $categorySlug => $questions) {
            $category = QuizCategory::query()->where('slug', $categorySlug)->first();

            if (! $category) {
                $this->command?->warn("Category with slug [{$categorySlug}] not found. Skipping its questions.");

                continue;
            }

            foreach ($questions as $questionData) {
                DB::transaction(function () use ($category, $questionData) {
                    $question = Question::query()->updateOrCreate(
                        [
                            'category_id' => $category->id,
                            'question' => $questionData['question'],
                        ],
                        [
                            'difficulty' => QuestionDifficulty::from($questionData['difficulty']),
                            'marks' => self::MARKS,
                            'negative_marks' => self::NEGATIVE_MARKS,
                            'explanation' => $questionData['explanation'],
                            'status' => UserStatus::Active,
                        ],
                    );

                    foreach ($questionData['options'] as $index => $optionText) {
                        $question->options()->updateOrCreate(
                            ['sort_order' => $index],
                            [
                                'option_text' => $optionText,
                                'is_correct' => $index === $questionData['correct'],
                            ],
                        );
                    }
                });
            }
        }
    }
}
