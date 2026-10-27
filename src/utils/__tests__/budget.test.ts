import { describe, it, expect } from 'vitest';
import { parseIDR, formatIDR, formatCompactIDR } from '../idr';
import { buildPlan, calculateMonthBudget } from '../calculator';
import { DEFAULT_CATEGORIES, categorize } from '../categorizer';
import type { Transaction, MonthPlan } from '../../types/budget';

describe('Aline Budget Tracker Acceptance Criteria', () => {
  // Criterion 1 & 9: 50/30/20 Math and Rounding Drift
  it('splits Rp 10.000.000 into 5.000.000, 3.000.000, and 2.000.000 with exact sum', () => {
    const plan = buildPlan(10_000_000);
    expect(plan.needs).toBe(5_000_000);
    expect(plan.wants).toBe(3_000_000);
    expect(plan.savings).toBe(2_000_000);
    expect(plan.total).toBe(10_000_000);
  });

  it('allocates rounding remainder to savings so sum strictly equals income', () => {
    const oddIncome = 10_000_001;
    const plan = buildPlan(oddIncome);
    expect(plan.needs + plan.wants + plan.savings).toBe(oddIncome);
  });

  // Criterion 2: Indomaret -> Groceries (Needs)
  it('auto-categorizes "Indomaret Rp 85.000" to Groceries (Needs)', () => {
    const catId = categorize('Indomaret 85000', DEFAULT_CATEGORIES);
    expect(catId).toBe('groceries');
    const cat = DEFAULT_CATEGORIES.find((c) => c.id === catId);
    expect(cat?.bucket).toBe('needs');
  });

  // Criterion 3: Netflix -> Entertainment (Wants)
  it('auto-categorizes "Netflix Rp 186.000" to Entertainment (Wants)', () => {
    const catId = categorize('Netflix Rp 186.000', DEFAULT_CATEGORIES);
    expect(catId).toBe('entertainment');
    const cat = DEFAULT_CATEGORIES.find((c) => c.id === catId);
    expect(cat?.bucket).toBe('wants');
  });

  // Criterion 4: Reksadana -> Investments (Savings)
  it('auto-categorizes "Reksadana Rp 500.000" to Investments (Savings)', () => {
    const catId = categorize('Reksadana Bibit Rp 500.000', DEFAULT_CATEGORIES);
    expect(catId).toBe('investments');
    const cat = DEFAULT_CATEGORIES.find((c) => c.id === catId);
    expect(cat?.bucket).toBe('savings');
  });

  // Criterion 5: Unknown merchant & Merchant Memory
  it('falls back to null (Uncategorized) and uses merchant memory when learned', () => {
    const unknownDesc = 'Bengkel Berkah Jaya 88';
    const initialMatch = categorize(unknownDesc, DEFAULT_CATEGORIES, {});
    expect(initialMatch).toBeNull();

    // User assigns to transportation
    const memory = { [unknownDesc.toLowerCase()]: 'transport' };
    const learnedMatch = categorize(unknownDesc, DEFAULT_CATEGORIES, memory);
    expect(learnedMatch).toBe('transport');
  });

  // Criterion 6: IDR Parser shortcuts and formatters
  it('parses Indonesian shortcut strings like "500rb", "1,5jt", "8.5jt", "8.500.000"', () => {
    expect(parseIDR('500rb')).toBe(500_000);
    expect(parseIDR('500 ribu')).toBe(500_000);
    expect(parseIDR('50k')).toBe(50_000);
    expect(parseIDR('1.5jt')).toBe(1_500_000);
    expect(parseIDR('8,5jt')).toBe(8_500_000);
    expect(parseIDR('8.500.000')).toBe(8_500_000);
    expect(parseIDR('Rp 8.500.000')).toBe(8_500_000);
    expect(parseIDR('8500000')).toBe(8_500_000);
  });

  it('formats IDR without decimals and provides compact format', () => {
    expect(formatIDR(8_500_000)).toMatch(/Rp\s*8\.500\.000/);
    expect(formatCompactIDR(8_500_000)).toBe('Rp 8,5 jt');
    expect(formatCompactIDR(450_000)).toBe('Rp 450 rb');
  });

  // Criterion 7 & 8: Month calculations and summary
  it('correctly calculates month budget spending and bucket rollups', () => {
    const monthPlan: MonthPlan = {
      month: '2026-10',
      income: 10_000_000,
      split: { needs: 50, wants: 30, savings: 20 },
    };

    const transactions: Transaction[] = [
      {
        id: '1',
        date: '2026-10-02',
        description: 'Indomaret',
        amount: 500_000,
        type: 'expense',
        categoryId: 'groceries',
        autoCategorized: true,
      },
      {
        id: '2',
        date: '2026-10-03',
        description: 'Netflix',
        amount: 186_000,
        type: 'expense',
        categoryId: 'entertainment',
        autoCategorized: true,
      },
      {
        id: '3',
        date: '2026-10-05',
        description: 'Bibit Reksadana',
        amount: 1_000_000,
        type: 'savings',
        categoryId: 'investments',
        autoCategorized: true,
      },
      {
        id: '4',
        date: '2026-09-20', // Different month, should be ignored
        description: 'Gojek Sept',
        amount: 100_000,
        type: 'expense',
        categoryId: 'transport',
        autoCategorized: true,
      },
    ];

    const summary = calculateMonthBudget(monthPlan, transactions, DEFAULT_CATEGORIES);

    expect(summary.needsSpent).toBe(500_000);
    expect(summary.wantsSpent).toBe(186_000);
    expect(summary.savingsSaved).toBe(1_000_000);
    expect(summary.totalSpent).toBe(686_000);
    expect(summary.remainingToSpend).toBe(8_000_000 - 686_000);
  });
});
