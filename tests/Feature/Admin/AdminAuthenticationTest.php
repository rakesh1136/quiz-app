<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_login_screen_can_be_rendered(): void
    {
        $response = $this->get(route('admin.login'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/login')
        );
    }

    public function test_authenticated_admin_visiting_admin_login_is_redirected_to_dashboard(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get(route('admin.login'));

        $response->assertRedirect(route('admin.dashboard'));
    }

    public function test_admins_can_authenticate_through_admin_login(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->post(route('admin.login.store'), [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('admin.dashboard'));
    }

    public function test_normal_users_cannot_authenticate_through_admin_login(): void
    {
        $user = User::factory()->create();

        $response = $this->post(route('admin.login.store'), [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    public function test_admins_cannot_authenticate_through_user_login(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->post(route('login.store'), [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    public function test_normal_users_can_still_authenticate_through_user_login(): void
    {
        $user = User::factory()->create();

        $response = $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard'));
    }

    public function test_guests_are_redirected_to_admin_login_when_accessing_admin_dashboard(): void
    {
        $response = $this->get(route('admin.dashboard'));

        $response->assertRedirect(route('admin.login'));
    }

    public function test_normal_users_cannot_access_admin_dashboard(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('admin.dashboard'));

        $response->assertForbidden();
    }

    public function test_admins_can_access_admin_dashboard(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')
            ->has('stats.totalUsers')
        );
    }

    public function test_admins_can_access_admin_users_page(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get(route('admin.users.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/users/index')
        );
    }

    public function test_admins_can_logout_and_are_redirected_to_admin_login(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post(route('admin.logout'));

        $this->assertGuest();
        $response->assertRedirect(route('admin.login'));
    }

    public function test_new_users_default_to_user_role(): void
    {
        $user = User::factory()->create();

        $this->assertSame(UserRole::User, $user->role);
    }
}
