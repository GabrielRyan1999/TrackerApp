import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Settings as SettingsIcon, SlidersHorizontal, Sun, Moon } from 'lucide-react';
import { formatIDR } from '../utils/idr';

interface NavbarProps {
  currentMonth: string;
  onChangeMonth: (month: string) => void;
  onOpenAddModal: () => void;
  onOpenPlanModal: () => void;
  onOpenSettingsModal: () => void;
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
      {/* Top Ticker & Category Bar (Reference Image 1: Top Bar) */}
      <div className="border-b border-stone-800 dark:border-stone-500 pb-1.5 mb-2 text-[11px] font-bold tracking-wider uppercase text-stone-700 dark:text-stone-300 flex flex-wrap items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2">
          <span>POLITICAL</span>
          <span>|</span>
          <span className="text-stone-950 dark:text-stone-100 font-extrabold underline decoration-1">ECONOMY & BUDGET</span>
          <span>|</span>
          <span className="hidden sm:inline">LIVING ESSENTIALS</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden md:inline">SAVINGS & RESERVES</span>
          <span className="hidden md:inline">|</span>
          <span className="hidden lg:inline">DISPATCHES</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">WEATHER: FAVORABLE 78°F</span>
          <span className="hidden sm:inline">•</span>
          <span>PRICE: RP 0 (FREE DISPATCH)</span>
        </div>
      </div>

      {/* Main Masthead Container with Authentic Ears */}
      <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-3 py-1">
        {/* Left Ear */}
        <div className="hidden md:block md:col-span-3 text-xs text-stone-600 dark:text-stone-400 border-r border-stone-800 dark:border-stone-500 pr-3 leading-snug">
          <div className="font-headline font-bold text-stone-900 dark:text-stone-100 uppercase text-xs">
            The Financial Journal
          </div>
          <div>Published in Jakarta for Indonesian household accounting.</div>
          <div className="font-mono-num text-xs mt-1 text-stone-500 dark:text-stone-400">
            VOL. XXIV • NO. {new Date().getDate()}
          </div>
        </div>

        {/* Center: The Grand Masthead Blackletter Title */}
        <div className="md:col-span-6 text-center select-none">
          <h1 className="font-masthead text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-stone-950 dark:text-stone-50 leading-none">
            The Daily News
          </h1>
          <p className="font-headline italic text-xs sm:text-sm text-stone-700 dark:text-stone-300 mt-1">
            "All the Financial Truths & Balances Fit to Print"
          </p>
        </div>

        {/* Right Ear */}
        <div className="hidden md:block md:col-span-3 text-xs text-stone-600 dark:text-stone-400 border-l border-stone-800 dark:border-stone-500 pl-3 leading-snug text-right">
          <div className="font-headline font-bold text-stone-900 dark:text-stone-100 uppercase text-xs">
            50 / 30 / 20 Accounting
          </div>
          <div>Needs 50% • Wants 30% • Savings 20%</div>
          <div className="font-mono-num font-bold text-stone-900 dark:text-stone-100 mt-1">
            Base: {formatIDR(income)}
          </div>
        </div>
      </div>

      {/* Dateline Double Rule (Reference Image 1: Thick-and-Thin Rule) */}
      <div className="border-t-4 border-b border-stone-900 dark:border-stone-400 py-1.5 my-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-bold tracking-wider uppercase text-stone-900 dark:text-stone-100 select-none">
        <div>
          <span>YOUR TOWN, {todayFormatted}</span>
        </div>
        <div className="hidden sm:block text-center text-stone-600 dark:text-stone-400">
          <span>SPECIAL 50/30/20 BALANCED ACCOUNTING EDITION</span>
        </div>
        <div className="font-mono-num">
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
