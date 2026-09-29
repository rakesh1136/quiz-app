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
import type { AdminCategory, SelectOption } from '@/types';

type BaseProps = {
    errors: Record<string, string | undefined>;
    statusOptions: SelectOption[];
};

type CreateProps = BaseProps & {
    mode: 'create';
};

type EditProps = BaseProps & {
    mode: 'edit';
    category: AdminCategory;
};

type Props = CreateProps | EditProps;

export function CategoryFormFields(props: Props) {
    const { errors, statusOptions } = props;
    const category = props.mode === 'edit' ? props.category : null;
    const [status, setStatus] = useState(category?.status ?? 'active');

    return (
        <div className="grid gap-6">
            <input type="hidden" name="status" value={status} />

            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    name="name"
                    defaultValue={category?.name}
                    required
                    autoFocus
                    placeholder="Category name"
                />
                <InputError message={errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                    id="description"
                    name="description"
                    defaultValue={category?.description ?? ''}
                    rows={4}
                    placeholder="Optional description for this category"
                    className={cn(
                        'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex min-h-[100px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
                    )}
                />
                <InputError message={errors.description} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                    value={status}
                    onValueChange={(value) =>
                        setStatus(value as AdminCategory['status'])
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
    );
}
