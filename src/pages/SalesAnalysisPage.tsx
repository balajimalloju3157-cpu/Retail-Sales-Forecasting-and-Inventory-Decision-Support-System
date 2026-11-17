import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Receipt, ShoppingBag, TrendingUp, Wallet } from 'lucide-react';
import {
  ALL_DAILY_SALES,
  MONTHLY_REVENUE_SERIES,
  getCategoryBreakdown,
} from '../data/sampleRetailData';
import { CurrencyCode, DateRangeOption } from '../types/retail';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { KpiCard } from '../components/KpiCard';

interface SalesAnalysisPageProps {
  currency: CurrencyCode;
  dateRange: DateRangeOption;
  onDateRangeChange: (range: DateRangeOption) => void;
}

export const SalesAnalysisPage: React.FC<SalesAnalysisPageProps> = ({
  currency,
  dateRange,
  onDateRangeChange,
}) => {
  const daysCount = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;

  const slicedDaily = useMemo(() => ALL_DAILY_SALES.slice(-daysCount), [daysCount]);
  const categoryBreakdown = useMemo(() => getCategoryBreakdown(), []);

  const summary = useMemo(() => {
    const totalRevenue = slicedDaily.reduce((sum, d) => sum + d.revenue, 0);
    const totalUnits = slicedDaily.reduce((sum, d) => sum + d.units, 0);
    const totalTransactions = slicedDaily.reduce((sum, d) => sum + d.transactions, 0);
    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    return {
      totalRevenue,
      totalUnits,
      totalTransactions,
      averageOrderValue,
    };
  }, [slicedDaily]);

  return (
    <div className="space-y-6">
      {/* Header + Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Sales Analysis
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Compare monetary revenue against physical unit volume across daily, monthly, and
            category views · Sample demonstration data
          </p>
        </div>

        <div
          role="group"
          aria-label="Sales analysis date filter"
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total Revenue"
          value={formatCurrency(summary.totalRevenue, currency)}
          icon={Wallet}
          trendText="+10.4%"
          trendDirection="up"
          subtitle="Monetary sales"
        />
        <KpiCard
          title="Total Quantity Sold"
          value={`${formatNumber(summary.totalUnits)} units`}
          icon={ShoppingBag}
          trendText="+8.1%"
          trendDirection="up"
          subtitle="Physical volume"
        />
        <KpiCard
          title="Number of Transactions"
          value={formatNumber(summary.totalTransactions)}
          icon={Receipt}
          trendText="+6.5%"
          trendDirection="up"
          subtitle="Completed invoices"
        />
        <KpiCard
          title="Average Order Value"
          value={formatCurrency(summary.averageOrderValue, currency)}
          icon={TrendingUp}
          trendText="+3.6%"
          trendDirection="up"
          subtitle="Revenue / order"
        />
      </div>

      {/* Daily Sales Trend Chart (Clear distinction: Revenue vs Quantity Sold) */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              Daily Sales Trend: Revenue vs Quantity Sold
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Left axis tracks Revenue ({currency}); right axis tracks physical Units Sold
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span className="h-2.5 w-2.5 rounded-xs bg-slate-900 dark:bg-slate-200 inline-block" />
              <span>Revenue ({currency})</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-teal-700 dark:text-teal-400">
              <span className="h-2.5 w-2.5 rounded-xs bg-teal-600 inline-block" />
              <span>Quantity Sold (Units)</span>
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={slicedDaily} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: '#64748B' }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                minTickGap={22}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12, fill: '#64748B' }}
                tickLine={false}
                axisLine={false}
                width={62}
                tickFormatter={(val: number) => formatCurrency(val, currency, true)}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12, fill: '#0D9488' }}
                tickLine={false}
                axisLine={false}
                width={44}
                tickFormatter={(val: number) => `${val}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const pt = payload[0].payload as {
                    revenue: number;
                    units: number;
                    transactions: number;
                  };
                  return (
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 shadow-md text-xs">
                      <p className="font-semibold text-slate-900 dark:text-white mb-1.5">{label}</p>
                      <div className="space-y-1 tabular-nums">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-500 dark:text-slate-400">Revenue</span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(pt.revenue, currency)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-500 dark:text-slate-400">Quantity Sold</span>
                          <span className="font-semibold text-teal-700 dark:text-teal-400">
                            {formatNumber(pt.units)} units
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-500 dark:text-slate-400">Transactions</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {formatNumber(pt.transactions)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar
                yAxisId="right"
                dataKey="units"
                fill="#0D9488"
                fillOpacity={0.28}
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#0F172A"
                strokeWidth={2.25}
                dot={false}
                activeDot={{ r: 5, fill: '#0F172A', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Revenue Chart + Sales Volume Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6">
          <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            Monthly Revenue
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 mb-5">
            6-month revenue progression (sample data)
          </p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_REVENUE_SERIES} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                  width={64}
                  tickFormatter={(val: number) => formatCurrency(val, currency, true)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const item = payload[0].payload as {
                      month: string;
                      revenue: number;
                      units: number;
                    };
                    return (
                      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 shadow-md text-xs tabular-nums">
                        <p className="font-semibold text-slate-900 dark:text-white">{item.month}</p>
                        <p className="mt-1 text-slate-700 dark:text-slate-300">
                          Revenue: {formatCurrency(item.revenue, currency)}
                        </p>
                        <p className="text-teal-700 dark:text-teal-400">
                          Units Sold: {formatNumber(item.units)}
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="revenue" fill="#0F172A" radius={[5, 5, 0, 0]} maxBarSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Distribution by Category (Quantity Sold) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6">
          <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            Sales Distribution by Category (Quantity Sold)
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 mb-5">
            Physical units sold per retail category over 30 days (sample data)
          </p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryBreakdown}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={150}
                  tick={{ fontSize: 12, fill: '#475569' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const item = payload[0].payload as {
                      category: string;
                      units: number;
                      revenue: number;
                    };
                    return (
                      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 shadow-md text-xs tabular-nums">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {item.category}
                        </p>
                        <p className="mt-1 text-teal-700 dark:text-teal-400">
                          Quantity Sold: {formatNumber(item.units)} units
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                          Revenue: {formatCurrency(item.revenue, currency)}
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="units" fill="#0D9488" radius={[0, 5, 5, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            Category Revenue Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Detailed comparison of quantity sold vs revenue generated per category
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <th className="py-3 px-5 font-medium">Category</th>
                <th className="py-3 px-5 font-medium text-right">Quantity Sold</th>
                <th className="py-3 px-5 font-medium text-right">Revenue</th>
                <th className="py-3 px-5 font-medium text-right">Avg Unit Price</th>
                <th className="py-3 px-5 font-medium text-right">Revenue Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {categoryBreakdown.map((cat) => (
                <tr
                  key={cat.category}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-5 font-medium text-slate-900 dark:text-white flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: cat.color }}
                      aria-hidden="true"
                    />
                    <span>{cat.category}</span>
                  </td>
                  <td className="py-3 px-5 text-right text-slate-700 dark:text-slate-300 tabular-nums">
                    {formatNumber(cat.units)} units
                  </td>
                  <td className="py-3 px-5 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                    {formatCurrency(cat.revenue, currency)}
                  </td>
                  <td className="py-3 px-5 text-right text-slate-600 dark:text-slate-400 tabular-nums">
                    {formatCurrency(cat.units > 0 ? cat.revenue / cat.units : 0, currency)}
                  </td>
                  <td className="py-3 px-5 text-right font-medium text-teal-700 dark:text-teal-400 tabular-nums">
                    {cat.percentage}%
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
