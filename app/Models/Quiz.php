<?php

namespace App\Models;

use App\Enums\QuizStatus;
use Database\Factories\QuizFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int $category_id
 * @property string $title
 * @property string $slug
 * @property string|null $description
 * @property int $duration
 * @property string $passing_score
 * @property int $max_attempts
 * @property QuizStatus $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read QuizCategory $category
 * @property-read Collection<int, Question> $questions
 * @property-read Collection<int, QuizQuestion> $quizQuestions
 * @property-read Collection<int, QuizAttempt> $attempts
 */
#[Fillable([
    'category_id',
    'title',
    'slug',
    'description',
    'duration',
    'passing_score',
    'max_attempts',
    'status',
])]
class Quiz extends Model
{
    /** @use HasFactory<QuizFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'duration' => 'integer',
            'passing_score' => 'decimal:2',
            'max_attempts' => 'integer',
            'status' => QuizStatus::class,
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Quiz $quiz): void {
            if ($quiz->isDirty('title')) {
                $quiz->slug = static::generateUniqueSlug($quiz->title, $quiz->id);
            }
        });
    }

    public static function generateUniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $counter = 1;

        while (static::query()
            ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
            ->where('slug', $slug)
            ->exists()) {
            $slug = $originalSlug.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * @return BelongsTo<QuizCategory, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(QuizCategory::class, 'category_id');
    }

    /**
     * @return HasMany<QuizQuestion, $this>
     */
    public function quizQuestions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class)->orderBy('question_order');
    }

    /**
     * @return BelongsToMany<Question, $this, QuizQuestion>
     */
    public function questions(): BelongsToMany
    {
        return $this->belongsToMany(Question::class, 'quiz_questions')
            ->using(QuizQuestion::class)
            ->withPivot(['question_order'])
            ->withTimestamps()
            ->orderByPivot('question_order');
    }

    public function questionsCount(): int
    {
        return $this->questions()->count();
    }

    public function totalMarks(): float
    {
        return (float) $this->questions()->sum('questions.marks');
    }

    /**
     * @return HasMany<QuizAttempt, $this>
     */
    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }
}
