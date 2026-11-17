import React from 'react';
import { ArrowDownRight, ArrowUpRight, ArrowUpDown, Minus } from 'lucide-react';
import { CurrencyCode, ProductItem } from '../types/retail';
import { formatCurrency, formatNumber } from '../utils/formatters';

export type ProductSortField = 'name' | 'unitsSold30d' | 'revenue30d' | 'salesRank' | 'growth';

interface ProductTableProps {
  products: ProductItem[];
  currency: CurrencyCode;
  showRank?: boolean;
  showRevenue?: boolean;
  sortField?: ProductSortField;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: ProductSortField) => void;
  emptyMessage?: string;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  currency,
  showRank = false,
  showRevenue = true,
  sortField,
  sortDirection = 'desc',
  onSort,
  emptyMessage = 'No products match the current filters.',
}) => {
  const getGrowthPct = (p: ProductItem) => {
    if (p.unitsSoldPrev30d === 0) return 0;
    return Math.round(((p.unitsSold30d - p.unitsSoldPrev30d) / p.unitsSoldPrev30d) * 1000) / 10;
  };

  const renderSortButton = (field: ProductSortField, label: string, alignRight = false) => {
    if (!onSort) {
      return <span>{label}</span>;
    }
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
            {showRank && (
              <th className="py-3 px-4 font-medium whitespace-nowrap">
                {renderSortButton('salesRank', 'Rank')}
              </th>
            )}
            <th className="py-3 px-4 font-medium whitespace-nowrap">
              {renderSortButton('name', 'Product Name')}
            </th>
            <th className="py-3 px-4 font-medium whitespace-nowrap">Product ID</th>
            <th className="py-3 px-4 font-medium text-right whitespace-nowrap">
              {renderSortButton('unitsSold30d', 'Units Sold', true)}
            </th>
            {showRevenue && (
              <th className="py-3 px-4 font-medium text-right whitespace-nowrap">
                {renderSortButton('revenue30d', 'Revenue', true)}
              </th>
            )}
            <th className="py-3 px-4 font-medium text-right whitespace-nowrap">
              {renderSortButton('growth', 'Performance', true)}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
          {products.length === 0 ? (
            <tr>
              <td
                colSpan={4 + (showRank ? 1 : 0) + (showRevenue ? 1 : 0)}
                className="py-8 px-4 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            products.map((product) => {
              const growth = getGrowthPct(product);
              const isPositive = growth > 0;
              const isNegative = growth < 0;

              return (
                <tr
                  key={product.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {showRank && (
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
                      #{product.salesRank}
                    </td>
                  )}
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-900 dark:text-white">{product.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{product.category}</p>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {product.id}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-900 dark:text-white tabular-nums whitespace-nowrap">
                    {formatNumber(product.unitsSold30d)}
                  </td>
                  {showRevenue && (
                    <td className="py-3 px-4 text-right font-medium text-slate-900 dark:text-white tabular-nums whitespace-nowrap">
                      {formatCurrency(product.revenue30d, currency)}
                    </td>
                  )}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <span
                      className={`inline-flex items-center justify-end gap-1 text-xs font-medium tabular-nums ${
                        isPositive
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : isNegative
                          ? 'text-rose-700 dark:text-rose-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {isPositive && <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />}
                      {isNegative && <ArrowDownRight className="h-3.5 w-3.5 shrink-0" />}
                      {!isPositive && !isNegative && <Minus className="h-3.5 w-3.5 shrink-0" />}
                      <span>
                        {isPositive ? `+${growth}%` : `${growth}%`}
                      </span>
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
