<?php

namespace App\Models;

use App\Enums\UserStatus;
use Database\Factories\QuizCategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property UserStatus $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, Question> $questions
 * @property-read Collection<int, Quiz> $quizzes
 */
#[Fillable(['name', 'slug', 'description', 'status'])]
class QuizCategory extends Model
{
    /** @use HasFactory<QuizCategoryFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => UserStatus::class,
        ];
    }

    /**
     * Boot the model.
     */
    protected static function booted(): void
    {
        static::saving(function (QuizCategory $category): void {
            if ($category->isDirty('name')) {
                $category->slug = static::generateUniqueSlug(
                    $category->name,
                    $category->id,
                );
            }
        });
    }

    /**
     * Generate a unique slug from the given name.
     */
    public static function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $slug = Str::slug($name);
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
     * Get the questions for the category.
     *
     * @return HasMany<Question, $this>
     */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class, 'category_id');
    }

    /**
     * Get the quizzes for the category.
     *
     * @return HasMany<Quiz, $this>
     */
    public function quizzes(): HasMany
    {
        return $this->hasMany(Quiz::class, 'category_id');
    }

    /**
     * Determine whether the category has related questions.
     */
    public function hasQuestions(): bool
    {
        return $this->questions()->exists();
    }

    /**
     * Determine whether the category can be deleted.
     */
    public function canBeDeleted(): bool
    {
        return ! $this->hasQuestions() && ! $this->quizzes()->exists();
    }

    /**
     * Get the number of questions in this category.
     */
    public function questionsCount(): int
    {
        return $this->questions()->count();
    }
}
