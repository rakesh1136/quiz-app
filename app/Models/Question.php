<?php

namespace App\Models;

use App\Enums\QuestionDifficulty;
use App\Enums\UserStatus;
use Database\Factories\QuestionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $category_id
 * @property string $question
 * @property QuestionDifficulty $difficulty
 * @property string $marks
 * @property string $negative_marks
 * @property string|null $explanation
 * @property UserStatus $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read QuizCategory $category
 * @property-read Collection<int, QuestionOption> $options
 * @property-read Collection<int, Quiz> $quizzes
 */
#[Fillable([
    'category_id',
    'question',
    'difficulty',
    'marks',
    'negative_marks',
    'explanation',
    'status',
])]
class Question extends Model
{
    /** @use HasFactory<QuestionFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'difficulty' => QuestionDifficulty::class,
            'marks' => 'decimal:2',
            'negative_marks' => 'decimal:2',
            'status' => UserStatus::class,
        ];
    }

    /**
     * Get the category that owns the question.
     *
     * @return BelongsTo<QuizCategory, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(QuizCategory::class, 'category_id');
    }

    /**
     * Get the options for the question.
     *
     * @return HasMany<QuestionOption, $this>
     */
    public function options(): HasMany
    {
        return $this->hasMany(QuestionOption::class)->orderBy('sort_order');
    }

    /**
     * Get the quizzes that include this question.
     *
     * @return BelongsToMany<Quiz, $this, QuizQuestion>
     */
    public function quizzes(): BelongsToMany
    {
        return $this->belongsToMany(Quiz::class, 'quiz_questions')
            ->using(QuizQuestion::class)
            ->withPivot(['question_order'])
            ->withTimestamps();
    }
}
