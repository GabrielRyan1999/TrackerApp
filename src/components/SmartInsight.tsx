import React, { useMemo } from 'react';
import type { BudgetSummary } from '../types/budget';
import { formatIDR } from '../utils/idr';

interface SmartInsightProps {
  summary: BudgetSummary;
}

export const SmartInsight: React.FC<SmartInsightProps> = ({ summary }) => {
  const insight = useMemo(() => {
    const totalSpendBudget = summary.needsBudget + summary.wantsBudget;
    const remainingSpending = totalSpendBudget - summary.totalSpent;
    const needsRatio = summary.needsBudget > 0 ? summary.needsSpent / summary.needsBudget : 0;
    const wantsRatio = summary.wantsBudget > 0 ? summary.wantsSpent / summary.wantsBudget : 0;
    const savingsRatio = summary.savingsBudget > 0 ? summary.savingsSaved / summary.savingsBudget : 0;

    // Condition 1: Wants over budget
    if (summary.wantsSpent > summary.wantsBudget) {
      const over = summary.wantsSpent - summary.wantsBudget;
      return {
        tone: 'danger' as const,
        headline: `DISCRETIONARY DEFICIT: WANTS EXCEED QUOTA BY ${formatIDR(over)}`,
        subhead: 'Household lifestyle outlays outpace 30% budgetary limit.',
        status: 'DEFICIT ALERT',
        message: `Discretionary spending has exceeded the 30% ceiling by ${formatIDR(over)}. Pause non-essential commerce to safeguard capital savings.`,
      };
    }

    // Condition 2: Needs over budget
    if (summary.needsSpent > summary.needsBudget) {
      const over = summary.needsSpent - summary.needsBudget;
      return {
        tone: 'danger' as const,
        headline: `LIVING COSTS SURPASS 50% CEILING BY ${formatIDR(over)}`,
        subhead: 'Essential obligations squeeze discretionary and reserve capacity.',
        status: 'CEILING BREACH',
        message: `Living necessities have surged ${formatIDR(over)} beyond planned thresholds. Immediate review of recurring liabilities is advised.`,
      };
    }

    // Condition 3: Wants close to limit (>=80%)
    if (wantsRatio >= 0.8) {
      const remainingWants = summary.wantsBudget - summary.wantsSpent;
      return {
        tone: 'warning' as const,
        headline: `LIFESTYLE OUTFLOW AT CRITICAL LIMIT (${Math.round(wantsRatio * 100)}%)`,
        subhead: `Narrow surplus of ${formatIDR(remainingWants)} remains for discretionary expenses.`,
        status: 'CAUTION ADV.',
        message: `With ${Math.round(wantsRatio * 100)}% of lifestyle funding exhausted, prudent pacing is recommended until next month's deposit.`,
      };
    }

    // Condition 4: Savings goal reached & spending healthy
    if (savingsRatio >= 1 && needsRatio <= 0.9 && wantsRatio <= 0.8) {
      return {
        tone: 'success' as const,
        headline: `FISCAL TRIUMPH: 20% SAVINGS TARGET SECURED`,
        subhead: `Statutory ${formatIDR(summary.savingsBudget)} capital reserve transferred into liquid savings.`,
        status: 'FULLY FUNDED',
        message: `Full statutory 20% savings target is safely secured. An operating cushion of ${formatIDR(remainingSpending)} remains available.`,
      };
    }

    // Condition 5: Normal healthy state
    return {
      tone: 'neutral' as const,
      headline: `FINANCIAL EQUILIBRIUM: 50/30/20 ALLOCATION STEADY`,
      subhead: `Outlays stand at ${Math.round(totalSpendBudget > 0 ? (summary.totalSpent / totalSpendBudget) * 100 : 0)}% of operating ceiling.`,
      status: 'EQUILIBRIUM',
      message: `Domestic accounts adhere to the standard 50/30/20 tripartite doctrine with disciplined operating margins.`,
    };
  }, [summary]);

  const totalSpendBudget = summary.needsBudget + summary.wantsBudget;
  const remainingSpending = totalSpendBudget - summary.totalSpent;

  return (
    <article className="border-2 border-stone-900 dark:border-stone-400 bg-stone-100/40 dark:bg-stone-900/30 p-3.5 sm:p-5 h-full flex flex-col justify-between">
      <div>
        {/* Header Eyebrow & Status */}
        <div className="flex items-center justify-between border-b-2 border-stone-900 dark:border-stone-400 pb-2 mb-3">
          <span className="text-xs font-bold tracking-widest uppercase text-stone-600 dark:text-stone-400">
            FINANCIAL INTELLIGENCE DISPATCH
          </span>
          <span
            className={`text-xs font-bold uppercase px-2 py-0.5 border ${
              insight.tone === 'danger'
                ? 'border-red-800 text-red-800 dark:text-red-400'
                : insight.tone === 'warning'
                ? 'border-amber-800 text-amber-800 dark:text-amber-400'
                : 'border-stone-900 dark:border-stone-300 text-stone-900 dark:text-stone-100'
            }`}
          >
            {insight.status}
          </span>
        </div>

        {/* Lead Headline */}
        <h2 className="font-headline text-lg sm:text-2xl font-black uppercase tracking-tight text-stone-950 dark:text-stone-50 leading-tight mb-1.5">
          {insight.headline}
        </h2>
        <p className="font-editorial italic text-xs sm:text-sm text-stone-700 dark:text-stone-300 mb-3">
          {insight.subhead}
        </p>

        {/* Concise Executive Takeaway */}
        <div className="border-t border-stone-300 dark:border-stone-700 pt-2.5 pb-3">
          <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed max-w-[55ch]">
            {insight.message}
          </p>
        </div>
      </div>

      {/* Quick Dispatch Ledger Table */}
      <div className="border-t-2 border-stone-900 dark:border-stone-400 pt-2.5 mt-2">
        <span className="text-xs font-bold tracking-widest uppercase text-stone-600 dark:text-stone-400 block mb-1.5">
          KEY OPERATING FIGURES:
        </span>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900">
            <span className="text-xs font-bold uppercase text-stone-600 dark:text-stone-400 block">
              Safe to Spend
            </span>
            <span className="font-mono-num font-black text-xs sm:text-sm text-stone-950 dark:text-stone-50 block mt-0.5">
              {formatIDR(Math.max(0, remainingSpending))}
            </span>
          </div>

          <div className="p-2 border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900">
            <span className="text-xs font-bold uppercase text-stone-600 dark:text-stone-400 block">
              Gross Outlay
            </span>
            <span className="font-mono-num font-black text-xs sm:text-sm text-stone-950 dark:text-stone-50 block mt-0.5">
              {formatIDR(summary.totalSpent)}
            </span>
          </div>

          <div className="p-2 border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900">
            <span className="text-xs font-bold uppercase text-stone-600 dark:text-stone-400 block">
              Capital Saved
            </span>
            <span className="font-mono-num font-black text-xs sm:text-sm text-stone-950 dark:text-stone-50 block mt-0.5">
              {formatIDR(summary.savingsSaved)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
