import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Settings as SettingsIcon, SlidersHorizontal, Sun, Moon, User as UserIcon, Cloud, CloudOff } from 'lucide-react';
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
          title="Account details"
        >
          {user ? (
            <>
              <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{user.email?.split('@')[0]}</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">[SYNCED]</span>
            </>
          ) : (
            <>
              <CloudOff className="w-3.5 h-3.5 text-stone-500" />
              <span>[SIGN IN]</span>
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
      <div className="border-t-2 border-b border-stone-900 dark:border-stone-400 py-1.5 my-2 flex flex-wrap items-center justify-between gap-2 text-xs font-bold tracking-wider uppercase text-stone-900 dark:text-stone-100 select-none">
        <div>
          <span>{todayFormatted}</span>
        </div>
        <div className="font-mono-num">
          <span>BASE INCOME: {formatIDR(income)}</span>
        </div>
        <div>
          <span>ISSUE: {currentMonth}</span>
        </div>
      </div>

      {/* Editorial Action Bar (Print Navigation Controls) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        {/* Left: Issue / Month selector */}
        <div className="flex items-center h-8 border border-stone-900 dark:border-stone-400 bg-stone-100 dark:bg-stone-900">
          <button
            onClick={handlePrevMonth}
            className="w-8 h-full flex items-center justify-center hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 transition border-r border-stone-900 dark:border-stone-400"
            title="Previous Issue"
            aria-label="Previous Issue"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 font-headline font-bold text-xs uppercase tracking-wider text-stone-900 dark:text-stone-100">
            {monthName}
          </span>
          <button
            onClick={handleNextMonth}
            className="w-8 h-full flex items-center justify-center hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 transition border-l border-stone-900 dark:border-stone-400"
            title="Next Issue"
            aria-label="Next Issue"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Plan Modal Button */}
          <button
            onClick={onOpenPlanModal}
            className="h-8 px-2.5 sm:px-3 flex items-center gap-1.5 border border-stone-900 dark:border-stone-400 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold uppercase tracking-wider text-xs transition"
            title="Configure Allocation Ratios"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Allocation: {formatIDR(income)}</span>
            <span className="sm:hidden">Plan</span>
          </button>

          {/* Add Transaction Button */}
          <button
            onClick={onOpenAddModal}
            className="h-8 px-3 sm:px-4 flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-200 dark:hover:bg-white dark:text-stone-950 font-bold uppercase tracking-wider text-xs border border-stone-900 dark:border-stone-300 transition"
            title="Record New Entry"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ Dispatch Entry</span>
          </button>

          {/* Citizen Account / Cloud Storage Button */}
          <button
            onClick={onOpenAuthModal}
            className={`h-8 px-2.5 sm:px-3 flex items-center gap-1.5 border border-stone-900 dark:border-stone-400 font-bold uppercase tracking-wider text-xs transition ${
              user
                ? 'bg-stone-200/90 dark:bg-stone-800 text-stone-950 dark:text-stone-50'
                : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100'
            }`}
            title={user ? `Signed in as ${user.email}` : 'Sign In or Create Citizen Account'}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">
              {user ? user.email?.split('@')[0] : 'Account'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                user && isCloudSynced
                  ? 'bg-emerald-600'
                  : user
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-stone-400'
              }`}
              title={user ? (isCloudSynced ? 'Cloud Synced' : 'Syncing...') : 'Local Memory Mode'}
            />
          </button>

          {/* Theme Daylight / Midnight Paper Toggle */}
          <button
            onClick={onToggleTheme}
            className="w-8 h-8 flex items-center justify-center border border-stone-900 dark:border-stone-400 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 transition"
            title={isDark ? 'Switch to Daylight Newsprint' : 'Switch to Midnight Broadsheet'}
            aria-label="Toggle Print Mode"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings / Archive */}
          <button
            onClick={onOpenSettingsModal}
            className="w-8 h-8 flex items-center justify-center border border-stone-900 dark:border-stone-400 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 transition"
            title="Archive & Preferences"
            aria-label="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
