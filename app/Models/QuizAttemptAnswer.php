<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $quiz_attempt_id
 * @property int $question_id
 * @property int|null $selected_option_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read QuizAttempt $attempt
 * @property-read Question $question
 * @property-read QuestionOption|null $selectedOption
 */
#[Fillable([
    'quiz_attempt_id',
    'question_id',
    'selected_option_id',
])]
class QuizAttemptAnswer extends Model
{
    /**
     * @return BelongsTo<QuizAttempt, $this>
     */
    public function attempt(): BelongsTo
    {
        return $this->belongsTo(QuizAttempt::class, 'quiz_attempt_id');
    }

    /**
     * @return BelongsTo<Question, $this>
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    /**
     * @return BelongsTo<QuestionOption, $this>
     */
    public function selectedOption(): BelongsTo
    {
        return $this->belongsTo(QuestionOption::class, 'selected_option_id');
    }
}
