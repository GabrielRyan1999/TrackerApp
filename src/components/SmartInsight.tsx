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
        title: 'Wants Budget Exceeded (30%)',
        message: `Discretionary spending is overbudget by ${formatIDR(over)}. Consider pausing dining out and impulse shopping so your savings remain protected.`,
      };
    }

    // Condition 2: Needs over budget
    if (summary.needsSpent > summary.needsBudget) {
      const over = summary.needsSpent - summary.needsBudget;
      return {
        tone: 'danger' as const,
        title: 'Essential Needs Exceeded (50%)',
        message: `Living essentials exceed 50% by ${formatIDR(over)}. Savings allocation is automatically adjusted to cover essential living costs.`,
      };
    }

    // Condition 3: Wants close to limit (>=80%)
    if (wantsRatio >= 0.8) {
      const remainingWants = summary.wantsBudget - summary.wantsSpent;
      return {
        tone: 'warning' as const,
        title: `Wants Nearing Monthly Limit (${Math.round(wantsRatio * 100)}%)`,
        message: `Remaining lifestyle & discretionary quota: ${formatIDR(remainingWants)}. Pace daily expenses to last until the end of the month.`,
      };
    }

    // Condition 4: Savings goal reached & spending healthy
    if (savingsRatio >= 1 && needsRatio <= 0.9 && wantsRatio <= 0.8) {
      return {
        tone: 'success' as const,
        title: 'Excellent Financial Health',
        message: `Your 20% savings target (${formatIDR(summary.savingsBudget)}) is fully secured, and daily spending is well disciplined. Safe-to-spend balance: ${formatIDR(remainingSpending)}.`,
      };
    }

    // Condition 5: Normal healthy state
    return {
      tone: 'neutral' as const,
      title: 'Balanced Budget Flow (50/30/20)',
      message: `Total spending is at ${Math.round(totalSpendBudget > 0 ? (summary.totalSpent / totalSpendBudget) * 100 : 0)}%. Safe-to-spend balance remaining: ${formatIDR(Math.max(0, remainingSpending))}.`,
    };
  }, [summary]);

  const styleMap = {
    success: {
      bar: 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20',
      dot: 'bg-emerald-500 shadow-emerald-500/40 shadow-xs',
      title: 'text-emerald-900 dark:text-emerald-200',
      text: 'text-emerald-800/80 dark:text-emerald-300/80',
    },
    warning: {
      bar: 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20',
      dot: 'bg-amber-500 shadow-amber-500/40 shadow-xs',
      title: 'text-amber-950 dark:text-amber-200',
      text: 'text-amber-900/80 dark:text-amber-300/80',
    },
    danger: {
      bar: 'border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20',
      dot: 'bg-rose-500 shadow-rose-500/40 shadow-xs',
      title: 'text-rose-950 dark:text-rose-200',
      text: 'text-rose-900/80 dark:text-rose-300/80',
    },
    neutral: {
      bar: 'border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0f172a]',
      dot: 'bg-emerald-500 shadow-emerald-500/40 shadow-xs',
      title: 'text-slate-900 dark:text-white',
      text: 'text-slate-600 dark:text-slate-400',
    },
  };

  const currentStyle = styleMap[insight.tone];

  return (
    <div
      className={`border rounded-2xl p-4 transition-all duration-300 flex items-start gap-3.5 shadow-xs ${currentStyle.bar}`}
    >
      <div className="mt-1 shrink-0">
        <span className={`block w-2.5 h-2.5 rounded-full ${currentStyle.dot}`} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className={`text-xs font-bold ${currentStyle.title} leading-tight`}>
          {insight.title}
        </h3>
        <p className={`text-xs ${currentStyle.text} mt-1 leading-relaxed`}>
          {insight.message}
        </p>
      </div>
    </div>
  );
};
