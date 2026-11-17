import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trendText?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  positiveIsGood?: boolean;
  subtitle?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon: Icon,
  trendText,
  trendDirection = 'neutral',
  positiveIsGood = true,
  subtitle,
}) => {
  const getTrendColor = () => {
    if (trendDirection === 'neutral') {
      return 'text-slate-500 dark:text-slate-400';
    }
    const isGood =
      (trendDirection === 'up' && positiveIsGood) ||
      (trendDirection === 'down' && !positiveIsGood);

    return isGood
      ? 'text-emerald-700 dark:text-emerald-400'
      : 'text-rose-700 dark:text-rose-400';
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-teal-400">
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>

      <p className="mt-3 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
        {value}
      </p>

      {(trendText || subtitle) && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          {trendText && (
            <span className={`inline-flex items-center gap-1 font-medium tabular-nums ${getTrendColor()}`}>
              {trendDirection === 'up' && <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />}
              {trendDirection === 'down' && <ArrowDownRight className="h-3.5 w-3.5 shrink-0" />}
              {trendDirection === 'neutral' && <Minus className="h-3.5 w-3.5 shrink-0" />}
              <span>{trendText}</span>
            </span>
          )}
          {subtitle && (
            <span className="text-slate-500 dark:text-slate-400 truncate">
              {trendText ? `· ${subtitle}` : subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
