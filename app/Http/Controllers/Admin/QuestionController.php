<?php

namespace App\Http\Controllers\Admin;

use App\Enums\QuestionDifficulty;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DeleteQuestionRequest;
use App\Http\Requests\Admin\StoreQuestionRequest;
use App\Http\Requests\Admin\UpdateQuestionRequest;
use App\Models\Question;
use App\Models\QuizCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class QuestionController extends Controller
{
    /**
     * Display a listing of questions.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Question::class);

        $filters = $this->filtersFromRequest($request);

        $query = Question::query()->with('category');

        if ($filters['category_id'] !== 'all') {
            $query->where('category_id', $filters['category_id']);
        }

        if ($filters['difficulty'] !== 'all') {
            $query->where('difficulty', $filters['difficulty']);
        }

        if ($filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if ($filters['search'] !== '') {
            $search = $filters['search'];
            $query->where('question', 'like', "%{$search}%");
        }

        $allowedSorts = ['id', 'category_id', 'difficulty', 'marks', 'status', 'created_at'];
        $sort = in_array($filters['sort'], $allowedSorts, true) ? $filters['sort'] : 'created_at';
        $direction = $filters['direction'] === 'asc' ? 'asc' : 'desc';

        if ($sort === 'category_id') {
            $query->join('quiz_categories', 'questions.category_id', '=', 'quiz_categories.id')
                ->orderBy('quiz_categories.name', $direction)
                ->select('questions.*');
        } else {
            $query->orderBy($sort, $direction);
        }

        $questions = $query
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Question $question) => $this->transformQuestion($question));

        return Inertia::render('admin/questions/index', [
            'questions' => $questions,
            'filters' => $filters,
            'categoryOptions' => $this->categoryFilterOptions(),
            'difficultyOptions' => $this->difficultyFilterOptions(),
            'statusOptions' => $this->statusFilterOptions(),
        ]);
    }

    /**
     * Show the form for creating a new question.
     */
    public function create(): Response
    {
        Gate::authorize('create', Question::class);

        return Inertia::render('admin/questions/create', [
            'categoryOptions' => $this->activeCategoryOptions(),
            'difficultyOptions' => QuestionDifficulty::options(),
            'statusOptions' => UserStatus::options(),
        ]);
    }

    /**
     * Store a newly created question.
     */
    public function store(StoreQuestionRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request) {
            $question = Question::create([
                'category_id' => $request->validated('category_id'),
                'question' => $request->validated('question'),
                'difficulty' => $request->validated('difficulty'),
                'marks' => $request->validated('marks'),
                'negative_marks' => $request->validated('negative_marks'),
                'explanation' => $request->validated('explanation'),
                'status' => $request->validated('status'),
            ]);

            $this->syncOptions($question, $request->validated('options'), (int) $request->validated('correct_option_index'));
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Question created successfully.')]);

        return to_route('admin.questions.index');
    }

    /**
     * Display the specified question.
     */
    public function show(Question $question): Response
    {
        Gate::authorize('view', $question);

        $question->load(['category', 'options']);

        return Inertia::render('admin/questions/show', [
            'question' => $this->transformQuestion($question, detailed: true),
        ]);
    }

    /**
     * Show the form for editing the specified question.
     */
    public function edit(Question $question): Response
    {
        Gate::authorize('update', $question);

        $question->load(['category', 'options']);

        return Inertia::render('admin/questions/edit', [
            'question' => $this->transformQuestion($question, detailed: true),
            'categoryOptions' => $this->allCategoryOptions(),
            'difficultyOptions' => QuestionDifficulty::options(),
            'statusOptions' => UserStatus::options(),
        ]);
    }

    /**
     * Update the specified question.
     */
    public function update(UpdateQuestionRequest $request, Question $question): RedirectResponse
    {
        Gate::authorize('update', $question);

        DB::transaction(function () use ($request, $question) {
            $question->update([
                'category_id' => $request->validated('category_id'),
                'question' => $request->validated('question'),
                'difficulty' => $request->validated('difficulty'),
                'marks' => $request->validated('marks'),
                'negative_marks' => $request->validated('negative_marks'),
                'explanation' => $request->validated('explanation'),
                'status' => $request->validated('status'),
            ]);

            $this->syncOptions($question, $request->validated('options'), (int) $request->validated('correct_option_index'));
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Question updated successfully.')]);

        return to_route('admin.questions.index', $request->query());
    }

    /**
     * Remove the specified question.
     */
    public function destroy(DeleteQuestionRequest $request, Question $question): RedirectResponse
    {
        $question->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Question deleted successfully.')]);

        return to_route('admin.questions.index', $request->query());
    }

    /**
     * @param  array<int, array{option_text: string}>  $options
     */
    private function syncOptions(Question $question, array $options, int $correctOptionIndex): void
    {
        $existingOptions = $question->options()->orderBy('sort_order')->get();

        foreach ($options as $index => $optionData) {
            $option = $existingOptions->get($index);

            if ($option) {
                $option->update([
                    'option_text' => $optionData['option_text'],
                    'is_correct' => $index === $correctOptionIndex,
                    'sort_order' => $index,
                ]);

                continue;
            }

            $question->options()->create([
                'option_text' => $optionData['option_text'],
                'is_correct' => $index === $correctOptionIndex,
                'sort_order' => $index,
            ]);
        }
    }

    /**
     * @return array{search: string, category_id: string, difficulty: string, status: string, sort: string, direction: string}
     */
    private function filtersFromRequest(Request $request): array
    {
        return [
            'search' => $request->string('search')->toString(),
            'category_id' => $request->string('category_id')->toString() ?: 'all',
            'difficulty' => $request->string('difficulty')->toString() ?: 'all',
            'status' => $request->string('status')->toString() ?: 'all',
            'sort' => $request->string('sort')->toString() ?: 'created_at',
            'direction' => $request->string('direction')->toString() ?: 'desc',
        ];
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
    private function statusFilterOptions(): array
    {
        return [
            ['value' => 'all', 'label' => 'All'],
            ...UserStatus::options(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function transformQuestion(Question $question, bool $detailed = false): array
    {
        $question->loadMissing(['category', 'options']);

        $correctOptionIndex = $question->options
            ->search(fn ($option) => $option->is_correct);

        $data = [
            'id' => $question->id,
            'category_id' => $question->category_id,
            'category_name' => $question->category?->name,
            'question' => $question->question,
            'difficulty' => $question->difficulty->value,
            'difficulty_label' => $question->difficulty->label(),
            'marks' => (float) $question->marks,
            'negative_marks' => (float) $question->negative_marks,
            'status' => $question->status->value,
            'status_label' => $question->status->label(),
            'created_at' => $question->created_at?->toISOString(),
            'correct_option_index' => $correctOptionIndex === false ? 0 : $correctOptionIndex,
            'options' => $question->options->map(fn ($option) => [
                'id' => $option->id,
                'option_text' => $option->option_text,
                'is_correct' => $option->is_correct,
                'sort_order' => $option->sort_order,
                'label' => chr(65 + $option->sort_order),
            ])->values()->all(),
        ];

        if ($detailed) {
            $data['explanation'] = $question->explanation;
            $data['updated_at'] = $question->updated_at?->toISOString();
        }

        return $data;
    }
}
