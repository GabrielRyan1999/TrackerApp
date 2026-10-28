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
    <section className="border-2 border-stone-900 dark:border-stone-400 bg-stone-100/40 dark:bg-stone-900/30 p-3.5 sm:p-4">
      {/* Table Headline (Reference Image 1: Financial / World Markets Table) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-900 dark:border-stone-400 pb-2 mb-3">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-stone-600 dark:text-stone-400 block">
            TABLE II. — MONTHLY CASH FLOW LEDGER
          </span>
          <h3 className="font-headline text-base sm:text-lg font-bold text-stone-950 dark:text-stone-50 leading-tight">
            Financial Inflows & Disbursements
          </h3>
        </div>
        <div className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 border border-stone-900 dark:border-stone-400 bg-stone-200/70 dark:bg-stone-800/70 text-stone-900 dark:text-stone-100">
          CERTIFIED REAL-TIME
        </div>
      </div>

      {/* 4-Item Tabular Broadsheet Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-stone-300 dark:divide-stone-700 border-y border-stone-300 dark:border-stone-700 py-2.5">
        {/* Income */}
        <div className="p-2 sm:px-3 space-y-1 min-w-0">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center justify-between">
            <span>Gross Inflow</span>
            <span className="text-emerald-700 dark:text-emerald-400">▲ IN</span>
          </div>
          <div className="font-mono-num text-base sm:text-lg font-black text-stone-950 dark:text-stone-50 tracking-tight truncate">
            {formatIDR(summary.income)}
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 italic">Operating base deposit</p>
        </div>

        {/* Expenses */}
        <div className="p-2 sm:px-3 space-y-1 min-w-0">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center justify-between">
            <span>Disbursements</span>
            <span className="text-red-700 dark:text-red-400">▼ OUT</span>
          </div>
          <div className="font-mono-num text-base sm:text-lg font-black text-stone-950 dark:text-stone-50 tracking-tight truncate">
            {formatIDR(summary.totalSpent)}
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 italic">Needs & Wants combined</p>
        </div>

        {/* Savings */}
        <div className="p-2 sm:px-3 space-y-1 min-w-0">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center justify-between">
            <span>Capital Saved</span>
            <span className="text-stone-900 dark:text-stone-100">★ SAFE</span>
          </div>
          <div className="font-mono-num text-base sm:text-lg font-black text-stone-950 dark:text-stone-50 tracking-tight truncate">
            {formatIDR(summary.savingsSaved)}
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 italic">Statutory 20% quota</p>
        </div>

        {/* Remaining to spend */}
        <div className="p-2 sm:px-3 space-y-1 min-w-0">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center justify-between">
            <span>Net Operating Buffer</span>
            <span className={operatingRemaining >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}>
              {operatingRemaining >= 0 ? '● BAL' : '⚠ DEF'}
            </span>
          </div>
          <div className={`font-mono-num text-base sm:text-lg font-black tracking-tight truncate ${
            operatingRemaining >= 0 ? 'text-stone-950 dark:text-stone-50' : 'text-red-700 dark:text-red-400'
          }`}>
            {formatIDR(operatingRemaining)}
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 italic">Available spending cushion</p>
        </div>
      </div>

      {/* Official Audit Notice Footer */}
      <div className="mt-2.5 pt-2 text-xs text-stone-600 dark:text-stone-400 italic text-justify leading-relaxed max-w-[55ch]">
        <strong>OFFICIAL GAZETTE AUDIT NOTICE:</strong> All figures above represent verified transactions for the current calendar issue. Liquid reserves must remain allocated according to the 50/30/20 standard unless formally amended via the Plan Allocation dispatch.
      </div>
    </section>
  );
};
