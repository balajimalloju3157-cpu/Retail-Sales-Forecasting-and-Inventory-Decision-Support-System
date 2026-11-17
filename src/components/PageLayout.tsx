import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import {
  CurrencyCode,
  InventoryDecisionRow,
  PageId,
  ProductItem,
  SaleTransaction,
  ToastNotification,
} from '../types/retail';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface PageLayoutProps {
  activePage: PageId;
  pageTitle: string;
  onNavigate: (page: PageId) => void;
  businessName: string;
  globalSearch: string;
  onGlobalSearchChange: (val: string) => void;
  products: ProductItem[];
  transactions: SaleTransaction[];
  inventoryAlerts: InventoryDecisionRow[];
  currency: CurrencyCode;
  toasts: ToastNotification[];
  onDismissToast: (id: string) => void;
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  activePage,
  pageTitle,
  onNavigate,
  businessName,
  globalSearch,
  onGlobalSearchChange,
  products,
  transactions,
  inventoryAlerts,
  currency,
  toasts,
  onDismissToast,
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        businessName={businessName}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Topbar
          pageTitle={pageTitle}
          onOpenMobileMenu={() => setMobileOpen(true)}
          globalSearch={globalSearch}
          onGlobalSearchChange={onGlobalSearchChange}
          products={products}
          transactions={transactions}
          inventoryAlerts={inventoryAlerts}
          currency={currency}
          onNavigate={onNavigate}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Toast Notification Stack */}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-88 max-w-[calc(100vw-2rem)]"
        >
          {toasts.map((toast) => {
            const Icon =
              toast.type === 'success'
                ? CheckCircle2
                : toast.type === 'error'
                ? AlertCircle
                : toast.type === 'warning'
                ? AlertTriangle
                : Info;

            const iconColor =
              toast.type === 'success'
                ? 'text-emerald-600 dark:text-emerald-400'
                : toast.type === 'error'
                ? 'text-rose-600 dark:text-rose-400'
                : toast.type === 'warning'
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-teal-600 dark:text-teal-400';

            return (
              <div
                key={toast.id}
                className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-lg"
              >
                <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${iconColor}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {toast.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                    {toast.message}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDismissToast(toast.id)}
                  aria-label="Dismiss notification"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
