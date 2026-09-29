import { Head, router } from '@inertiajs/react';
import { Download, FileSpreadsheet, FileText, Filter, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard } from '@/routes/admin';
import {
    exportMethod as exportReport,
    index as exportReportsIndex,
} from '@/routes/admin/export-reports';
import type {
    AdminExportFilterSummaryItem,
    AdminExportReportFilterOptions,
    AdminExportReportFilters,
} from '@/types';

type Props = {
    filters: AdminExportReportFilters;
    filterOptions: AdminExportReportFilterOptions;
    filterSummary: AdminExportFilterSummaryItem[];
    recordCount: number;
    hasData: boolean;
};

function buildQuery(filters: AdminExportReportFilters, format?: string) {
    return {
        report_type: filters.report_type || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
        user_id: filters.user_id !== 'all' ? filters.user_id : undefined,
        quiz_id: filters.quiz_id !== 'all' ? filters.quiz_id : undefined,
        category_id:
            filters.category_id !== 'all' ? filters.category_id : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        format: format || undefined,
    };
}

export default function AdminExportReportsIndex({
    filters,
    filterOptions,
    filterSummary,
    recordCount,
    hasData,
}: Props) {
    const [exportingFormat, setExportingFormat] = useState<
        'csv' | 'xlsx' | null
    >(null);

    const applyFilters = (nextFilters: Partial<AdminExportReportFilters>) => {
        const query = {
            ...filters,
            ...nextFilters,
        };

        router.get(
            exportReportsIndex.url({
                query: buildQuery(query),
            }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const clearFilters = () => {
        router.get(
            exportReportsIndex.url({
                query: {
                    report_type: filters.report_type || undefined,
                },
            }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const hasActiveFilters =
        filters.date_from !== '' ||
        filters.date_to !== '' ||
        filters.user_id !== 'all' ||
        filters.quiz_id !== 'all' ||
        filters.category_id !== 'all' ||
        filters.status !== 'all';

    const handleExport = async (format: 'csv' | 'xlsx') => {
        if (!hasData || exportingFormat) {
            return;
        }

        setExportingFormat(format);

        try {
            const url = exportReport.url({
                query: buildQuery(filters, format),
            });

            const response = await fetch(url, {
                headers: {
                    Accept: 'application/json, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                let message = 'Unable to generate the report. Please try again.';

                try {
                    const data = (await response.json()) as {
                        message?: string;
                        errors?: Record<string, string[]>;
                    };

                    if (data.message) {
                        message = data.message;
                    } else if (data.errors) {
                        message = Object.values(data.errors).flat()[0] ?? message;
                    }
                } catch {
                    // Keep generic message for non-JSON failures.
                }

                toast.error(message);
                return;
            }

            const blob = await response.blob();
            const disposition = response.headers.get('Content-Disposition');
            const matched = disposition?.match(/filename="?([^"]+)"?/i);
            const fallbackName = `${filters.report_type.replace(/_/g, '-')}-report.${format === 'xlsx' ? 'xlsx' : 'csv'}`;
            const filename = matched?.[1] ?? fallbackName;

            const objectUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(objectUrl);

            toast.success('Report downloaded successfully.');
        } catch {
            toast.error('Unable to generate the report. Please try again.');
        } finally {
            setExportingFormat(null);
        }
    };

    const isExporting = exportingFormat !== null;

    return (
        <>
            <Head title="Export Reports" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Export Reports
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Select a report type, apply filters, and download CSV or
                        Excel files generated from live quiz data.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="size-5 text-primary" />
                            Report Options
                        </CardTitle>
                        <CardDescription>
                            Choose the report and filters. Matching record count
                            updates from the database.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                            <div className="space-y-1.5 md:col-span-2 xl:col-span-3">
                                <label className="text-xs font-medium text-muted-foreground">
                                    Report Type
                                </label>
                                <Select
                                    value={filters.report_type}
                                    onValueChange={(value) =>
                                        applyFilters({ report_type: value })
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Report type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filterOptions.reportTypes.map(
                                            (option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">
                                    Date From
                                </label>
                                <Input
                                    type="date"
                                    value={filters.date_from}
                                    onChange={(event) =>
                                        applyFilters({
                                            date_from: event.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">
                                    Date To
                                </label>
                                <Input
                                    type="date"
                                    value={filters.date_to}
                                    onChange={(event) =>
                                        applyFilters({
                                            date_to: event.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">
                                    User
                                </label>
                                <Select
                                    value={filters.user_id}
                                    onValueChange={(value) =>
                                        applyFilters({ user_id: value })
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="User" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filterOptions.users.map((option) => (
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

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">
                                    Quiz
                                </label>
                                <Select
                                    value={filters.quiz_id}
                                    onValueChange={(value) =>
                                        applyFilters({ quiz_id: value })
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Quiz" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filterOptions.quizzes.map((option) => (
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

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">
                                    Category
                                </label>
                                <Select
                                    value={filters.category_id}
                                    onValueChange={(value) =>
                                        applyFilters({ category_id: value })
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filterOptions.categories.map(
                                            (option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">
                                    Result Status
                                </label>
                                <Select
                                    value={filters.status}
                                    onValueChange={(value) =>
                                        applyFilters({ status: value })
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filterOptions.statuses.map(
                                            (option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {hasActiveFilters ? (
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={clearFilters}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

                <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Export Filter Summary</CardTitle>
                            <CardDescription>
                                Review the selected filters before downloading.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {filterSummary.map((item) => (
                                    <div
                                        key={item.label}
                                        className="rounded-lg border border-sidebar-border/60 bg-muted/10 px-4 py-3"
                                    >
                                        <dt className="text-xs text-muted-foreground">
                                            {item.label}
                                        </dt>
                                        <dd className="mt-1 text-sm font-medium">
                                            {item.value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Matching Records</CardTitle>
                            <CardDescription>
                                Count from the database for the current filters.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-3xl font-bold tabular-nums">
                                {recordCount}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {recordCount === 1
                                    ? '1 record found'
                                    : `${recordCount} records found`}
                            </p>

                            {!hasData ? (
                                <p className="rounded-lg border border-dashed border-sidebar-border/70 px-3 py-4 text-sm text-muted-foreground">
                                    No data available for the selected filters.
                                </p>
                            ) : null}

                            <div className="flex flex-col gap-2">
                                <Button
                                    type="button"
                                    disabled={!hasData || isExporting}
                                    onClick={() => handleExport('csv')}
                                >
                                    {exportingFormat === 'csv' ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <FileText className="size-4" />
                                    )}
                                    Export CSV
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={!hasData || isExporting}
                                    onClick={() => handleExport('xlsx')}
                                >
                                    {exportingFormat === 'xlsx' ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <FileSpreadsheet className="size-4" />
                                    )}
                                    Export Excel
                                </Button>
                            </div>

                            {isExporting ? (
                                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Download className="size-4" />
                                    Generating report...
                                </p>
                            ) : null}
                        </CardContent>
                    </Card>
                </section>
            </div>
        </>
    );
}

AdminExportReportsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Export Reports',
            href: exportReportsIndex(),
        },
    ],
};
