<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserStatus;
use App\Models\QuizCategory;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateQuizCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var QuizCategory $category */
        $category = $this->route('category');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('quiz_categories', 'name')->ignore($category->id),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['required', 'string', Rule::enum(UserStatus::class)],
        ];
    }
}
