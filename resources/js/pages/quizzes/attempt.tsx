import { Head, router } from '@inertiajs/react';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { QuestionNavigator } from '@/components/user/question-navigator';
import { QuizTimer } from '@/components/user/quiz-timer';
import { useAttemptCountdown } from '@/hooks/use-attempt-countdown';
import { confirmAction } from '@/lib/confirm-delete';
import { cn } from '@/lib/utils';
import { submit as submitAttempt } from '@/routes/quizzes/attempts';
import { save as saveAnswer } from '@/routes/quizzes/attempts/answers';
import type { QuizAttemptPageData } from '@/types';

type Props = QuizAttemptPageData;

export default function QuizAttemptPage({
    quiz,
    attempt,
    questions,
    answers: initialAnswers,
}: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] =
        useState<Record<string, number | null>>(initialAnswers);
    const [savingQuestionId, setSavingQuestionId] = useState<number | null>(
        null,
    );
    const [submitting, setSubmitting] = useState(false);
    const [timeExpired, setTimeExpired] = useState(false);
    const submittedRef = useRef(false);

    useEffect(() => {
        setAnswers(initialAnswers);
    }, [initialAnswers]);

    const submitNow = useCallback(() => {
        if (submittedRef.current) {
            return;
        }

        submittedRef.current = true;
        setSubmitting(true);

        router.post(
            submitAttempt.url({ quiz: quiz.id, attempt: attempt.id }),
            {},
            {
                preserveScroll: true,
                onError: () => {
                    submittedRef.current = false;
                    setSubmitting(false);
                },
            },
        );
    }, [attempt.id, quiz.id]);

    const handleAutoSubmit = useCallback(() => {
        setTimeExpired(true);
        submitNow();
    }, [submitNow]);

    const remainingSeconds = useAttemptCountdown({
        remainingSeconds: attempt.remaining_seconds,
        onExpire: handleAutoSubmit,
    });

    const totalQuestions = questions.length;
    const currentQuestion = questions[currentIndex];
    const selectedOptionId = currentQuestion
        ? (answers[String(currentQuestion.id)] ?? null)
        : null;
    const progressPercent =
        totalQuestions > 0
            ? Math.round(((currentIndex + 1) / totalQuestions) * 100)
            : 0;
    const answeredCount = questions.filter(
        (question) => answers[String(question.id)],
    ).length;
    const unansweredCount = totalQuestions - answeredCount;
    const isLastQuestion = currentIndex >= totalQuestions - 1;
    const locked = timeExpired || remainingSeconds <= 0;
    const frozen = locked || submitting;

    const handleManualSubmit = async () => {
        if (submittedRef.current) {
            return;
        }

        const confirmed = await confirmAction({
            title: 'Are you sure you want to submit the quiz?',
            html: `Answered: <strong>${answeredCount}</strong><br />Unanswered: <strong>${unansweredCount}</strong><br /><br />You won't be able to change your answers after submitting.`,
            confirmButtonText: 'Submit Quiz',
            cancelButtonText: 'Keep Answering',
            confirmButtonColor: '#059669',
        });

        if (!confirmed) {
            return;
        }

        submitNow();
    };

    const handleSelectOption = (optionId: number) => {
        if (!currentQuestion || savingQuestionId !== null || frozen) {
            return;
        }

        const questionId = currentQuestion.id;

        setAnswers((previous) => ({
            ...previous,
            [String(questionId)]: optionId,
        }));
        setSavingQuestionId(questionId);

        router.put(
            saveAnswer.url({
                quiz: quiz.id,
                attempt: attempt.id,
            }),
            {
                question_id: questionId,
                selected_option_id: optionId,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setSavingQuestionId(null),
            },
        );
    };

    if (!currentQuestion || totalQuestions === 0) {
        return (
            <>
                <Head title={quiz.title} />
                <Card>
                    <CardContent className="py-10 text-center text-sm text-muted-foreground">
                        This quiz has no questions available.
                    </CardContent>
                </Card>
            </>
        );
    }

    return (
        <>
            <Head title={`${quiz.title} — Attempt`} />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            {quiz.title}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Question {currentIndex + 1} of {totalQuestions}
                        </p>
                    </div>

                    <div className="sm:w-72">
                        <QuizTimer
                            remainingSeconds={remainingSeconds}
                            totalSeconds={attempt.duration_seconds}
                        />
                    </div>
                </div>

                <div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <p className="mt-1.5 text-right text-xs text-muted-foreground">
                        {progressPercent}%
                    </p>
                </div>

                {locked ? (
                    <Card className="border-rose-500/30 bg-rose-500/5">
                        <CardContent className="py-4 text-center text-sm text-rose-600 dark:text-rose-400">
                            Your quiz time has ended. Submitting your attempt...
                        </CardContent>
                    </Card>
                ) : null}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="flex flex-col gap-4 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg leading-7 sm:text-xl">
                                    {currentQuestion.question}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="flex flex-col gap-3"
                                    role="radiogroup"
                                    aria-label="Answer options"
                                >
                                    {currentQuestion.options.map(
                                        (option, index) => {
                                            const isSelected =
                                                selectedOptionId === option.id;
                                            const optionLabel =
                                                String.fromCharCode(65 + index);

                                            return (
                                                <button
                                                    key={option.id}
                                                    type="button"
                                                    role="radio"
                                                    aria-checked={isSelected}
                                                    disabled={
                                                        savingQuestionId !==
                                                            null || frozen
                                                    }
                                                    onClick={() =>
                                                        handleSelectOption(
                                                            option.id,
                                                        )
                                                    }
                                                    className={cn(
                                                        'flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-all',
                                                        isSelected
                                                            ? 'border-primary bg-primary/10 shadow-sm'
                                                            : 'border-border/70 bg-background hover:border-primary/40 hover:bg-muted/40',
                                                        (savingQuestionId !==
                                                            null ||
                                                            frozen) &&
                                                            'opacity-70',
                                                    )}
                                                    data-test="attempt-option"
                                                >
                                                    <span
                                                        className={cn(
                                                            'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                                                            isSelected
                                                                ? 'border-primary bg-primary text-primary-foreground'
                                                                : 'border-border bg-muted text-muted-foreground',
                                                        )}
                                                    >
                                                        {optionLabel}
                                                    </span>
                                                    <span className="text-sm leading-6">
                                                        {option.option_text}
                                                    </span>
                                                </button>
                                            );
                                        },
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex items-center justify-between gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={currentIndex === 0 || frozen}
                                onClick={() =>
                                    setCurrentIndex((index) =>
                                        Math.max(0, index - 1),
                                    )
                                }
                                data-test="attempt-previous"
                            >
                                <ChevronLeft className="size-4" />
                                Previous
                            </Button>

                            <p className="hidden text-xs text-muted-foreground sm:block">
                                {selectedOptionId
                                    ? 'Answer saved'
                                    : 'Select an option to continue'}
                            </p>

                            {isLastQuestion ? (
                                <Button
                                    type="button"
                                    disabled={submitting}
                                    onClick={handleManualSubmit}
                                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                                    data-test="attempt-submit"
                                >
                                    {submitting ? (
                                        <Spinner />
                                    ) : (
                                        <CheckCircle2 className="size-4" />
                                    )}
                                    {submitting
                                        ? 'Submitting...'
                                        : 'Submit Quiz'}
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    disabled={frozen}
                                    onClick={() =>
                                        setCurrentIndex((index) =>
                                            Math.min(
                                                totalQuestions - 1,
                                                index + 1,
                                            ),
                                        )
                                    }
                                    data-test="attempt-next"
                                >
                                    Next
                                    <ChevronRight className="size-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
                        <QuestionNavigator
                            questions={questions}
                            answers={answers}
                            currentIndex={currentIndex}
                            onNavigate={(index) => {
                                if (!frozen) {
                                    setCurrentIndex(index);
                                }
                            }}
                        />

                        <div className="rounded-2xl border border-border/70 bg-card p-4">
                            <p className="text-xs text-muted-foreground">
                                You can submit at any time. Unanswered questions
                                are allowed.
                            </p>
                            <Button
                                type="button"
                                disabled={submitting}
                                onClick={handleManualSubmit}
                                className="mt-3 w-full bg-emerald-600 text-white hover:bg-emerald-700"
                                data-test="attempt-submit-sidebar"
                            >
                                {submitting ? (
                                    <Spinner />
                                ) : (
                                    <CheckCircle2 className="size-4" />
                                )}
                                {submitting ? 'Submitting...' : 'Submit Quiz'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
