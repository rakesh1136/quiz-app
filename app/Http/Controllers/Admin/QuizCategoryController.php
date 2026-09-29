<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DeleteQuizCategoryRequest;
use App\Http\Requests\Admin\StoreQuizCategoryRequest;
use App\Http\Requests\Admin\UpdateQuizCategoryRequest;
use App\Models\QuizCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class QuizCategoryController extends Controller
{
    /**
     * Display a listing of categories.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', QuizCategory::class);

        $filters = $this->filtersFromRequest($request);

        $query = QuizCategory::query();

        if ($filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if ($filters['search'] !== '') {
            $search = $filters['search'];
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $allowedSorts = ['name', 'slug', 'status', 'created_at'];
        $sort = in_array($filters['sort'], $allowedSorts, true) ? $filters['sort'] : 'created_at';
        $direction = $filters['direction'] === 'asc' ? 'asc' : 'desc';

        $categories = $query
            ->orderBy($sort, $direction)
            ->paginate(10)
            ->withQueryString()
            ->through(fn (QuizCategory $category) => $this->transformCategory($category));

        return Inertia::render('admin/categories/index', [
            'categories' => $categories,
            'filters' => $filters,
            'statusOptions' => $this->statusFilterOptions(),
        ]);
    }

    /**
     * Show the form for creating a new category.
     */
    public function create(): Response
    {
        Gate::authorize('create', QuizCategory::class);

        return Inertia::render('admin/categories/create', [
            'statusOptions' => UserStatus::options(),
        ]);
    }

    /**
     * Store a newly created category.
     */
    public function store(StoreQuizCategoryRequest $request): RedirectResponse
    {
        QuizCategory::create([
            'name' => $request->validated('name'),
            'description' => $request->validated('description'),
            'status' => $request->validated('status'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category created successfully.')]);

        return to_route('admin.categories.index');
    }

    /**
     * Display the specified category.
     */
    public function show(QuizCategory $category): Response
    {
        Gate::authorize('view', $category);

        return Inertia::render('admin/categories/show', [
            'category' => $this->transformCategory($category, detailed: true),
        ]);
    }

    /**
     * Show the form for editing the specified category.
     */
    public function edit(QuizCategory $category): Response
    {
        Gate::authorize('update', $category);

        return Inertia::render('admin/categories/edit', [
            'category' => $this->transformCategory($category, detailed: true),
            'statusOptions' => UserStatus::options(),
        ]);
    }

    /**
     * Update the specified category.
     */
    public function update(UpdateQuizCategoryRequest $request, QuizCategory $category): RedirectResponse
    {
        Gate::authorize('update', $category);

        $category->update([
            'name' => $request->validated('name'),
            'description' => $request->validated('description'),
            'status' => $request->validated('status'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category updated successfully.')]);

        return to_route('admin.categories.index', $request->query());
    }

    /**
     * Remove the specified category.
     */
    public function destroy(DeleteQuizCategoryRequest $request, QuizCategory $category): RedirectResponse
    {
        $category->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category deleted successfully.')]);

        return to_route('admin.categories.index', $request->query());
    }

    /**
     * @return array{search: string, status: string, sort: string, direction: string}
     */
    private function filtersFromRequest(Request $request): array
    {
        return [
            'search' => $request->string('search')->toString(),
            'status' => $request->string('status')->toString() ?: 'all',
            'sort' => $request->string('sort')->toString() ?: 'created_at',
            'direction' => $request->string('direction')->toString() ?: 'desc',
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
    private function transformCategory(QuizCategory $category, bool $detailed = false): array
    {
        $data = [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'status' => $category->status->value,
            'status_label' => $category->status->label(),
            'created_at' => $category->created_at?->toISOString(),
            'can_delete' => $category->canBeDeleted(),
        ];

        if ($detailed) {
            $data['updated_at'] = $category->updated_at?->toISOString();
            $data['questions_count'] = $category->questionsCount();
        }

        return $data;
    }
}
