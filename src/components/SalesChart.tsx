import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CurrencyCode, DailySalesPoint, MonthlySalesPoint } from '../types/retail';
import { formatCurrency, formatNumber } from '../utils/formatters';

export type SalesGranularity = 'daily' | 'weekly' | 'monthly';

interface SalesChartProps {
  dailyData: DailySalesPoint[];
  monthlyData: MonthlySalesPoint[];
  currency: CurrencyCode;
  title?: string;
  subtitle?: string;
}

export const SalesChart: React.FC<SalesChartProps> = ({
  dailyData,
  monthlyData,
  currency,
  title = 'Sales Overview',
  subtitle = 'Revenue trajectory across selected timeframe (sample data)',
}) => {
  const [granularity, setGranularity] = useState<SalesGranularity>('daily');

  const chartData = useMemo(() => {
    if (granularity === 'monthly') {
      return monthlyData.map((m) => ({
        label: m.month,
        revenue: m.revenue,
        units: m.units,
        transactions: m.transactions,
      }));
    }

    if (granularity === 'weekly') {
      const weeks: { label: string; revenue: number; units: number; transactions: number }[] = [];
      for (let i = 0; i < dailyData.length; i += 7) {
        const slice = dailyData.slice(i, i + 7);
        if (slice.length === 0) continue;
        const firstLabel = slice[0].label;
        const lastLabel = slice[slice.length - 1].label;
        weeks.push({
          label: slice.length > 1 ? `${firstLabel}–${lastLabel}` : firstLabel,
          revenue: slice.reduce((sum, d) => sum + d.revenue, 0),
          units: slice.reduce((sum, d) => sum + d.units, 0),
          transactions: slice.reduce((sum, d) => sum + d.transactions, 0),
        });
      }
      return weeks;
    }

    return dailyData.map((d) => ({
      label: d.label,
      revenue: d.revenue,
      units: d.units,
      transactions: d.transactions,
    }));
  }, [dailyData, monthlyData, granularity]);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>

        {/* Granularity Segmented Control */}
        <div
          role="group"
          aria-label="Chart granularity"
          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1 self-start sm:self-auto"
        >
          {(['daily', 'weekly', 'monthly'] as SalesGranularity[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setGranularity(mode)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors whitespace-nowrap shrink-0 ${
                granularity === mode
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 sm:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="salesRevenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D9488" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: '#64748B' }}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              minTickGap={24}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#64748B' }}
              tickLine={false}
              axisLine={false}
              width={64}
              tickFormatter={(val: number) => formatCurrency(val, currency, true)}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                const item = payload[0].payload as {
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
                          {formatCurrency(item.revenue, currency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-slate-500 dark:text-slate-400">Units Sold</span>
                        <span className="font-medium text-teal-700 dark:text-teal-400">
                          {formatNumber(item.units)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-slate-500 dark:text-slate-400">Orders</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {formatNumber(item.transactions)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#0F172A"
              strokeWidth={2.25}
              fill="url(#salesRevenueFill)"
              activeDot={{ r: 5, fill: '#0D9488', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
