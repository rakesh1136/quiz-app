<?php

namespace App\Services;

use App\Enums\QuizAttemptStatus;
use App\Models\Question;
use App\Models\QuizAttempt;
use App\Models\QuizAttemptAnswer;
use Illuminate\Support\Facades\DB;

class QuizAttemptScorer
{
    /**
     * Score and persist an attempt exactly once.
     */
    public function finalize(QuizAttempt $attempt): QuizAttempt
    {
        return DB::transaction(function () use ($attempt): QuizAttempt {
            /** @var QuizAttempt $lockedAttempt */
            $lockedAttempt = QuizAttempt::query()
                ->whereKey($attempt->id)
                ->lockForUpdate()
                ->firstOrFail();

            $lockedAttempt->loadMissing('quiz');

            if ($lockedAttempt->hasStoredResult()) {
                return $lockedAttempt;
            }

            $result = $this->calculate($lockedAttempt);

            $lockedAttempt->forceFill([
                'status' => QuizAttemptStatus::Submitted,
                'completed_at' => $lockedAttempt->completed_at ?? now(),
                'total_questions' => $result['total_questions'],
                'attempted_questions' => $result['attempted_questions'],
                'correct_answers' => $result['correct_answers'],
                'wrong_answers' => $result['wrong_answers'],
                'unanswered_questions' => $result['unanswered_questions'],
                'total_marks' => $result['total_marks'],
                'score' => $result['obtained_marks'],
                'percentage' => $result['percentage'],
                'is_passed' => $result['is_passed'],
            ])->save();

            return $lockedAttempt->refresh();
        });
    }

    /**
     * Score expired in-progress attempts and any submitted attempts that were never scored.
     */
    public function finalizePendingForUser(int $userId): void
    {
        $attempts = QuizAttempt::query()
            ->with('quiz')
            ->where('user_id', $userId)
            ->where(function ($query): void {
                $query->where('status', QuizAttemptStatus::InProgress)
                    ->orWhere(function ($inner): void {
                        $inner->whereIn('status', [
                            QuizAttemptStatus::Submitted,
                            QuizAttemptStatus::Completed,
                        ])->whereNull('percentage');
                    });
            })
            ->get();

        foreach ($attempts as $attempt) {
            if ($attempt->isInProgress() && ! $attempt->hasExpired()) {
                continue;
            }

            $this->finalize($attempt);
        }
    }

    /**
     * @return array{
     *     total_questions: int,
     *     attempted_questions: int,
     *     correct_answers: int,
     *     wrong_answers: int,
     *     unanswered_questions: int,
     *     total_marks: float,
     *     obtained_marks: float,
     *     percentage: float,
     *     is_passed: bool
     * }
     */
    public function calculate(QuizAttempt $attempt): array
    {
        $attempt->loadMissing('quiz');

        $questions = $attempt->quiz->questions()
            ->with('options')
            ->get();

        $answers = $attempt->answers()
            ->get(['question_id', 'selected_option_id'])
            ->keyBy('question_id');

        $correct = 0;
        $wrong = 0;
        $unanswered = 0;
        $totalMarks = 0.0;
        $obtainedMarks = 0.0;

        foreach ($questions as $question) {
            /** @var Question $question */
            $marks = (float) $question->marks;
            $negativeMarks = (float) $question->negative_marks;
            $totalMarks += $marks;

            /** @var QuizAttemptAnswer|null $answer */
            $answer = $answers->get($question->id);

            if ($answer?->selected_option_id === null) {
                $unanswered++;

                continue;
            }

            $correctOption = $question->options->firstWhere('is_correct', true);

            if ($correctOption !== null && $answer->selected_option_id === $correctOption->id) {
                $correct++;
                $obtainedMarks += $marks;
            } else {
                $wrong++;
                $obtainedMarks -= $negativeMarks;
            }
        }

        $totalMarks = round($totalMarks, 2);
        $obtainedMarks = max(0.0, round($obtainedMarks, 2));
        $percentage = $totalMarks > 0
            ? round(($obtainedMarks / $totalMarks) * 100, 2)
            : 0.0;

        return [
            'total_questions' => $questions->count(),
            'attempted_questions' => $correct + $wrong,
            'correct_answers' => $correct,
            'wrong_answers' => $wrong,
            'unanswered_questions' => $unanswered,
            'total_marks' => $totalMarks,
            'obtained_marks' => $obtainedMarks,
            'percentage' => $percentage,
            'is_passed' => $percentage >= (float) $attempt->quiz->passing_score,
        ];
    }
}
