import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertCircle,
  AlertTriangle,
  Boxes,
  Info,
  PackageX,
  Search,
} from 'lucide-react';
import { SAMPLE_PRODUCTS } from '../data/sampleRetailData';
import {
  ForecastPeriodDays,
  InventoryDecisionRow,
  StockStatus,
} from '../types/retail';
import {
  calculateEstimatedShortage,
  calculateSuggestedReorderQuantity,
  determineStockStatus,
  formatNumber,
} from '../utils/formatters';
import { InventorySortField, InventoryTable } from '../components/InventoryTable';
import { KpiCard } from '../components/KpiCard';

interface InventoryInsightsPageProps {
  defaultForecastPeriod: ForecastPeriodDays;
  safetyStockDays: number;
  safetyStockBufferPct: number;
}

export const InventoryInsightsPage: React.FC<InventoryInsightsPageProps> = ({
  defaultForecastPeriod,
  safetyStockDays,
  safetyStockBufferPct,
}) => {
  const [horizonDays, setHorizonDays] = useState<ForecastPeriodDays>(defaultForecastPeriod);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | StockStatus>('ALL');
  const [sortField, setSortField] = useState<InventorySortField>('estimatedShortage');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const inventoryRows: InventoryDecisionRow[] = useMemo(() => {
    return SAMPLE_PRODUCTS.map((p) => {
      const forecastDemand = Math.max(1, Math.round(p.dailyAvgDemand * horizonDays));
      const dynamicSafety = Math.max(
        Math.round(p.dailyAvgDemand * safetyStockDays),
        Math.round(forecastDemand * (safetyStockBufferPct / 100))
      );
      const estimatedShortage = calculateEstimatedShortage(forecastDemand, p.availableStock);
      const suggestedReorderQty = calculateSuggestedReorderQuantity(
        forecastDemand,
        dynamicSafety,
        p.availableStock
      );
      const status = determineStockStatus(p.availableStock, forecastDemand, dynamicSafety);

      return {
        productId: p.id,
        productName: p.name,
        category: p.category,
        availableStock: p.availableStock,
        forecastDemand,
        safetyStock: dynamicSafety,
        estimatedShortage,
        suggestedReorderQty,
        status,
      };
    });
  }, [horizonDays, safetyStockDays, safetyStockBufferPct]);

  const kpis = useMemo(() => {
    const totalProducts = inventoryRows.length;
    const lowStockCount = inventoryRows.filter((r) => r.status === 'Low Stock').length;
    const reorderCount = inventoryRows.filter((r) => r.status === 'Reorder Required').length;
    const totalShortage = inventoryRows.reduce((sum, r) => sum + r.estimatedShortage, 0);

    return {
      totalProducts,
      lowStockCount,
      reorderCount,
      totalShortage,
    };
  }, [inventoryRows]);

  const filteredAndSortedRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = inventoryRows.filter((row) => {
      const matchesStatus = statusFilter === 'ALL' || row.status === statusFilter;
      const matchesQuery =
        !q ||
        row.productName.toLowerCase().includes(q) ||
        row.productId.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'productName') cmp = a.productName.localeCompare(b.productName);
      else cmp = a[sortField] - b[sortField];
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [inventoryRows, searchQuery, statusFilter, sortField, sortDirection]);

  const chartData = useMemo(() => {
    return [...inventoryRows]
      .sort((a, b) => b.estimatedShortage - a.estimatedShortage || b.suggestedReorderQty - a.suggestedReorderQty)
      .slice(0, 8)
      .map((r) => ({
        sku: r.productId,
        name: r.productName,
        availableStock: r.availableStock,
        forecastDemand: r.forecastDemand,
      }));
  }, [inventoryRows]);

  const handleSort = (field: InventorySortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'productName' ? 'asc' : 'desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + Forecast Horizon Selector */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Inventory Insights
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Compare available warehouse stock against {horizonDays}-day demand forecasts to plan
            replenishment · Sample demonstration data
          </p>
        </div>

        <div
          role="group"
          aria-label="Demand comparison horizon"
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 self-start sm:self-auto"
        >
          {([7, 14, 30] as ForecastPeriodDays[]).map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setHorizonDays(days)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                horizonDays === days
                  ? 'bg-slate-900 text-white dark:bg-teal-600'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {days}-Day Horizon
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total Products"
          value={formatNumber(kpis.totalProducts)}
          icon={Boxes}
          trendText="Tracked inventory"
          trendDirection="neutral"
          subtitle="Active SKUs"
        />
        <KpiCard
          title="Products with Low Stock"
          value={formatNumber(kpis.lowStockCount)}
          icon={AlertTriangle}
          trendText="Below safety buffer"
          trendDirection={kpis.lowStockCount > 0 ? 'down' : 'neutral'}
          positiveIsGood={false}
          subtitle="Monitor closely"
        />
        <KpiCard
          title="Products Requiring Reorder"
          value={formatNumber(kpis.reorderCount)}
          icon={AlertCircle}
          trendText="Stock < demand"
          trendDirection={kpis.reorderCount > 0 ? 'down' : 'neutral'}
          positiveIsGood={false}
          subtitle="Action needed"
        />
        <KpiCard
          title="Estimated Stock Shortage"
          value={`${formatNumber(kpis.totalShortage)} units`}
          icon={PackageX}
          trendText={`${horizonDays}-day gap`}
          trendDirection={kpis.totalShortage > 0 ? 'down' : 'neutral'}
          positiveIsGood={false}
          subtitle="Across at-risk SKUs"
        />
      </div>

      {/* Inventory Distribution Chart */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6">
        <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
          Inventory Distribution: Available Stock vs Forecast Demand
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 mb-5">
          Top 8 SKUs prioritized by estimated shortage over the next {horizonDays} days (sample
          data)
        </p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="sku"
                tick={{ fontSize: 12, fill: '#64748B' }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748B' }}
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const item = payload[0].payload as {
                    sku: string;
                    name: string;
                    availableStock: number;
                    forecastDemand: number;
                  };
                  return (
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 shadow-md text-xs tabular-nums">
                      <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
                      <p className="text-slate-500 font-mono mb-1">{item.sku}</p>
                      <p className="text-slate-700 dark:text-slate-200">
                        Available Stock: {formatNumber(item.availableStock)} units
                      </p>
                      <p className="text-teal-700 dark:text-teal-400">
                        Forecast Demand: {formatNumber(item.forecastDemand)} units
                      </p>
                    </div>
                  );
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar
                dataKey="availableStock"
                name="Available Stock"
                fill="#0F172A"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="forecastDemand"
                name="Forecast Demand"
                fill="#0D9488"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters & Inventory Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-4 sm:px-5 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              Replenishment Decision Table
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Safety buffer: {safetyStockDays} days / {safetyStockBufferPct}% minimum · Click
              column headers to sort
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:flex-initial sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                aria-label="Search inventory products"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-1.5 pl-9 pr-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | StockStatus)}
              aria-label="Filter by stock status"
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 focus:border-teal-600 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Reorder Required">Reorder Required</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Healthy Stock">Healthy Stock</option>
            </select>
          </div>
        </div>

        <InventoryTable
          rows={filteredAndSortedRows}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </div>

      {/* Required Estimate Caveat */}
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900 p-4">
        <Info className="h-5 w-5 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          These are basic estimates (Estimated Shortage = max(0, Forecast Demand − Available
          Stock); Suggested Reorder = max(0, Forecast Demand + Safety Stock − Available Stock))
          and do not account for supplier lead times or incoming purchase orders.
        </p>
      </div>
    </div>
  );
};
