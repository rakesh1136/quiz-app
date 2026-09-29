<?php

namespace App\Http\Controllers\Admin;

use App\Enums\QuestionDifficulty;
use App\Enums\QuizStatus;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DeleteQuizRequest;
use App\Http\Requests\Admin\PublishQuizRequest;
use App\Http\Requests\Admin\StoreQuizRequest;
use App\Http\Requests\Admin\UpdateQuizRequest;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\QuizCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class QuizController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Quiz::class);

        $filters = $this->filtersFromRequest($request);

        $query = Quiz::query()
            ->with('category')
            ->withCount('questions');

        if ($filters['category_id'] !== 'all') {
            $query->where('category_id', $filters['category_id']);
        }

        if ($filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if ($filters['search'] !== '') {
            $search = $filters['search'];
            $query->where(function ($builder) use ($search) {
                $builder->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $allowedSorts = ['title', 'category_id', 'duration', 'passing_score', 'status', 'created_at'];
        $sort = in_array($filters['sort'], $allowedSorts, true) ? $filters['sort'] : 'created_at';
        $direction = $filters['direction'] === 'asc' ? 'asc' : 'desc';

        if ($sort === 'category_id') {
            $query->join('quiz_categories', 'quizzes.category_id', '=', 'quiz_categories.id')
                ->orderBy('quiz_categories.name', $direction)
                ->select('quizzes.*');
        } else {
            $query->orderBy($sort, $direction);
        }

        $quizzes = $query
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Quiz $quiz) => $this->transformQuiz($quiz));

        return Inertia::render('admin/quizzes/index', [
            'quizzes' => $quizzes,
            'filters' => $filters,
            'categoryOptions' => $this->categoryFilterOptions(),
            'statusOptions' => $this->statusFilterOptions(),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Quiz::class);

        return Inertia::render('admin/quizzes/create', [
            'categoryOptions' => $this->activeCategoryOptions(),
            'statusOptions' => QuizStatus::options(),
            'bankQuestions' => $this->questionBank(),
            'difficultyOptions' => $this->difficultyFilterOptions(),
            'questionStatusOptions' => $this->questionStatusFilterOptions(),
        ]);
    }

    public function store(StoreQuizRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request) {
            $quiz = Quiz::create([
                'category_id' => $request->validated('category_id'),
                'title' => $request->validated('title'),
                'description' => $request->validated('description'),
                'duration' => $request->validated('duration'),
                'passing_score' => $request->validated('passing_score'),
                'max_attempts' => $request->validated('max_attempts'),
                'status' => $request->validated('status'),
            ]);

            $this->syncQuestions($quiz, $request->input('question_ids', []));
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Quiz created successfully.')]);

        return to_route('admin.quizzes.index');
    }

    public function show(Quiz $quiz): Response
    {
        Gate::authorize('view', $quiz);

        $quiz->load(['category', 'questions.category']);

        return Inertia::render('admin/quizzes/show', [
            'quiz' => $this->transformQuiz($quiz, detailed: true),
        ]);
    }

    public function edit(Quiz $quiz): Response
    {
        Gate::authorize('update', $quiz);

        $quiz->load(['category', 'questions.category']);

        return Inertia::render('admin/quizzes/edit', [
            'quiz' => $this->transformQuiz($quiz, detailed: true),
            'categoryOptions' => $this->allCategoryOptions(),
            'statusOptions' => QuizStatus::options(),
            'bankQuestions' => $this->questionBank(),
            'difficultyOptions' => $this->difficultyFilterOptions(),
            'questionStatusOptions' => $this->questionStatusFilterOptions(),
        ]);
    }

    public function update(UpdateQuizRequest $request, Quiz $quiz): RedirectResponse
    {
        Gate::authorize('update', $quiz);

        DB::transaction(function () use ($request, $quiz) {
            $quiz->update([
                'category_id' => $request->validated('category_id'),
                'title' => $request->validated('title'),
                'description' => $request->validated('description'),
                'duration' => $request->validated('duration'),
                'passing_score' => $request->validated('passing_score'),
                'max_attempts' => $request->validated('max_attempts'),
                'status' => $request->validated('status'),
            ]);

            $this->syncQuestions($quiz, $request->input('question_ids', []));
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Quiz updated successfully.')]);

        return to_route('admin.quizzes.index', $request->query());
    }

    public function destroy(DeleteQuizRequest $request, Quiz $quiz): RedirectResponse
    {
        $quiz->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Quiz deleted successfully.')]);

        return to_route('admin.quizzes.index', $request->query());
    }

    public function publish(PublishQuizRequest $request, Quiz $quiz): RedirectResponse
    {
        Gate::authorize('update', $quiz);

        $quiz->update(['status' => QuizStatus::Published]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Quiz published successfully.')]);

        return to_route('admin.quizzes.index', $request->query());
    }

    public function unpublish(Request $request, Quiz $quiz): RedirectResponse
    {
        Gate::authorize('update', $quiz);

        $quiz->update(['status' => QuizStatus::Draft]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Quiz unpublished successfully.')]);

        return to_route('admin.quizzes.index', $request->query());
    }

    /**
     * @param  array<int|string>|null  $questionIds
     */
    private function syncQuestions(Quiz $quiz, ?array $questionIds): void
    {
        $questionIds = collect($questionIds ?? [])
            ->filter(fn ($id) => is_numeric($id))
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        $quiz->quizQuestions()->delete();

        foreach ($questionIds as $order => $questionId) {
            $quiz->quizQuestions()->create([
                'question_id' => $questionId,
                'question_order' => $order,
            ]);
        }
    }

    /**
     * @return array{search: string, category_id: string, status: string, sort: string, direction: string}
     */
    private function filtersFromRequest(Request $request): array
    {
        return [
            'search' => $request->string('search')->toString(),
            'category_id' => $request->string('category_id')->toString() ?: 'all',
            'status' => $request->string('status')->toString() ?: 'all',
            'sort' => $request->string('sort')->toString() ?: 'created_at',
            'direction' => $request->string('direction')->toString() ?: 'desc',
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function questionBank(): array
    {
        return Question::query()
            ->with('category')
            ->orderBy('question')
            ->get()
            ->map(fn (Question $question) => [
                'id' => $question->id,
                'question' => $question->question,
                'category_id' => $question->category_id,
                'category_name' => $question->category?->name,
                'difficulty' => $question->difficulty->value,
                'difficulty_label' => $question->difficulty->label(),
                'marks' => (float) $question->marks,
                'negative_marks' => (float) $question->negative_marks,
                'status' => $question->status->value,
                'status_label' => $question->status->label(),
            ])
            ->all();
    }

    /**
     * @return array<array{value: string, label: string}>
     */
    private function categoryFilterOptions(): array
    {
        return [
            ['value' => 'all', 'label' => 'All Categories'],
            ...QuizCategory::query()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (QuizCategory $category) => [
                    'value' => (string) $category->id,
                    'label' => $category->name,
                ])
                ->all(),
        ];
    }

    /**
     * @return array<array{value: string, label: string}>
     */
    private function activeCategoryOptions(): array
    {
        return QuizCategory::query()
            ->where('status', UserStatus::Active)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (QuizCategory $category) => [
                'value' => (string) $category->id,
                'label' => $category->name,
            ])
            ->all();
    }

    /**
     * @return array<array{value: string, label: string}>
     */
    private function allCategoryOptions(): array
    {
        return QuizCategory::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (QuizCategory $category) => [
                'value' => (string) $category->id,
                'label' => $category->name,
            ])
            ->all();
    }

    /**
     * @return array<array{value: string, label: string}>
     */
    private function statusFilterOptions(): array
    {
        return [
            ['value' => 'all', 'label' => 'All'],
            ...QuizStatus::options(),
        ];
    }

    /**
     * @return array<array{value: string, label: string}>
     */
    private function difficultyFilterOptions(): array
    {
        return [
            ['value' => 'all', 'label' => 'All'],
            ...QuestionDifficulty::options(),
        ];
    }

    /**
     * @return array<array{value: string, label: string}>
     */
    private function questionStatusFilterOptions(): array
    {
        return [
            ['value' => 'all', 'label' => 'All'],
            ...UserStatus::options(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function transformQuiz(Quiz $quiz, bool $detailed = false): array
    {
        $quiz->loadMissing(['category', 'questions.category']);

        $questionsCount = $quiz->questions_count ?? $quiz->questions->count();
        $totalMarks = $quiz->questions->sum(fn (Question $question) => (float) $question->marks);

        $data = [
            'id' => $quiz->id,
            'title' => $quiz->title,
            'slug' => $quiz->slug,
            'description' => $quiz->description,
            'category_id' => $quiz->category_id,
            'category_name' => $quiz->category?->name,
            'duration' => $quiz->duration,
            'passing_score' => (float) $quiz->passing_score,
            'max_attempts' => $quiz->max_attempts,
            'status' => $quiz->status->value,
            'status_label' => $quiz->status->label(),
            'questions_count' => $questionsCount,
            'total_marks' => $totalMarks,
            'created_at' => $quiz->created_at?->toISOString(),
        ];

        if ($detailed) {
            $data['updated_at'] = $quiz->updated_at?->toISOString();
            $data['question_ids'] = $quiz->questions->pluck('id')->all();
            $data['questions'] = $quiz->questions->map(fn (Question $question) => [
                'id' => $question->id,
                'question' => $question->question,
                'difficulty' => $question->difficulty->value,
                'difficulty_label' => $question->difficulty->label(),
                'marks' => (float) $question->marks,
                'negative_marks' => (float) $question->negative_marks,
                'category_name' => $question->category?->name,
                'status' => $question->status->value,
                'question_order' => $question->pivot->question_order,
            ])->values()->all();
        }

        return $data;
    }
}
