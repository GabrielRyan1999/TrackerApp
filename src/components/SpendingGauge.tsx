import React from 'react';
import type { BudgetSummary, Category } from '../types/budget';
import { formatIDR } from '../utils/idr';

interface SpendingGaugeProps {
  summary: BudgetSummary;
  categories: Category[];
}

export const SpendingGauge: React.FC<SpendingGaugeProps> = ({ summary, categories }) => {
  const totalSpendingBudget = summary.needsBudget + summary.wantsBudget;
  const totalSpent = summary.totalSpent;
  const ratio = totalSpendingBudget > 0 ? totalSpent / totalSpendingBudget : 0;
  const percentNumber = Math.round(ratio * 100);
  const remainingSpending = totalSpendingBudget - totalSpent;

  const radius = 80;
  const strokeWidth = 14;
  const arcLength = Math.PI * radius;

  const catMap = new Map<string, Category>(categories.map((c) => [c.id, c]));
  const expenseCategories = Object.entries(summary.categorySpent)
    .filter(([catId, amount]) => {
      if (amount <= 0) return false;
      const cat = catMap.get(catId);
      return !cat || cat.bucket !== 'savings';
    })
    .sort((a, b) => b[1] - a[1]);

  let accumulatedRatio = 0;

  let statusBadge = {
    label: `On Track (${percentNumber}%)`,
    className: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
    glowColor: 'bg-emerald-500/10 dark:bg-emerald-500/15',
  };
  if (ratio > 1) {
    statusBadge = {
      label: `Overbudget (+${percentNumber - 100}%)`,
      className: 'bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800',
      glowColor: 'bg-rose-500/10 dark:bg-rose-500/15',
    };
  } else if (ratio >= 0.8) {
    statusBadge = {
      label: `Warning (${percentNumber}%)`,
      className: 'bg-amber-50 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800',
      glowColor: 'bg-amber-500/10 dark:bg-amber-500/15',
    };
  }

  return (
    <div className="relative bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 sm:p-6 transition shadow-xs hover:border-slate-300 dark:hover:border-slate-700/80">
      {/* Ambient background glow behind the gauge */}
      <div
        className={`absolute -top-10 left-1/2 -translate-x-1/2 w-56 sm:w-64 h-56 sm:h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${statusBadge.glowColor}`}
      />

      <div className="relative flex items-center justify-between gap-2 mb-3 sm:mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Spending Gauge
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 text-pretty">
            Combined spending against combined Needs and Wants budget
          </p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-lg font-bold border shrink-0 ${statusBadge.className}`}>
          {statusBadge.label}
        </span>
      </div>

      {/* Semicircle SVG */}
      <div className="relative flex flex-col items-center justify-center py-1 sm:py-2">
        <svg viewBox="0 0 200 115" className="w-full max-w-[260px] sm:max-w-[280px] h-auto aspect-[200/115] drop-shadow-xs">
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="currentColor"
            className="text-slate-100 dark:text-slate-800"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {expenseCategories.map(([catId, amount]) => {
            const cat = catMap.get(catId);
            const color = cat ? cat.color : '#64748b';
            const catRatio = totalSpendingBudget > 0 ? amount / totalSpendingBudget : 0;
            const segmentLength = Math.min(catRatio, 1) * arcLength;
            const offset = -(accumulatedRatio * arcLength);

            const isFirst = accumulatedRatio === 0;
            accumulatedRatio += catRatio;

            return (
              <path
                key={catId}
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${segmentLength} ${arcLength}`}
                strokeDashoffset={offset}
                strokeLinecap={isFirst ? 'round' : 'butt'}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>

        {/* Central Numbers */}
        <div className="absolute bottom-1 sm:bottom-2 text-center pointer-events-none select-none">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
            Total Spent
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight block">
            {formatIDR(totalSpent)}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mt-0.5">
            of {formatIDR(totalSpendingBudget)} budget
          </span>
        </div>
      </div>

      {/* Remaining safe-to-spend banner */}
      <div className="relative mt-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs gap-2">
        <span className="text-slate-600 dark:text-slate-400 font-semibold truncate">
          Safe to Spend
        </span>
        <span
          className={`font-extrabold text-xs sm:text-sm shrink-0 ${
            remainingSpending >= 0
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-rose-700 dark:text-rose-400'
          }`}
        >
          {remainingSpending >= 0
            ? formatIDR(remainingSpending)
            : `Overbudget by ${formatIDR(Math.abs(remainingSpending))}`}
        </span>
      </div>

      {/* Mini Legend */}
      {expenseCategories.length > 0 && (
        <div className="relative flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-2 pt-2 border-t border-slate-100/60 dark:border-slate-800/60">
          {expenseCategories.slice(0, 4).map(([catId, amount]) => {
            const cat = catMap.get(catId);
            if (!cat) return null;
            return (
              <div
                key={catId}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 font-medium"
              >
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="truncate max-w-[110px] sm:max-w-none">{cat.name}</span>
                <span className="font-bold text-slate-900 dark:text-white ml-0.5 shrink-0">
                  {formatIDR(amount)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
