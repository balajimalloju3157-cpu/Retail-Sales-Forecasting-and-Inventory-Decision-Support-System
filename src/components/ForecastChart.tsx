import React from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CurrencyCode, ForecastSeriesPoint } from '../types/retail';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface ForecastChartProps {
  data: ForecastSeriesPoint[];
  currency: CurrencyCode;
  metricMode: 'units' | 'revenue';
  productName: string;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  data,
  currency,
  metricMode,
  productName,
}) => {
  const forecastStartIndex = data.findIndex((d) => d.isForecast);
  const boundaryLabel =
    forecastStartIndex > 0 ? data[forecastStartIndex - 1].label : undefined;
  const forecastFirstLabel =
    forecastStartIndex >= 0 ? data[forecastStartIndex].label : undefined;
  const forecastLastLabel = data.length > 0 ? data[data.length - 1].label : undefined;

  const actualKey = metricMode === 'units' ? 'actualUnits' : 'actualRevenue';
  const predictedKey = metricMode === 'units' ? 'predictedUnits' : 'predictedRevenue';

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            Actual vs Predicted Demand — {productName}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Historical sales (solid navy) compared against projected forecast window (dashed teal · sample data)
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span className="h-0.5 w-4 bg-slate-900 dark:bg-slate-200 inline-block" />
            <span>Historical Actual</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-teal-700 dark:text-teal-400">
            <span className="h-0.5 w-4 border-t-2 border-dashed border-teal-600 inline-block" />
            <span>Forecast Estimate</span>
          </span>
        </div>
      </div>

      <div className="h-80 sm:h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 14, right: 12, left: 6, bottom: 0 }}>
            <defs>
              <linearGradient id="forecastBandFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D9488" stopOpacity={0.14} />
                <stop offset="95%" stopColor="#0D9488" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />

            {forecastFirstLabel && forecastLastLabel && (
              <ReferenceArea
                x1={boundaryLabel || forecastFirstLabel}
                x2={forecastLastLabel}
                fill="#0D9488"
                fillOpacity={0.05}
              />
            )}

            {boundaryLabel && (
              <ReferenceLine
                x={boundaryLabel}
                stroke="#64748B"
                strokeDasharray="4 4"
                label={{
                  value: 'Forecast Start',
                  position: 'insideTopRight',
                  fill: '#475569',
                  fontSize: 11,
                }}
              />
            )}

            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: '#64748B' }}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              minTickGap={22}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#64748B' }}
              tickLine={false}
              axisLine={false}
              width={64}
              tickFormatter={(val: number) =>
                metricMode === 'revenue'
                  ? formatCurrency(val, currency, true)
                  : formatNumber(val)
              }
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                const pt = payload[0].payload as ForecastSeriesPoint;
                return (
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 shadow-md text-xs">
                    <p className="font-semibold text-slate-900 dark:text-white mb-1">
                      {label} · {pt.isForecast ? 'Forecast Window' : 'Historical'}
                    </p>
                    <div className="space-y-1 tabular-nums">
                      {pt.actualUnits !== null && (
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-500 dark:text-slate-400">Actual</span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {metricMode === 'units'
                              ? `${formatNumber(pt.actualUnits)} units`
                              : formatCurrency(pt.actualRevenue || 0, currency)}
                          </span>
                        </div>
                      )}
                      {pt.predictedUnits !== null && (
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-500 dark:text-slate-400">Predicted</span>
                          <span className="font-semibold text-teal-700 dark:text-teal-400">
                            {metricMode === 'units'
                              ? `${formatNumber(pt.predictedUnits)} units`
                              : formatCurrency(pt.predictedRevenue || 0, currency)}
                          </span>
                        </div>
                      )}
                      {pt.isForecast && pt.lowerUnits !== null && pt.upperUnits !== null && metricMode === 'units' && (
                        <div className="flex items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                          <span>Est. Range</span>
                          <span>
                            {formatNumber(pt.lowerUnits)} – {formatNumber(pt.upperUnits)} units
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }}
            />

            <Area
              type="monotone"
              dataKey={predictedKey}
              stroke="none"
              fill="url(#forecastBandFill)"
              connectNulls={false}
            />

            <Line
              type="monotone"
              dataKey={actualKey}
              stroke="#0F172A"
              strokeWidth={2.5}
              dot={{ r: 2.5, fill: '#0F172A' }}
              activeDot={{ r: 5, fill: '#0F172A', stroke: '#FFFFFF', strokeWidth: 2 }}
              connectNulls={false}
            />

            <Line
              type="monotone"
              dataKey={predictedKey}
              stroke="#0D9488"
              strokeWidth={2.5}
              strokeDasharray="6 4"
              dot={{ r: 2.5, fill: '#0D9488' }}
              activeDot={{ r: 5, fill: '#0D9488', stroke: '#FFFFFF', strokeWidth: 2 }}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
