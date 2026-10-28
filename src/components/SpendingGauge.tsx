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

  // Needle angle for gauge (-90 deg at 0% to +90 deg at 100%)
  const clampedRatio = Math.min(Math.max(ratio, 0), 1.25);
  const needleAngle = -90 + clampedRatio * 180;

  // 4-Zone Indicator Logic: Green (0-50%), Yellow (50-75%), Orange (75-90%), Red (90%+)
  const getZoneInfo = (r: number) => {
    if (r > 1) {
      return {
        label: `Over Budget (+${percentNumber - 100}%)`,
        badgeClass: 'border-red-700 text-red-700 bg-red-50 dark:border-red-400 dark:text-red-300 dark:bg-red-950/40',
        needleColor: '#dc2626',
        zoneName: 'Deficit',
      };
    }
    if (r >= 0.9) {
      return {
        label: `Critical (${percentNumber}%)`,
        badgeClass: 'border-red-600 text-red-600 bg-red-50 dark:border-red-400 dark:text-red-300 dark:bg-red-950/30',
        needleColor: '#ef4444',
        zoneName: 'Critical',
      };
    }
    if (r >= 0.75) {
      return {
        label: `Warning (${percentNumber}%)`,
        badgeClass: 'border-orange-600 text-orange-700 bg-orange-50 dark:border-orange-400 dark:text-orange-300 dark:bg-orange-950/30',
        needleColor: '#ea580c',
        zoneName: 'Warning',
      };
    }
    if (r >= 0.5) {
      return {
        label: `Moderate (${percentNumber}%)`,
        badgeClass: 'border-yellow-600 text-yellow-800 bg-yellow-50 dark:border-yellow-400 dark:text-yellow-300 dark:bg-yellow-950/30',
        needleColor: '#ca8a04',
        zoneName: 'Moderate',
      };
    }
    return {
      label: `Safe (${percentNumber}%)`,
      badgeClass: 'border-emerald-700 text-emerald-700 bg-emerald-50 dark:border-emerald-400 dark:text-emerald-300 dark:bg-emerald-950/30',
      needleColor: '#16a34a',
      zoneName: 'Safe',
    };
  };

  const currentZone = getZoneInfo(ratio);

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
            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 border ${currentZone.badgeClass}`}>
              {currentZone.label}
            </span>
          </div>
        </div>

      {/* Engraved Semicircle Gauge SVG with Green, Yellow, Orange, Red Zones */}
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

          {/* Background base track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="currentColor"
            className="text-stone-200 dark:text-stone-800"
            strokeWidth={strokeWidth}
          />

          {/* 1. Green Zone (0% - 50%) */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#16a34a"
            strokeWidth={strokeWidth}
            strokeDasharray={`${0.5 * arcLength} ${arcLength}`}
            strokeDashoffset="0"
            className={`transition-opacity duration-300 ${ratio >= 0.5 ? 'opacity-100' : 'opacity-90'}`}
          />

          {/* 2. Yellow Zone (50% - 75%) */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#ca8a04"
            strokeWidth={strokeWidth}
            strokeDasharray={`${0.25 * arcLength} ${arcLength}`}
            strokeDashoffset={-(0.5 * arcLength)}
            className={`transition-opacity duration-300 ${ratio >= 0.5 ? 'opacity-100' : 'opacity-35'}`}
          />

          {/* 3. Orange Zone (75% - 90%) */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#ea580c"
            strokeWidth={strokeWidth}
            strokeDasharray={`${0.15 * arcLength} ${arcLength}`}
            strokeDashoffset={-(0.75 * arcLength)}
            className={`transition-opacity duration-300 ${ratio >= 0.75 ? 'opacity-100' : 'opacity-35'}`}
          />

          {/* 4. Red Zone (90% - 100%) */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#dc2626"
            strokeWidth={strokeWidth}
            strokeDasharray={`${0.10 * arcLength} ${arcLength}`}
            strokeDashoffset={-(0.9 * arcLength)}
            className={`transition-opacity duration-300 ${ratio >= 0.9 ? 'opacity-100' : 'opacity-35'}`}
          />

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
              points="100,18 95,30 105,30"
              fill={currentZone.needleColor}
              stroke="currentColor"
              className="stroke-stone-900 dark:stroke-stone-100"
              strokeWidth="1"
            />
          </g>

          {/* Center Pivot Rivet */}
          <circle cx="100" cy="100" r="7" className="fill-stone-900 dark:fill-stone-100" />
          <circle cx="100" cy="100" r="3" fill={currentZone.needleColor} />

          {/* Scale Markers */}
          <text x="18" y="114" className="text-[9px] font-bold font-mono-num fill-stone-600 dark:fill-stone-400" textAnchor="middle">
            0%
          </text>
          <text x="100" y="13" className="text-[9px] font-bold font-mono-num fill-stone-600 dark:fill-stone-400" textAnchor="middle">
            50%
          </text>
          <text x="182" y="114" className="text-[9px] font-bold font-mono-num fill-stone-600 dark:fill-stone-400" textAnchor="middle">
            100%
          </text>
        </svg>

        {/* 4-Zone Color Legend Strip */}
        <div className="grid grid-cols-4 gap-1 text-[10px] font-bold uppercase tracking-wider text-center pt-2 mt-2 border-t border-dashed border-stone-300 dark:border-stone-700 w-full">
          <div className="flex items-center justify-center gap-1 text-emerald-800 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
            <span>0–50%</span>
          </div>
          <div className="flex items-center justify-center gap-1 text-yellow-800 dark:text-yellow-400">
            <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
            <span>50–75%</span>
          </div>
          <div className="flex items-center justify-center gap-1 text-orange-800 dark:text-orange-400">
            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
            <span>75–90%</span>
          </div>
          <div className="flex items-center justify-center gap-1 text-red-800 dark:text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
            <span>&gt;90%</span>
          </div>
        </div>

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
