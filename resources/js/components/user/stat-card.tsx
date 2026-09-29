import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Props = {
    icon: LucideIcon;
    label: string;
    value: string;
    description?: string;
    accentClassName?: string;
};

export function StatCard({
    icon: Icon,
    label,
    value,
    description,
    accentClassName,
}: Props) {
    return (
        <Card className="gap-0 py-5 transition-shadow hover:shadow-md">
            <CardContent className="px-5">
                <span
                    className={cn(
                        'flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary',
                        accentClassName,
                    )}
                >
                    <Icon className="size-5" />
                </span>
                <p className="mt-4 text-sm font-medium text-muted-foreground">
                    {label}
                </p>
                <p className="mt-1 text-3xl font-semibold tracking-tight">
                    {value}
                </p>
                {description ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                        {description}
                    </p>
                ) : null}
            </CardContent>
        </Card>
    );
}
