<?php

namespace App\Policies;

use App\Models\QuizCategory;
use App\Models\User;

class QuizCategoryPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, QuizCategory $quizCategory): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, QuizCategory $quizCategory): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, QuizCategory $quizCategory): bool
    {
        return $user->isAdmin() && $quizCategory->canBeDeleted();
    }
}
