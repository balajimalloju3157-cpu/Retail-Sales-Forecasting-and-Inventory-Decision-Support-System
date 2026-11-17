import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bell,
  Menu,
  Search,
  User,
  X,
} from 'lucide-react';
import { CurrencyCode, InventoryDecisionRow, PageId, ProductItem, SaleTransaction } from '../types/retail';
import { formatCurrency } from '../utils/formatters';

interface TopbarProps {
  pageTitle: string;
  onOpenMobileMenu: () => void;
  globalSearch: string;
  onGlobalSearchChange: (value: string) => void;
  products: ProductItem[];
  transactions: SaleTransaction[];
  inventoryAlerts: InventoryDecisionRow[];
  currency: CurrencyCode;
  onNavigate: (page: PageId) => void;
}

const AVATAR_URL = '/src/assets/images/avatar_retail_manager_1794910454315.jpg';

export const Topbar: React.FC<TopbarProps> = ({
  pageTitle,
  onOpenMobileMenu,
  globalSearch,
  onGlobalSearchChange,
  products,
  transactions,
  inventoryAlerts,
  currency,
  onNavigate,
}) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return { products: [], invoices: [] };

    const matchedProducts = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
      .slice(0, 4);

    const matchedInvoices = transactions
      .filter(
        (t) =>
          t.invoiceId.toLowerCase().includes(q) ||
          t.productName.toLowerCase().includes(q) ||
          t.productId.toLowerCase().includes(q)
      )
      .slice(0, 3);

    return { products: matchedProducts, invoices: matchedInvoices };
  }, [globalSearch, products, transactions]);

  const hasResults =
    searchResults.products.length > 0 || searchResults.invoices.length > 0;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8">
      {/* Left: Mobile Menu Toggle + Page Title + Welcome message */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <h1 className="font-display text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
            {pageTitle}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 truncate">
            Welcome back!
          </p>
        </div>
      </div>

      {/* Right: Search + Notifications + User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Global Search Field */}
        <div ref={searchRef} className="relative hidden md:block w-64 lg:w-80">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => onGlobalSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            placeholder="Search SKUs, products, invoices..."
            aria-label="Search products, SKUs, or invoices"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-1.5 pl-9 pr-8 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-teal-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
          />
          {globalSearch && (
            <button
              type="button"
              onClick={() => onGlobalSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Search Quick Results Popover */}
          {searchFocused && globalSearch.trim().length > 0 && (
            <div className="absolute right-0 mt-2 w-96 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-2 z-40">
              {!hasResults ? (
                <p className="px-3 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  No matching products or invoices for &ldquo;{globalSearch}&rdquo;.
                </p>
              ) : (
                <div className="space-y-2">
                  {searchResults.products.length > 0 && (
                    <div>
                      <p className="px-2.5 py-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                        Products
                      </p>
                      {searchResults.products.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSearchFocused(false);
                            onNavigate('product-performance');
                          }}
                          className="w-full flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                              {p.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                              {p.id} · {p.category}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 tabular-nums shrink-0">
                            {formatCurrency(p.revenue30d, currency)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.invoices.length > 0 && (
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
                      <p className="px-2.5 py-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                        Recent Invoices
                      </p>
                      {searchResults.invoices.map((inv) => (
                        <button
                          key={inv.invoiceId}
                          type="button"
                          onClick={() => {
                            setSearchFocused(false);
                            onNavigate('sales-analysis');
                          }}
                          className="w-full flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white font-mono">
                              {inv.invoiceId}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {inv.productName}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 tabular-nums shrink-0">
                            {formatCurrency(inv.amount, currency)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen((prev) => !prev);
              setProfileOpen(false);
            }}
            aria-label={`Inventory notifications (${inventoryAlerts.length} alerts)`}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <Bell className="h-4.5 w-4.5" />
            {inventoryAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-md bg-rose-600 px-1 text-[11px] font-semibold text-white tabular-nums">
                {inventoryAlerts.length}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg z-40">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Inventory Alerts
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  {inventoryAlerts.length} items need attention
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {inventoryAlerts.length === 0 ? (
                  <p className="px-4 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                    All stocked products are within healthy thresholds.
                  </p>
                ) : (
                  inventoryAlerts.slice(0, 6).map((item) => (
                    <button
                      key={item.productId}
                      type="button"
                      onClick={() => {
                        setNotificationsOpen(false);
                        onNavigate('inventory-insights');
                      }}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      {item.status === 'Reorder Required' ? (
                        <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                          {item.productName}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                          {item.status} · Stock: {item.availableStock} · Forecast:{' '}
                          {item.forecastDemand}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="border-t border-slate-200 dark:border-slate-800 p-2">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(false);
                    onNavigate('inventory-insights');
                  }}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium text-teal-700 dark:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span>Open Inventory Insights</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen((prev) => !prev);
              setNotificationsOpen(false);
            }}
            aria-label="User profile menu"
            className="flex items-center gap-2.5 rounded-lg p-1 pr-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            {!avatarError ? (
              <img
                src={AVATAR_URL}
                alt="Store operations manager avatar"
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
                className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white dark:bg-teal-600">
                <User className="h-4 w-4" />
              </span>
            )}
            <span className="hidden sm:block text-left">
              <span className="block text-xs font-medium text-slate-900 dark:text-white leading-tight">
                Store Manager
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Operations
              </span>
            </span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg py-1.5 z-40">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  onNavigate('reports');
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Export Reports
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  onNavigate('settings');
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Workspace Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
