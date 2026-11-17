import React from 'react';
import { AlertCircle, AlertTriangle, ArrowUpDown, CheckCircle2 } from 'lucide-react';
import { InventoryDecisionRow, StockStatus } from '../types/retail';
import { formatNumber } from '../utils/formatters';

export type InventorySortField =
  | 'productName'
  | 'availableStock'
  | 'forecastDemand'
  | 'estimatedShortage'
  | 'suggestedReorderQty';

interface InventoryTableProps {
  rows: InventoryDecisionRow[];
  sortField: InventorySortField;
  sortDirection: 'asc' | 'desc';
  onSort: (field: InventorySortField) => void;
}

const StatusDisplay: React.FC<{ status: StockStatus }> = ({ status }) => {
  if (status === 'Healthy Stock') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        <span>Healthy Stock</span>
      </span>
    );
  }
  if (status === 'Low Stock') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        <span>Low Stock</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700 dark:text-rose-400">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span>Reorder Required</span>
    </span>
  );
};

export const InventoryTable: React.FC<InventoryTableProps> = ({
  rows,
  sortField,
  sortDirection,
  onSort,
}) => {
  const renderHeaderSort = (field: InventorySortField, label: string, alignRight = false) => {
    const active = sortField === field;
    return (
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1 font-medium hover:text-slate-900 dark:hover:text-white transition-colors ${
          alignRight ? 'ml-auto' : ''
        } ${active ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
      >
        <span>{label}</span>
        <ArrowUpDown
          className={`h-3.5 w-3.5 ${active ? 'text-teal-600 dark:text-teal-400' : 'opacity-50'}`}
        />
        {active && (
          <span className="sr-only">
            {sortDirection === 'asc' ? 'sorted ascending' : 'sorted descending'}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <th className="py-3 px-4 font-medium whitespace-nowrap">Product ID</th>
            <th className="py-3 px-4 font-medium whitespace-nowrap">
              {renderHeaderSort('productName', 'Product Name')}
            </th>
            <th className="py-3 px-4 font-medium text-right whitespace-nowrap">
              {renderHeaderSort('availableStock', 'Available Stock', true)}
            </th>
            <th className="py-3 px-4 font-medium text-right whitespace-nowrap">
              {renderHeaderSort('forecastDemand', 'Forecast Demand', true)}
            </th>
            <th className="py-3 px-4 font-medium text-right whitespace-nowrap">
              {renderHeaderSort('estimatedShortage', 'Estimated Shortage', true)}
            </th>
            <th className="py-3 px-4 font-medium text-right whitespace-nowrap">
              {renderHeaderSort('suggestedReorderQty', 'Suggested Reorder Qty', true)}
            </th>
            <th className="py-3 px-4 font-medium whitespace-nowrap">Stock Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="py-8 px-4 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                No inventory items match the selected filter criteria.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.productId}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {row.productId}
                </td>
                <td className="py-3 px-4">
                  <p className="font-medium text-slate-900 dark:text-white">{row.productName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{row.category}</p>
                </td>
                <td className="py-3 px-4 text-right font-medium text-slate-900 dark:text-white tabular-nums whitespace-nowrap">
                  {formatNumber(row.availableStock)}
                </td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">
                  {formatNumber(row.forecastDemand)}
                </td>
                <td className="py-3 px-4 text-right tabular-nums whitespace-nowrap">
                  <span
                    className={
                      row.estimatedShortage > 0
                        ? 'font-semibold text-rose-700 dark:text-rose-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }
                  >
                    {formatNumber(row.estimatedShortage)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right tabular-nums whitespace-nowrap">
                  <span
                    className={
                      row.suggestedReorderQty > 0
                        ? 'font-semibold text-slate-900 dark:text-white'
                        : 'text-slate-500 dark:text-slate-400'
                    }
                  >
                    {formatNumber(row.suggestedReorderQty)}
                  </span>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <StatusDisplay status={row.status} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
