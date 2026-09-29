import { ArrowDown, ArrowUp, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DifficultyBadge } from '@/components/admin/difficulty-badge';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type {
    AdminQuiz,
    BankQuestion,
    CategorySelectOption,
    SelectOption,
} from '@/types';

type BaseProps = {
    errors: Record<string, string | undefined>;
    categoryOptions: CategorySelectOption[];
    statusOptions: SelectOption[];
    bankQuestions: BankQuestion[];
    difficultyOptions: SelectOption[];
    questionStatusOptions: SelectOption[];
};

type CreateProps = BaseProps & {
    mode: 'create';
};

type EditProps = BaseProps & {
    mode: 'edit';
    quiz: AdminQuiz;
};

type Props = CreateProps | EditProps;

function truncate(text: string, length = 90): string {
    return text.length > length ? `${text.slice(0, length)}...` : text;
}

export function QuizFormFields(props: Props) {
    const {
        errors,
        categoryOptions,
        statusOptions,
        bankQuestions,
        difficultyOptions,
        questionStatusOptions,
    } = props;
    const quiz = props.mode === 'edit' ? props.quiz : null;

    const [title, setTitle] = useState(quiz?.title ?? '');
    const [categoryId, setCategoryId] = useState(
        quiz ? String(quiz.category_id) : (categoryOptions[0]?.value ?? ''),
    );
    const [duration, setDuration] = useState(String(quiz?.duration ?? 30));
    const [passingScore, setPassingScore] = useState(
        String(quiz?.passing_score ?? 60),
    );
    const [maxAttempts, setMaxAttempts] = useState(
        String(quiz?.max_attempts ?? 2),
    );
    const [status, setStatus] = useState(quiz?.status ?? 'draft');
    const [selectedIds, setSelectedIds] = useState<number[]>(
        quiz?.question_ids ?? [],
    );

    const [bankSearch, setBankSearch] = useState('');
    const [bankCategory, setBankCategory] = useState('all');
    const [bankDifficulty, setBankDifficulty] = useState('all');
    const [bankStatus, setBankStatus] = useState('active');

    const questionMap = useMemo(() => {
        return new Map(bankQuestions.map((question) => [question.id, question]));
    }, [bankQuestions]);

    const filteredBankQuestions = useMemo(() => {
        return bankQuestions.filter((question) => {
            if (
                bankSearch &&
                !question.question
                    .toLowerCase()
                    .includes(bankSearch.toLowerCase())
            ) {
                return false;
            }

            if (
                bankCategory !== 'all' &&
                String(question.category_id) !== bankCategory
            ) {
                return false;
            }

            if (
                bankDifficulty !== 'all' &&
                question.difficulty !== bankDifficulty
            ) {
                return false;
            }

            if (bankStatus !== 'all' && question.status !== bankStatus) {
                return false;
            }

            return true;
        });
    }, [bankQuestions, bankSearch, bankCategory, bankDifficulty, bankStatus]);

    const preferredBankQuestions = useMemo(() => {
        if (!categoryId) {
            return filteredBankQuestions;
        }

        return [...filteredBankQuestions].sort((a, b) => {
            const aMatch = String(a.category_id) === categoryId ? 0 : 1;
            const bMatch = String(b.category_id) === categoryId ? 0 : 1;

            return aMatch - bMatch;
        });
    }, [filteredBankQuestions, categoryId]);

    const selectedQuestions = selectedIds
        .map((id) => questionMap.get(id))
        .filter((question): question is BankQuestion => Boolean(question));

    const totalMarks = selectedQuestions.reduce(
        (sum, question) => sum + question.marks,
        0,
    );

    const toggleQuestion = (questionId: number) => {
        setSelectedIds((current) => {
            if (current.includes(questionId)) {
                return current.filter((id) => id !== questionId);
            }

            return [...current, questionId];
        });
    };

    const moveQuestion = (index: number, direction: -1 | 1) => {
        setSelectedIds((current) => {
            const nextIndex = index + direction;

            if (nextIndex < 0 || nextIndex >= current.length) {
                return current;
            }

            const next = [...current];
            const [item] = next.splice(index, 1);
            next.splice(nextIndex, 0, item);

            return next;
        });
    };

    const removeQuestion = (questionId: number) => {
        setSelectedIds((current) =>
            current.filter((id) => id !== questionId),
        );
    };

    return (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="grid gap-6">
                {selectedIds.map((id, index) => (
                    <input
                        key={`${id}-${index}`}
                        type="hidden"
                        name={`question_ids[${index}]`}
                        value={id}
                    />
                ))}

                <div className="grid gap-2">
                    <Label htmlFor="title">Quiz Title</Label>
                    <Input
                        id="title"
                        name="title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        required
                        placeholder="PHP Advanced Assessment"
                    />
                    <InputError message={errors.title} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="category_id">Category</Label>
                    <input type="hidden" name="category_id" value={categoryId} />
                    <Select
                        value={categoryId}
                        onValueChange={(value) => {
                            setCategoryId(value);
                            setBankCategory(value);
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categoryOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.category_id} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                        id="description"
                        name="description"
                        defaultValue={quiz?.description ?? ''}
                        rows={4}
                        placeholder="Quiz instructions or description"
                        className={cn(
                            'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex min-h-[100px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]',
                        )}
                    />
                    <InputError message={errors.description} />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="grid gap-2">
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                            id="duration"
                            name="duration"
                            type="number"
                            min="1"
                            value={duration}
                            onChange={(event) =>
                                setDuration(event.target.value)
                            }
                            required
                        />
                        <InputError message={errors.duration} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="passing_score">Passing Score (%)</Label>
                        <Input
                            id="passing_score"
                            name="passing_score"
                            type="number"
                            min="0.01"
                            max="100"
                            step="0.01"
                            value={passingScore}
                            onChange={(event) =>
                                setPassingScore(event.target.value)
                            }
                            required
                        />
                        <InputError message={errors.passing_score} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="max_attempts">Maximum Attempts</Label>
                        <Input
                            id="max_attempts"
                            name="max_attempts"
                            type="number"
                            min="1"
                            value={maxAttempts}
                            onChange={(event) =>
                                setMaxAttempts(event.target.value)
                            }
                            required
                        />
                        <InputError message={errors.max_attempts} />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <input type="hidden" name="status" value={status} />
                    <Select
                        value={status}
                        onValueChange={(value) =>
                            setStatus(value as AdminQuiz['status'])
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.status} />
                </div>

                <div className="grid gap-4 rounded-xl border border-sidebar-border/70 p-4">
                    <div>
                        <h3 className="text-base font-semibold">
                            Question Bank
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Select questions to include in this quiz. Matching
                            category questions appear first.
                        </p>
                    </div>

                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={bankSearch}
                            onChange={(event) =>
                                setBankSearch(event.target.value)
                            }
                            placeholder="Search questions..."
                            className="pl-9"
                        />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <Select
                            value={bankCategory}
                            onValueChange={setBankCategory}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Categories
                                </SelectItem>
                                {categoryOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={bankDifficulty}
                            onValueChange={setBankDifficulty}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                {difficultyOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={bankStatus}
                            onValueChange={setBankStatus}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {questionStatusOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border border-sidebar-border/50 p-2">
                        {preferredBankQuestions.length === 0 ? (
                            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                                No questions match your filters.
                            </p>
                        ) : (
                            preferredBankQuestions.map((question) => {
                                const checked = selectedIds.includes(
                                    question.id,
                                );
                                const disabled =
                                    question.status !== 'active' && !checked;

                                return (
                                    <label
                                        key={question.id}
                                        className={cn(
                                            'flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2 hover:bg-muted/20',
                                            disabled &&
                                                'cursor-not-allowed opacity-50',
                                        )}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            disabled={disabled}
                                            onChange={() =>
                                                toggleQuestion(question.id)
                                            }
                                            className="mt-1 size-4 accent-primary"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm">
                                                {truncate(question.question)}
                                            </p>
                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                <span>
                                                    {question.category_name}
                                                </span>
                                                <DifficultyBadge
                                                    difficulty={
                                                        question.difficulty
                                                    }
                                                    label={
                                                        question.difficulty_label
                                                    }
                                                />
                                                <span>
                                                    {question.marks} mark
                                                </span>
                                            </div>
                                        </div>
                                    </label>
                                );
                            })
                        )}
                    </div>
                    <InputError message={errors.question_ids} />
                </div>

                <div className="grid gap-4 rounded-xl border border-sidebar-border/70 p-4">
                    <div>
                        <h3 className="text-base font-semibold">
                            Selected Questions
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Reorder questions with move up / move down.
                        </p>
                    </div>

                    {selectedQuestions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No questions selected yet.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {selectedQuestions.map((question, index) => (
                                <div
                                    key={question.id}
                                    className="flex items-start gap-3 rounded-lg border border-sidebar-border/50 px-3 py-2"
                                >
                                    <span className="mt-0.5 w-6 text-sm font-medium text-muted-foreground">
                                        {index + 1}.
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm">
                                            {question.question}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {question.category_name} ·{' '}
                                            {question.difficulty_label} ·{' '}
                                            {question.marks} mark
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            disabled={index === 0}
                                            onClick={() =>
                                                moveQuestion(index, -1)
                                            }
                                        >
                                            <ArrowUp className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            disabled={
                                                index ===
                                                selectedQuestions.length - 1
                                            }
                                            onClick={() =>
                                                moveQuestion(index, 1)
                                            }
                                        >
                                            <ArrowDown className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                removeQuestion(question.id)
                                            }
                                        >
                                            <X className="size-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <aside className="h-fit rounded-xl border border-sidebar-border/70 p-4 lg:sticky lg:top-6">
                <h3 className="text-base font-semibold">Quiz Summary</h3>
                <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">Questions</dt>
                        <dd className="font-medium">
                            {selectedQuestions.length}
                        </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">Total Marks</dt>
                        <dd className="font-medium">{totalMarks}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">Duration</dt>
                        <dd className="font-medium">{duration || 0} min</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">Passing Score</dt>
                        <dd className="font-medium">{passingScore || 0}%</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">
                            Maximum Attempts
                        </dt>
                        <dd className="font-medium">{maxAttempts || 0}</dd>
                    </div>
                </dl>
            </aside>
        </div>
    );
}
