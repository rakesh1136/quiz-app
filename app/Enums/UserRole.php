<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case User = 'user';

    /**
     * Get the display label for the role.
     */
    public function label(): string
    {
        return ucfirst($this->value);
    }

    /**
     * Determine if the role is an admin.
     */
    public function isAdmin(): bool
    {
        return $this === self::Admin;
    }

    /**
     * Get all roles as select options.
     *
     * @return array<array{value: string, label: string}>
     */
    public static function assignable(): array
    {
        return collect(self::cases())
            ->map(fn (self $role) => ['value' => $role->value, 'label' => $role->label()])
            ->values()
            ->toArray();
    }
}
