<?php

namespace App\Providers;

use App\Models\Question;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizCategory;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureRouteBindings();
    }

    /**
     * Configure explicit route model bindings.
     */
    protected function configureRouteBindings(): void
    {
        Route::bind('category', fn (string $value) => QuizCategory::query()->whereKey($value)->firstOrFail());
        Route::bind('question', fn (string $value) => Question::query()->whereKey($value)->firstOrFail());
        Route::bind('quiz', fn (string $value) => Quiz::query()->whereKey($value)->firstOrFail());
        Route::bind('attempt', fn (string $value) => QuizAttempt::query()->whereKey($value)->firstOrFail());
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
