import React from 'react';
import {
  BarChart3,
  Boxes,
  FileSpreadsheet,
  LayoutDashboard,
  PackageCheck,
  Settings,
  TrendingUp,
  UploadCloud,
  X,
} from 'lucide-react';
import { PageId } from '../types/retail';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  businessName: string;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'upload', label: 'Upload Data', icon: UploadCloud },
  { id: 'sales-analysis', label: 'Sales Analysis', icon: BarChart3 },
  { id: 'product-performance', label: 'Product Performance', icon: PackageCheck },
  { id: 'sales-forecast', label: 'Sales Forecast', icon: TrendingUp },
  { id: 'inventory-insights', label: 'Inventory Insights', icon: Boxes },
  { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  mobileOpen,
  onCloseMobile,
  businessName,
}) => {
  const handleNavClick = (page: PageId) => {
    onNavigate(page);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      <div>
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => handleNavClick('overview')}
            className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-lg"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-teal-600">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="text-teal-400 dark:text-white"
              >
                <rect x="3" y="13" width="4" height="8" rx="1" fill="currentColor" />
                <rect x="10" y="8" width="4" height="13" rx="1" fill="currentColor" opacity="0.85" />
                <rect x="17" y="3" width="4" height="18" rx="1" fill="white" />
              </svg>
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              RetailIQ
            </span>
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="lg:hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav aria-label="Main navigation" className="px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-teal-600 dark:text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white'
                }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 shrink-0 ${
                    isActive
                      ? 'text-teal-400 dark:text-white'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Workspace Context */}
      <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800">
        <p className="text-xs font-medium text-slate-900 dark:text-slate-200 truncate">
          {businessName}
        </p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Sample demonstration data
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-64">
        {navContent}
      </aside>

      {/* Mobile & Tablet Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw]">{navContent}</aside>
        </div>
      )}
    </>
  );
};
