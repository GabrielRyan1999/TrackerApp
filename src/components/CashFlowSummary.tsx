import React from 'react';
import type { BudgetSummary } from '../types/budget';
import { formatIDR } from '../utils/idr';

interface CashFlowSummaryProps {
  summary: BudgetSummary;
}

export const CashFlowSummary: React.FC<CashFlowSummaryProps> = ({ summary }) => {
  const operatingBudget = summary.needsBudget + summary.wantsBudget;
  const operatingRemaining = operatingBudget - summary.totalSpent;

  return (
    <section className="border-2 border-stone-900 dark:border-stone-400 bg-stone-100/40 dark:bg-stone-900/30 p-3.5 sm:p-5">
      {/* Table Headline */}
      <div className="border-b border-stone-900 dark:border-stone-400 pb-2 mb-3">
        <h2 className="font-headline text-lg sm:text-xl font-bold uppercase text-stone-950 dark:text-stone-50 leading-tight">
          Cash Flow Summary
        </h2>
      </div>

      {/* 4-Column Balanced Ledger Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-stone-300 dark:divide-stone-700 py-1">
        {/* 1. Gross Revenue */}
        <div className="p-2 sm:px-4 space-y-1 min-w-0">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
            <span>Income</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-mono-num font-black">[IN]</span>
          </div>
          <div className="font-mono-num text-xl sm:text-2xl font-black text-stone-950 dark:text-stone-50 tracking-tight">
            {formatIDR(summary.income)}
          </div>
        </div>

        {/* 2. Disbursements */}
        <div className="p-2 sm:px-4 space-y-1 min-w-0">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
            <span>Spent</span>
            <span className="text-red-700 dark:text-red-400 font-mono-num font-black">[OUT]</span>
          </div>
          <div className="font-mono-num text-xl sm:text-2xl font-black text-stone-950 dark:text-stone-50 tracking-tight">
            {formatIDR(summary.totalSpent)}
          </div>
        </div>

        {/* 3. Capital Saved */}
        <div className="p-2 sm:px-4 space-y-1 min-w-0">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
            <span>Saved</span>
            <span className="text-stone-900 dark:text-stone-100 font-mono-num font-black">[GOAL]</span>
          </div>
          <div className="font-mono-num text-xl sm:text-2xl font-black text-stone-950 dark:text-stone-50 tracking-tight">
            {formatIDR(summary.savingsSaved)}
          </div>
        </div>

        {/* 4. Net Operating Buffer */}
        <div className="p-2 sm:px-4 space-y-1 min-w-0">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
            <span>Remaining</span>
            <span className={`font-mono-num font-black ${
              operatingRemaining >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
            }`}>
              {operatingRemaining >= 0 ? '[SURPLUS]' : '[DEFICIT]'}
            </span>
          </div>
          <div className={`font-mono-num text-xl sm:text-2xl font-black tracking-tight ${
            operatingRemaining >= 0 ? 'text-stone-950 dark:text-stone-50' : 'text-red-700 dark:text-red-400'
          }`}>
            {formatIDR(operatingRemaining)}
          </div>
        </div>
      </div>
    </section>
  );
};
