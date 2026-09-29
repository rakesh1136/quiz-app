<?php

namespace App\Http\Requests\Admin;

use App\Models\QuizCategory;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;

class DeleteQuizCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        /** @var QuizCategory $category */
        $category = $this->route('category');

        return ($this->user()?->isAdmin() ?? false) && $category->canBeDeleted();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [];
    }

    /**
     * Handle a failed authorization attempt.
     */
    protected function failedAuthorization(): void
    {
        /** @var QuizCategory $category */
        $category = $this->route('category');

        if ($category->hasQuestions()) {
            throw ValidationException::withMessages([
                'category' => __('This category cannot be deleted because it has related questions.'),
            ]);
        }

        parent::failedAuthorization();
    }
}
