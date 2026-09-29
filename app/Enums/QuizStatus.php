<?php

namespace App\Enums;

enum QuizStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
    case Inactive = 'inactive';

    /**
     * Get the human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Published => 'Published',
            self::Inactive => 'Inactive',
        };
    }

    /**
     * Get options for select inputs.
     *
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $status) => ['value' => $status->value, 'label' => $status->label()],
            self::cases(),
        );
    }
}
