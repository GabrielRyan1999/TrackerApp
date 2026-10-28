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
      {/* Table Headline (World Markets Ledger Style) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-stone-900 dark:border-stone-400 pb-2 mb-3">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-stone-600 dark:text-stone-400 block">
            TABLE I. — OFFICIAL FINANCIAL LEDGER
          </span>
          <h2 className="font-headline text-lg sm:text-xl font-black uppercase text-stone-950 dark:text-stone-50 leading-tight">
            Monthly Inflows & Disbursements Census
          </h2>
        </div>
        <div className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 border border-stone-900 dark:border-stone-400 bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100">
          CERTIFIED REAL-TIME
        </div>
      </div>

      {/* 4-Column Balanced Ledger Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-stone-300 dark:divide-stone-700 py-1">
        {/* 1. Gross Revenue */}
        <div className="p-2 sm:px-4 space-y-1 min-w-0">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
            <span>Gross Revenue</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-mono-num font-black">[INFLOW]</span>
          </div>
          <div className="font-mono-num text-xl sm:text-2xl font-black text-stone-950 dark:text-stone-50 tracking-tight">
            {formatIDR(summary.income)}
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Operating base deposit
          </p>
        </div>

        {/* 2. Disbursements */}
        <div className="p-2 sm:px-4 space-y-1 min-w-0">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
            <span>Disbursements</span>
            <span className="text-red-700 dark:text-red-400 font-mono-num font-black">[OUTFLOW]</span>
          </div>
          <div className="font-mono-num text-xl sm:text-2xl font-black text-stone-950 dark:text-stone-50 tracking-tight">
            {formatIDR(summary.totalSpent)}
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Needs & Wants combined outlays
          </p>
        </div>

        {/* 3. Capital Saved */}
        <div className="p-2 sm:px-4 space-y-1 min-w-0">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
            <span>Capital Saved</span>
            <span className="text-stone-900 dark:text-stone-100 font-mono-num font-black">[RESERVES]</span>
          </div>
          <div className="font-mono-num text-xl sm:text-2xl font-black text-stone-950 dark:text-stone-50 tracking-tight">
            {formatIDR(summary.savingsSaved)}
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Statutory 20% preserved quota
          </p>
        </div>

        {/* 4. Net Operating Buffer */}
        <div className="p-2 sm:px-4 space-y-1 min-w-0">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
            <span>Operating Buffer</span>
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
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Liquid spending capacity remaining
          </p>
        </div>
      </div>
    </section>
  );
};
