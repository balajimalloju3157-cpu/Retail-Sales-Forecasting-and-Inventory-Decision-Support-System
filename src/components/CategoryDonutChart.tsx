import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CategoryBreakdown, CurrencyCode } from '../types/retail';
import { formatCurrency } from '../utils/formatters';

interface CategoryDonutChartProps {
  data: CategoryBreakdown[];
  currency: CurrencyCode;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ data, currency }) => {
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 flex flex-col justify-between">
      <div>
        <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
          Revenue by Category
        </h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          30-day category distribution (sample data)
        </p>
      </div>

      <div className="relative h-56 w-full my-3">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="revenue"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={84}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.category} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const item = payload[0].payload as CategoryBreakdown;
                return (
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 shadow-md text-xs">
                    <p className="font-semibold text-slate-900 dark:text-white">{item.category}</p>
                    <p className="mt-1 text-slate-600 dark:text-slate-300 tabular-nums">
                      {formatCurrency(item.revenue, currency)} ({item.percentage}%)
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Summary */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Total
          </span>
          <span className="font-display text-base font-bold text-slate-900 dark:text-white tabular-nums">
            {formatCurrency(totalRevenue, currency, true)}
          </span>
        </div>
      </div>

      {/* Clean Legend */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
        {data.map((item) => (
          <div key={item.category} className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-xs"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <span className="text-slate-700 dark:text-slate-300 truncate">{item.category}</span>
            </div>
            <div className="flex items-center gap-2.5 shrink-0 tabular-nums">
              <span className="font-medium text-slate-900 dark:text-white">
                {formatCurrency(item.revenue, currency)}
              </span>
              <span className="w-10 text-right text-slate-500 dark:text-slate-400">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
