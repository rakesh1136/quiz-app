<?php

namespace App\Enums;

enum QuizAttemptStatus: string
{
    case InProgress = 'in_progress';
    case Submitted = 'submitted';
    case Completed = 'completed';

    public function label(): string
    {
        return match ($this) {
            self::InProgress => 'In Progress',
            self::Submitted => 'Submitted',
            self::Completed => 'Completed',
        };
    }
}
