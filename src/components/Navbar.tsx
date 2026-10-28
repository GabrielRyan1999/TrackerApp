import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Settings as SettingsIcon, SlidersHorizontal, Sun, Moon } from 'lucide-react';
import { formatIDR } from '../utils/idr';
import type { User } from '@supabase/supabase-js';

interface NavbarProps {
  currentMonth: string;
  onChangeMonth: (month: string) => void;
  onOpenAddModal: () => void;
  onOpenPlanModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenAuthModal: () => void;
  user: User | null;
  isCloudSynced: boolean;
  income: number;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMonth,
  onChangeMonth,
  onOpenAddModal,
  onOpenPlanModal,
  onOpenSettingsModal,
  onOpenAuthModal,
  user,
  isCloudSynced,
  income,
  isDark,
  onToggleTheme,
}) => {
  const [yearStr, monthStr] = currentMonth.split('-');
  const dateObj = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1);
  const monthName = dateObj.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    const prevDate = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 2, 1);
    const newYear = prevDate.getFullYear();
    const newMonth = String(prevDate.getMonth() + 1).padStart(2, '0');
    onChangeMonth(`${newYear}-${newMonth}`);
  };

  const handleNextMonth = () => {
    const nextDate = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10), 1);
    const newYear = nextDate.getFullYear();
    const newMonth = String(nextDate.getMonth() + 1).padStart(2, '0');
    onChangeMonth(`${newYear}-${newMonth}`);
  };

  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="border-b-2 border-stone-900 dark:border-stone-400 pb-3 pt-2">
      {/* Top Ticker: User Status */}
      <div className="border-b border-stone-300 dark:border-stone-700 pb-1.5 mb-2 text-xs font-bold tracking-wider uppercase text-stone-700 dark:text-stone-300 flex items-center justify-between select-none font-mono-num">
        <span>50/30/20 BUDGET TRACKER</span>
        <button
          onClick={onOpenAuthModal}
          className="hover:underline flex items-center gap-1.5 text-stone-900 dark:text-stone-100 transition"
          title={user ? `Signed in as ${user.email} (${isCloudSynced ? 'Synced' : 'Syncing...'})` : 'Sign In'}
        >
          {user ? (
            <>
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isCloudSynced ? 'bg-emerald-600' : 'bg-amber-500 animate-pulse'
                }`}
              />
              <span>{user.email?.split('@')[0]}</span>
              <span
                className={`font-bold ${
                  isCloudSynced
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {isCloudSynced ? '[SYNCED]' : '[SYNCING...]'}
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full shrink-0 bg-red-600" />
              <span className="text-red-700 dark:text-red-400 font-bold">[SIGN IN]</span>
            </>
          )}
        </button>
      </div>

      {/* Main Masthead Title */}
      <div className="text-center py-2 select-none">
        <h1 className="font-masthead text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-stone-950 dark:text-stone-50 leading-none">
          The Daily News
        </h1>
        <p className="font-headline italic text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
          "All the Financial Truths & Balances Fit to Print"
        </p>
      </div>

      {/* Dateline Double Rule */}
      <div className="border-t-2 border-b border-stone-900 dark:border-stone-400 py-1.5 my-2 flex items-center justify-between gap-2 text-xs font-bold tracking-wider uppercase text-stone-900 dark:text-stone-100 select-none">
        <span className="truncate">{todayFormatted}</span>
        <span className="font-mono-num shrink-0 text-right">BASE INCOME: {formatIDR(income)}</span>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1 text-xs">
        {/* Row 1 on mobile: Month Selector on Left, Utilities on Right */}
        <div className="flex items-center justify-between sm:justify-start gap-2">
          {/* Month selector */}
          <div className="flex items-center h-8 border border-stone-900 dark:border-stone-400 bg-stone-100 dark:bg-stone-900">
            <button
              onClick={handlePrevMonth}
              className="w-8 h-full flex items-center justify-center hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 transition border-r border-stone-900 dark:border-stone-400"
              title="Previous Month"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-headline font-bold text-xs uppercase tracking-wider text-stone-900 dark:text-stone-100 min-w-[105px] text-center">
              {monthName}
            </span>
            <button
              onClick={handleNextMonth}
              className="w-8 h-full flex items-center justify-center hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 transition border-l border-stone-900 dark:border-stone-400"
              title="Next Month"
              aria-label="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Utility Icons */}
          <div className="flex sm:hidden items-center gap-1.5">
            <button
              onClick={onToggleTheme}
              className="w-8 h-8 flex items-center justify-center border border-stone-900 dark:border-stone-400 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 transition"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenSettingsModal}
              className="w-8 h-8 flex items-center justify-center border border-stone-900 dark:border-stone-400 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 transition"
              title="Settings"
              aria-label="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 2 on mobile / Right cluster on desktop */}
        <div className="flex items-center gap-2">
          {/* Plan Modal Button */}
          <button
            onClick={onOpenPlanModal}
            className="h-8 px-3 flex items-center justify-center gap-1.5 border border-stone-900 dark:border-stone-400 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold uppercase tracking-wider text-xs transition shrink-0"
            title="Configure Budget Allocation"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Allocation: {formatIDR(income)}</span>
            <span className="sm:hidden">Plan</span>
          </button>

          {/* Add Transaction Button */}
          <button
            onClick={onOpenAddModal}
            className="h-8 px-3 sm:px-4 flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-950 font-bold uppercase tracking-wider text-xs border border-stone-900 dark:border-stone-300 transition"
            title="Add Transaction"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Transaction</span>
          </button>

          {/* Desktop Utility Icons */}
          <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onToggleTheme}
              className="w-8 h-8 flex items-center justify-center border border-stone-900 dark:border-stone-400 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 transition"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenSettingsModal}
              className="w-8 h-8 flex items-center justify-center border border-stone-900 dark:border-stone-400 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 transition"
              title="Settings"
              aria-label="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
