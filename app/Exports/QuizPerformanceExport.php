<?php

namespace App\Exports;

use Illuminate\Support\Collection;

class QuizPerformanceExport extends TabularExport
{
    public function filenamePrefix(): string
    {
        return 'quiz-performance-report';
    }

    public function headings(): array
    {
        return [
            'Quiz Name',
            'Category',
            'Total Attempts',
            'Total Participants',
            'Average Score',
            'Average Percentage',
            'Best Score',
            'Lowest Score',
            'Pass Rate',
            'Fail Rate',
            'Average Completion Time',
        ];
    }

    public function rows(): Collection
    {
        return $this->queries->quizPerformanceRows($this->filters)
            ->map(fn (array $row) => [
                $row['quiz_name'],
                $row['category'],
                $row['total_attempts'],
                $row['total_participants'],
                $row['average_score'],
                $row['average_percentage'],
                $row['best_score'],
                $row['lowest_score'],
                $row['pass_rate'],
                $row['fail_rate'],
                $row['average_completion_time'],
            ]);
    }
}
