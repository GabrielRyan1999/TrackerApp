import React from 'react';
import type { BudgetSummary } from '../types/budget';
import { formatIDR } from '../utils/idr';

interface BucketCardsProps {
  summary: BudgetSummary;
  planSplit?: {
    needs: number;
    wants: number;
    savings: number;
  };
}

export const BucketCards: React.FC<BucketCardsProps> = ({ summary, planSplit }) => {
  const needsRatio = summary.needsBudget > 0 ? summary.needsSpent / summary.needsBudget : 0;
  const wantsRatio = summary.wantsBudget > 0 ? summary.wantsSpent / summary.wantsBudget : 0;
  const savingsRatio = summary.savingsBudget > 0 ? summary.savingsSaved / summary.savingsBudget : 0;

  const needsPct = Math.round(needsRatio * 100);
  const wantsPct = Math.round(wantsRatio * 100);
  const savingsPct = Math.round(savingsRatio * 100);

  const targetNeeds = planSplit?.needs ?? (summary.income > 0 ? Math.round((summary.needsBudget / summary.income) * 100) : 50);
  const targetWants = planSplit?.wants ?? (summary.income > 0 ? Math.round((summary.wantsBudget / summary.income) * 100) : 30);
  const targetSavings = planSplit?.savings ?? (summary.income > 0 ? Math.round((summary.savingsBudget / summary.income) * 100) : 20);

  const needsRemaining = summary.needsBudget - summary.needsSpent;
  const wantsRemaining = summary.wantsBudget - summary.wantsSpent;
  const savingsRemaining = summary.savingsBudget - summary.savingsSaved;

  return (
    <section className="border-2 border-stone-900 dark:border-stone-400 bg-stone-100/40 dark:bg-stone-900/30">
      {/* Header Strip */}
      <div className="border-b border-stone-900 dark:border-stone-400 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 bg-stone-200/60 dark:bg-stone-800/60">
        <h2 className="font-bold tracking-wider">50 / 30 / 20 Allocation</h2>
        <span>Target: {targetNeeds}% / {targetWants}% / {targetSavings}%</span>
      </div>

      {/* 3-Column Broadsheet Continuous Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-900 dark:divide-stone-400">
        {/* SECTION I: NEEDS */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-stone-300 dark:border-stone-700 pb-2 mb-2.5">
              <h3 className="font-headline text-base sm:text-lg font-bold uppercase text-stone-950 dark:text-stone-50 leading-tight">
                Needs ({targetNeeds}%)
              </h3>
              <span
                className={`font-mono-num text-sm sm:text-base font-black px-2 py-0.5 border ${
                  needsRatio > 1
                    ? 'border-red-800 text-red-800 dark:border-red-400 dark:text-red-400'
                    : needsRatio >= 0.8
                    ? 'border-amber-800 text-amber-800 dark:border-amber-400 dark:text-amber-400'
                    : 'border-stone-900 dark:border-stone-400 text-stone-900 dark:text-stone-100'
                }`}
              >
                {needsPct}%
              </span>
            </div>

            {/* Remaining / Overbudget Figure */}
            <div className="my-2.5">
              <span className="text-xs uppercase tracking-wider text-stone-600 dark:text-stone-400 block font-bold">
                {needsRemaining >= 0 ? 'Remaining:' : 'Over Budget:'}
              </span>
              <div
                className={`font-headline text-xl sm:text-2xl font-black tracking-tight ${
                  needsRemaining >= 0
                    ? 'text-stone-950 dark:text-stone-50'
                    : 'text-red-800 dark:text-red-400'
                }`}
              >
                {needsRemaining >= 0 ? formatIDR(needsRemaining) : `-${formatIDR(Math.abs(needsRemaining))}`}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="my-2">
              <div className="w-full bg-stone-200 dark:bg-stone-800 h-2.5 border border-stone-900 dark:border-stone-400 p-[1px]">
                <div
                  className={`h-full transition-all duration-500 ${
                    needsRatio > 1
                      ? 'bg-red-800 dark:bg-red-500'
                      : needsRatio >= 0.8
                      ? 'bg-amber-700 dark:bg-amber-500'
                      : 'bg-stone-900 dark:bg-stone-200'
                  }`}
                  style={{ width: `${Math.min(needsPct, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Ledger Numbers */}
          <div className="pt-2 border-t border-stone-300 dark:border-stone-700 space-y-1 text-xs font-mono-num">
            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span className="font-sans uppercase text-xs">Spent:</span>
              <span className="font-bold text-stone-900 dark:text-stone-100">{formatIDR(summary.needsSpent)}</span>
            </div>
            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span className="font-sans uppercase text-xs">Budget:</span>
              <span className="font-bold text-stone-900 dark:text-stone-100">{formatIDR(summary.needsBudget)}</span>
            </div>
          </div>
        </div>

        {/* SECTION II: WANTS */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-stone-300 dark:border-stone-700 pb-2 mb-2.5">
              <h3 className="font-headline text-base sm:text-lg font-bold uppercase text-stone-950 dark:text-stone-50 leading-tight">
                Wants ({targetWants}%)
              </h3>
              <span
                className={`font-mono-num text-sm sm:text-base font-black px-2 py-0.5 border ${
                  wantsRatio > 1
                    ? 'border-red-800 text-red-800 dark:border-red-400 dark:text-red-400'
                    : wantsRatio >= 0.8
                    ? 'border-amber-800 text-amber-800 dark:border-amber-400 dark:text-amber-400'
                    : 'border-stone-900 dark:border-stone-400 text-stone-900 dark:text-stone-100'
                }`}
              >
                {wantsPct}%
              </span>
            </div>

            {/* Remaining / Overbudget Figure */}
            <div className="my-2.5">
              <span className="text-xs uppercase tracking-wider text-stone-600 dark:text-stone-400 block font-bold">
                {wantsRemaining >= 0 ? 'Remaining:' : 'Over Budget:'}
              </span>
              <div
                className={`font-headline text-xl sm:text-2xl font-black tracking-tight ${
                  wantsRemaining >= 0
                    ? 'text-stone-950 dark:text-stone-50'
                    : 'text-red-800 dark:text-red-400'
                }`}
              >
                {wantsRemaining >= 0 ? formatIDR(wantsRemaining) : `-${formatIDR(Math.abs(wantsRemaining))}`}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="my-2">
              <div className="w-full bg-stone-200 dark:bg-stone-800 h-2.5 border border-stone-900 dark:border-stone-400 p-[1px]">
                <div
                  className={`h-full transition-all duration-500 ${
                    wantsRatio > 1
                      ? 'bg-red-800 dark:bg-red-500'
                      : wantsRatio >= 0.8
                      ? 'bg-amber-700 dark:bg-amber-500'
                      : 'bg-stone-900 dark:bg-stone-200'
                  }`}
                  style={{ width: `${Math.min(wantsPct, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Ledger Numbers */}
          <div className="pt-2 border-t border-stone-300 dark:border-stone-700 space-y-1 text-xs font-mono-num">
            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span className="font-sans uppercase text-xs">Spent:</span>
              <span className="font-bold text-stone-900 dark:text-stone-100">{formatIDR(summary.wantsSpent)}</span>
            </div>
            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span className="font-sans uppercase text-xs">Budget:</span>
              <span className="font-bold text-stone-900 dark:text-stone-100">{formatIDR(summary.wantsBudget)}</span>
            </div>
          </div>
        </div>

        {/* SECTION III: SAVINGS */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-stone-300 dark:border-stone-700 pb-2 mb-2.5">
              <h3 className="font-headline text-base sm:text-lg font-bold uppercase text-stone-950 dark:text-stone-50 leading-tight">
                Savings ({targetSavings}%)
              </h3>
              <span
                className={`font-mono-num text-sm sm:text-base font-black px-2 py-0.5 border ${
                  savingsPct >= 100
                    ? 'border-emerald-800 text-emerald-800 dark:border-emerald-400 dark:text-emerald-400'
                    : 'border-stone-900 dark:border-stone-400 text-stone-900 dark:text-stone-100'
                }`}
              >
                {savingsPct}%
              </span>
            </div>

            {/* Remaining / Fulfilled Figure */}
            <div className="my-2.5">
              <span className="text-xs uppercase tracking-wider text-stone-600 dark:text-stone-400 block font-bold">
                {savingsRemaining <= 0 ? 'Goal Met:' : 'Remaining:'}
              </span>
              <div className="font-headline text-xl sm:text-2xl font-black tracking-tight text-stone-950 dark:text-stone-50">
                {savingsRemaining <= 0 ? 'Goal Reached' : formatIDR(savingsRemaining)}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="my-2">
              <div className="w-full bg-stone-200 dark:bg-stone-800 h-2.5 border border-stone-900 dark:border-stone-400 p-[1px]">
                <div
                  className="h-full bg-stone-900 dark:bg-stone-200 transition-all duration-500"
                  style={{ width: `${Math.min(savingsPct, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Ledger Numbers */}
          <div className="pt-2 border-t border-stone-300 dark:border-stone-700 space-y-1 text-xs font-mono-num">
            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span className="font-sans uppercase text-xs">Saved:</span>
              <span className="font-bold text-stone-900 dark:text-stone-100">{formatIDR(summary.savingsSaved)}</span>
            </div>
            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span className="font-sans uppercase text-xs">Target:</span>
              <span className="font-bold text-stone-900 dark:text-stone-100">{formatIDR(summary.savingsBudget)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
