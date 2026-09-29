import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    BrainCircuit,
    CheckCircle2,
    Clock3,
    HelpCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { show as quizzesShow } from '@/routes/quizzes';
import type { FeaturedQuiz } from '@/types';

type Props = {
    quiz: FeaturedQuiz;
};

export function FeaturedQuizCard({ quiz }: Props) {
    const passingScore = Number.isInteger(quiz.passing_score)
        ? quiz.passing_score.toString()
        : quiz.passing_score.toFixed(0);

    return (
        <Card className="group flex h-full flex-col gap-0 overflow-hidden border-border/70 py-0 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10">
            <div className="relative overflow-hidden border-b border-indigo-500/10 bg-gradient-to-br from-indigo-500/15 via-violet-500/10 to-sky-500/10 px-5 py-5">
                <div className="absolute -top-10 -right-8 size-28 rounded-full bg-indigo-500/10 blur-2xl" />
                <div className="relative flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                        <BrainCircuit className="size-5" />
                    </span>
                    <Badge className="border-indigo-500/20 bg-background/80 text-foreground shadow-sm backdrop-blur">
                        {quiz.category_name}
                    </Badge>
                </div>
            </div>

            <CardHeader className="gap-2 px-5 pt-5 pb-0">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold tracking-tight transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {quiz.title}
                    </h3>
                    <p className="line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
                        {quiz.description?.trim() ||
                            'No description available.'}
                    </p>
                </div>
            </CardHeader>

            <CardContent className="mt-auto px-5 pt-5 pb-0">
                <div className="grid grid-cols-2 gap-2">
                    <span className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs font-medium text-muted-foreground">
                        <HelpCircle className="size-4 text-indigo-500" />
                        <span>
                            {quiz.questions_count}{' '}
                            {quiz.questions_count === 1
                                ? 'Question'
                                : 'Questions'}
                        </span>
                    </span>
                    <span className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs font-medium text-muted-foreground">
                        <Clock3 className="size-4 text-violet-500" />
                        <span>
                            {quiz.duration}{' '}
                            {quiz.duration === 1 ? 'Minute' : 'Minutes'}
                        </span>
                    </span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    <span>Passing score</span>
                    <span className="ml-auto font-semibold text-foreground">
                        {passingScore}%
                    </span>
                </div>
            </CardContent>

            <CardFooter className="px-5 pt-4 pb-5">
                <Button className="w-full" asChild data-test="view-quiz-button">
                    <Link href={quizzesShow(quiz.id)} prefetch>
                        View Quiz
                        <ArrowRight className="size-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
