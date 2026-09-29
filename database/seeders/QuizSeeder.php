<?php

namespace Database\Seeders;

use App\Enums\QuizStatus;
use App\Enums\UserStatus;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\QuizCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class QuizSeeder extends Seeder
{
    /**
     * @var array<int, array{title: string, category_slug: string, description: string, duration: int, passing_score: float, max_attempts: int, status: QuizStatus, question_limit: int}>
     */
    private array $quizzes = [
        [
            'title' => 'PHP Fundamentals',
            'category_slug' => 'php',
            'description' => 'Test your knowledge of PHP programming concepts, syntax, OOP, and core language features.',
            'duration' => 20,
            'passing_score' => 60,
            'max_attempts' => 2,
            'status' => QuizStatus::Published,
            'question_limit' => 10,
        ],
        [
            'title' => 'Laravel Basics',
            'category_slug' => 'laravel',
            'description' => 'Assess your understanding of Laravel routing, Eloquent, middleware, Blade, and Artisan.',
            'duration' => 25,
            'passing_score' => 60,
            'max_attempts' => 2,
            'status' => QuizStatus::Published,
            'question_limit' => 8,
        ],
        [
            'title' => 'JavaScript Essentials',
            'category_slug' => 'javascript',
            'description' => 'Cover modern JavaScript fundamentals including ES6+, promises, async/await, and array methods.',
            'duration' => 20,
            'passing_score' => 60,
            'max_attempts' => 3,
            'status' => QuizStatus::Published,
            'question_limit' => 7,
        ],
        [
            'title' => 'React Fundamentals',
            'category_slug' => 'react',
            'description' => 'Evaluate your knowledge of React components, props, state, and hooks.',
            'duration' => 15,
            'passing_score' => 60,
            'max_attempts' => 2,
            'status' => QuizStatus::Published,
            'question_limit' => 5,
        ],
        [
            'title' => 'MySQL Basics',
            'category_slug' => 'mysql',
            'description' => 'Test SQL fundamentals including SELECT, JOINs, keys, indexes, and aggregation.',
            'duration' => 15,
            'passing_score' => 60,
            'max_attempts' => 2,
            'status' => QuizStatus::Published,
            'question_limit' => 5,
        ],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ($this->quizzes as $quizData) {
            $category = QuizCategory::query()
                ->where('slug', $quizData['category_slug'])
                ->first();

            if (! $category) {
                $this->command?->warn("Category [{$quizData['category_slug']}] not found. Skipping quiz [{$quizData['title']}].");

                continue;
            }

            $questions = Question::query()
                ->where('category_id', $category->id)
                ->where('status', UserStatus::Active)
                ->orderBy('id')
                ->limit($quizData['question_limit'])
                ->get();

            if ($questions->isEmpty()) {
                $this->command?->warn("No active questions found for [{$quizData['category_slug']}]. Skipping quiz [{$quizData['title']}].");

                continue;
            }

            DB::transaction(function () use ($quizData, $category, $questions) {
                $quiz = Quiz::query()->updateOrCreate(
                    ['title' => $quizData['title']],
                    [
                        'category_id' => $category->id,
                        'description' => $quizData['description'],
                        'duration' => $quizData['duration'],
                        'passing_score' => $quizData['passing_score'],
                        'max_attempts' => $quizData['max_attempts'],
                        'status' => $quizData['status'],
                    ],
                );

                $syncData = [];

                foreach ($questions->values() as $order => $question) {
                    $syncData[$question->id] = ['question_order' => $order];
                }

                $quiz->questions()->sync($syncData);
            });
        }
    }
}
