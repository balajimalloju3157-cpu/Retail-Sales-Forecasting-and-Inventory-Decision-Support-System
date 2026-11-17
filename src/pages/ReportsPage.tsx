import React, { useState } from 'react';
import { Calendar, Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import {
  ALL_DAILY_SALES,
  SAMPLE_PRODUCTS,
  SAMPLE_REPORTS,
  buildForecastSeries,
} from '../data/sampleRetailData';
import { CurrencyCode, DateFormat, ForecastPeriodDays } from '../types/retail';
import {
  calculateEstimatedShortage,
  calculateSuggestedReorderQuantity,
  determineStockStatus,
  downloadCsvFile,
  formatDate,
} from '../utils/formatters';

interface ReportsPageProps {
  currency: CurrencyCode;
  dateFormat: DateFormat;
  defaultForecastPeriod: ForecastPeriodDays;
  safetyStockDays: number;
  safetyStockBufferPct: number;
  onNotify: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  dateFormat,
  defaultForecastPeriod,
  safetyStockDays,
  safetyStockBufferPct,
  onNotify,
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadReport = (reportId: string, title: string) => {
    setDownloadingId(reportId);

    window.setTimeout(() => {
      if (reportId === 'sales-summary') {
        downloadCsvFile(
          'retailiq_sales_summary_sample.csv',
          ['Date', 'Revenue (INR)', 'Units Sold', 'Transactions'],
          ALL_DAILY_SALES.map((d) => [d.date, d.revenue, d.units, d.transactions])
        );
      } else if (reportId === 'product-performance') {
        downloadCsvFile(
          'retailiq_product_performance_sample.csv',
          ['Sales Rank', 'Product ID', 'Product Name', 'Category', 'Units Sold (30d)', 'Revenue (INR)'],
          SAMPLE_PRODUCTS.map((p) => [
            p.salesRank,
            p.id,
            p.name,
            p.category,
            p.unitsSold30d,
            p.revenue30d,
          ])
        );
      } else if (reportId === 'demand-forecast') {
        const forecastRows = buildForecastSeries('ALL', defaultForecastPeriod).filter(
          (pt) => pt.isForecast
        );
        downloadCsvFile(
          'retailiq_demand_forecast_sample.csv',
          ['Forecast Date', 'Predicted Units', 'Lower Estimate', 'Upper Estimate', 'Projected Revenue (INR)'],
          forecastRows.map((pt) => [
            pt.date,
            pt.predictedUnits || 0,
            pt.lowerUnits || 0,
            pt.upperUnits || 0,
            pt.predictedRevenue || 0,
          ])
        );
      } else if (reportId === 'inventory-insights') {
        downloadCsvFile(
          'retailiq_inventory_insights_sample.csv',
          [
            'Product ID',
            'Product Name',
            'Available Stock',
            `Forecast Demand (${defaultForecastPeriod}d)`,
            'Safety Stock',
            'Estimated Shortage',
            'Suggested Reorder Qty',
            'Stock Status',
          ],
          SAMPLE_PRODUCTS.map((p) => {
            const demand = Math.max(1, Math.round(p.dailyAvgDemand * defaultForecastPeriod));
            const safety = Math.max(
              Math.round(p.dailyAvgDemand * safetyStockDays),
              Math.round(demand * (safetyStockBufferPct / 100))
            );
            const shortage = calculateEstimatedShortage(demand, p.availableStock);
            const reorder = calculateSuggestedReorderQuantity(demand, safety, p.availableStock);
            const status = determineStockStatus(p.availableStock, demand, safety);
            return [p.id, p.name, p.availableStock, demand, safety, shortage, reorder, status];
          })
        );
      }

      setDownloadingId(null);
      onNotify('success', 'Report Downloaded', `${title} exported as CSV (sample data).`);
    }, 350);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Reports
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Export structured CSV summaries from the demonstration retail dataset for offline review
          and purchasing workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SAMPLE_REPORTS.map((report) => {
          const isLoading = downloadingId === report.id;
          return (
            <div
              key={report.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between gap-5"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-teal-400">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {report.format} · Sample data
                  </span>
                </div>

                <h3 className="mt-4 font-display text-base font-semibold text-slate-900 dark:text-white">
                  {report.title}
                </h3>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {report.description}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Last generated: {formatDate(report.lastGenerated, dateFormat)}</span>
                </div>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleDownloadReport(report.id, report.title)}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 disabled:opacity-60 px-4 py-2 text-xs font-medium text-white transition-colors whitespace-nowrap shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  <span>{isLoading ? 'Exporting...' : 'Download'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
