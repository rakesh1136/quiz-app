import { cn } from '@/lib/utils';
import type { AttemptQuestion } from '@/types';

type Props = {
    questions: AttemptQuestion[];
    answers: Record<string, number | null>;
    currentIndex: number;
    onNavigate: (index: number) => void;
};

export function QuestionNavigator({
    questions,
    answers,
    currentIndex,
    onNavigate,
}: Props) {
    const answeredCount = questions.filter(
        (question) => answers[String(question.id)],
    ).length;

    return (
        <div className="rounded-2xl border border-border/70 bg-card p-4">
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold tracking-tight">
                    Questions
                </h2>
                <span className="text-xs text-muted-foreground">
                    {answeredCount}/{questions.length} answered
                </span>
            </div>

            <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5">
                {questions.map((question, index) => {
                    const isCurrent = index === currentIndex;
                    const isAnswered = Boolean(answers[String(question.id)]);

                    return (
                        <button
                            key={question.id}
                            type="button"
                            onClick={() => onNavigate(index)}
                            aria-current={isCurrent ? 'true' : undefined}
                            aria-label={`Question ${index + 1}${isAnswered ? ' (answered)' : ''}`}
                            className={cn(
                                'flex size-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors',
                                isCurrent
                                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                    : isAnswered
                                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400'
                                      : 'border-border/70 bg-background text-muted-foreground hover:bg-muted',
                            )}
                            data-test="question-navigator-item"
                        >
                            {index + 1}
                        </button>
                    );
                })}
            </div>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                    <span className="size-3 rounded-sm bg-primary" />
                    Current
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <span className="size-3 rounded-sm border border-emerald-500/40 bg-emerald-500/20" />
                    Answered
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <span className="size-3 rounded-sm border border-border bg-background" />
                    Unanswered
                </span>
            </div>
        </div>
    );
}
