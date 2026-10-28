import { describe, it, expect } from 'vitest';
import { parseIDR, formatIDR, formatCompactIDR } from '../idr';
import { buildPlan, calculateMonthBudget } from '../calculator';
import { parseCSV } from '../storage';
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

describe('CSV Parser', () => {
  it('parses valid exported CSV correctly', () => {
    const csvData = [
      'ID,Date,Description,Amount (IDR),Type,Category,Bucket,Auto Categorized,Note',
      'tx-1,2026-10-01,"Monthly Salary",10000000,income,"Uncategorized",none,No,"Payroll"',
      'tx-2,2026-10-02,"Weekly Groceries (Indomaret)",350000,expense,"Groceries (Daily Needs)",needs,Yes,""',
    ].join('\n');

    const result = parseCSV(csvData, DEFAULT_CATEGORIES);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('tx-1');
    expect(result[0].date).toBe('2026-10-01');
    expect(result[0].description).toBe('Monthly Salary');
    expect(result[0].amount).toBe(10_000_000);
    expect(result[0].type).toBe('income');
    expect(result[0].note).toBe('Payroll');

    expect(result[1].id).toBe('tx-2');
    expect(result[1].amount).toBe(350_000);
    expect(result[1].categoryId).toBe('groceries');
    expect(result[1].type).toBe('expense');
  });

  it('handles formatted amounts, dates, and auto-categorization', () => {
    const csvData = [
      'Date,Description,Amount,Type',
      '05/10/2026,"Indomaret Snack","Rp 45.000,00",expense',
      '2026-10-10,"Bibit Reksadana",500000,savings',
    ].join('\n');

    const result = parseCSV(csvData, DEFAULT_CATEGORIES);
    expect(result).toHaveLength(2);
    expect(result[0].date).toBe('2026-10-05');
    expect(result[0].amount).toBe(45_000);
    expect(result[0].categoryId).toBe('groceries'); // auto-categorized
    expect(result[1].type).toBe('savings');
    expect(result[1].amount).toBe(500_000);
  });
});

describe('Transaction Editing and Dynamic Recalculation', () => {
  const monthPlan: MonthPlan = {
    month: '2026-10',
    income: 10_000_000,
    split: { needs: 50, wants: 30, savings: 20 },
  };

  const initialTransactions: Transaction[] = [
    {
      id: 'tx-1',
      date: '2026-10-05',
      description: 'Groceries typo',
      amount: 100_000, // Typo: was meant to be 1_000_000
      type: 'expense',
      categoryId: 'groceries', // Needs
      autoCategorized: false,
    },
    {
      id: 'tx-2',
      date: '2026-10-10',
      description: 'Movie Night',
      amount: 200_000,
      type: 'expense',
      categoryId: 'entertainment', // Wants
      autoCategorized: false,
    },
  ];

  it('correctly updates spending and remaining budget when amount typo is edited', () => {
    // 1. Initial calculation
    const initialSummary = calculateMonthBudget(monthPlan, initialTransactions, DEFAULT_CATEGORIES);
    expect(initialSummary.needsSpent).toBe(100_000);
    expect(initialSummary.totalSpent).toBe(300_000);
    expect(initialSummary.remainingToSpend).toBe(8_000_000 - 300_000);

    // 2. Edit tx-1 amount from 100.000 to 1.000.000
    const editedTransactions = initialTransactions.map((tx) =>
      tx.id === 'tx-1' ? { ...tx, amount: 1_000_000, description: 'Groceries Corrected' } : tx
    );

    const updatedSummary = calculateMonthBudget(monthPlan, editedTransactions, DEFAULT_CATEGORIES);
    expect(updatedSummary.needsSpent).toBe(1_000_000);
    expect(updatedSummary.totalSpent).toBe(1_200_000);
    expect(updatedSummary.remainingToSpend).toBe(8_000_000 - 1_200_000);
    expect(updatedSummary.categorySpent['groceries']).toBe(1_000_000);
  });

  it('correctly shifts buckets when a transaction category or type is edited', () => {
    // Edit tx-2 from Entertainment (Wants) to Investments (Savings)
    const editedTransactions = initialTransactions.map((tx) =>
      tx.id === 'tx-2' ? { ...tx, type: 'savings' as const, categoryId: 'investments', amount: 500_000 } : tx
    );

    const updatedSummary = calculateMonthBudget(monthPlan, editedTransactions, DEFAULT_CATEGORIES);
    expect(updatedSummary.wantsSpent).toBe(0);
    expect(updatedSummary.savingsSaved).toBe(500_000);
    expect(updatedSummary.needsSpent).toBe(100_000);
    expect(updatedSummary.totalSpent).toBe(100_000); // only needs + wants count as spent
  });
});
