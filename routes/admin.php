<?php

use App\Http\Controllers\Admin\Auth\LoginController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ExportReportController;
use App\Http\Controllers\Admin\QuestionController;
use App\Http\Controllers\Admin\QuizAttemptController;
use App\Http\Controllers\Admin\QuizCategoryController;
use App\Http\Controllers\Admin\QuizController;
use App\Http\Controllers\Admin\QuizPerformanceController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\UserPerformanceController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::middleware('guest')->group(function () {
            Route::get('/', [LoginController::class, 'create'])->name('login');
            Route::post('login', [LoginController::class, 'store'])
                ->middleware('throttle:5,1')
                ->name('login.store');
        });

        Route::middleware(['auth', 'admin'])->group(function () {
            Route::post('logout', [LoginController::class, 'destroy'])->name('logout');
            Route::get('dashboard', DashboardController::class)->name('dashboard');
            Route::get('reports', ReportController::class)->name('reports');
            Route::get('user-performance', [UserPerformanceController::class, 'index'])
                ->name('user-performance.index');
            Route::get('user-performance/{user}', [UserPerformanceController::class, 'show'])
                ->name('user-performance.show');
            Route::get('quiz-performance', [QuizPerformanceController::class, 'index'])
                ->name('quiz-performance.index');
            Route::get('quiz-performance/{quiz}', [QuizPerformanceController::class, 'show'])
                ->name('quiz-performance.show');
            Route::get('export-reports', [ExportReportController::class, 'index'])
                ->name('export-reports.index');
            Route::get('export-reports/export', [ExportReportController::class, 'export'])
                ->name('export-reports.export');
            Route::resource('users', UserController::class);
            Route::resource('categories', QuizCategoryController::class)
                ->parameters(['categories' => 'category']);
            Route::resource('questions', QuestionController::class)
                ->parameters(['questions' => 'question']);
            Route::patch('quizzes/{quiz}/publish', [QuizController::class, 'publish'])->name('quizzes.publish');
            Route::patch('quizzes/{quiz}/unpublish', [QuizController::class, 'unpublish'])->name('quizzes.unpublish');
            Route::resource('quizzes', QuizController::class)
                ->parameters(['quizzes' => 'quiz']);
            Route::resource('attempts', QuizAttemptController::class)
                ->only(['index', 'show'])
                ->parameters(['attempts' => 'attempt']);
        });
    });
