import InputError from '@/components/input-error';
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
import { useState } from 'react';
import type {
    AdminQuestion,
    CategorySelectOption,
    SelectOption,
} from '@/types';

const optionLabels = ['A', 'B', 'C', 'D'];

type BaseProps = {
    errors: Record<string, string | undefined>;
    categoryOptions: CategorySelectOption[];
    difficultyOptions: SelectOption[];
    statusOptions: SelectOption[];
};

type CreateProps = BaseProps & {
    mode: 'create';
};

type EditProps = BaseProps & {
    mode: 'edit';
    question: AdminQuestion;
};

type Props = CreateProps | EditProps;

export function QuestionFormFields(props: Props) {
    const { errors, categoryOptions, difficultyOptions, statusOptions } = props;
    const question = props.mode === 'edit' ? props.question : null;

    const [categoryId, setCategoryId] = useState(
        question ? String(question.category_id) : (categoryOptions[0]?.value ?? ''),
    );
    const [difficulty, setDifficulty] = useState(
        question?.difficulty ?? 'medium',
    );
    const [status, setStatus] = useState(question?.status ?? 'active');
    const [correctOptionIndex, setCorrectOptionIndex] = useState(
        String(question?.correct_option_index ?? 0),
    );

    return (
        <div className="grid gap-6">
            <input type="hidden" name="category_id" value={categoryId} />
            <input type="hidden" name="difficulty" value={difficulty} />
            <input type="hidden" name="status" value={status} />
            <input
                type="hidden"
                name="correct_option_index"
                value={correctOptionIndex}
            />

            <div className="grid gap-2">
                <Label htmlFor="category_id">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
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
                <Label htmlFor="question">Question</Label>
                <textarea
                    id="question"
                    name="question"
                    defaultValue={question?.question}
                    rows={4}
                    required
                    placeholder="Enter the question text"
                    className={cn(
                        'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex min-h-[120px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
                    )}
                />
                <InputError message={errors.question} />
            </div>

            <div className="grid gap-4">
                <div>
                    <Label>Options</Label>
                    <p className="text-sm text-muted-foreground">
                        Provide exactly 4 unique options and select the
                        correct answer.
                    </p>
                </div>

                {optionLabels.map((label, index) => (
                    <div key={label} className="grid gap-2">
                        <div className="flex items-center gap-3">
                            <label className="flex cursor-pointer items-center gap-2">
                                <input
                                    type="radio"
                                    name="correct_option_radio"
                                    value={String(index)}
                                    checked={
                                        correctOptionIndex === String(index)
                                    }
                                    onChange={() =>
                                        setCorrectOptionIndex(String(index))
                                    }
                                    className="size-4 accent-primary"
                                />
                                <span className="text-sm font-medium">
                                    Option {label}
                                </span>
                            </label>
                        </div>
                        <Input
                            name={`options[${index}][option_text]`}
                            defaultValue={
                                question?.options[index]?.option_text ?? ''
                            }
                            required
                            placeholder={`Option ${label}`}
                        />
                    </div>
                ))}

                <InputError message={errors.options} />
                <InputError message={errors.correct_option_index} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                        value={difficulty}
                        onValueChange={(value) =>
                            setDifficulty(
                                value as AdminQuestion['difficulty'],
                            )
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select difficulty" />
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
                    <InputError message={errors.difficulty} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={status}
                        onValueChange={(value) =>
                            setStatus(value as AdminQuestion['status'])
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
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="marks">Marks</Label>
                    <Input
                        id="marks"
                        name="marks"
                        type="number"
                        step="0.01"
                        min="0.01"
                        defaultValue={question?.marks ?? 1}
                        required
                    />
                    <InputError message={errors.marks} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="negative_marks">Negative Marks</Label>
                    <Input
                        id="negative_marks"
                        name="negative_marks"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={question?.negative_marks ?? 0}
                        required
                    />
                    <InputError message={errors.negative_marks} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="explanation">Explanation</Label>
                <textarea
                    id="explanation"
                    name="explanation"
                    defaultValue={question?.explanation ?? ''}
                    rows={3}
                    placeholder="Optional explanation shown after quiz completion"
                    className={cn(
                        'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
                    )}
                />
                <InputError message={errors.explanation} />
            </div>
        </div>
    );
}
