<?php

namespace Database\Factories;

use App\Enums\QuizAttemptStatus;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QuizAttempt>
 */
class QuizAttemptFactory extends Factory
{
    protected $model = QuizAttempt::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'quiz_id' => Quiz::factory(),
            'status' => QuizAttemptStatus::InProgress,
            'started_at' => now()->subMinutes(10),
            'completed_at' => null,
            'total_questions' => null,
            'attempted_questions' => null,
            'correct_answers' => null,
            'wrong_answers' => null,
            'unanswered_questions' => null,
            'total_marks' => null,
            'score' => null,
            'percentage' => null,
            'is_passed' => null,
        ];
    }

    public function submitted(array $result = []): static
    {
        $totalQuestions = $result['total_questions'] ?? 10;
        $attempted = $result['attempted_questions'] ?? 8;
        $correct = $result['correct_answers'] ?? 6;
        $wrong = $result['wrong_answers'] ?? 2;
        $unanswered = $result['unanswered_questions'] ?? ($totalQuestions - $attempted);
        $totalMarks = $result['total_marks'] ?? 10;
        $score = $result['score'] ?? 5.5;
        $percentage = $result['percentage'] ?? 55;
        $isPassed = $result['is_passed'] ?? ($percentage >= 60);

        return $this->state(fn () => [
            'status' => QuizAttemptStatus::Submitted,
            'completed_at' => now()->subMinutes(2),
            'total_questions' => $totalQuestions,
            'attempted_questions' => $attempted,
            'correct_answers' => $correct,
            'wrong_answers' => $wrong,
            'unanswered_questions' => $unanswered,
            'total_marks' => $totalMarks,
            'score' => $score,
            'percentage' => $percentage,
            'is_passed' => $isPassed,
        ]);
    }

    public function passed(): static
    {
        return $this->submitted([
            'score' => 8.5,
            'percentage' => 85,
            'is_passed' => true,
            'correct_answers' => 9,
            'wrong_answers' => 1,
            'attempted_questions' => 10,
            'unanswered_questions' => 0,
        ]);
    }

    public function failed(): static
    {
        return $this->submitted([
            'score' => 2.5,
            'percentage' => 25,
            'is_passed' => false,
            'correct_answers' => 3,
            'wrong_answers' => 5,
            'attempted_questions' => 8,
            'unanswered_questions' => 2,
        ]);
    }
}
