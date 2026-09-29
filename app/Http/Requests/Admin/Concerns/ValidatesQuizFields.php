<?php

namespace App\Http\Requests\Admin\Concerns;

use App\Enums\QuizStatus;
use App\Enums\UserStatus;
use App\Models\Question;
use App\Models\QuizCategory;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\Rule;

trait ValidatesQuizFields
{
    /**
     * @return array<string, mixed>
     */
    protected function quizRules(?int $quizId = null): array
    {
        return [
            'title' => [
                'required',
                'string',
                'max:255',
                Rule::unique('quizzes', 'title')->ignore($quizId),
            ],
            'category_id' => [
                'required',
                'integer',
                Rule::exists('quiz_categories', 'id'),
            ],
            'description' => ['nullable', 'string', 'max:5000'],
            'duration' => ['required', 'integer', 'min:1'],
            'passing_score' => ['required', 'numeric', 'gt:0', 'max:100'],
            'max_attempts' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'string', Rule::enum(QuizStatus::class)],
            'question_ids' => ['nullable', 'array'],
            'question_ids.*' => ['integer', 'distinct', Rule::exists('questions', 'id')],
        ];
    }

    protected function configureQuizValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $categoryId = $this->input('category_id');

            if ($categoryId && ! QuizCategory::query()
                ->whereKey($categoryId)
                ->where('status', UserStatus::Active)
                ->exists()) {
                $validator->errors()->add('category_id', __('Please select an active category.'));
            }

            $status = $this->input('status');
            $questionIds = collect($this->input('question_ids', []))
                ->filter(fn ($id) => is_numeric($id))
                ->map(fn ($id) => (int) $id)
                ->unique()
                ->values();

            if ($status === QuizStatus::Published->value) {
                if ($questionIds->isEmpty()) {
                    $validator->errors()->add('question_ids', __('Published quizzes must include at least one question.'));
                }

                $inactiveCount = Question::query()
                    ->whereIn('id', $questionIds)
                    ->where('status', '!=', UserStatus::Active)
                    ->count();

                if ($inactiveCount > 0) {
                    $validator->errors()->add('question_ids', __('Published quizzes can only include active questions.'));
                }
            }
        });
    }
}
