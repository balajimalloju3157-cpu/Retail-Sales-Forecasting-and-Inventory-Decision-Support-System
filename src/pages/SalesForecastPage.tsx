import React, { useMemo, useState } from 'react';
import { Activity, CalendarClock, Info, PackageSearch, TrendingUp } from 'lucide-react';
import { SAMPLE_PRODUCTS, buildForecastSeries } from '../data/sampleRetailData';
import { CurrencyCode, DateFormat, ForecastPeriodDays } from '../types/retail';
import { formatCurrency, formatDate, formatNumber } from '../utils/formatters';
import { ForecastChart } from '../components/ForecastChart';
import { KpiCard } from '../components/KpiCard';

interface SalesForecastPageProps {
  currency: CurrencyCode;
  dateFormat: DateFormat;
  defaultForecastPeriod: ForecastPeriodDays;
}

export const SalesForecastPage: React.FC<SalesForecastPageProps> = ({
  currency,
  dateFormat,
  defaultForecastPeriod,
}) => {
  const [forecastPeriod, setForecastPeriod] = useState<ForecastPeriodDays>(defaultForecastPeriod);
  const [selectedProductId, setSelectedProductId] = useState<string>('ALL');
  const [metricMode, setMetricMode] = useState<'units' | 'revenue'>('units');

  const series = useMemo(
    () => buildForecastSeries(selectedProductId, forecastPeriod),
    [selectedProductId, forecastPeriod]
  );

  const selectedProduct = useMemo(
    () => SAMPLE_PRODUCTS.find((p) => p.id === selectedProductId) || null,
    [selectedProductId]
  );

  const forecastOnlyRows = useMemo(() => series.filter((pt) => pt.isForecast), [series]);

  const kpiSummary = useMemo(() => {
    const totalPredictedUnits = forecastOnlyRows.reduce(
      (sum, pt) => sum + (pt.predictedUnits || 0),
      0
    );
    const totalPredictedRevenue = forecastOnlyRows.reduce(
      (sum, pt) => sum + (pt.predictedRevenue || 0),
      0
    );
    const avgDailyUnits =
      forecastOnlyRows.length > 0 ? totalPredictedUnits / forecastOnlyRows.length : 0;
    const avgDailyRevenue =
      forecastOnlyRows.length > 0 ? totalPredictedRevenue / forecastOnlyRows.length : 0;

    return {
      totalPredictedUnits,
      totalPredictedRevenue,
      avgDailyUnits,
      avgDailyRevenue,
    };
  }, [forecastOnlyRows]);

  const displayName = selectedProduct
    ? `${selectedProduct.name} (${selectedProduct.id})`
    : 'All Tracked Products';

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Demand Forecasting
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Projected demand estimates derived from historical sales patterns · Sample demonstration
            data
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Product Selector */}
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            aria-label="Select product for demand forecast"
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:border-teal-600 focus:outline-none max-w-xs"
          >
            <option value="ALL">All Products (Storewide)</option>
            {SAMPLE_PRODUCTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} — {p.name}
              </option>
            ))}
          </select>

          {/* Forecast Period Selector */}
          <div
            role="group"
            aria-label="Forecast horizon"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1"
          >
            {([7, 14, 30] as ForecastPeriodDays[]).map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setForecastPeriod(days)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  forecastPeriod === days
                    ? 'bg-slate-900 text-white dark:bg-teal-600'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>

          {/* Units / Revenue Toggle */}
          <div
            role="group"
            aria-label="Forecast metric unit"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1"
          >
            <button
              type="button"
              onClick={() => setMetricMode('units')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                metricMode === 'units'
                  ? 'bg-teal-700 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Units
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('revenue')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                metricMode === 'revenue'
                  ? 'bg-teal-700 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Revenue
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Forecasted Demand"
          value={`${formatNumber(kpiSummary.totalPredictedUnits)} units`}
          icon={TrendingUp}
          trendText={formatCurrency(kpiSummary.totalPredictedRevenue, currency)}
          trendDirection="neutral"
          subtitle="Sample estimate"
        />
        <KpiCard
          title="Average Predicted Sales"
          value={
            metricMode === 'units'
              ? `${kpiSummary.avgDailyUnits.toFixed(1)} units/day`
              : `${formatCurrency(kpiSummary.avgDailyRevenue, currency)}/day`
          }
          icon={PackageSearch}
          trendText="+4.8% seasonal"
          trendDirection="up"
          subtitle="Daily run rate"
        />
        <KpiCard
          title="Forecast Period"
          value={`${forecastPeriod} Days`}
          icon={CalendarClock}
          trendText="Forward horizon"
          trendDirection="neutral"
          subtitle="Next window"
        />
        <KpiCard
          title="Sample Reference MAE"
          value={selectedProduct ? '±1.2 units/day' : '±4.8 units/day'}
          icon={Activity}
          trendText="Demonstration metric"
          trendDirection="neutral"
          subtitle="Not a live ML score"
        />
      </div>

      {/* Forecast Chart */}
      <ForecastChart
        data={series}
        currency={currency}
        metricMode={metricMode}
        productName={displayName}
      />

      {/* Required Decision-Support Information Note */}
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900 p-4">
        <Info className="h-5 w-5 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          Forecasts are estimates based on historical data and should be used as decision-support
          information, not guaranteed outcomes. Values shown here use sample demonstration patterns
          until a forecasting backend is connected.
        </p>
      </div>

      {/* Forecast Results Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              Forecast Results Schedule ({forecastPeriod}-Day Sample)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daily projected units, estimate interval, and expected revenue for {displayName}
            </p>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {forecastOnlyRows.length} days
          </span>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/90 z-10">
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <th className="py-3 px-5 font-medium">Forecast Date</th>
                <th className="py-3 px-5 font-medium text-right">Predicted Units</th>
                <th className="py-3 px-5 font-medium text-right">Estimated Range</th>
                <th className="py-3 px-5 font-medium text-right">Projected Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {forecastOnlyRows.map((row) => (
                <tr
                  key={row.date}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2.5 px-5 font-medium text-slate-900 dark:text-white tabular-nums">
                    {formatDate(row.date, dateFormat)}
                  </td>
                  <td className="py-2.5 px-5 text-right font-semibold text-teal-700 dark:text-teal-400 tabular-nums">
                    {formatNumber(row.predictedUnits || 0)} units
                  </td>
                  <td className="py-2.5 px-5 text-right text-slate-600 dark:text-slate-400 tabular-nums">
                    {formatNumber(row.lowerUnits || 0)} – {formatNumber(row.upperUnits || 0)}
                  </td>
                  <td className="py-2.5 px-5 text-right font-medium text-slate-900 dark:text-white tabular-nums">
                    {formatCurrency(row.predictedRevenue || 0, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
