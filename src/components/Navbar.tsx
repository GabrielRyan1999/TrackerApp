import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Settings as SettingsIcon, SlidersHorizontal, Sun, Moon, Newspaper } from 'lucide-react';
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
  themeMode: 'modern' | 'newspaper';
  onToggleThemeMode: () => void;
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
  themeMode,
  onToggleThemeMode,
}) => {
  const [yearStr, monthStr] = currentMonth.split('-');
  const dateObj = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1);
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

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

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0c121e]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 px-3 sm:px-4 py-2.5 sm:py-3 transition">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-900 dark:bg-emerald-500 flex items-center justify-center text-white dark:text-slate-950 font-black text-sm sm:text-base shadow-sm shrink-0">
            Rp
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Budget Tracker
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                50/30/20
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden xs:block">
              Rupiah Monthly Spending
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Month Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-0.5">
            <button
              onClick={handlePrevMonth}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition"
              title="Previous month"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 sm:px-3 capitalize text-slate-900 dark:text-slate-100 font-bold text-xs select-none">
              {monthName}
            </span>
            <button
              onClick={handleNextMonth}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition"
              title="Next month"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Plan Button */}
          <button
            onClick={onOpenPlanModal}
            className="h-8 sm:h-9 px-2.5 sm:px-3.5 flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
            title="Configure Budget Plan"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span className="hidden md:inline">Income: {formatIDR(income)}</span>
            <span className="md:hidden">Plan</span>
          </button>

          {/* Quick Add Button (Desktop: visible in header. Mobile: via floating action button) */}
          <button
            onClick={onOpenAddModal}
            className="hidden sm:flex h-9 px-3.5 sm:px-4 items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition"
            title="Add Transaction (Shortcut: Press N)"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs font-mono font-bold bg-emerald-800/90 text-emerald-100 rounded border border-emerald-600/60 ml-0.5 select-none">
              N
            </kbd>
          </button>

          {/* Theme Style Toggle (Newspaper vs Modern) */}
          <button
            onClick={onToggleThemeMode}
            className={`h-8 sm:h-9 px-2.5 sm:px-3 flex items-center gap-1.5 rounded-xl border text-xs font-bold transition ${
              themeMode === 'newspaper'
                ? 'bg-amber-100/90 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-800 shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80'
            }`}
            title={`Switch to ${themeMode === 'newspaper' ? 'Modern' : 'Newspaper'} theme`}
            aria-label="Toggle Theme Mode"
          >
            <Newspaper className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
            <span className="hidden sm:inline">
              {themeMode === 'newspaper' ? 'Newspaper' : 'Modern'}
            </span>
          </button>

          {/* Theme Light/Dark toggle */}
          <button
            onClick={onToggleTheme}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettingsModal}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Settings"
            aria-label="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
