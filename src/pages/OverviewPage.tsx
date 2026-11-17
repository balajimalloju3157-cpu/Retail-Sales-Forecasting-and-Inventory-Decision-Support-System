import React, { useMemo } from 'react';
import {
  ArrowRight,
  BarChart2,
  Package,
  ShoppingCart,
  Wallet,
} from 'lucide-react';
import {
  ALL_DAILY_SALES,
  MONTHLY_REVENUE_SERIES,
  RECENT_TRANSACTIONS,
  SAMPLE_PRODUCTS,
  getCategoryBreakdown,
} from '../data/sampleRetailData';
import { CurrencyCode, DateFormat, DateRangeOption, PageId } from '../types/retail';
import { formatCurrency, formatDate, formatNumber } from '../utils/formatters';
import { CategoryDonutChart } from '../components/CategoryDonutChart';
import { KpiCard } from '../components/KpiCard';
import { ProductTable } from '../components/ProductTable';
import { SalesChart } from '../components/SalesChart';

interface OverviewPageProps {
  currency: CurrencyCode;
  dateFormat: DateFormat;
  dateRange: DateRangeOption;
  onDateRangeChange: (range: DateRangeOption) => void;
  onNavigate: (page: PageId) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  currency,
  dateFormat,
  dateRange,
  onDateRangeChange,
  onNavigate,
}) => {
  const daysCount = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;

  const slicedDaily = useMemo(() => {
    return ALL_DAILY_SALES.slice(-daysCount);
  }, [daysCount]);

  const prevSlicedDaily = useMemo(() => {
    if (daysCount === 90) {
      return ALL_DAILY_SALES.slice(0, 45);
    }
    return ALL_DAILY_SALES.slice(-(daysCount * 2), -daysCount);
  }, [daysCount]);

  const kpis = useMemo(() => {
    const totalRevenue = slicedDaily.reduce((sum, d) => sum + d.revenue, 0);
    const totalUnits = slicedDaily.reduce((sum, d) => sum + d.units, 0);
    const avgDaily = slicedDaily.length > 0 ? totalRevenue / slicedDaily.length : 0;

    const prevRev = prevSlicedDaily.reduce((sum, d) => sum + d.revenue, 0);
    const prevUnits = prevSlicedDaily.reduce((sum, d) => sum + d.units, 0);
    const prevAvgDaily = prevSlicedDaily.length > 0 ? prevRev / prevSlicedDaily.length : 0;

    const revChange =
      dateRange === '90d'
        ? '+11.4%'
        : prevRev > 0
        ? `${(((totalRevenue - prevRev) / prevRev) * 100).toFixed(1)}%`
        : '+8.4%';

    const unitChange =
      dateRange === '90d'
        ? '+9.2%'
        : prevUnits > 0
        ? `${(((totalUnits - prevUnits) / prevUnits) * 100).toFixed(1)}%`
        : '+6.8%';

    const avgChange =
      dateRange === '90d'
        ? '+7.6%'
        : prevAvgDaily > 0
        ? `${(((avgDaily - prevAvgDaily) / prevAvgDaily) * 100).toFixed(1)}%`
        : '+5.2%';

    const ensurePlus = (val: string) =>
      val.startsWith('+') || val.startsWith('-') ? val : `+${val}`;

    return {
      totalRevenue,
      totalUnits,
      avgDaily,
      revTrend: ensurePlus(revChange),
      unitTrend: ensurePlus(unitChange),
      avgTrend: ensurePlus(avgChange),
    };
  }, [slicedDaily, prevSlicedDaily, dateRange]);

  const categoryBreakdown = useMemo(() => getCategoryBreakdown(), []);

  const topFiveProducts = useMemo(() => {
    return [...SAMPLE_PRODUCTS]
      .sort((a, b) => b.revenue30d - a.revenue30d)
      .slice(0, 5);
  }, []);

  const recentActivity = useMemo(() => RECENT_TRANSACTIONS.slice(0, 5), []);

  const rangeLabel =
    dateRange === '7d' ? 'Last 7 days' : dateRange === '30d' ? 'Last 30 days' : 'Last 90 days';

  return (
    <div className="space-y-6">
      {/* Welcome Section + Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Retail Performance Overview
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Monitor your sales, understand product demand, and make smarter inventory decisions.
            <span className="text-slate-500 dark:text-slate-500"> · Sample demonstration data</span>
          </p>
        </div>

        <div
          role="group"
          aria-label="Date range filter"
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 self-start sm:self-auto"
        >
          {(
            [
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
            ] as { id: DateRangeOption; label: string }[]
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onDateRangeChange(opt.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                dateRange === opt.id
                  ? 'bg-slate-900 text-white dark:bg-teal-600'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Summary Cards */}
      <section aria-label="Key performance indicators" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total Revenue"
          value={formatCurrency(kpis.totalRevenue, currency)}
          icon={Wallet}
          trendText={kpis.revTrend}
          trendDirection={kpis.revTrend.startsWith('-') ? 'down' : 'up'}
          subtitle={rangeLabel}
        />
        <KpiCard
          title="Total Units Sold"
          value={formatNumber(kpis.totalUnits)}
          icon={ShoppingCart}
          trendText={kpis.unitTrend}
          trendDirection={kpis.unitTrend.startsWith('-') ? 'down' : 'up'}
          subtitle="vs prior period"
        />
        <KpiCard
          title="Total Products"
          value={formatNumber(SAMPLE_PRODUCTS.length)}
          icon={Package}
          trendText="5 categories"
          trendDirection="neutral"
          subtitle="Active sample SKUs"
        />
        <KpiCard
          title="Average Daily Sales"
          value={formatCurrency(kpis.avgDaily, currency)}
          icon={BarChart2}
          trendText={kpis.avgTrend}
          trendDirection={kpis.avgTrend.startsWith('-') ? 'down' : 'up'}
          subtitle="Daily run rate"
        />
      </section>

      {/* Main Charts Row */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <SalesChart
            dailyData={slicedDaily}
            monthlyData={MONTHLY_REVENUE_SERIES}
            currency={currency}
          />
        </div>
        <CategoryDonutChart data={categoryBreakdown} currency={currency} />
      </section>

      {/* Bottom Tables Row */}
      <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Top Selling Products (3 cols) */}
        <div className="xl:col-span-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Top Selling Products
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Top 5 SKUs by 30-day revenue (sample data)
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('product-performance')}
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 dark:text-teal-400 hover:underline whitespace-nowrap shrink-0"
            >
              <span>View all</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <ProductTable products={topFiveProducts} currency={currency} />
        </div>

        {/* Recent Sales Activity (2 cols) */}
        <div className="xl:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Recent Sales Activity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest POS transactions (sample data)
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('sales-analysis')}
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 dark:text-teal-400 hover:underline whitespace-nowrap shrink-0"
            >
              <span>Details</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4 font-medium whitespace-nowrap">Invoice</th>
                  <th className="py-3 px-4 font-medium whitespace-nowrap">Product</th>
                  <th className="py-3 px-4 font-medium whitespace-nowrap">Date</th>
                  <th className="py-3 px-4 font-medium text-right whitespace-nowrap">Qty</th>
                  <th className="py-3 px-4 font-medium text-right whitespace-nowrap">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {recentActivity.map((tx) => (
                  <tr
                    key={tx.invoiceId}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {tx.invoiceId}
                    </td>
                    <td className="py-3 px-4 text-slate-900 dark:text-white max-w-[160px] truncate">
                      {tx.productName}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                      {formatDate(tx.date, dateFormat)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                      {tx.quantity}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-white tabular-nums whitespace-nowrap">
                      {formatCurrency(tx.amount, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
