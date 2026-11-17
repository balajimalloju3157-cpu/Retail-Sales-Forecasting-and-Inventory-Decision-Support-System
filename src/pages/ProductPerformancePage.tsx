import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Search } from 'lucide-react';
import { SAMPLE_PRODUCTS } from '../data/sampleRetailData';
import { CurrencyCode } from '../types/retail';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { ProductSortField, ProductTable } from '../components/ProductTable';

interface ProductPerformancePageProps {
  currency: CurrencyCode;
  initialSearch?: string;
}

export const ProductPerformancePage: React.FC<ProductPerformancePageProps> = ({
  currency,
  initialSearch = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortField, setSortField] = useState<ProductSortField>('revenue30d');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const categories = useMemo(() => {
    const unique = Array.from(new Set(SAMPLE_PRODUCTS.map((p) => p.category)));
    return ['ALL', ...unique];
  }, []);

  const handleSort = (field: ProductSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'name' || field === 'salesRank' ? 'asc' : 'desc');
    }
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return SAMPLE_PRODUCTS.filter((p) => {
      const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const sortProducts = (list: typeof SAMPLE_PRODUCTS) => {
    return [...list].sort((a, b) => {
      const getGrowth = (p: (typeof SAMPLE_PRODUCTS)[0]) =>
        p.unitsSoldPrev30d > 0 ? (p.unitsSold30d - p.unitsSoldPrev30d) / p.unitsSoldPrev30d : 0;

      let cmp = 0;
      if (sortField === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortField === 'salesRank') cmp = a.salesRank - b.salesRank;
      else if (sortField === 'unitsSold30d') cmp = a.unitsSold30d - b.unitsSold30d;
      else if (sortField === 'revenue30d') cmp = a.revenue30d - b.revenue30d;
      else if (sortField === 'growth') cmp = getGrowth(a) - getGrowth(b);

      return sortDirection === 'asc' ? cmp : -cmp;
    });
  };

  const bestSellingProducts = useMemo(() => {
    const top = filteredProducts.filter((p) => p.salesRank <= 10);
    return sortProducts(top);
  }, [filteredProducts, sortField, sortDirection]);

  const slowMovingProducts = useMemo(() => {
    const slow = filteredProducts.filter((p) => p.salesRank > 10);
    return sortProducts(slow);
  }, [filteredProducts, sortField, sortDirection]);

  const topChartProducts = useMemo(() => {
    return [...filteredProducts]
      .sort((a, b) => b.revenue30d - a.revenue30d)
      .slice(0, 8)
      .map((p) => ({
        shortName: p.id,
        fullName: p.name,
        revenue: p.revenue30d,
        units: p.unitsSold30d,
      }));
  }, [filteredProducts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Product Performance
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Identify high-velocity revenue drivers and slow-moving SKUs requiring promotional or
          stock adjustments · Sample demonstration data
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name or SKU ID..."
            aria-label="Search products by name or ID"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 pl-9 pr-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter by category"
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:border-teal-600 focus:outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          <select
            value={`${sortField}:${sortDirection}`}
            onChange={(e) => {
              const [field, dir] = e.target.value.split(':') as [
                ProductSortField,
                'asc' | 'desc',
              ];
              setSortField(field);
              setSortDirection(dir);
            }}
            aria-label="Sort products"
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:border-teal-600 focus:outline-none"
          >
            <option value="revenue30d:desc">Sort: Revenue (High to Low)</option>
            <option value="unitsSold30d:desc">Sort: Units Sold (High to Low)</option>
            <option value="salesRank:asc">Sort: Sales Rank (#1 first)</option>
            <option value="growth:desc">Sort: Growth (Highest first)</option>
            <option value="name:asc">Sort: Product Name (A–Z)</option>
          </select>
        </div>
      </div>

      {/* Top Performing Products Bar Chart */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6">
        <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
          Top-Performing Products by Revenue
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 mb-5">
          30-day revenue across highest-ranked SKUs matching current filter (sample data)
        </p>

        {topChartProducts.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            No products match your search criteria.
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topChartProducts} margin={{ top: 8, right: 12, left: 6, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="shortName"
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
                      shortName: string;
                      fullName: string;
                      revenue: number;
                      units: number;
                    };
                    return (
                      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 shadow-md text-xs tabular-nums">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {item.fullName}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 font-mono mb-1">
                          {item.shortName}
                        </p>
                        <p className="text-slate-700 dark:text-slate-200">
                          Revenue: {formatCurrency(item.revenue, currency)}
                        </p>
                        <p className="text-teal-700 dark:text-teal-400">
                          Units Sold: {formatNumber(item.units)}
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="revenue" fill="#0F172A" radius={[5, 5, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Best-Selling Products Section */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              Best-Selling Products
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Top 10 ranked products driving core store volume and revenue
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
            {bestSellingProducts.length} SKUs
          </span>
        </div>

        <ProductTable
          products={bestSellingProducts}
          currency={currency}
          showRank
          showRevenue
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          emptyMessage="No best-selling products match your current search or category filter."
        />
      </section>

      {/* Slow-Moving Products Section */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              Slow-Moving Products
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Lower-velocity SKUs with declining or flat 30-day demand
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
            {slowMovingProducts.length} SKUs
          </span>
        </div>

        <ProductTable
          products={slowMovingProducts}
          currency={currency}
          showRank={false}
          showRevenue={false}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          emptyMessage="No slow-moving products match your current search or category filter."
        />
      </section>
    </div>
  );
};
