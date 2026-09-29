<?php

namespace App\Http\Requests\Admin;

use App\Enums\QuizStatus;
use App\Enums\UserStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PublishQuizRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => ['sometimes', 'string', Rule::in([QuizStatus::Published->value])],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $quiz = $this->route('quiz');

            if (! $quiz) {
                return;
            }

            if ($quiz->questions()->count() === 0) {
                $validator->errors()->add('status', __('Published quizzes must include at least one question.'));
            }

            $inactiveCount = $quiz->questions()
                ->where('questions.status', '!=', UserStatus::Active)
                ->count();

            if ($inactiveCount > 0) {
                $validator->errors()->add('status', __('Published quizzes can only include active questions.'));
            }
        });
    }
}
