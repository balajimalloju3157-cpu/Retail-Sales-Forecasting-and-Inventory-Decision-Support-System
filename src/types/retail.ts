export type PageId =
  | 'overview'
  | 'upload'
  | 'sales-analysis'
  | 'product-performance'
  | 'sales-forecast'
  | 'inventory-insights'
  | 'reports'
  | 'settings';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

export type ThemePreference = 'light' | 'dark' | 'system';

export type DateRangeOption = '7d' | '30d' | '90d';

export type ForecastPeriodDays = 7 | 14 | 30;

export type StockStatus = 'Healthy Stock' | 'Low Stock' | 'Reorder Required';

export interface AppSettings {
  businessName: string;
  currency: CurrencyCode;
  dateFormat: DateFormat;
  theme: ThemePreference;
  defaultForecastPeriod: ForecastPeriodDays;
  forecastMethodLabel: string;
  safetyStockDays: number;
  safetyStockBufferPct: number;
}

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  unitPrice: number; // stored in INR base
  availableStock: number;
  unitsSold30d: number;
  unitsSoldPrev30d: number;
  revenue30d: number; // stored in INR base
  dailyAvgDemand: number;
  safetyStock: number;
  salesRank: number;
}

export interface SaleTransaction {
  invoiceId: string;
  date: string; // YYYY-MM-DD
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number; // INR base
  amount: number; // INR base
}

export interface DailySalesPoint {
  date: string; // YYYY-MM-DD
  label: string;
  revenue: number; // INR base
  units: number;
  transactions: number;
}

export interface MonthlySalesPoint {
  month: string;
  revenue: number;
  units: number;
  transactions: number;
}

export interface CategoryBreakdown {
  category: string;
  revenue: number;
  units: number;
  percentage: number;
  color: string;
}

export interface ForecastSeriesPoint {
  date: string;
  label: string;
  actualUnits: number | null;
  actualRevenue: number | null;
  predictedUnits: number | null;
  predictedRevenue: number | null;
  lowerUnits: number | null;
  upperUnits: number | null;
  isForecast: boolean;
}

export interface InventoryDecisionRow {
  productId: string;
  productName: string;
  category: string;
  availableStock: number;
  forecastDemand: number;
  safetyStock: number;
  estimatedShortage: number;
  suggestedReorderQty: number;
  status: StockStatus;
}

export interface UploadedDatasetPreview {
  fileName: string;
  fileSizeBytes: number;
  fileType: 'CSV' | 'Excel';
  rowsCount: number;
  columnsCount: number;
  columns: string[];
  missingValuesByColumn: Record<string, number>;
  totalMissingValues: number;
  previewRows: Record<string, string | number>[];
  validationStatus: 'valid' | 'invalid' | 'processing' | 'validated-local';
  validationErrors: string[];
  detectedMapping: {
    dateColumn?: string;
    productColumn?: string;
    quantityColumn?: string;
    revenueColumn?: string;
  };
  uploadedAt: string;
}

export interface ReportDefinition {
  id: string;
  title: string;
  description: string;
  lastGenerated: string;
  recordCount: number;
  format: 'CSV' | 'Excel (.xlsx)';
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}
