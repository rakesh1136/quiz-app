<?php

namespace App\Exports;

use App\Services\Admin\ExportReportQueryService;
use Illuminate\Support\Collection;

abstract class TabularExport
{
    /**
     * @param  array{
     *     report_type: string,
     *     date_from: string,
     *     date_to: string,
     *     user_id: string,
     *     quiz_id: string,
     *     category_id: string,
     *     status: string
     * }  $filters
     */
    public function __construct(
        protected ExportReportQueryService $queries,
        protected array $filters,
    ) {}

    abstract public function filenamePrefix(): string;

    /**
     * @return list<string>
     */
    abstract public function headings(): array;

    /**
     * @return Collection<int, list<string|int|float|null>>
     */
    abstract public function rows(): Collection;
}
