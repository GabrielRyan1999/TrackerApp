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
  const strokeWidth = 12;
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

  // Needle angle for gauge (-90 deg at 0% to +90 deg at 100%)
  const clampedRatio = Math.min(Math.max(ratio, 0), 1.25);
  const needleAngle = -90 + clampedRatio * 180;

  return (
    <section className="border-2 border-stone-900 dark:border-stone-400 bg-stone-100/40 dark:bg-stone-900/30 p-3.5 sm:p-5 h-full flex flex-col justify-between">
      <div>
        {/* Gauge Header */}
        <div className="flex items-start justify-between border-b-2 border-stone-900 dark:border-stone-400 pb-2 mb-3">
          <div>
            <h2 className="font-headline text-base sm:text-lg font-bold text-stone-950 dark:text-stone-50 leading-tight">
              Spending Meter
            </h2>
          </div>
          <div className="text-right shrink-0">
            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 border ${
              ratio > 1
                ? 'border-red-800 text-red-800 dark:text-red-400'
                : ratio >= 0.8
                ? 'border-amber-800 text-amber-800 dark:text-amber-400'
                : 'border-stone-900 dark:border-stone-300 text-stone-900 dark:text-stone-100'
            }`}>
              {ratio > 1 ? `Over Budget (+${percentNumber - 100}%)` : `${percentNumber}% Used`}
            </span>
          </div>
        </div>

      {/* Engraved Semicircle Gauge SVG */}
      <div className="relative flex flex-col items-center justify-center py-1">
        <svg viewBox="0 0 200 120" className="w-full max-w-[280px] h-auto aspect-[200/120] select-none">
          {/* Outer dial ring */}
          <path
            d="M 18 100 A 82 82 0 0 1 182 100"
            fill="none"
            stroke="currentColor"
            className="text-stone-300 dark:text-stone-700"
            strokeWidth="1"
          />

          {/* Background track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="currentColor"
            className="text-stone-200 dark:text-stone-800"
            strokeWidth={strokeWidth}
          />

          {/* Category Segments */}
          {expenseCategories.map(([catId, amount]) => {
            const cat = catMap.get(catId);
            const color = cat ? cat.color : '#57534e';
            const catRatio = totalSpendingBudget > 0 ? amount / totalSpendingBudget : 0;
            const segmentLength = Math.min(catRatio, 1) * arcLength;
            const offset = -(accumulatedRatio * arcLength);

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
                className="transition-all duration-500"
              />
            );
          })}

          {/* Engraved Dial Needle */}
          <g transform={`rotate(${needleAngle} 100 100)`} className="transition-transform duration-700 ease-out">
            {/* Needle line */}
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="28"
              stroke="currentColor"
              className="text-stone-900 dark:text-stone-100"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Arrowhead */}
            <polygon
              points="100,20 96,30 104,30"
              fill="currentColor"
              className="text-stone-900 dark:text-stone-100"
            />
          </g>

          {/* Center Pivot Rivet */}
          <circle cx="100" cy="100" r="7" className="fill-stone-900 dark:fill-stone-100" />
          <circle cx="100" cy="100" r="3" className="fill-stone-100 dark:fill-stone-900" />

          {/* Scale Markers */}
          <text x="18" y="114" className="text-[9px] font-bold font-mono-num fill-stone-600 dark:fill-stone-400" textAnchor="middle">
            0%
          </text>
          <text x="100" y="14" className="text-[9px] font-bold font-mono-num fill-stone-600 dark:fill-stone-400" textAnchor="middle">
            50%
          </text>
          <text x="182" y="114" className="text-[9px] font-bold font-mono-num fill-stone-600 dark:fill-stone-400" textAnchor="middle">
            100%
          </text>
        </svg>

        {/* Central Readout */}
        <div className="text-center mt-2 border-t border-dashed border-stone-400 dark:border-stone-600 pt-2 w-full">
          <span className="text-[11px] font-bold tracking-widest uppercase text-stone-500 dark:text-stone-400 block">
            Spent This Month
          </span>
          <span className="font-headline text-2xl sm:text-3xl font-black text-stone-950 dark:text-stone-50 tracking-tight block">
            {formatIDR(totalSpent)}
          </span>
          <span className="text-xs text-stone-600 dark:text-stone-400 block mt-0.5">
            of <strong className="font-mono-num">{formatIDR(totalSpendingBudget)}</strong> budget
          </span>
        </div>
      </div>

      {/* Safe to Spend Ledger Box */}
      <div className="mt-2.5 pt-2 border-t border-stone-900 dark:border-stone-400 flex items-center justify-between text-xs">
        <span className="text-stone-600 dark:text-stone-400 font-bold uppercase tracking-wider text-[11px]">
          Remaining:
        </span>
        <span className={`font-mono-num font-bold text-xs sm:text-sm ${
          remainingSpending >= 0
            ? 'text-stone-900 dark:text-stone-100'
            : 'text-red-800 dark:text-red-400'
        }`}>
          {remainingSpending >= 0
            ? formatIDR(remainingSpending)
            : `Over by ${formatIDR(Math.abs(remainingSpending))}`}
        </span>
      </div>

      {/* Commodity Legend */}
      {expenseCategories.length > 0 && (
        <div className="mt-2 pt-2 border-t border-stone-300 dark:border-stone-700 grid grid-cols-2 gap-1 text-xs">
          {expenseCategories.slice(0, 4).map(([catId, amount]) => {
            const cat = catMap.get(catId);
            if (!cat) return null;
            return (
              <div key={catId} className="flex items-center justify-between pr-1 text-stone-700 dark:text-stone-300">
                <span className="truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 inline-block shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="truncate">{cat.name}</span>
                </span>
                <span className="font-mono-num font-semibold text-stone-900 dark:text-stone-100 shrink-0 ml-1">
                  {formatIDR(amount)}
                </span>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </section>
  );
};
