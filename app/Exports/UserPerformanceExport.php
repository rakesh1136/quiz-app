<?php

namespace App\Exports;

use Illuminate\Support\Collection;

class UserPerformanceExport extends TabularExport
{
    public function filenamePrefix(): string
    {
        return 'user-performance-report';
    }

    public function headings(): array
    {
        return [
            'User Name',
            'Email',
            'Total Attempts',
            'Passed',
            'Failed',
            'Average Score',
            'Best Score',
            'Lowest Score',
            'Average Percentage',
            'Pass Rate',
            'Last Attempt Date',
        ];
    }

    public function rows(): Collection
    {
        return $this->queries->userPerformanceRows($this->filters)
            ->map(fn (array $row) => [
                $row['user_name'],
                $row['email'],
                $row['total_attempts'],
                $row['passed'],
                $row['failed'],
                $row['average_score'],
                $row['best_score'],
                $row['lowest_score'],
                $row['average_percentage'],
                $row['pass_rate'],
                $row['last_attempt_date'],
            ]);
    }
}
