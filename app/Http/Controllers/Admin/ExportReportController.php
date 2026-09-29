<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ExportReportRequest;
use App\Models\QuizAttempt;
use App\Services\Admin\ExportReportQueryService;
use App\Services\Admin\ExportReportWriter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportReportController extends Controller
{
    public function __construct(
        private ExportReportQueryService $queries,
        private ExportReportWriter $writer,
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', QuizAttempt::class);

        $filters = $this->queries->filtersFromRequest($request);
        $recordCount = $this->queries->recordCount($filters);

        return Inertia::render('admin/export-reports/index', [
            'filters' => $filters,
            'filterOptions' => $this->queries->filterOptions(),
            'filterSummary' => $this->queries->filterSummary($filters),
            'recordCount' => $recordCount,
            'hasData' => $recordCount > 0,
        ]);
    }

    public function export(ExportReportRequest $request): StreamedResponse|JsonResponse
    {
        Gate::authorize('viewAny', QuizAttempt::class);

        $filters = $this->queries->filtersFromRequest($request);
        $format = (string) $request->string('format');

        if ($this->queries->recordCount($filters) === 0) {
            return response()->json([
                'message' => 'No data available for the selected filters.',
            ], 422);
        }

        try {
            $export = $this->writer->makeExport($filters);

            return $format === 'xlsx'
                ? $this->writer->streamExcel($export)
                : $this->writer->streamCsv($export);
        } catch (\Throwable) {
            return response()->json([
                'message' => 'Unable to generate the report. Please try again.',
            ], 500);
        }
    }
}
