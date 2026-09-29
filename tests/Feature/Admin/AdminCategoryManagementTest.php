<?php

namespace Tests\Feature\Admin;

use App\Enums\UserStatus;
use App\Models\QuizCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminCategoryManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_categories_index(): void
    {
        $admin = User::factory()->admin()->create();
        QuizCategory::factory()->count(3)->create();

        $response = $this->actingAs($admin)->get(route('admin.categories.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/categories/index')
            ->has('categories.data', 3)
        );
    }

    public function test_categories_index_can_search_by_name(): void
    {
        $admin = User::factory()->admin()->create();
        QuizCategory::factory()->create(['name' => 'Laravel Basics']);
        QuizCategory::factory()->create(['name' => 'React Hooks']);

        $response = $this->actingAs($admin)->get(route('admin.categories.index', [
            'search' => 'Laravel',
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->has('categories.data', 1)
            ->where('categories.data.0.name', 'Laravel Basics')
        );
    }

    public function test_categories_index_can_filter_by_status(): void
    {
        $admin = User::factory()->admin()->create();
        QuizCategory::factory()->create(['status' => UserStatus::Active]);
        QuizCategory::factory()->inactive()->create(['name' => 'Inactive Category']);

        $response = $this->actingAs($admin)->get(route('admin.categories.index', [
            'status' => UserStatus::Inactive->value,
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->has('categories.data', 1)
            ->where('categories.data.0.name', 'Inactive Category')
        );
    }

    public function test_admin_can_create_category_with_auto_slug(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post(route('admin.categories.store'), [
            'name' => 'Web Development',
            'description' => 'Web related questions',
            'status' => UserStatus::Active->value,
        ]);

        $response->assertRedirect(route('admin.categories.index'));
        $this->assertDatabaseHas('quiz_categories', [
            'name' => 'Web Development',
            'slug' => 'web-development',
            'status' => UserStatus::Active->value,
        ]);
    }

    public function test_admin_cannot_create_duplicate_category_name(): void
    {
        $admin = User::factory()->admin()->create();
        QuizCategory::factory()->create(['name' => 'Laravel']);

        $response = $this->actingAs($admin)->post(route('admin.categories.store'), [
            'name' => 'Laravel',
            'status' => UserStatus::Active->value,
        ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_admin_can_update_category_and_regenerate_slug(): void
    {
        $admin = User::factory()->admin()->create();
        $category = QuizCategory::factory()->create([
            'name' => 'Old Name',
            'slug' => 'old-name',
        ]);

        $response = $this->actingAs($admin)->put(route('admin.categories.update', $category), [
            'name' => 'General Knowledge',
            'description' => 'Updated description',
            'status' => UserStatus::Inactive->value,
        ]);

        $response->assertRedirect(route('admin.categories.index'));
        $this->assertDatabaseHas('quiz_categories', [
            'id' => $category->id,
            'name' => 'General Knowledge',
            'slug' => 'general-knowledge',
            'status' => UserStatus::Inactive->value,
        ]);
    }

    public function test_admin_can_view_category_details(): void
    {
        $admin = User::factory()->admin()->create();
        $category = QuizCategory::factory()->create();

        $response = $this->actingAs($admin)->get(route('admin.categories.show', $category));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/categories/show')
            ->where('category.name', $category->name)
            ->where('category.questions_count', 0)
        );
    }

    public function test_admin_can_delete_category(): void
    {
        $admin = User::factory()->admin()->create();
        $category = QuizCategory::factory()->create();

        $response = $this->actingAs($admin)->delete(route('admin.categories.destroy', $category));

        $response->assertRedirect(route('admin.categories.index'));
        $this->assertDatabaseMissing('quiz_categories', ['id' => $category->id]);
    }

    public function test_normal_user_cannot_access_categories_module(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('admin.categories.index'));

        $response->assertForbidden();
    }

    public function test_slug_uniqueness_is_handled_when_duplicate_slug_exists(): void
    {
        QuizCategory::factory()->create([
            'name' => 'Laravel',
            'slug' => 'laravel',
        ]);

        $slug = QuizCategory::generateUniqueSlug('Laravel');

        $this->assertSame('laravel-1', $slug);
    }
}
