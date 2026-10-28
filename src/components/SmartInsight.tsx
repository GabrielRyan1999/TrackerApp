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
        headline: `DISCRETIONARY DEFICIT: WANTS EXCEED BUDGETARY LIMIT BY ${formatIDR(over)}`,
        subhead: 'Household lifestyle outlays outpace 30% quota, demanding immediate expenditure halt.',
        status: 'DEFICIT ALERT',
        message: `Discretionary expenditures have exceeded the allocated 30% ceiling by ${formatIDR(over)}. To maintain the inviolability of your capital savings, financial discipline recommends pausing dining and non-essential commerce.`,
      };
    }

    // Condition 2: Needs over budget
    if (summary.needsSpent > summary.needsBudget) {
      const over = summary.needsSpent - summary.needsBudget;
      return {
        tone: 'danger' as const,
        headline: `ESSENTIAL LIVING COSTS SURPASS 50% CEILING BY ${formatIDR(over)}`,
        subhead: 'Unprecedented grocery or utility obligations squeeze discretionary and reserve capacity.',
        status: 'CEILING BREACH',
        message: `Living necessities have surged ${formatIDR(over)} beyond planned thresholds. Under standard 50/30/20 mechanics, excess obligations automatically drain from secondary allocations to safeguard solvency.`,
      };
    }

    // Condition 3: Wants close to limit (>=80%)
    if (wantsRatio >= 0.8) {
      const remainingWants = summary.wantsBudget - summary.wantsSpent;
      return {
        tone: 'warning' as const,
        headline: `LIFESTYLE QUOTA APPARATUS APPROACHES CRITICAL LIMIT (${Math.round(wantsRatio * 100)}%)`,
        subhead: `A narrow surplus of ${formatIDR(remainingWants)} remains for discretionary recreation this month.`,
        status: 'CAUTION ADV.',
        message: `With ${Math.round(wantsRatio * 100)}% of lifestyle funding exhausted, prudent pacing is strongly advised across all non-essential merchant purchases until the arrival of the subsequent monthly deposit.`,
      };
    }

    // Condition 4: Savings goal reached & spending healthy
    if (savingsRatio >= 1 && needsRatio <= 0.9 && wantsRatio <= 0.8) {
      return {
        tone: 'success' as const,
        headline: `FISCAL TRIUMPH: 20% SAVINGS TARGET SECURED AS OPERATING COSTS HOLD`,
        subhead: `Complete ${formatIDR(summary.savingsBudget)} capital reserve transferred into liquid savings and investments.`,
        status: 'FULLY FUNDED',
        message: `The treasury reports robust financial health. Full statutory 20% savings have been safely archived, while operating outlays preserve a resilient cushion of ${formatIDR(remainingSpending)}.`,
      };
    }

    // Condition 5: Normal healthy state
    return {
      tone: 'neutral' as const,
      headline: `FINANCIAL EQUILIBRIUM: 50/30/20 ALLOCATION REMAINS STEADY`,
      subhead: `Total monthly outlays stand at ${Math.round(totalSpendBudget > 0 ? (summary.totalSpent / totalSpendBudget) * 100 : 0)}% of the operating budget ceiling.`,
      status: 'EQUILIBRIUM',
      message: `The ongoing accounts exhibit disciplined adherence to the standard tripartite financial doctrine. An available operating balance of ${formatIDR(Math.max(0, remainingSpending))} remains at your command.`,
    };
  }, [summary]);

  const totalSpendBudget = summary.needsBudget + summary.wantsBudget;
  const remainingSpending = totalSpendBudget - summary.totalSpent;

  return (
    <article className="border-b border-stone-900 dark:border-stone-400 pb-4 mb-4">
      {/* Front Page Lead Headline (Reference Image 1: Top Story Headline) */}
      <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-stone-950 dark:text-stone-50 leading-[1.1] mb-1.5">
        {insight.headline}
      </h2>
      <p className="font-editorial italic text-sm sm:text-base text-stone-700 dark:text-stone-300 mb-3 border-b border-stone-300 dark:border-stone-700 pb-2">
        {insight.subhead}
      </p>

      {/* Story Column + Boxed "NEWS TODAY" Bulletin side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Left Column: Story with Dropcap */}
        <div className="md:col-span-8 text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed text-justify">
          <p className="newspaper-dropcap">
            {insight.message}
          </p>
        </div>

        {/* Right Column: Boxed "DISPATCH TODAY" (Reference Image 1: NEWS TODAY Box) */}
        <div className="md:col-span-4 border border-stone-900 dark:border-stone-400 bg-stone-100/70 dark:bg-stone-900/50 p-2.5 sm:p-3">
          <div className="flex items-center justify-between border-b border-stone-900 dark:border-stone-400 pb-1 mb-2">
            <span className="font-headline font-bold text-xs uppercase tracking-wider text-stone-900 dark:text-stone-100">
              DISPATCH TODAY
            </span>
            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 border ${
              insight.tone === 'danger'
                ? 'border-red-800 text-red-800 dark:text-red-400'
                : insight.tone === 'warning'
                ? 'border-amber-800 text-amber-800 dark:text-amber-400'
                : 'border-stone-900 dark:border-stone-300 text-stone-900 dark:text-stone-100'
            }`}>
              {insight.status}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-baseline justify-between border-b border-dashed border-stone-300 dark:border-stone-700 pb-1">
              <span className="text-stone-600 dark:text-stone-400 text-[11px]">Safe to Spend:</span>
              <span className="font-mono-num font-bold text-stone-900 dark:text-stone-100">
                {formatIDR(Math.max(0, remainingSpending))}
              </span>
            </div>
            <div className="flex items-baseline justify-between border-b border-dashed border-stone-300 dark:border-stone-700 pb-1">
              <span className="text-stone-600 dark:text-stone-400 text-[11px]">Gross Outlay:</span>
              <span className="font-mono-num font-bold text-stone-900 dark:text-stone-100">
                {formatIDR(summary.totalSpent)}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-stone-600 dark:text-stone-400 text-[11px]">Savings Secured:</span>
              <span className="font-mono-num font-bold text-stone-900 dark:text-stone-100">
                {formatIDR(summary.savingsSaved)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
