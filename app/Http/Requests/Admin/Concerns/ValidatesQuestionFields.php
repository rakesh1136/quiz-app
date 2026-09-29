<?php

namespace App\Http\Requests\Admin\Concerns;

use App\Enums\QuestionDifficulty;
use App\Enums\UserStatus;
use App\Models\QuizCategory;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\Rule;

trait ValidatesQuestionFields
{
    /**
     * Get the shared question validation rules.
     *
     * @return array<string, mixed>
     */
    protected function questionRules(): array
    {
        return [
            'category_id' => [
                'required',
                'integer',
                Rule::exists('quiz_categories', 'id'),
            ],
            'question' => ['required', 'string', 'max:5000'],
            'options' => ['required', 'array', 'size:4'],
            'options.*.option_text' => ['required', 'string', 'max:1000'],
            'correct_option_index' => ['required', 'integer', 'min:0', 'max:3'],
            'difficulty' => ['required', 'string', Rule::enum(QuestionDifficulty::class)],
            'marks' => ['required', 'numeric', 'gt:0'],
            'negative_marks' => ['required', 'numeric', 'min:0'],
            'explanation' => ['nullable', 'string', 'max:5000'],
            'status' => ['required', 'string', Rule::enum(UserStatus::class)],
        ];
    }

    /**
     * Configure the validator instance.
     */
    protected function configureQuestionValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $options = collect($this->input('options', []))
                ->pluck('option_text')
                ->map(fn ($text) => is_string($text) ? mb_strtolower(trim($text)) : '')
                ->filter(fn ($text) => $text !== '');

            if ($options->count() === 4 && $options->unique()->count() !== 4) {
                $validator->errors()->add('options', __('Each option must be unique.'));
            }

            if ($this->isMethod('post')) {
                $categoryId = $this->input('category_id');

                if ($categoryId && ! QuizCategory::query()
                    ->whereKey($categoryId)
                    ->where('status', UserStatus::Active)
                    ->exists()) {
                    $validator->errors()->add('category_id', __('Please select an active category.'));
                }
            }
        });
    }
}
