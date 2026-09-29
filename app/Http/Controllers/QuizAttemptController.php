<?php

namespace App\Http\Controllers;

use App\Enums\QuizAttemptStatus;
use App\Enums\QuizStatus;
use App\Enums\UserStatus;
use App\Http\Requests\StoreQuizAttemptAnswerRequest;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizAttemptAnswer;
use App\Services\QuizAttemptScorer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class QuizAttemptController extends Controller
{
    public function __construct(protected QuizAttemptScorer $scorer) {}

    /**
     * List the authenticated user's quiz attempts.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user !== null && $user->status === UserStatus::Active, 403);

        $this->scorer->finalizePendingForUser($user->id);

        $attempts = QuizAttempt::query()
            ->with(['quiz:id,title,duration'])
            ->where('user_id', $user->id)
            ->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (QuizAttempt $attempt) => $this->mapAttemptSummary($attempt));

        return Inertia::render('quizzes/attempts', [
            'attempts' => $attempts,
        ]);
    }

    /**
     * Start a new quiz attempt, or resume an in-progress one.
     */
    public function store(Request $request, Quiz $quiz): RedirectResponse
    {
        abort_unless($quiz->status === QuizStatus::Published, 404);

        $user = $request->user();

        abort_unless($user !== null && $user->status === UserStatus::Active, 403);

        abort_unless($quiz->questions()->exists(), 422, 'This quiz has no questions.');

        $attempt = DB::transaction(function () use ($user, $quiz): ?QuizAttempt {
            $existingAttempt = QuizAttempt::query()
                ->where('user_id', $user->id)
                ->where('quiz_id', $quiz->id)
                ->where('status', QuizAttemptStatus::InProgress)
                ->lockForUpdate()
                ->latest('id')
                ->first();

            if ($existingAttempt) {
                return $existingAttempt;
            }

            $attemptCount = QuizAttempt::query()
                ->where('user_id', $user->id)
                ->where('quiz_id', $quiz->id)
                ->lockForUpdate()
                ->count();

            if ($attemptCount >= $quiz->max_attempts) {
                return null;
            }

            return QuizAttempt::query()->create([
                'user_id' => $user->id,
                'quiz_id' => $quiz->id,
                'status' => QuizAttemptStatus::InProgress,
                'started_at' => now(),
            ]);
        });

        if (! $attempt) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('You have reached the maximum number of attempts for this quiz.'),
            ]);

            return redirect()->route('quizzes.show', $quiz);
        }

        return redirect()->route('quizzes.attempts.show', [
            'quiz' => $quiz,
            'attempt' => $attempt,
        ]);
    }

    /**
     * Display the quiz attempt page.
     */
    public function show(Request $request, Quiz $quiz, QuizAttempt $attempt): Response|RedirectResponse
    {
        $this->authorizeAttempt($request, $quiz, $attempt);

        $attempt->setRelation('quiz', $quiz);

        if ($attempt->isSubmitted()) {
            return $this->redirectToResult($quiz, $this->scorer->finalize($attempt));
        }

        if ($attempt->hasExpired()) {
            return $this->redirectToResult($quiz, $this->scorer->finalize($attempt));
        }

        $questions = $quiz->questions()
            ->with(['options' => fn ($query) => $query->orderBy('sort_order')])
            ->get()
            ->map(fn (Question $question) => [
                'id' => $question->id,
                'question' => $question->question,
                'options' => $question->options
                    ->map(fn (QuestionOption $option) => [
                        'id' => $option->id,
                        'option_text' => $option->option_text,
                    ])
                    ->values()
                    ->all(),
            ])
            ->values()
            ->all();

        $answers = $attempt->answers()
            ->get(['question_id', 'selected_option_id'])
            ->mapWithKeys(fn (QuizAttemptAnswer $answer) => [
                (string) $answer->question_id => $answer->selected_option_id,
            ])
            ->all();

        return Inertia::render('quizzes/attempt', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'duration' => $quiz->duration,
            ],
            'attempt' => [
                'id' => $attempt->id,
                'status' => $attempt->status->value,
                'started_at' => $attempt->started_at?->toISOString(),
                'expires_at' => $attempt->expiresAt()?->toISOString(),
                'duration_seconds' => $quiz->duration * 60,
                'remaining_seconds' => $attempt->remainingSeconds(),
            ],
            'questions' => $questions,
            'answers' => $answers,
        ]);
    }

    /**
     * Save or update the selected answer for a question.
     */
    public function saveAnswer(
        StoreQuizAttemptAnswerRequest $request,
        Quiz $quiz,
        QuizAttempt $attempt,
    ): RedirectResponse {
        $this->authorizeAttempt($request, $quiz, $attempt);

        $attempt->setRelation('quiz', $quiz);

        abort_if($attempt->isSubmitted(), 403);

        if ($attempt->hasExpired()) {
            return $this->redirectToResult($quiz, $this->scorer->finalize($attempt));
        }

        QuizAttemptAnswer::query()->updateOrCreate(
            [
                'quiz_attempt_id' => $attempt->id,
                'question_id' => (int) $request->validated('question_id'),
            ],
            [
                'selected_option_id' => (int) $request->validated('selected_option_id'),
            ],
        );

        return back();
    }

    /**
     * Submit and score the attempt on the server.
     */
    public function submit(Request $request, Quiz $quiz, QuizAttempt $attempt): RedirectResponse
    {
        $this->authorizeAttempt($request, $quiz, $attempt);

        $attempt->setRelation('quiz', $quiz);

        return $this->redirectToResult($quiz, $this->scorer->finalize($attempt));
    }

    /**
     * Display the persisted result without recalculating a completed attempt.
     */
    public function result(Request $request, Quiz $quiz, QuizAttempt $attempt): Response|RedirectResponse
    {
        $this->authorizeAttempt($request, $quiz, $attempt);

        $attempt->setRelation('quiz', $quiz);

        if ($attempt->isInProgress() && ! $attempt->hasExpired()) {
            return redirect()->route('quizzes.attempts.show', [
                'quiz' => $quiz,
                'attempt' => $attempt,
            ]);
        }

        $attempt = $this->scorer->finalize($attempt);

        return Inertia::render('quizzes/result', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'passing_score' => (float) $quiz->passing_score,
            ],
            'attempt' => [
                'id' => $attempt->id,
                'status' => $attempt->status->value,
                'completed_at' => $attempt->completed_at?->toISOString(),
                'timed_out' => $attempt->wasSubmittedAfterExpiry(),
                'total_questions' => $attempt->total_questions,
                'attempted_questions' => $attempt->attempted_questions,
                'correct_answers' => $attempt->correct_answers,
                'wrong_answers' => $attempt->wrong_answers,
                'unanswered_questions' => $attempt->unanswered_questions,
                'total_marks' => (float) $attempt->total_marks,
                'obtained_marks' => (float) $attempt->score,
                'percentage' => (float) $attempt->percentage,
                'is_passed' => $attempt->is_passed,
            ],
        ]);
    }

    /**
     * Keep the previous confirmation URL working.
     */
    public function submitted(Request $request, Quiz $quiz, QuizAttempt $attempt): RedirectResponse
    {
        $this->authorizeAttempt($request, $quiz, $attempt);

        $attempt->setRelation('quiz', $quiz);

        if ($attempt->isInProgress() && ! $attempt->hasExpired()) {
            return redirect()->route('quizzes.attempts.show', [
                'quiz' => $quiz,
                'attempt' => $attempt,
            ]);
        }

        return $this->redirectToResult($quiz, $this->scorer->finalize($attempt));
    }

    /**
     * Shared guard for every attempt endpoint.
     */
    protected function authorizeAttempt(Request $request, Quiz $quiz, QuizAttempt $attempt): void
    {
        abort_unless($quiz->status === QuizStatus::Published, 404);
        abort_unless($attempt->quiz_id === $quiz->id, 404);
        abort_unless($attempt->user_id === $request->user()?->id, 403);
    }

    protected function redirectToResult(Quiz $quiz, QuizAttempt $attempt): RedirectResponse
    {
        return redirect()->route('quizzes.attempts.result', [
            'quiz' => $quiz,
            'attempt' => $attempt,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    protected function mapAttemptSummary(QuizAttempt $attempt): array
    {
        $inProgress = $attempt->isInProgress();

        return [
            'id' => $attempt->id,
            'quiz_id' => $attempt->quiz_id,
            'quiz_title' => $attempt->quiz?->title ?? 'Deleted quiz',
            'status' => $attempt->status->value,
            'started_at' => $attempt->started_at?->toISOString(),
            'completed_at' => $attempt->completed_at?->toISOString(),
            'obtained_marks' => $attempt->score !== null ? (float) $attempt->score : null,
            'total_marks' => $attempt->total_marks !== null ? (float) $attempt->total_marks : null,
            'percentage' => $attempt->percentage !== null ? (float) $attempt->percentage : null,
            'is_passed' => $inProgress ? null : (bool) $attempt->is_passed,
            'remaining_seconds' => $inProgress ? $attempt->remainingSeconds() : null,
        ];
    }
}
