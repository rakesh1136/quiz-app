<?php

namespace App\Services\Admin;

use App\Exports\QuizAttemptsExport;
use App\Exports\QuizPerformanceExport;
use App\Exports\TabularExport;
use App\Exports\UserPerformanceExport;
use Illuminate\Support\Carbon;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportReportWriter
{
    public function __construct(
        private ExportReportQueryService $queries,
    ) {}

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
    public function makeExport(array $filters): TabularExport
    {
        return match ($filters['report_type']) {
            ExportReportQueryService::REPORT_USER_PERFORMANCE => new UserPerformanceExport($this->queries, $filters),
            ExportReportQueryService::REPORT_QUIZ_PERFORMANCE => new QuizPerformanceExport($this->queries, $filters),
            default => new QuizAttemptsExport($this->queries, $filters),
        };
    }

    public function filename(TabularExport $export, string $format): string
    {
        $extension = $format === 'xlsx' ? 'xlsx' : 'csv';

        return sprintf(
            '%s-%s.%s',
            $export->filenamePrefix(),
            Carbon::now()->toDateString(),
            $extension,
        );
    }

    public function streamCsv(TabularExport $export): StreamedResponse
    {
        $filename = $this->filename($export, 'csv');

        return response()->streamDownload(function () use ($export): void {
            $handle = fopen('php://output', 'w');

            if ($handle === false) {
                return;
            }

            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($handle, $export->headings());

            foreach ($export->rows() as $row) {
                fputcsv($handle, array_map(
                    fn ($value) => $value === null ? '' : $value,
                    $row,
                ));
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function streamExcel(TabularExport $export): StreamedResponse
    {
        $filename = $this->filename($export, 'xlsx');

        return response()->streamDownload(function () use ($export): void {
            $spreadsheet = new Spreadsheet;
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->fromArray($export->headings(), null, 'A1');

            $rowIndex = 2;
            foreach ($export->rows() as $row) {
                $sheet->fromArray(
                    [array_map(fn ($value) => $value === null ? '' : $value, $row)],
                    null,
                    'A'.$rowIndex,
                );
                $rowIndex++;
            }

            foreach (range(1, count($export->headings())) as $column) {
                $sheet->getColumnDimensionByColumn($column)->setAutoSize(true);
            }

            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
            $spreadsheet->disconnectWorksheets();
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}
