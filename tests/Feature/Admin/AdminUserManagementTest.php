<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_users_index(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->count(3)->create();

        $response = $this->actingAs($admin)->get(route('admin.users.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/users/index')
            ->has('users.data', 3)
            ->where('filters.role', 'user')
        );
    }

    public function test_users_index_excludes_admins_by_default(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->create();
        User::factory()->admin()->create(['email' => 'other-admin@example.com']);

        $response = $this->actingAs($admin)->get(route('admin.users.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->has('users.data', 1)
            ->where('users.data.0.role', UserRole::User->value)
        );
    }

    public function test_users_index_can_filter_by_role_all(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->create();
        User::factory()->admin()->create(['email' => 'other-admin@example.com']);

        $response = $this->actingAs($admin)->get(route('admin.users.index', ['role' => 'all']));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->has('users.data', 3)
        );
    }

    public function test_users_index_can_search_by_name(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->create(['name' => 'Jane Doe']);
        User::factory()->create(['name' => 'John Smith']);

        $response = $this->actingAs($admin)->get(route('admin.users.index', [
            'search' => 'Jane',
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->has('users.data', 1)
            ->where('users.data.0.name', 'Jane Doe')
        );
    }

    public function test_users_index_can_filter_by_status(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->create(['status' => UserStatus::Active]);
        User::factory()->create([
            'email' => 'inactive@example.com',
            'status' => UserStatus::Inactive,
        ]);

        $response = $this->actingAs($admin)->get(route('admin.users.index', [
            'status' => UserStatus::Inactive->value,
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->has('users.data', 1)
            ->where('users.data.0.email', 'inactive@example.com')
        );
    }

    public function test_admin_can_create_user(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post(route('admin.users.store'), [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => UserRole::User->value,
            'status' => UserStatus::Active->value,
        ]);

        $response->assertRedirect(route('admin.users.index'));
        $this->assertDatabaseHas('users', [
            'email' => 'newuser@example.com',
            'role' => UserRole::User->value,
            'status' => UserStatus::Active->value,
        ]);
    }

    public function test_admin_can_update_user(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();

        $response = $this->actingAs($admin)->put(route('admin.users.update', $user), [
            'name' => 'Updated Name',
            'email' => $user->email,
            'role' => UserRole::User->value,
            'status' => UserStatus::Inactive->value,
        ]);

        $response->assertRedirect(route('admin.users.index'));
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
            'status' => UserStatus::Inactive->value,
        ]);
    }

    public function test_admin_can_view_user_details(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();

        $response = $this->actingAs($admin)->get(route('admin.users.show', $user));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/users/show')
            ->where('user.email', $user->email)
        );
    }

    public function test_admin_can_delete_user(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();

        $response = $this->actingAs($admin)->delete(route('admin.users.destroy', $user));

        $response->assertRedirect(route('admin.users.index'));
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_admin_cannot_delete_own_account(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->delete(route('admin.users.destroy', $admin));

        $response->assertForbidden();
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_normal_user_cannot_access_users_module(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('admin.users.index'));

        $response->assertForbidden();
    }

    public function test_create_user_validation_errors(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post(route('admin.users.store'), [
            'name' => '',
            'email' => 'not-an-email',
            'password' => 'short',
            'password_confirmation' => 'mismatch',
            'role' => 'invalid',
            'status' => 'invalid',
        ]);

        $response->assertSessionHasErrors([
            'name',
            'email',
            'password',
            'role',
            'status',
        ]);
    }
}
