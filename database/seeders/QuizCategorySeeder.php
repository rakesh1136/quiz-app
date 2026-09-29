<?php

namespace Database\Seeders;

use App\Enums\UserStatus;
use App\Models\QuizCategory;
use Illuminate\Database\Seeder;

class QuizCategorySeeder extends Seeder
{
    /**
     * Seed demo quiz categories.
     *
     * @var array<int, array{name: string, slug: string, description: string}>
     */
    private array $categories = [
        [
            'name' => 'PHP',
            'slug' => 'php',
            'description' => 'Test your knowledge of PHP programming concepts, syntax, object-oriented programming, and core PHP features.',
        ],
        [
            'name' => 'Laravel',
            'slug' => 'laravel',
            'description' => 'Questions on Laravel routing, Eloquent ORM, middleware, migrations, validation, and framework best practices.',
        ],
        [
            'name' => 'JavaScript',
            'slug' => 'javascript',
            'description' => 'Modern JavaScript fundamentals including ES6+ features, async programming, closures, and the event loop.',
        ],
        [
            'name' => 'React',
            'slug' => 'react',
            'description' => 'React components, hooks, state management, rendering behavior, and frontend application patterns.',
        ],
        [
            'name' => 'MySQL',
            'slug' => 'mysql',
            'description' => 'SQL queries, relational database design, indexes, keys, joins, and transaction management in MySQL.',
        ],
        [
            'name' => 'HTML & CSS',
            'slug' => 'html-css',
            'description' => 'Web markup, semantic HTML, CSS layout, responsive design, and styling fundamentals.',
        ],
        [
            'name' => 'TypeScript',
            'slug' => 'typescript',
            'description' => 'Typed JavaScript including interfaces, type annotations, generics, and compile-time type safety.',
        ],
        [
            'name' => 'Python',
            'slug' => 'python',
            'description' => 'Python syntax, data structures, functions, OOP concepts, and common standard library features.',
        ],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ($this->categories as $category) {
            QuizCategory::query()->updateOrCreate(
                ['slug' => $category['slug']],
                [
                    'name' => $category['name'],
                    'description' => $category['description'],
                    'status' => UserStatus::Active,
                ],
            );
        }
    }
}
