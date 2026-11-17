import React from 'react';
import { UploadComponent } from '../components/UploadComponent';
import { UploadedDatasetPreview } from '../types/retail';

interface UploadDataPageProps {
  dataset: UploadedDatasetPreview | null;
  onDatasetChange: (dataset: UploadedDatasetPreview | null) => void;
  onNotify: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export const UploadDataPage: React.FC<UploadDataPageProps> = ({
  dataset,
  onDatasetChange,
  onNotify,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Upload Your Retail Data
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Import historical POS or sales spreadsheets (CSV or Excel) to validate columns, inspect
            missing values, and preview records before forecasting.
          </p>
        </div>
      </div>

      <UploadComponent
        dataset={dataset}
        onDatasetChange={onDatasetChange}
        onNotify={onNotify}
      />

      {/* Expected Schema Guidance */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
          Recommended Dataset Format
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Files are parsed locally in your browser for validation and preview. When connected to a
          Python (Pandas / Scikit-learn) backend API, these columns feed demand forecasting and
          inventory calculations.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-2.5 pr-4 font-medium">Column Name</th>
                <th className="py-2.5 pr-4 font-medium">Requirement</th>
                <th className="py-2.5 pr-4 font-medium">Example Value</th>
                <th className="py-2.5 font-medium">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="py-2.5 pr-4 font-mono">date</td>
                <td className="py-2.5 pr-4 font-medium text-slate-900 dark:text-white">Required</td>
                <td className="py-2.5 pr-4 font-mono">2026-11-01</td>
                <td className="py-2.5">Transaction or daily summary date for time-series grouping</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-mono">product_id / product_name</td>
                <td className="py-2.5 pr-4 font-medium text-slate-900 dark:text-white">Required</td>
                <td className="py-2.5 pr-4 font-mono">SKU-101</td>
                <td className="py-2.5">Unique SKU identifier and human-readable product title</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-mono">quantity</td>
                <td className="py-2.5 pr-4 font-medium text-slate-900 dark:text-white">Required</td>
                <td className="py-2.5 pr-4 font-mono">5</td>
                <td className="py-2.5">Units sold per row for demand velocity and stock comparison</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-mono">revenue / unit_price</td>
                <td className="py-2.5 pr-4 font-medium text-slate-900 dark:text-white">Required</td>
                <td className="py-2.5 pr-4 font-mono">6495</td>
                <td className="py-2.5">Sales value used for revenue analysis and AOV metrics</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-mono">category</td>
                <td className="py-2.5 pr-4 text-slate-500">Optional</td>
                <td className="py-2.5 pr-4 font-mono">Electronics & Accessories</td>
                <td className="py-2.5">Enables category revenue and distribution breakdowns</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
