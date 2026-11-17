import {
  AppSettings,
  CategoryBreakdown,
  DailySalesPoint,
  ForecastPeriodDays,
  ForecastSeriesPoint,
  MonthlySalesPoint,
  ProductItem,
  ReportDefinition,
  SaleTransaction,
} from '../types/retail';

export const DEFAULT_SETTINGS: AppSettings = {
  businessName: 'Meridian Retail Mart',
  currency: 'INR',
  dateFormat: 'DD/MM/YYYY',
  theme: 'light',
  defaultForecastPeriod: 14,
  forecastMethodLabel: 'Seasonal Moving Average (Sample Prototype)',
  safetyStockDays: 5,
  safetyStockBufferPct: 20,
};

export const SAMPLE_PRODUCTS: ProductItem[] = [
  {
    id: 'SKU-101',
    name: 'Wireless Bluetooth Earbuds Pro',
    category: 'Electronics & Accessories',
    unitPrice: 1299,
    availableStock: 42,
    unitsSold30d: 148,
    unitsSoldPrev30d: 126,
    revenue30d: 192252,
    dailyAvgDemand: 4.9,
    safetyStock: 25,
    salesRank: 1,
  },
  {
    id: 'SKU-102',
    name: 'USB-C Fast Charging Adapter 30W',
    category: 'Electronics & Accessories',
    unitPrice: 549,
    availableStock: 115,
    unitsSold30d: 210,
    unitsSoldPrev30d: 185,
    revenue30d: 115290,
    dailyAvgDemand: 7.0,
    safetyStock: 35,
    salesRank: 2,
  },
  {
    id: 'SKU-103',
    name: 'Classic Cotton Polo Shirt (Navy)',
    category: 'Apparel & Footwear',
    unitPrice: 799,
    availableStock: 190,
    unitsSold30d: 132,
    unitsSoldPrev30d: 118,
    revenue30d: 105468,
    dailyAvgDemand: 4.4,
    safetyStock: 22,
    salesRank: 3,
  },
  {
    id: 'SKU-104',
    name: 'Stainless Steel Insulated Bottle 1L',
    category: 'Home & Kitchen',
    unitPrice: 649,
    availableStock: 68,
    unitsSold30d: 156,
    unitsSoldPrev30d: 142,
    revenue30d: 101244,
    dailyAvgDemand: 5.2,
    safetyStock: 26,
    salesRank: 4,
  },
  {
    id: 'SKU-105',
    name: 'Herbal Vitamin C Face Serum 30ml',
    category: 'Personal Care',
    unitPrice: 499,
    availableStock: 145,
    unitsSold30d: 184,
    unitsSoldPrev30d: 162,
    revenue30d: 91816,
    dailyAvgDemand: 6.1,
    safetyStock: 30,
    salesRank: 5,
  },
  {
    id: 'SKU-106',
    name: 'Artisanal Roasted Arabica Coffee 250g',
    category: 'Groceries & Beverages',
    unitPrice: 380,
    availableStock: 55,
    unitsSold30d: 196,
    unitsSoldPrev30d: 174,
    revenue30d: 74480,
    dailyAvgDemand: 6.5,
    safetyStock: 32,
    salesRank: 6,
  },
  {
    id: 'SKU-107',
    name: 'Lightweight Running Sneakers',
    category: 'Apparel & Footwear',
    unitPrice: 1899,
    availableStock: 28,
    unitsSold30d: 38,
    unitsSoldPrev30d: 35,
    revenue30d: 72162,
    dailyAvgDemand: 1.3,
    safetyStock: 10,
    salesRank: 7,
  },
  {
    id: 'SKU-108',
    name: 'Non-Stick Ceramic Frying Pan 26cm',
    category: 'Home & Kitchen',
    unitPrice: 1149,
    availableStock: 48,
    unitsSold30d: 54,
    unitsSoldPrev30d: 49,
    revenue30d: 62046,
    dailyAvgDemand: 1.8,
    safetyStock: 12,
    salesRank: 8,
  },
  {
    id: 'SKU-109',
    name: 'Organic Green Tea Loose Leaf 150g',
    category: 'Groceries & Beverages',
    unitPrice: 295,
    availableStock: 240,
    unitsSold30d: 164,
    unitsSoldPrev30d: 158,
    revenue30d: 48380,
    dailyAvgDemand: 5.5,
    safetyStock: 28,
    salesRank: 9,
  },
  {
    id: 'SKU-110',
    name: 'Matte Sunscreen SPF 50+ 50g',
    category: 'Personal Care',
    unitPrice: 449,
    availableStock: 34,
    unitsSold30d: 96,
    unitsSoldPrev30d: 82,
    revenue30d: 43104,
    dailyAvgDemand: 3.2,
    safetyStock: 18,
    salesRank: 10,
  },
  {
    id: 'SKU-111',
    name: 'Ergonomic Laptop Stand Aluminum',
    category: 'Electronics & Accessories',
    unitPrice: 1499,
    availableStock: 16,
    unitsSold30d: 26,
    unitsSoldPrev30d: 21,
    revenue30d: 38974,
    dailyAvgDemand: 0.9,
    safetyStock: 8,
    salesRank: 11,
  },
  {
    id: 'SKU-112',
    name: 'Bamboo Cutting Board Set (2-Pack)',
    category: 'Home & Kitchen',
    unitPrice: 599,
    availableStock: 92,
    unitsSold30d: 46,
    unitsSoldPrev30d: 48,
    revenue30d: 27554,
    dailyAvgDemand: 1.5,
    safetyStock: 10,
    salesRank: 12,
  },
  {
    id: 'SKU-113',
    name: 'Cold-Pressed Almond Hair Oil 200ml',
    category: 'Personal Care',
    unitPrice: 349,
    availableStock: 85,
    unitsSold30d: 52,
    unitsSoldPrev30d: 58,
    revenue30d: 18148,
    dailyAvgDemand: 1.7,
    safetyStock: 12,
    salesRank: 13,
  },
  {
    id: 'SKU-114',
    name: 'Woven Canvas Tote Bag',
    category: 'Apparel & Footwear',
    unitPrice: 429,
    availableStock: 134,
    unitsSold30d: 24,
    unitsSoldPrev30d: 36,
    revenue30d: 10296,
    dailyAvgDemand: 0.8,
    safetyStock: 8,
    salesRank: 14,
  },
  {
    id: 'SKU-115',
    name: 'Himalayan Pink Salt Grinder 200g',
    category: 'Groceries & Beverages',
    unitPrice: 220,
    availableStock: 160,
    unitsSold30d: 31,
    unitsSoldPrev30d: 44,
    revenue30d: 6820,
    dailyAvgDemand: 1.0,
    safetyStock: 10,
    salesRank: 15,
  },
  {
    id: 'SKU-116',
    name: 'Silicone Baking Mat XL',
    category: 'Home & Kitchen',
    unitPrice: 480,
    availableStock: 74,
    unitsSold30d: 11,
    unitsSoldPrev30d: 19,
    revenue30d: 5280,
    dailyAvgDemand: 0.37,
    safetyStock: 6,
    salesRank: 16,
  },
  {
    id: 'SKU-117',
    name: 'Braided Micro-USB Legacy Cable 2m',
    category: 'Electronics & Accessories',
    unitPrice: 249,
    availableStock: 112,
    unitsSold30d: 14,
    unitsSoldPrev30d: 29,
    revenue30d: 3486,
    dailyAvgDemand: 0.47,
    safetyStock: 6,
    salesRank: 17,
  },
  {
    id: 'SKU-118',
    name: 'Formal Leather Belt (Tan, 34)',
    category: 'Apparel & Footwear',
    unitPrice: 699,
    availableStock: 49,
    unitsSold30d: 7,
    unitsSoldPrev30d: 15,
    revenue30d: 4893,
    dailyAvgDemand: 0.23,
    safetyStock: 5,
    salesRank: 18,
  },
];

