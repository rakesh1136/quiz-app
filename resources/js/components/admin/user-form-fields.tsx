import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import type { AdminUser, SelectOption } from '@/types';

type BaseProps = {
    errors: Record<string, string | undefined>;
    roleOptions: SelectOption[];
    statusOptions: SelectOption[];
};

type CreateProps = BaseProps & {
    mode: 'create';
};

type EditProps = BaseProps & {
    mode: 'edit';
    user: AdminUser;
};

type Props = CreateProps | EditProps;

export function UserFormFields(props: Props) {
    const { errors, roleOptions, statusOptions } = props;
    const user = props.mode === 'edit' ? props.user : null;
    const [role, setRole] = useState(user?.role ?? 'user');
    const [status, setStatus] = useState(user?.status ?? 'active');

    return (
        <div className="grid gap-6">
            <input type="hidden" name="role" value={role} />
            <input type="hidden" name="status" value={status} />
            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    name="name"
                    defaultValue={user?.name}
                    required
                    autoFocus
                    placeholder="Full name"
                />
                <InputError message={errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                    id="email"
                    type="email"
                    name="email"
                    defaultValue={user?.email}
                    required
                    placeholder="email@example.com"
                />
                <InputError message={errors.email} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="password">
                    Password
                    {props.mode === 'edit' ? (
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                            (leave blank to keep current password)
                        </span>
                    ) : null}
                </Label>
                <PasswordInput
                    id="password"
                    name="password"
                    required={props.mode === 'create'}
                    autoComplete="new-password"
                    placeholder="Password"
                />
                <InputError message={errors.password} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="password_confirmation">
                    Confirm Password
                </Label>
                <PasswordInput
                    id="password_confirmation"
                    name="password_confirmation"
                    required={props.mode === 'create'}
                    autoComplete="new-password"
                    placeholder="Confirm password"
                />
                <InputError message={errors.password_confirmation} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                    value={role}
                    onValueChange={(value) =>
                        setRole(value as AdminUser['role'])
                    }
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                        {roleOptions.map((option) => (
                            <SelectItem
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={errors.role} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                    value={status}
                    onValueChange={(value) =>
                        setStatus(value as AdminUser['status'])
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
