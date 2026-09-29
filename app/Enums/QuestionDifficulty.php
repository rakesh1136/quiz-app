<?php

namespace App\Enums;

enum QuestionDifficulty: string
{
    case Easy = 'easy';
    case Medium = 'medium';
    case Hard = 'hard';

    /**
     * Get the display label for the difficulty.
     */
    public function label(): string
    {
        return ucfirst($this->value);
    }

    /**
     * Get all difficulties as select options.
     *
     * @return array<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return collect(self::cases())
            ->map(fn (self $difficulty) => ['value' => $difficulty->value, 'label' => $difficulty->label()])
            ->values()
            ->toArray();
    }
}