export const CATEGORY_COLORS: Record<string, string> = {
  'Electronics & Accessories': '#0F172A',
  'Apparel & Footwear': '#0D9488',
  'Home & Kitchen': '#2563EB',
  'Personal Care': '#64748B',
  'Groceries & Beverages': '#0EA5E9',
};

export function getCategoryBreakdown(): CategoryBreakdown[] {
  const totalsByCategory = new Map<string, { revenue: number; units: number }>();
  let totalRev = 0;

  for (const product of SAMPLE_PRODUCTS) {
    const existing = totalsByCategory.get(product.category) || { revenue: 0, units: 0 };
    existing.revenue += product.revenue30d;
    existing.units += product.unitsSold30d;
    totalsByCategory.set(product.category, existing);
    totalRev += product.revenue30d;
  }

  return Array.from(totalsByCategory.entries())
    .map(([category, vals]) => ({
      category,
      revenue: vals.revenue,
      units: vals.units,
      percentage: Math.round((vals.revenue / totalRev) * 1000) / 10,
      color: CATEGORY_COLORS[category] || '#334155',
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

// Generate 90 days of deterministic daily sales ending 2026-11-17
export function generateDailySalesSeries(daysCount = 90): DailySalesPoint[] {
  const endDate = new Date('2026-11-17T00:00:00');
  const points: DailySalesPoint[] = [];

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(endDate.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat

    // Weekend retail lift + gentle upward seasonal trend + deterministic wave
    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.28 : dayOfWeek === 5 ? 1.12 : 0.94;
    const trendFactor = 0.92 + ((daysCount - 1 - i) / daysCount) * 0.16;
    const microWave = 1 + Math.sin(i * 0.72) * 0.08 + Math.cos(i * 0.35) * 0.05;

    const baseDailyRevenue = 34500; // ~10.3L/mo across full catalog; scaled nicely
    const revenue = Math.round(baseDailyRevenue * weekendMultiplier * trendFactor * microWave);
    const units = Math.round(revenue / 645);
    const transactions = Math.max(18, Math.round(units / 2.65));

    points.push({
      date: iso,
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue,
      units,
      transactions,
    });
  }

  return points;
}

export const ALL_DAILY_SALES: DailySalesPoint[] = generateDailySalesSeries(90);

export const MONTHLY_REVENUE_SERIES: MonthlySalesPoint[] = [
  { month: 'Jun 2026', revenue: 812400, units: 1290, transactions: 492 },
  { month: 'Jul 2026', revenue: 864900, units: 1365, transactions: 518 },
  { month: 'Aug 2026', revenue: 891200, units: 1410, transactions: 541 },
  { month: 'Sep 2026', revenue: 948600, units: 1495, transactions: 576 },
  { month: 'Oct 2026', revenue: 1042800, units: 1624, transactions: 625 },
  { month: 'Nov 2026', revenue: 1062700, units: 1648, transactions: 638 },
];

export const RECENT_TRANSACTIONS: SaleTransaction[] = [
  {
    invoiceId: 'INV-8492',
    date: '2026-11-17',
    productId: 'SKU-101',
    productName: 'Wireless Bluetooth Earbuds Pro',
    category: 'Electronics & Accessories',
    quantity: 3,
    unitPrice: 1299,
    amount: 3897,
  },
  {
    invoiceId: 'INV-8491',
    date: '2026-11-17',
    productId: 'SKU-105',
    productName: 'Herbal Vitamin C Face Serum 30ml',
    category: 'Personal Care',
    quantity: 4,
    unitPrice: 499,
    amount: 1996,
  },
  {
    invoiceId: 'INV-8490',
    date: '2026-11-16',
    productId: 'SKU-107',
    productName: 'Lightweight Running Sneakers',
    category: 'Apparel & Footwear',
    quantity: 2,
    unitPrice: 1899,
    amount: 3798,
  },
  {
    invoiceId: 'INV-8489',
    date: '2026-11-16',
    productId: 'SKU-102',
    productName: 'USB-C Fast Charging Adapter 30W',
    category: 'Electronics & Accessories',
    quantity: 6,
    unitPrice: 549,
    amount: 3294,
  },
  {
    invoiceId: 'INV-8488',
    date: '2026-11-16',
    productId: 'SKU-104',
    productName: 'Stainless Steel Insulated Bottle 1L',
    category: 'Home & Kitchen',
    quantity: 5,
    unitPrice: 649,
    amount: 3245,
  },
  {
    invoiceId: 'INV-8487',
    date: '2026-11-15',
    productId: 'SKU-103',
    productName: 'Classic Cotton Polo Shirt (Navy)',
    category: 'Apparel & Footwear',
    quantity: 3,
    unitPrice: 799,
    amount: 2397,
  },
  {
    invoiceId: 'INV-8486',
    date: '2026-11-15',
    productId: 'SKU-106',
    productName: 'Artisanal Roasted Arabica Coffee 250g',
    category: 'Groceries & Beverages',
    quantity: 5,
    unitPrice: 380,
    amount: 1900,
  },
  {
    invoiceId: 'INV-8485',
    date: '2026-11-14',
    productId: 'SKU-108',
    productName: 'Non-Stick Ceramic Frying Pan 26cm',
    category: 'Home & Kitchen',
    quantity: 2,
    unitPrice: 1149,
    amount: 2298,
  },
];

/**
 * Generates historical actuals (last 21 days) + future forecast (7, 14, or 30 days)
 * for either all products combined or a specific product SKU.
 */
export function buildForecastSeries(
  productId: string | 'ALL',
  forecastPeriod: ForecastPeriodDays
): ForecastSeriesPoint[] {
  const historyDays = 21;
  const baseDate = new Date('2026-11-17T00:00:00');
  const selectedProduct =
    productId === 'ALL' ? null : SAMPLE_PRODUCTS.find((p) => p.id === productId) || null;

  const avgDailyUnits = selectedProduct
    ? selectedProduct.dailyAvgDemand
    : SAMPLE_PRODUCTS.reduce((acc, p) => acc + p.dailyAvgDemand, 0);

  const avgUnitPrice = selectedProduct
    ? selectedProduct.unitPrice
    : Math.round(
        SAMPLE_PRODUCTS.reduce((acc, p) => acc + p.revenue30d, 0) /
          SAMPLE_PRODUCTS.reduce((acc, p) => acc + p.unitsSold30d, 0)
      );

  const points: ForecastSeriesPoint[] = [];

  // Historical period
  for (let i = historyDays - 1; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const dow = d.getDay();
    const weekendBump = dow === 0 || dow === 6 ? 1.22 : dow === 5 ? 1.1 : 0.94;
    const wave = 1 + Math.sin(i * 0.85) * 0.11;

    const units = Math.max(1, Math.round(avgDailyUnits * weekendBump * wave));
    const revenue = units * avgUnitPrice;

    // Overlap predicted on the final historical day so the chart line connects smoothly
    const isLastHistoryDay = i === 0;

    points.push({
      date: iso,
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      actualUnits: units,
      actualRevenue: revenue,
      predictedUnits: isLastHistoryDay ? units : null,
      predictedRevenue: isLastHistoryDay ? revenue : null,
      lowerUnits: isLastHistoryDay ? units : null,
      upperUnits: isLastHistoryDay ? units : null,
      isForecast: false,
    });
  }

  // Forecast period
  for (let j = 1; j <= forecastPeriod; j++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + j);
    const iso = d.toISOString().slice(0, 10);
    const dow = d.getDay();
    const weekendBump = dow === 0 || dow === 6 ? 1.24 : dow === 5 ? 1.11 : 0.95;
    const mildGrowth = 1 + (j / forecastPeriod) * 0.06;
    const wave = 1 + Math.cos(j * 0.7) * 0.06;

    const predictedUnits = Math.max(1, Math.round(avgDailyUnits * weekendBump * mildGrowth * wave));
    const spread = Math.max(1, Math.round(predictedUnits * (0.12 + (j / forecastPeriod) * 0.08)));

    points.push({
      date: iso,
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      actualUnits: null,
      actualRevenue: null,
      predictedUnits,
      predictedRevenue: predictedUnits * avgUnitPrice,
      lowerUnits: Math.max(0, predictedUnits - spread),
      upperUnits: predictedUnits + spread,
      isForecast: true,
    });
  }

  return points;
}

export const SAMPLE_REPORTS: ReportDefinition[] = [
  {
    id: 'sales-summary',
    title: 'Sales Summary Report',
    description:
      'Daily revenue, transaction volume, average order value, and category-level contribution across the selected retail window.',
    lastGenerated: '2026-11-17',
    recordCount: 90,
    format: 'CSV',
  },
  {
    id: 'product-performance',
    title: 'Product Performance Report',
    description:
      'Ranked breakdown of best-selling and slow-moving SKUs with unit volume, 30-day revenue, and period-over-period growth.',
    lastGenerated: '2026-11-17',
    recordCount: 18,
    format: 'CSV',
  },
  {
    id: 'demand-forecast',
    title: 'Demand Forecast Report',
    description:
      'Projected unit demand and estimated revenue curves for the upcoming forecast horizon with upper/lower estimate bounds (Sample Data).',
    lastGenerated: '2026-11-17',
    recordCount: 14,
    format: 'CSV',
  },
  {
    id: 'inventory-insights',
    title: 'Inventory Insights Report',
    description:
      'Stock-level comparison against forecasted demand, estimated shortage quantities, safety stock buffers, and suggested reorder orders.',
    lastGenerated: '2026-11-17',
    recordCount: 18,
    format: 'CSV',
  },
];

export const SAMPLE_CSV_DATASET_ROWS: (string | number)[][] = [
  ['2026-11-01', 'SKU-101', 'Wireless Bluetooth Earbuds Pro', 'Electronics & Accessories', 5, 1299, 6495],
  ['2026-11-01', 'SKU-102', 'USB-C Fast Charging Adapter 30W', 'Electronics & Accessories', 8, 549, 4392],
  ['2026-11-02', 'SKU-103', 'Classic Cotton Polo Shirt (Navy)', 'Apparel & Footwear', 4, 799, 3196],
  ['2026-11-02', 'SKU-104', 'Stainless Steel Insulated Bottle 1L', 'Home & Kitchen', 6, 649, 3894],
  ['2026-11-03', 'SKU-105', 'Herbal Vitamin C Face Serum 30ml', 'Personal Care', 7, 499, 3493],
  ['2026-11-03', 'SKU-106', 'Artisanal Roasted Arabica Coffee 250g', 'Groceries & Beverages', 9, 380, 3420],
  ['2026-11-04', 'SKU-107', 'Lightweight Running Sneakers', 'Apparel & Footwear', 2, 1899, 3798],
  ['2026-11-04', 'SKU-108', 'Non-Stick Ceramic Frying Pan 26cm', 'Home & Kitchen', 3, 1149, 3447],
  ['2026-11-05', 'SKU-109', 'Organic Green Tea Loose Leaf 150g', 'Groceries & Beverages', 6, 295, 1770],
  ['2026-11-05', 'SKU-110', 'Matte Sunscreen SPF 50+ 50g', 'Personal Care', 4, 449, 1796],
  ['2026-11-06', 'SKU-101', 'Wireless Bluetooth Earbuds Pro', 'Electronics & Accessories', 6, 1299, 7794],
  ['2026-11-06', 'SKU-111', 'Ergonomic Laptop Stand Aluminum', 'Electronics & Accessories', 2, 1499, 2998],
];

export const SAMPLE_CSV_HEADERS = [
  'date',
  'product_id',
  'product_name',
  'category',
  'quantity',
  'unit_price',
  'revenue',
];
