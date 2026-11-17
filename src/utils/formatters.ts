import { CurrencyCode, DateFormat, StockStatus } from '../types/retail';

const CURRENCY_CONFIG: Record<
  CurrencyCode,
  { symbol: string; locale: string; rateFromInr: number }
> = {
  INR: { symbol: '₹', locale: 'en-IN', rateFromInr: 1 },
  USD: { symbol: '$', locale: 'en-US', rateFromInr: 0.012 },
  EUR: { symbol: '€', locale: 'de-DE', rateFromInr: 0.011 },
  GBP: { symbol: '£', locale: 'en-GB', rateFromInr: 0.0094 },
};

export function formatCurrency(
  amountInInr: number,
  currency: CurrencyCode = 'INR',
  compact = false
): string {
  const cfg = CURRENCY_CONFIG[currency];
  const converted = amountInInr * cfg.rateFromInr;

  if (compact && Math.abs(converted) >= 100000 && currency === 'INR') {
    return `${cfg.symbol}${(converted / 100000).toFixed(2)}L`;
  }
  if (compact && Math.abs(converted) >= 1000) {
    return `${cfg.symbol}${(converted / 1000).toFixed(1)}k`;
  }

  return new Intl.NumberFormat(cfg.locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Math.round(converted));
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(Math.round(value));
}

export function formatDate(isoDate: string, format: DateFormat = 'DD/MM/YYYY'): string {
  if (!isoDate) return '—';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const [year, month, day] = parts;

  switch (format) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY':
    default:
      return `${day}/${month}/${year}`;
  }
}

export function formatShortDate(isoDate: string): string {
  const dateObj = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(dateObj.getTime())) return isoDate;
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Core Inventory Decision Support Calculations
 * Estimated Shortage = max(0, Forecast Demand - Available Stock)
 * Suggested Reorder Quantity = max(0, Forecast Demand + Safety Stock - Available Stock)
 */
export function calculateEstimatedShortage(
  forecastDemand: number,
  availableStock: number
): number {
  return Math.max(0, Math.round(forecastDemand - availableStock));
}

export function calculateSuggestedReorderQuantity(
  forecastDemand: number,
  safetyStock: number,
  availableStock: number
): number {
  return Math.max(0, Math.round(forecastDemand + safetyStock - availableStock));
}

export function determineStockStatus(
  availableStock: number,
  forecastDemand: number,
  safetyStock: number
): StockStatus {
  if (availableStock < forecastDemand) {
    return 'Reorder Required';
  }
  if (availableStock < forecastDemand + safetyStock) {
    return 'Low Stock';
  }
  return 'Healthy Stock';
}

export function downloadCsvFile(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
): void {
  const escapeCell = (val: string | number): string => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvLines = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ];
  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
