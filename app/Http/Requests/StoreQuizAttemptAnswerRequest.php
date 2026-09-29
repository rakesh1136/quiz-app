<?php

namespace App\Http\Requests;

use App\Models\QuizAttempt;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreQuizAttemptAnswerRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var QuizAttempt $attempt */
        $attempt = $this->route('attempt');

        return $attempt->user_id === $this->user()?->id;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var QuizAttempt $attempt */
        $attempt = $this->route('attempt');
        $quizId = $attempt->quiz_id;
        $questionId = (int) $this->input('question_id');

        return [
            'question_id' => [
                'required',
                'integer',
                Rule::exists('quiz_questions', 'question_id')->where(
                    'quiz_id',
                    $quizId,
                ),
            ],
            'selected_option_id' => [
                'required',
                'integer',
                Rule::exists('question_options', 'id')->where(
                    'question_id',
                    $questionId > 0 ? $questionId : 0,
                ),
            ],
        ];
    }
}
