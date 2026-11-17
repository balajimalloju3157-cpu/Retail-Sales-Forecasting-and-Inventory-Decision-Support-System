import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  RotateCcw,
  UploadCloud,
} from 'lucide-react';
import { UploadedDatasetPreview } from '../types/retail';
import { SAMPLE_CSV_DATASET_ROWS, SAMPLE_CSV_HEADERS } from '../data/sampleRetailData';
import { downloadCsvFile, formatFileSize, formatNumber } from '../utils/formatters';

interface UploadComponentProps {
  dataset: UploadedDatasetPreview | null;
  onDatasetChange: (dataset: UploadedDatasetPreview | null) => void;
  onNotify: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function findMatchingColumn(columns: string[], candidates: string[]): string | undefined {
  const normalized = columns.map((c) => ({
    raw: c,
    clean: c.trim().toLowerCase().replace(/[^a-z0-9]/g, ''),
  }));
  for (const candidate of candidates) {
    const match = normalized.find((col) => col.clean.includes(candidate));
    if (match) return match.raw;
  }
  return undefined;
}

export const UploadComponent: React.FC<UploadComponentProps> = ({
  dataset,
  onDatasetChange,
  onNotify,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const parseUploadedFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isSupported = ['csv', 'xlsx', 'xls'].includes(ext);

    if (!isSupported) {
      const invalidPreview: UploadedDatasetPreview = {
        fileName: file.name,
        fileSizeBytes: file.size,
        fileType: 'CSV',
        rowsCount: 0,
        columnsCount: 0,
        columns: [],
        missingValuesByColumn: {},
        totalMissingValues: 0,
        previewRows: [],
        validationStatus: 'invalid',
        validationErrors: [
          `Unsupported file format ".${ext || 'unknown'}". Please upload a .csv, .xlsx, or .xls retail sales file.`,
        ],
        detectedMapping: {},
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onDatasetChange(invalidPreview);
      onNotify('error', 'Unsupported File Format', 'Only CSV and Excel (.xlsx / .xls) files are accepted.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const tooLarge: UploadedDatasetPreview = {
        fileName: file.name,
        fileSizeBytes: file.size,
        fileType: ext === 'csv' ? 'CSV' : 'Excel',
        rowsCount: 0,
        columnsCount: 0,
        columns: [],
        missingValuesByColumn: {},
        totalMissingValues: 0,
        previewRows: [],
        validationStatus: 'invalid',
        validationErrors: [
          `File size (${formatFileSize(file.size)}) exceeds the 10 MB browser preview limit.`,
        ],
        detectedMapping: {},
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onDatasetChange(tooLarge);
      onNotify('error', 'File Too Large', 'Please choose a file under 10 MB.');
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        throw new Error('The uploaded workbook contains no readable sheets.');
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rawObjects = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
        defval: '',
      });

      if (rawObjects.length === 0) {
        const emptyPreview: UploadedDatasetPreview = {
          fileName: file.name,
          fileSizeBytes: file.size,
          fileType: ext === 'csv' ? 'CSV' : 'Excel',
          rowsCount: 0,
          columnsCount: 0,
          columns: [],
          missingValuesByColumn: {},
          totalMissingValues: 0,
          previewRows: [],
          validationStatus: 'invalid',
          validationErrors: [
            'The file does not contain any data rows below the header row.',
          ],
          detectedMapping: {},
          uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        onDatasetChange(emptyPreview);
        onNotify('error', 'Empty Dataset', 'No sales records were found in the uploaded file.');
        return;
      }

      const columns = Object.keys(rawObjects[0]);
      const missingValuesByColumn: Record<string, number> = {};
      let totalMissingValues = 0;

      for (const col of columns) {
        missingValuesByColumn[col] = 0;
      }

      for (const row of rawObjects) {
        for (const col of columns) {
          const val = row[col];
          if (val === null || val === undefined || String(val).trim() === '') {
            missingValuesByColumn[col] += 1;
            totalMissingValues += 1;
          }
        }
      }

      const dateColumn = findMatchingColumn(columns, ['date', 'orderdate', 'saledate', 'timestamp']);
      const productColumn = findMatchingColumn(columns, ['product', 'sku', 'item', 'productid', 'productname']);
      const quantityColumn = findMatchingColumn(columns, ['qty', 'quantity', 'units', 'sold']);
      const revenueColumn = findMatchingColumn(columns, ['revenue', 'amount', 'sales', 'total', 'price']);

      const validationErrors: string[] = [];
      if (!dateColumn) validationErrors.push('Missing a recognizable date column (e.g., "date" or "sale_date").');
      if (!productColumn) validationErrors.push('Missing a product identifier or name column (e.g., "product_id" or "product_name").');
      if (!quantityColumn) validationErrors.push('Missing a quantity/units sold column (e.g., "quantity" or "units").');
      if (!revenueColumn) validationErrors.push('Missing a revenue or unit price column (e.g., "revenue" or "unit_price").');

      const previewRows = rawObjects.slice(0, 8).map((row) => {
        const cleanRow: Record<string, string | number> = {};
        for (const col of columns) {
          const val = row[col];
          cleanRow[col] =
            typeof val === 'number' || typeof val === 'string' ? val : String(val ?? '');
        }
        return cleanRow;
      });

      const isValid = validationErrors.length === 0;

      onDatasetChange({
        fileName: file.name,
        fileSizeBytes: file.size,
        fileType: ext === 'csv' ? 'CSV' : 'Excel',
        rowsCount: rawObjects.length,
        columnsCount: columns.length,
        columns,
        missingValuesByColumn,
        totalMissingValues,
        previewRows,
        validationStatus: isValid ? 'valid' : 'invalid',
        validationErrors,
        detectedMapping: { dateColumn, productColumn, quantityColumn, revenueColumn },
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      if (isValid) {
        onNotify(
          'success',
          'File Validated Successfully',
          `Parsed ${formatNumber(rawObjects.length)} rows across ${columns.length} columns.`
        );
      } else {
        onNotify(
          'error',
          'Missing Required Columns',
          `${validationErrors.length} schema issue(s) found in ${file.name}.`
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not parse file contents.';
      onDatasetChange({
        fileName: file.name,
        fileSizeBytes: file.size,
        fileType: ext === 'csv' ? 'CSV' : 'Excel',
        rowsCount: 0,
        columnsCount: 0,
        columns: [],
        missingValuesByColumn: {},
        totalMissingValues: 0,
        previewRows: [],
        validationStatus: 'invalid',
        validationErrors: [msg],
        detectedMapping: {},
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      onNotify('error', 'Upload Failed', msg);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void parseUploadedFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void parseUploadedFile(file);
    }
  };

  const handleProcessDataset = () => {
    if (!dataset || dataset.validationStatus !== 'valid') return;
    onDatasetChange({ ...dataset, validationStatus: 'processing' });

    window.setTimeout(() => {
      onDatasetChange({ ...dataset, validationStatus: 'validated-local' });
      onNotify(
        'info',
        'Local Schema Check Complete',
        'Dataset structure verified in browser. Connect a Python/Pandas API backend to run server-side model training.'
      );
    }, 650);
  };

  const handleDownloadSample = () => {
    downloadCsvFile(
      'retailiq_sample_sales_dataset.csv',
      SAMPLE_CSV_HEADERS,
      SAMPLE_CSV_DATASET_ROWS
    );
    onNotify(
      'success',
      'Sample Dataset Downloaded',
      'You can drag and drop retailiq_sample_sales_dataset.csv here to test validation.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Dropzone Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            isDragging
              ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/20'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/30'
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-teal-600 mb-4">
            <UploadCloud className="h-6 w-6" />
          </div>

          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            Drag and drop your historical sales file
          </h2>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-md">
            Supports CSV (.csv) and Excel (.xlsx, .xls) files up to 10 MB. Expected columns: date,
            product ID/name, quantity, and revenue.
          </p>

          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInput}
            className="hidden"
          />

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-teal-500 transition-colors whitespace-nowrap shrink-0"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Browse Files</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSample}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="h-4 w-4" />
              <span>Download Sample Dataset</span>
            </button>
          </div>
        </div>
      </div>

      {/* State 1: No file uploaded */}
      {!dataset && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
            No file uploaded yet
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Select a CSV or Excel file above to inspect row counts, column mapping, missing values,
            and a tabular preview before submitting to a forecasting backend.
          </p>
        </div>
      )}

      {/* State 2 / 3 / 4: Dataset Loaded */}
      {dataset && (
        <div className="space-y-6">
          {/* Validation Status Banner & Summary */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-3">
                {dataset.validationStatus === 'invalid' ? (
                  <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
                ) : dataset.validationStatus === 'processing' ? (
                  <Loader2 className="h-5 w-5 text-teal-600 dark:text-teal-400 animate-spin mt-0.5 shrink-0" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                )}

                <div>
                  <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                    {dataset.fileName}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    {dataset.fileType} · {formatFileSize(dataset.fileSizeBytes)} · Checked at{' '}
                    {dataset.uploadedAt}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onDatasetChange(null)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>

                <button
                  type="button"
                  disabled={
                    dataset.validationStatus !== 'valid'
                  }
                  onClick={handleProcessDataset}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-700 hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-xs font-medium text-white transition-colors"
                >
                  {dataset.validationStatus === 'processing' && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  <span>
                    {dataset.validationStatus === 'processing'
                      ? 'Checking Dataset...'
                      : dataset.validationStatus === 'validated-local'
                      ? 'Validated Locally'
                      : 'Process Dataset'}
                  </span>
                </button>
              </div>
            </div>

            {/* Error State Details */}
            {dataset.validationStatus === 'invalid' && (
              <div className="mt-4 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 p-4">
                <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
                  Validation failed — action required
                </p>
                <ul className="mt-2 list-disc list-inside space-y-1 text-xs text-rose-700 dark:text-rose-300">
                  {dataset.validationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Honest Backend Notice after clicking Process Dataset */}
            {dataset.validationStatus === 'validated-local' && (
              <div className="mt-4 rounded-lg bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/60 p-4">
                <p className="text-sm font-semibold text-teal-900 dark:text-teal-200">
                  Client-side validation complete (No backend server connected)
                </p>
                <p className="mt-1 text-xs text-teal-800 dark:text-teal-300">
                  Your file has been parsed and verified locally in the browser. Dashboard pages
                  continue displaying demonstration sample data until a Python (Pandas /
                  Scikit-learn) API endpoint is connected to persist and train on uploaded records.
                </p>
              </div>
            )}

            {/* Dataset Summary Metrics */}
            {dataset.rowsCount > 0 && (
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Validation Status</p>
                  <p
                    className={`mt-1 text-sm font-semibold ${
                      dataset.validationStatus === 'invalid'
                        ? 'text-rose-700 dark:text-rose-400'
                        : 'text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    {dataset.validationStatus === 'invalid'
                      ? 'Schema Incomplete'
                      : 'Valid Structure'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Rows</p>
                  <p className="mt-1 font-display text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                    {formatNumber(dataset.rowsCount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Columns Detected</p>
                  <p className="mt-1 font-display text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                    {dataset.columnsCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Missing Values</p>
                  <p className="mt-1 font-display text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                    {formatNumber(dataset.totalMissingValues)}
                  </p>
                </div>
              </div>
            )}

            {/* Missing Value Summary per Column */}
            {dataset.columns.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Column & Missing-Value Summary
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                  {dataset.columns.map((col) => (
                    <div
                      key={col}
                      className="flex items-center justify-between gap-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-2.5 py-1.5"
                    >
                      <span className="font-mono text-slate-700 dark:text-slate-300 truncate">
                        {col}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                        {dataset.missingValuesByColumn[col] || 0} null
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Preview Table */}
          {dataset.previewRows.length > 0 && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                    Uploaded File Preview
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Showing first {dataset.previewRows.length} of {formatNumber(dataset.rowsCount)}{' '}
                    parsed rows
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300">
                      {dataset.columns.map((col) => (
                        <th key={col} className="py-2.5 px-4 font-mono font-medium whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {dataset.previewRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        {dataset.columns.map((col) => (
                          <td
                            key={col}
                            className="py-2.5 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap tabular-nums"
                          >
                            {row[col] === '' ? (
                              <span className="text-slate-400 italic">empty</span>
                            ) : (
                              String(row[col])
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
