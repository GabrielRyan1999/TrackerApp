import type { MonthPlan, Transaction, Category, BudgetSummary } from '../types/budget';

/**
 * 50/30/20 split with remainder going to savings so total always equals income.
 */
export function buildPlan(
  income: number,
  split = { needs: 50, wants: 30, savings: 20 }
): { needs: number; wants: number; savings: number; total: number } {
  if (income <= 0 || isNaN(income)) {
    return { needs: 0, wants: 0, savings: 0, total: 0 };
  }

  const needs = Math.round((income * split.needs) / 100);
  const wants = Math.round((income * split.wants) / 100);
  const savings = income - needs - wants;

  return {
    needs,
    wants,
    savings,
    total: needs + wants + savings, // strictly equals income
  };
}

/**
 * Calculates budget status, spending per bucket, per category, and remaining amount.
 */
export function calculateMonthBudget(
  monthPlan: MonthPlan,
  transactions: Transaction[],
  categories: Category[]
): BudgetSummary {
  const plan = buildPlan(monthPlan.income, monthPlan.split);
  const monthPrefix = monthPlan.month; // e.g. "2026-10"

  const monthTx = transactions.filter((t) => t.date.startsWith(monthPrefix));

  let needsSpent = 0;
  let wantsSpent = 0;
  let savingsSaved = 0;
  let uncategorizedCount = 0;
  const categorySpent: Record<string, number> = {};

  const categoryMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

  for (const tx of monthTx) {
    if (tx.type === 'income') {
      // Income transactions add to cash inflow, but do not count as bucket spending
      continue;
    }

    if (!tx.categoryId || tx.categoryId === 'uncategorized') {
      uncategorizedCount++;
      // As per Section 8: Uncategorized items are excluded from bucket totals until categorized
      categorySpent['uncategorized'] = (categorySpent['uncategorized'] || 0) + tx.amount;
      continue;
    }

    const cat = categoryMap.get(tx.categoryId);
    const bucket = tx.type === 'savings' ? 'savings' : cat ? cat.bucket : 'needs';

    if (bucket === 'needs') {
      needsSpent += tx.amount;
    } else if (bucket === 'wants') {
      wantsSpent += tx.amount;
    } else if (bucket === 'savings') {
      savingsSaved += tx.amount;
    }

    categorySpent[tx.categoryId] = (categorySpent[tx.categoryId] || 0) + tx.amount;
  }

  const totalSpent = needsSpent + wantsSpent;
  const remainingToSpend = (plan.needs + plan.wants) - totalSpent;

  const needsPercent = plan.needs > 0 ? (needsSpent / plan.needs) * 100 : 0;
  const wantsPercent = plan.wants > 0 ? (wantsSpent / plan.wants) * 100 : 0;
  const savingsPercent = plan.savings > 0 ? (savingsSaved / plan.savings) * 100 : 0;

  return {
    income: monthPlan.income,
    needsBudget: plan.needs,
    wantsBudget: plan.wants,
    savingsBudget: plan.savings,
    needsSpent,
    wantsSpent,
    savingsSaved,
    totalSpent,
    remainingToSpend,
    needsPercent,
    wantsPercent,
    savingsPercent,
    categorySpent,
    uncategorizedCount,
  };
}
