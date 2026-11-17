import React, { useEffect, useState } from 'react';
import { RotateCcw, Save } from 'lucide-react';
import { DEFAULT_SETTINGS } from '../data/sampleRetailData';
import {
  AppSettings,
  CurrencyCode,
  DateFormat,
  ForecastPeriodDays,
  ThemePreference,
} from '../types/retail';

interface SettingsPageProps {
  settings: AppSettings;
  onSaveSettings: (updated: AppSettings) => void;
  onNotify: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onSaveSettings,
  onNotify,
}) => {
  const [draft, setDraft] = useState<AppSettings>(settings);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedName = draft.businessName.trim() || DEFAULT_SETTINGS.businessName;
    const sanitized: AppSettings = {
      ...draft,
      businessName: cleanedName,
      safetyStockDays: Math.max(1, Math.min(30, Number(draft.safetyStockDays) || 5)),
      safetyStockBufferPct: Math.max(5, Math.min(100, Number(draft.safetyStockBufferPct) || 20)),
    };
    onSaveSettings(sanitized);
    onNotify('success', 'Settings Saved', 'Workspace preferences have been updated.');
  };

  const handleReset = () => {
    setDraft(DEFAULT_SETTINGS);
    onSaveSettings(DEFAULT_SETTINGS);
    onNotify('info', 'Defaults Restored', 'Settings have been reset to default prototype values.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Settings
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Configure store details, display formatting, forecast horizons, and safety stock
          thresholds for this frontend workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Store & Display Settings */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
          <div>
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              General & Regional Formatting
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Changes immediately update currency, dates, and branding across all dashboard views.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="businessName"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Business Name
              </label>
              <input
                id="businessName"
                type="text"
                value={draft.businessName}
                onChange={(e) => setDraft({ ...draft, businessName: e.target.value })}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-teal-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
              />
            </div>

            <div>
              <label
                htmlFor="currencySelect"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Display Currency
              </label>
              <select
                id="currencySelect"
                value={draft.currency}
                onChange={(e) => setDraft({ ...draft, currency: e.target.value as CurrencyCode })}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-teal-600 focus:outline-none"
              >
                <option value="INR">INR (₹) — Indian Rupee (Default)</option>
                <option value="USD">USD ($) — US Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="dateFormatSelect"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Date Format
              </label>
              <select
                id="dateFormatSelect"
                value={draft.dateFormat}
                onChange={(e) => setDraft({ ...draft, dateFormat: e.target.value as DateFormat })}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-teal-600 focus:outline-none"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (e.g., 17/11/2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (e.g., 11/17/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (e.g., 2026-11-17)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="themeSelect"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Theme Preference
              </label>
              <select
                id="themeSelect"
                value={draft.theme}
                onChange={(e) => setDraft({ ...draft, theme: e.target.value as ThemePreference })}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-teal-600 focus:outline-none"
              >
                <option value="light">Light (Default)</option>
                <option value="dark">Dark</option>
                <option value="system">Match System</option>
              </select>
            </div>
          </div>
        </section>

        {/* Forecasting & Safety Stock Configuration */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
          <div>
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              Forecast & Safety Stock Configuration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Controls default demand horizon and replenishment safety buffer calculations on the
              Inventory Insights page.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="defaultForecastPeriod"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Default Forecast Horizon
              </label>
              <select
                id="defaultForecastPeriod"
                value={draft.defaultForecastPeriod}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    defaultForecastPeriod: Number(e.target.value) as ForecastPeriodDays,
                  })
                }
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-teal-600 focus:outline-none"
              >
                <option value={7}>7 Days</option>
                <option value={14}>14 Days (Recommended)</option>
                <option value={30}>30 Days</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="forecastMethodLabel"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Forecasting Method Label (Prototype)
              </label>
              <select
                id="forecastMethodLabel"
                value={draft.forecastMethodLabel}
                onChange={(e) => setDraft({ ...draft, forecastMethodLabel: e.target.value })}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-teal-600 focus:outline-none"
              >
                <option value="Seasonal Moving Average (Sample Prototype)">
                  Seasonal Moving Average (Sample Prototype)
                </option>
                <option value="Exponential Smoothing (Sample Prototype)">
                  Exponential Smoothing (Sample Prototype)
                </option>
                <option value="Linear Trend + Weekday Seasonality (Sample)">
                  Linear Trend + Weekday Seasonality (Sample)
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="safetyStockDays"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Safety Stock Coverage (Days of Demand)
              </label>
              <input
                id="safetyStockDays"
                type="number"
                min={1}
                max={30}
                value={draft.safetyStockDays}
                onChange={(e) =>
                  setDraft({ ...draft, safetyStockDays: Number(e.target.value) })
                }
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white tabular-nums focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="safetyStockBufferPct"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Minimum Safety Buffer (% of Forecast Demand)
              </label>
              <input
                id="safetyStockBufferPct"
                type="number"
                min={5}
                max={100}
                value={draft.safetyStockBufferPct}
                onChange={(e) =>
                  setDraft({ ...draft, safetyStockBufferPct: Number(e.target.value) })
                }
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white tabular-nums focus:border-teal-600 focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 px-5 py-2 text-sm font-medium text-white transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
