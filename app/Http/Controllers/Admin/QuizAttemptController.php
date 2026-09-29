<?php

namespace App\Http\Controllers\Admin;

use App\Enums\QuizAttemptStatus;
use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizAttemptAnswer;
use App\Models\QuizCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class QuizAttemptController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', QuizAttempt::class);

        $filters = $this->filtersFromRequest($request);

        $query = QuizAttempt::query()
            ->with([
                'user:id,name,email',
                'quiz:id,title,category_id',
                'quiz.category:id,name',
            ])
            ->whereIn('status', [
                QuizAttemptStatus::Submitted,
                QuizAttemptStatus::Completed,
            ]);

        if ($filters['status'] === 'passed') {
            $query->where('is_passed', true);
        } elseif ($filters['status'] === 'failed') {
            $query->where('is_passed', false);
        }

        if ($filters['quiz_id'] !== 'all') {
            $query->where('quiz_id', $filters['quiz_id']);
        }

        if ($filters['category_id'] !== 'all') {
            $query->whereHas('quiz', function ($builder) use ($filters): void {
                $builder->where('category_id', $filters['category_id']);
            });
        }

        if ($filters['search'] !== '') {
            $search = $filters['search'];

            $query->where(function ($builder) use ($search): void {
                $builder
                    ->whereHas('user', function ($userQuery) use ($search): void {
                        $userQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('quiz', function ($quizQuery) use ($search): void {
                        $quizQuery->where('title', 'like', "%{$search}%");
                    });
            });
        }

        $attempts = $query
            ->latest('completed_at')
            ->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (QuizAttempt $attempt) => $this->transformAttempt($attempt));

        return Inertia::render('admin/attempts/index', [
            'attempts' => $attempts,
            'filters' => $filters,
            'statusOptions' => $this->statusFilterOptions(),
            'quizOptions' => $this->quizFilterOptions(),
            'categoryOptions' => $this->categoryFilterOptions(),
        ]);
    }

    public function show(Request $request, QuizAttempt $attempt): Response
    {
        Gate::authorize('view', $attempt);

        abort_unless(
            in_array($attempt->status, [
                QuizAttemptStatus::Submitted,
                QuizAttemptStatus::Completed,
            ], true),
            404,
        );

        $attempt->load([
            'user:id,name,email',
            'quiz:id,title,category_id,passing_score',
            'quiz.category:id,name',
            'quiz.questions:id,question,marks,negative_marks',
            'quiz.questions.options:id,question_id,option_text,is_correct,sort_order',
            'answers:id,quiz_attempt_id,question_id,selected_option_id',
        ]);

        return Inertia::render('admin/attempts/show', [
            'attempt' => $this->transformAttempt($attempt, detailed: true),
            'questions' => $this->transformReviewQuestions($attempt),
            'backUrl' => route('admin.attempts.index', $this->activeFilters($request)),
        ]);
    }

    /**
     * @return array{
     *     search: string,
     *     status: string,
     *     quiz_id: string,
     *     category_id: string
     * }
     */
    private function filtersFromRequest(Request $request): array
    {
        $status = (string) $request->string('status', 'all');
        $allowedStatuses = ['all', 'passed', 'failed'];

        return [
            'search' => trim((string) $request->string('search')),
            'status' => in_array($status, $allowedStatuses, true) ? $status : 'all',
            'quiz_id' => $this->optionalIdFilter($request->input('quiz_id')),
            'category_id' => $this->optionalIdFilter($request->input('category_id')),
        ];
    }

    private function optionalIdFilter(mixed $value): string
    {
        if ($value === null || $value === '' || $value === 'all') {
            return 'all';
        }

        return ctype_digit((string) $value) ? (string) $value : 'all';
    }

    /**
     * Keep only active listing filters when returning from the review page.
     *
     * @return array<string, string>
     */
    private function activeFilters(Request $request): array
    {
        return array_filter(
            $this->filtersFromRequest($request),
            fn (string $value): bool => $value !== '' && $value !== 'all',
        );
    }

    /**
     * @return array<array{value: string, label: string}>
     */
    private function statusFilterOptions(): array
    {
        return [
            ['value' => 'all', 'label' => 'All'],
            ['value' => 'passed', 'label' => 'Passed'],
            ['value' => 'failed', 'label' => 'Failed'],
        ];
    }

    /**
     * @return array<array{value: string, label: string}>
     */
    private function quizFilterOptions(): array
    {
        return [
            ['value' => 'all', 'label' => 'All Quizzes'],
            ...Quiz::query()
                ->orderBy('title')
                ->get(['id', 'title'])
                ->map(fn (Quiz $quiz) => [
                    'value' => (string) $quiz->id,
                    'label' => $quiz->title,
                ])
                ->all(),
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
     * @return array<string, mixed>
     */
    private function transformAttempt(QuizAttempt $attempt, bool $detailed = false): array
    {
        $data = [
            'id' => $attempt->id,
            'user' => [
                'id' => $attempt->user?->id,
                'name' => $attempt->user?->name ?? 'Deleted user',
                'email' => $attempt->user?->email,
            ],
            'quiz' => [
                'id' => $attempt->quiz?->id,
                'title' => $attempt->quiz?->title ?? 'Deleted quiz',
                'category_name' => $attempt->quiz?->category?->name,
            ],
            'total_questions' => $attempt->total_questions,
            'attempted_questions' => $attempt->attempted_questions,
            'score' => $attempt->score === null ? null : (float) $attempt->score,
            'total_marks' => $attempt->total_marks === null ? null : (float) $attempt->total_marks,
            'percentage' => $attempt->percentage === null ? null : (float) $attempt->percentage,
            'is_passed' => $attempt->is_passed,
            'status' => $attempt->is_passed === null
                ? 'unknown'
                : ($attempt->is_passed ? 'passed' : 'failed'),
            'status_label' => $attempt->is_passed === null
                ? '—'
                : ($attempt->is_passed ? 'Passed' : 'Failed'),
            'completed_at' => $attempt->completed_at?->toISOString(),
        ];

        if ($detailed) {
            $data['correct_answers'] = $attempt->correct_answers;
            $data['wrong_answers'] = $attempt->wrong_answers;
            $data['unanswered_questions'] = $attempt->unanswered_questions;
            $data['started_at'] = $attempt->started_at?->toISOString();
            $data['quiz']['passing_score'] = $attempt->quiz?->passing_score === null
                ? null
                : (float) $attempt->quiz->passing_score;
        }

        return $data;
    }

    /**
     * Build a read-only review using the same per-question rules as QuizAttemptScorer.
     *
     * @return array<int, array<string, mixed>>
     */
    private function transformReviewQuestions(QuizAttempt $attempt): array
    {
        $answers = $attempt->answers->keyBy('question_id');

        return $attempt->quiz->questions
            ->values()
            ->map(function ($question, int $index) use ($answers): array {
                /** @var QuizAttemptAnswer|null $answer */
                $answer = $answers->get($question->id);
                $selectedOptionId = $answer?->selected_option_id;
                $correctOption = $question->options->firstWhere('is_correct', true);

                $status = match (true) {
                    $selectedOptionId === null => 'unanswered',
                    $correctOption !== null && $selectedOptionId === $correctOption->id => 'correct',
                    default => 'wrong',
                };

                $marksAwarded = match ($status) {
                    'correct' => (float) $question->marks,
                    'wrong' => -((float) $question->negative_marks),
                    default => 0.0,
                };

                return [
                    'id' => $question->id,
                    'number' => $index + 1,
                    'text' => $question->question,
                    'status' => $status,
                    'status_label' => ucfirst($status),
                    'marks_awarded' => $marksAwarded,
                    'marks' => (float) $question->marks,
                    'negative_marks' => (float) $question->negative_marks,
                    'selected_option_id' => $selectedOptionId,
                    'correct_option_id' => $correctOption?->id,
                    'options' => $question->options
                        ->values()
                        ->map(fn ($option, int $optionIndex) => [
                            'id' => $option->id,
                            'label' => chr(65 + $optionIndex),
                            'text' => $option->option_text,
                            'is_selected' => $option->id === $selectedOptionId,
                            'is_correct' => $option->id === $correctOption?->id,
                        ])
                        ->all(),
                ];
            })
            ->all();
    }
}
