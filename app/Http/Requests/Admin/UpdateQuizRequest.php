<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Admin\Concerns\ValidatesQuizFields;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateQuizRequest extends FormRequest
{
    use ValidatesQuizFields;

    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return $this->quizRules($this->route('quiz')?->id);
    }

    public function withValidator($validator): void
    {
        $this->configureQuizValidator($validator);
    }
}
