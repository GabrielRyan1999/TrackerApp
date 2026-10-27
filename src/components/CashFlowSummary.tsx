import React from 'react';
import type { BudgetSummary } from '../types/budget';
import { formatIDR } from '../utils/idr';
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';

interface CashFlowSummaryProps {
  summary: BudgetSummary;
}

export const CashFlowSummary: React.FC<CashFlowSummaryProps> = ({ summary }) => {
  return (
    <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 sm:p-6 transition">
      <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Cash Flow</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Summary of inflows and outflows</p>
        </div>
        <div className="flex items-center text-xs font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg shrink-0">
          <span>Real-time</span>
        </div>
      </div>

      {/* Flat metrics list (No nested cards!) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-1 sm:pt-2">
        {/* Income */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold truncate">Income</span>
          </div>
          <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
            {formatIDR(summary.income)}
          </div>
        </div>

        {/* Expenses */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
            <ArrowDownRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="font-semibold truncate">Expenses</span>
          </div>
          <div className="text-base sm:text-lg font-extrabold text-rose-600 dark:text-rose-400 tracking-tight truncate">
            {formatIDR(summary.totalSpent)}
          </div>
        </div>

        {/* Savings */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold truncate">Savings</span>
          </div>
          <div className="text-base sm:text-lg font-extrabold text-emerald-700 dark:text-emerald-300 tracking-tight truncate">
            {formatIDR(summary.savingsSaved)}
          </div>
        </div>

        {/* Remaining to spend */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-semibold truncate">Remaining</span>
          </div>
          <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
            {formatIDR((summary.needsBudget + summary.wantsBudget) - summary.totalSpent)}
          </div>
        </div>
      </div>
    </div>
  );
};
