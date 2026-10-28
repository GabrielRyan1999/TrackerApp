import React, { useMemo } from 'react';
import type { BudgetSummary } from '../types/budget';
import { formatIDR } from '../utils/idr';

interface SmartInsightProps {
  summary: BudgetSummary;
}

export const SmartInsight: React.FC<SmartInsightProps> = ({ summary }) => {
  const insight = useMemo(() => {
    const needsRatio = summary.needsBudget > 0 ? summary.needsSpent / summary.needsBudget : 0;
    const wantsRatio = summary.wantsBudget > 0 ? summary.wantsSpent / summary.wantsBudget : 0;
    const savingsRatio = summary.savingsBudget > 0 ? summary.savingsSaved / summary.savingsBudget : 0;

    // Condition 1: Wants over budget
    if (summary.wantsSpent > summary.wantsBudget) {
      const over = summary.wantsSpent - summary.wantsBudget;
      return {
        tone: 'danger' as const,
        headline: `Wants Over Budget by ${formatIDR(over)}`,
        subhead: 'Lifestyle spending has exceeded your 30% limit for this month.',
        status: 'OVER BUDGET',
      };
    }

    // Condition 2: Needs over budget
    if (summary.needsSpent > summary.needsBudget) {
      const over = summary.needsSpent - summary.needsBudget;
      return {
        tone: 'danger' as const,
        headline: `Needs Over Budget by ${formatIDR(over)}`,
        subhead: 'Essential living expenses have exceeded your 50% limit for this month.',
        status: 'OVER BUDGET',
      };
    }

    // Condition 3: Wants close to limit (>=80%)
    if (wantsRatio >= 0.8) {
      const remainingWants = summary.wantsBudget - summary.wantsSpent;
      return {
        tone: 'warning' as const,
        headline: `Wants Near Limit (${Math.round(wantsRatio * 100)}%)`,
        subhead: `${formatIDR(remainingWants)} remaining for discretionary spending.`,
        status: 'NEAR LIMIT',
      };
    }

    // Condition 4: Savings goal reached & spending healthy
    if (savingsRatio >= 1 && needsRatio <= 0.9 && wantsRatio <= 0.8) {
      return {
        tone: 'success' as const,
        headline: 'Savings Target Reached',
        subhead: `${formatIDR(summary.savingsBudget)} allocated to savings this month.`,
        status: 'ON TARGET',
      };
    }

    // Condition 5: Normal healthy state
    return {
      tone: 'neutral' as const,
      headline: 'Budget On Track',
      subhead: `Spending is within your planned 50/30/20 allocation.`,
      status: 'ON TRACK',
    };
  }, [summary]);

  const totalSpendBudget = summary.needsBudget + summary.wantsBudget;
  const remainingSpending = totalSpendBudget - summary.totalSpent;

  return (
    <article className="border-2 border-stone-900 dark:border-stone-400 bg-stone-100/40 dark:bg-stone-900/30 p-3.5 sm:p-5 h-full flex flex-col justify-between">
      <div>
        {/* Header Status */}
        <div className="flex items-center justify-between border-b border-stone-900 dark:border-stone-400 pb-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
            Monthly Overview
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

        {/* Lead Headline & Description */}
        <h2 className="font-headline text-lg sm:text-2xl font-black uppercase tracking-tight text-stone-950 dark:text-stone-50 leading-tight mb-1.5">
          {insight.headline}
        </h2>
        <p className="font-editorial italic text-xs sm:text-sm text-stone-700 dark:text-stone-300 mb-3 max-w-[55ch]">
          {insight.subhead}
        </p>
      </div>

      {/* Quick Figures Table */}
      <div className="border-t border-stone-900 dark:border-stone-400 pt-2.5 mt-2">
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
              Total Spent
            </span>
            <span className="font-mono-num font-black text-xs sm:text-sm text-stone-950 dark:text-stone-50 block mt-0.5">
              {formatIDR(summary.totalSpent)}
            </span>
          </div>

          <div className="p-2 border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900">
            <span className="text-xs font-bold uppercase text-stone-600 dark:text-stone-400 block">
              Total Saved
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
