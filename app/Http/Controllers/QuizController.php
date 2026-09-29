<?php

namespace App\Http\Controllers;

use App\Enums\QuizStatus;
use App\Enums\UserStatus;
use App\Models\Quiz;
use App\Models\QuizCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuizController extends Controller
{
    /**
     * Display the published quizzes listing for authenticated users.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'search' => trim((string) $request->string('search')),
            'category' => trim((string) $request->string('category')),
        ];

        if ($filters['category'] === 'all') {
            $filters['category'] = '';
        }

        $query = Quiz::query()
            ->where('status', QuizStatus::Published)
            ->with('category:id,name,slug')
            ->withCount('questions');

        if ($filters['search'] !== '') {
            $search = $filters['search'];

            $query->where(function ($builder) use ($search): void {
                $builder->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($filters['category'] !== '') {
            $query->whereHas(
                'category',
                fn ($builder) => $builder->where('slug', $filters['category']),
            );
        }

        $quizzes = $query
            ->latest()
            ->paginate(9)
            ->withQueryString()
            ->through(fn (Quiz $quiz) => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'slug' => $quiz->slug,
                'description' => $quiz->description,
                'duration' => $quiz->duration,
                'passing_score' => (float) $quiz->passing_score,
                'max_attempts' => $quiz->max_attempts,
                'questions_count' => $quiz->questions_count,
                'category_name' => $quiz->category?->name ?? 'Uncategorized',
                'category_slug' => $quiz->category?->slug,
            ]);

        $categories = QuizCategory::query()
            ->where('status', UserStatus::Active)
            ->whereHas('quizzes', fn ($builder) => $builder->where('status', QuizStatus::Published))
            ->orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->map(fn (QuizCategory $category) => [
                'value' => $category->slug,
                'label' => $category->name,
            ])
            ->values()
            ->all();

        return Inertia::render('quizzes/index', [
            'quizzes' => $quizzes,
            'filters' => $filters,
            'categories' => $categories,
        ]);
    }

    /**
     * Display a published quiz for authenticated users.
     */
    public function show(Quiz $quiz): Response
    {
        abort_unless($quiz->status === QuizStatus::Published, 404);

        $quiz->load(['category:id,name,slug']);
        $quiz->loadCount('questions');

        return Inertia::render('quizzes/show', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'slug' => $quiz->slug,
                'description' => $quiz->description,
                'duration' => $quiz->duration,
                'passing_score' => (float) $quiz->passing_score,
                'max_attempts' => $quiz->max_attempts,
                'questions_count' => $quiz->questions_count,
                'total_marks' => $quiz->totalMarks(),
                'category_name' => $quiz->category?->name ?? 'Uncategorized',
                'category_slug' => $quiz->category?->slug,
            ],
        ]);
    }
}
