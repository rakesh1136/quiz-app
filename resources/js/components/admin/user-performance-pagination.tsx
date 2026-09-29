import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Paginated = {
    from: number | null;
    to: number | null;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
};

type Props = {
    paginator: Paginated;
    resourceLabel?: string;
};

export function UserPerformancePagination({
    paginator,
    resourceLabel = 'users',
}: Props) {
    const { from, to, total, links } = paginator;

    if (total === 0) {
        return null;
    }

    const previousLink = links[0]?.url;
    const nextLink = links[links.length - 1]?.url;
    const pageLinks = links.slice(1, -1);

    return (
        <div className="flex flex-col gap-4 border-t border-sidebar-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                {from && to
                    ? `Showing ${from}–${to} of ${total} ${resourceLabel}`
                    : `Showing ${total} ${resourceLabel}`}
            </p>

            <div className="flex items-center gap-1">
                {previousLink ? (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={previousLink} preserveState preserveScroll>
                            <ChevronLeft className="size-4" />
                            Previous
                        </Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" disabled>
                        <ChevronLeft className="size-4" />
                        Previous
                    </Button>
                )}

                <div className="hidden items-center gap-1 sm:flex">
                    {pageLinks.map((link) => (
                        <Button
                            key={`${link.label}-${link.url}`}
                            variant={link.active ? 'default' : 'outline'}
                            size="sm"
                            className="min-w-9"
                            asChild={Boolean(link.url)}
                            disabled={!link.url}
                        >
                            {link.url ? (
                                <Link
                                    href={link.url}
                                    preserveState
                                    preserveScroll
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ) : (
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            )}
                        </Button>
                    ))}
                </div>

                {nextLink ? (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={nextLink} preserveState preserveScroll>
                            Next
                            <ChevronRight className="size-4" />
                        </Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" disabled>
                        Next
                        <ChevronRight className="size-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
