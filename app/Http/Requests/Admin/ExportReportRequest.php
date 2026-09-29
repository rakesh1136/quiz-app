<?php

namespace App\Http\Requests\Admin;

use App\Services\Admin\ExportReportQueryService;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ExportReportRequest extends FormRequest
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
            'report_type' => [
                'required',
                'string',
                Rule::in([
                    ExportReportQueryService::REPORT_QUIZ_ATTEMPTS,
                    ExportReportQueryService::REPORT_USER_PERFORMANCE,
                    ExportReportQueryService::REPORT_QUIZ_PERFORMANCE,
                ]),
            ],
            'format' => ['required', 'string', Rule::in(['csv', 'xlsx'])],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'user_id' => ['nullable', 'string'],
            'quiz_id' => ['nullable', 'string'],
            'category_id' => ['nullable', 'string'],
            'status' => ['nullable', 'string', Rule::in(['all', 'passed', 'failed'])],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $from = $this->input('date_from');
            $to = $this->input('date_to');

            if ($from && $to && strtotime((string) $to) < strtotime((string) $from)) {
                $validator->errors()->add('date_to', 'The end date must be on or after the start date.');
            }

            foreach (['user_id', 'quiz_id', 'category_id'] as $field) {
                $value = $this->input($field);

                if ($value === null || $value === '' || $value === 'all') {
                    continue;
                }

                if (! ctype_digit((string) $value)) {
                    $validator->errors()->add($field, 'The selected value is invalid.');
                }
            }
        });
    }
}
