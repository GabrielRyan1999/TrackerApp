import React from 'react';
import type { BudgetSummary } from '../types/budget';
import { formatIDR } from '../utils/idr';
import { ShieldCheck, HeartHandshake, PiggyBank } from 'lucide-react';

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

  const needsBarColor = needsRatio > 1 ? 'bg-rose-500' : needsRatio >= 0.8 ? 'bg-amber-500' : 'bg-blue-600';
  const wantsBarColor = wantsRatio > 1 ? 'bg-rose-500' : wantsRatio >= 0.8 ? 'bg-amber-500' : 'bg-pink-600';
  const savingsBarColor = 'bg-emerald-600';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
      {/* Needs Card */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700/80 shadow-xs">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  Needs
                </h3>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block -mt-0.5">
                  {targetNeeds}% target
                </span>
              </div>
            </div>
            <span
              className={`text-base font-black tracking-tight shrink-0 ${
                needsRatio > 1
                  ? 'text-rose-600 dark:text-rose-400'
                  : needsRatio >= 0.8
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`}
            >
              {needsPct}%
            </span>
          </div>

          {/* Available balance */}
          <div className="my-2 flex items-baseline justify-between gap-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs">
              {needsRemaining >= 0 ? 'Remaining' : 'Overbudget'}
            </span>
            <span
              className={`text-xs sm:text-sm font-bold tracking-tight shrink-0 ${
                needsRemaining >= 0
                  ? 'text-blue-700 dark:text-blue-400'
                  : 'text-rose-700 dark:text-rose-400'
              }`}
            >
              {needsRemaining >= 0 ? formatIDR(needsRemaining) : `+${formatIDR(Math.abs(needsRemaining))}`}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${needsBarColor}`}
              style={{ width: `${Math.min(needsPct, 100)}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px]">Spent</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {formatIDR(summary.needsSpent)}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px]">Limit</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {formatIDR(summary.needsBudget)}
            </span>
          </div>
        </div>
      </div>

      {/* Wants Card */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700/80 shadow-xs">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  Wants
                </h3>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block -mt-0.5">
                  {targetWants}% target
                </span>
              </div>
            </div>
            <span
              className={`text-base font-black tracking-tight shrink-0 ${
                wantsRatio > 1
                  ? 'text-rose-600 dark:text-rose-400'
                  : wantsRatio >= 0.8
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-pink-600 dark:text-pink-400'
              }`}
            >
              {wantsPct}%
            </span>
          </div>

          {/* Available balance */}
          <div className="my-2 flex items-baseline justify-between gap-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs">
              {wantsRemaining >= 0 ? 'Remaining' : 'Overbudget'}
            </span>
            <span
              className={`text-xs sm:text-sm font-bold tracking-tight shrink-0 ${
                wantsRemaining >= 0
                  ? 'text-pink-700 dark:text-pink-400'
                  : 'text-rose-700 dark:text-rose-400'
              }`}
            >
              {wantsRemaining >= 0 ? formatIDR(wantsRemaining) : `+${formatIDR(Math.abs(wantsRemaining))}`}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${wantsBarColor}`}
              style={{ width: `${Math.min(wantsPct, 100)}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px]">Spent</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {formatIDR(summary.wantsSpent)}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px]">Limit</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {formatIDR(summary.wantsBudget)}
            </span>
          </div>
        </div>
      </div>

      {/* Savings Card */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700/80 shadow-xs">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <PiggyBank className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  Savings
                </h3>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block -mt-0.5">
                  {targetSavings}% target
                </span>
              </div>
            </div>
            <span
              className={`text-base font-black tracking-tight shrink-0 ${
                savingsPct >= 100
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {savingsPct}%
            </span>
          </div>

          {/* Savings balance */}
          <div className="my-2 flex items-baseline justify-between gap-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs">
              {savingsRemaining <= 0 ? 'Status' : 'Remaining'}
            </span>
            <span
              className={`text-xs sm:text-sm font-bold tracking-tight shrink-0 ${
                savingsRemaining <= 0
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {savingsRemaining <= 0 ? 'Target Met' : formatIDR(savingsRemaining)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${savingsBarColor}`}
              style={{ width: `${Math.min(savingsPct, 100)}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px]">Saved</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {formatIDR(summary.savingsSaved)}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px]">Target</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {formatIDR(summary.savingsBudget)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
