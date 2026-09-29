<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\QuizAttemptController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

require __DIR__.'/admin.php';

Route::inertia('/', 'welcome')->name('home');

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
    });

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('attempts', [QuizAttemptController::class, 'index'])
        ->name('attempts.index');
    Route::get('quizzes', [QuizController::class, 'index'])->name('quizzes.index');
    Route::get('quizzes/{quiz}', [QuizController::class, 'show'])->name('quizzes.show');

    Route::post('quizzes/{quiz}/attempts', [QuizAttemptController::class, 'store'])
        ->name('quizzes.attempts.store');
    Route::get('quizzes/{quiz}/attempt/{attempt}', [QuizAttemptController::class, 'show'])
        ->name('quizzes.attempts.show');
    Route::put('quizzes/{quiz}/attempt/{attempt}/answers', [QuizAttemptController::class, 'saveAnswer'])
        ->name('quizzes.attempts.answers.save');
    Route::post('quizzes/{quiz}/attempt/{attempt}/submit', [QuizAttemptController::class, 'submit'])
        ->name('quizzes.attempts.submit');
    Route::get('quizzes/{quiz}/attempt/{attempt}/result', [QuizAttemptController::class, 'result'])
        ->name('quizzes.attempts.result');
    Route::get('quizzes/{quiz}/attempt/{attempt}/submitted', [QuizAttemptController::class, 'submitted'])
        ->name('quizzes.attempts.submitted');
});

Route::middleware(['auth'])->group(function () {
    Route::post('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';
