/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_SETTINGS,
  RECENT_TRANSACTIONS,
  SAMPLE_PRODUCTS,
} from './data/sampleRetailData';
import {
  AppSettings,
  DateRangeOption,
  InventoryDecisionRow,
  PageId,
  ToastNotification,
  UploadedDatasetPreview,
} from './types/retail';
import {
  calculateEstimatedShortage,
  calculateSuggestedReorderQuantity,
  determineStockStatus,
} from './utils/formatters';
import { PageLayout } from './components/PageLayout';
import { OverviewPage } from './pages/OverviewPage';
import { UploadDataPage } from './pages/UploadDataPage';
import { SalesAnalysisPage } from './pages/SalesAnalysisPage';
import { ProductPerformancePage } from './pages/ProductPerformancePage';
import { SalesForecastPage } from './pages/SalesForecastPage';
import { InventoryInsightsPage } from './pages/InventoryInsightsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

const PAGE_TITLES: Record<PageId, string> = {
  overview: 'Overview',
  upload: 'Upload Data',
  'sales-analysis': 'Sales Analysis',
  'product-performance': 'Product Performance',
  'sales-forecast': 'Sales Forecast',
  'inventory-insights': 'Inventory Insights',
  reports: 'Reports',
  settings: 'Settings',
};

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('overview');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [dateRange, setDateRange] = useState<DateRangeOption>('30d');
  const [globalSearch, setGlobalSearch] = useState('');
  const [uploadedDataset, setUploadedDataset] = useState<UploadedDatasetPreview | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Apply Light / Dark / System theme cleanly on <html>
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark =
        settings.theme === 'dark' || (settings.theme === 'system' && prefersDark);
      root.classList.toggle('dark', shouldBeDark);
    };

    applyTheme();

    if (settings.theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      media.addEventListener('change', applyTheme);
      return () => media.removeEventListener('change', applyTheme);
    }
  }, [settings.theme]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (type: ToastNotification['type'], title: string, message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  // Compute inventory alerts for Topbar notifications
  const inventoryAlerts: InventoryDecisionRow[] = useMemo(() => {
    return SAMPLE_PRODUCTS.map((p) => {
      const forecastDemand = Math.max(
        1,
        Math.round(p.dailyAvgDemand * settings.defaultForecastPeriod)
      );
      const safetyStock = Math.max(
        Math.round(p.dailyAvgDemand * settings.safetyStockDays),
        Math.round(forecastDemand * (settings.safetyStockBufferPct / 100))
      );
      const estimatedShortage = calculateEstimatedShortage(forecastDemand, p.availableStock);
      const suggestedReorderQty = calculateSuggestedReorderQuantity(
        forecastDemand,
        safetyStock,
        p.availableStock
      );
      const status = determineStockStatus(p.availableStock, forecastDemand, safetyStock);
      return {
        productId: p.id,
        productName: p.name,
        category: p.category,
        availableStock: p.availableStock,
        forecastDemand,
        safetyStock,
        estimatedShortage,
        suggestedReorderQty,
        status,
      };
    })
      .filter((row) => row.status !== 'Healthy Stock')
      .sort((a, b) => b.estimatedShortage - a.estimatedShortage);
  }, [
    settings.defaultForecastPeriod,
    settings.safetyStockDays,
    settings.safetyStockBufferPct,
  ]);

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <OverviewPage
            currency={settings.currency}
            dateFormat={settings.dateFormat}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onNavigate={setActivePage}
          />
        );
      case 'upload':
        return (
          <UploadDataPage
            dataset={uploadedDataset}
            onDatasetChange={setUploadedDataset}
            onNotify={notify}
          />
        );
      case 'sales-analysis':
        return (
          <SalesAnalysisPage
            currency={settings.currency}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        );
      case 'product-performance':
        return (
          <ProductPerformancePage
            currency={settings.currency}
            initialSearch={globalSearch}
          />
        );
      case 'sales-forecast':
        return (
          <SalesForecastPage
            currency={settings.currency}
            dateFormat={settings.dateFormat}
            defaultForecastPeriod={settings.defaultForecastPeriod}
          />
        );
      case 'inventory-insights':
        return (
          <InventoryInsightsPage
            defaultForecastPeriod={settings.defaultForecastPeriod}
            safetyStockDays={settings.safetyStockDays}
            safetyStockBufferPct={settings.safetyStockBufferPct}
          />
        );
      case 'reports':
        return (
          <ReportsPage
            currency={settings.currency}
            dateFormat={settings.dateFormat}
            defaultForecastPeriod={settings.defaultForecastPeriod}
            safetyStockDays={settings.safetyStockDays}
            safetyStockBufferPct={settings.safetyStockBufferPct}
            onNotify={notify}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            settings={settings}
            onSaveSettings={setSettings}
            onNotify={notify}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PageLayout
      activePage={activePage}
      pageTitle={PAGE_TITLES[activePage]}
      onNavigate={setActivePage}
      businessName={settings.businessName}
      globalSearch={globalSearch}
      onGlobalSearchChange={setGlobalSearch}
      products={SAMPLE_PRODUCTS}
      transactions={RECENT_TRANSACTIONS}
      inventoryAlerts={inventoryAlerts}
      currency={settings.currency}
      toasts={toasts}
      onDismissToast={dismissToast}
    >
      {renderPage()}
    </PageLayout>
  );
}
