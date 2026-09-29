<?php

namespace App\Exports;

use Illuminate\Support\Collection;

class QuizAttemptsExport extends TabularExport
{
    public function filenamePrefix(): string
    {
        return 'quiz-attempts-report';
    }

    public function headings(): array
    {
        return [
            'User Name',
            'User Email',
            'Quiz Name',
            'Category',
            'Attempt Date',
            'Score',
            'Percentage',
            'Correct Answers',
            'Incorrect Answers',
            'Skipped Answers',
            'Completion Time',
            'Result',
        ];
    }

    public function rows(): Collection
    {
        return $this->queries->quizAttemptsRows($this->filters)
            ->map(fn (array $row) => [
                $row['user_name'],
                $row['user_email'],
                $row['quiz_name'],
                $row['category'],
                $row['attempt_date'],
                $row['score'],
                $row['percentage'],
                $row['correct_answers'],
                $row['incorrect_answers'],
                $row['skipped_answers'],
                $row['completion_time'],
                $row['result'],
            ]);
    }
}
