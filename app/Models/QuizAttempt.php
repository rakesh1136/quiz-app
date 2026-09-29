<?php

namespace App\Models;

use App\Enums\QuizAttemptStatus;
use Carbon\CarbonInterface;
use Database\Factories\QuizAttemptFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int $quiz_id
 * @property QuizAttemptStatus $status
 * @property Carbon|null $started_at
 * @property Carbon|null $completed_at
 * @property int|null $total_questions
 * @property int|null $attempted_questions
 * @property int|null $correct_answers
 * @property int|null $wrong_answers
 * @property int|null $unanswered_questions
 * @property string|null $total_marks
 * @property string|null $score
 * @property string|null $percentage
 * @property bool|null $is_passed
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 * @property-read Quiz $quiz
 * @property-read Collection<int, QuizAttemptAnswer> $answers
 */
#[Fillable([
    'user_id',
    'quiz_id',
    'status',
    'started_at',
    'completed_at',
    'total_questions',
    'attempted_questions',
    'correct_answers',
    'wrong_answers',
    'unanswered_questions',
    'total_marks',
    'score',
    'percentage',
    'is_passed',
])]
class QuizAttempt extends Model
{
    /** @use HasFactory<QuizAttemptFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => QuizAttemptStatus::class,
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'total_questions' => 'integer',
            'attempted_questions' => 'integer',
            'correct_answers' => 'integer',
            'wrong_answers' => 'integer',
            'unanswered_questions' => 'integer',
            'total_marks' => 'decimal:2',
            'score' => 'decimal:2',
            'percentage' => 'decimal:2',
            'is_passed' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Quiz, $this>
     */
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    /**
     * @return HasMany<QuizAttemptAnswer, $this>
     */
    public function answers(): HasMany
    {
        return $this->hasMany(QuizAttemptAnswer::class);
    }

    public function isInProgress(): bool
    {
        return $this->status === QuizAttemptStatus::InProgress;
    }

    public function isSubmitted(): bool
    {
        return $this->status !== QuizAttemptStatus::InProgress;
    }

    public function hasStoredResult(): bool
    {
        return $this->isSubmitted()
            && $this->total_questions !== null
            && $this->score !== null
            && $this->percentage !== null
            && $this->is_passed !== null;
    }

    /**
     * The moment this attempt stops accepting answers.
     */
    public function expiresAt(): ?CarbonInterface
    {
        if ($this->started_at === null) {
            return null;
        }

        return $this->started_at->addMinutes($this->quiz->duration);
    }

    /**
     * Seconds left before the attempt expires, never negative.
     */
    public function remainingSeconds(): int
    {
        $expiresAt = $this->expiresAt();

        if ($expiresAt === null) {
            return 0;
        }

        return max(0, (int) ceil(now()->diffInSeconds($expiresAt, false)));
    }

    public function hasExpired(): bool
    {
        return $this->remainingSeconds() <= 0;
    }

    /**
     * Determine whether the attempt was submitted because the timer ran out.
     */
    public function wasSubmittedAfterExpiry(): bool
    {
        $expiresAt = $this->expiresAt();

        if ($expiresAt === null || $this->completed_at === null) {
            return false;
        }

        return $this->completed_at->greaterThanOrEqualTo($expiresAt->subSeconds(5));
    }
}
