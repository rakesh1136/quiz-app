<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DeleteUserRequest;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', User::class);

        $filters = $this->filtersFromRequest($request);

        $query = User::query();

        if ($filters['role'] !== 'all') {
            $query->where('role', $filters['role']);
        }

        if ($filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if ($filters['search'] !== '') {
            $search = $filters['search'];
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $allowedSorts = ['name', 'email', 'created_at', 'status'];
        $sort = in_array($filters['sort'], $allowedSorts, true) ? $filters['sort'] : 'created_at';
        $direction = $filters['direction'] === 'asc' ? 'asc' : 'desc';

        $users = $query
            ->orderBy($sort, $direction)
            ->paginate(10)
            ->withQueryString()
            ->through(fn (User $user) => $this->transformUser($user, $request));

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $filters,
            'roleOptions' => $this->roleFilterOptions(),
            'statusOptions' => $this->statusFilterOptions(),
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        Gate::authorize('create', User::class);

        return Inertia::render('admin/users/create', [
            'roleOptions' => UserRole::assignable(),
            'statusOptions' => UserStatus::options(),
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => $request->validated('password'),
            'role' => $request->validated('role'),
            'status' => $request->validated('status'),
            'email_verified_at' => now(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User created successfully.')]);

        return to_route('admin.users.index');
    }

    /**
     * Display the specified user.
     */
    public function show(Request $request, User $user): Response
    {
        Gate::authorize('view', $user);

        return Inertia::render('admin/users/show', [
            'user' => $this->transformUser($user, $request, detailed: true),
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(Request $request, User $user): Response
    {
        Gate::authorize('update', $user);

        return Inertia::render('admin/users/edit', [
            'user' => $this->transformUser($user, $request, detailed: true),
            'roleOptions' => UserRole::assignable(),
            'statusOptions' => UserStatus::options(),
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        Gate::authorize('update', $user);

        $data = [
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'role' => $request->validated('role'),
            'status' => $request->validated('status'),
        ];

        if ($request->filled('password')) {
            $data['password'] = $request->validated('password');
        }

        $user->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User updated successfully.')]);

        return to_route('admin.users.index', $request->query());
    }

    /**
     * Remove the specified user.
     */
    public function destroy(DeleteUserRequest $request, User $user): RedirectResponse
    {
        $user->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User deleted successfully.')]);

        return to_route('admin.users.index', $request->query());
    }

    /**
     * @return array{search: string, role: string, status: string, sort: string, direction: string}
     */
    private function filtersFromRequest(Request $request): array
    {
        return [
            'search' => $request->string('search')->toString(),
            'role' => $request->string('role')->toString() ?: 'user',
            'status' => $request->string('status')->toString() ?: 'all',
            'sort' => $request->string('sort')->toString() ?: 'created_at',
            'direction' => $request->string('direction')->toString() ?: 'desc',
        ];
    }

    /**
     * @return array<array{value: string, label: string}>
     */
    private function roleFilterOptions(): array
    {
        return [
            ['value' => 'all', 'label' => 'All'],
            ...UserRole::assignable(),
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
    private function transformUser(User $user, Request $request, bool $detailed = false): array
    {
        $data = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role->value,
            'role_label' => $user->role->label(),
            'status' => $user->status->value,
            'status_label' => $user->status->label(),
            'created_at' => $user->created_at?->toISOString(),
            'can_delete' => $request->user() && $user->id !== $request->user()->id,
        ];

        if ($detailed) {
            $data['updated_at'] = $user->updated_at?->toISOString();
            $data['email_verified_at'] = $user->email_verified_at?->toISOString();
        }

        return $data;
    }
}
