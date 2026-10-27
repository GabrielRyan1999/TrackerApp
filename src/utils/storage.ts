import type { Transaction, MonthPlan, Category, Settings } from '../types/budget';
import { DEFAULT_CATEGORIES } from './categorizer';

const STORAGE_KEY_PREFIX = 'budget_tracker_503020_';

export interface AppData {
  plans: Record<string, MonthPlan>; // keyed by "yyyy-mm"
  transactions: Transaction[];
  categories: Category[];
  settings: Settings;
}

const DEFAULT_SETTINGS: Settings = {
  currency: 'IDR',
  locale: 'id-ID',
  split: {
    needs: 50,
    wants: 30,
    savings: 20,
  },
  merchantMemory: {
    'janji jiwa': 'dining',
    'mie gacoan': 'dining',
    'kopi kenangan': 'dining',
    'starbucks': 'dining',
  },
  theme: 'system',
};

const SEED_MONTH = '2026-10';

const SEED_PLAN: MonthPlan = {
  month: SEED_MONTH,
  income: 10_000_000, // 10 Juta IDR
  split: { needs: 50, wants: 30, savings: 20 },
};

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    date: '2026-10-01',
    description: 'Monthly Salary',
    amount: 10_000_000,
    type: 'income',
    categoryId: null,
    autoCategorized: false,
    note: 'Payroll deposit',
  },
  {
    id: 'tx-2',
    date: '2026-10-02',
    description: 'Room Rental & Housing',
    amount: 2_000_000,
    type: 'expense',
    categoryId: 'housing',
    autoCategorized: true,
  },
  {
    id: 'tx-3',
    date: '2026-10-03',
    description: 'Weekly Groceries (Indomaret)',
    amount: 350_000,
    type: 'expense',
    categoryId: 'groceries',
    autoCategorized: true,
  },
  {
    id: 'tx-4',
    date: '2026-10-05',
    description: 'PLN Electricity Token',
    amount: 250_000,
    type: 'expense',
    categoryId: 'utilities',
    autoCategorized: true,
  },
  {
    id: 'tx-5',
    date: '2026-10-06',
    description: 'Pertamax Fuel',
    amount: 150_000,
    type: 'expense',
    categoryId: 'transport',
    autoCategorized: true,
  },
  {
    id: 'tx-6',
    date: '2026-10-08',
    description: 'Gojek Ride to Office',
    amount: 45_000,
    type: 'expense',
    categoryId: 'transport',
    autoCategorized: true,
  },
  {
    id: 'tx-7',
    date: '2026-10-10',
    description: 'KFC Lunch & Coffee',
    amount: 120_000,
    type: 'expense',
    categoryId: 'dining',
    autoCategorized: true,
  },
  {
    id: 'tx-8',
    date: '2026-10-12',
    description: 'Netflix & Spotify Subs',
    amount: 240_000,
    type: 'expense',
    categoryId: 'entertainment',
    autoCategorized: true,
  },
  {
    id: 'tx-9',
    date: '2026-10-15',
    description: 'Bibit Money Market Mutual Fund',
    amount: 1_200_000,
    type: 'savings',
    categoryId: 'investments',
    autoCategorized: true,
  },
  {
    id: 'tx-10',
    date: '2026-10-18',
    description: 'Uniqlo Casual Shirt',
    amount: 399_000,
    type: 'expense',
    categoryId: 'shopping',
    autoCategorized: true,
  },
  {
    id: 'tx-11',
    date: '2026-10-20',
    description: 'Emergency Fund Savings Deposit',
    amount: 500_000,
    type: 'savings',
    categoryId: 'savings',
    autoCategorized: true,
  },
  {
    id: 'tx-12',
    date: '2026-10-22',
    description: 'Pharmacy - Vitamins',
    amount: 85_000,
    type: 'expense',
    categoryId: 'healthcare',
    autoCategorized: true,
  },
];

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}data`);
    if (raw) {
      const parsed = JSON.parse(raw);
      const loadedCategories: Category[] = (parsed.categories || DEFAULT_CATEGORIES).map((cat: Category) => {
        const defaultMatch = DEFAULT_CATEGORIES.find((d) => d.id === cat.id);
        if (defaultMatch) {
          return {
            ...cat,
            name: defaultMatch.name,
            icon: defaultMatch.icon,
            keywords: Array.from(new Set([...(cat.keywords || []), ...(defaultMatch.keywords || [])])),
          };
        }
        return cat;
      });

      return {
        plans: parsed.plans || { [SEED_MONTH]: SEED_PLAN },
        transactions: parsed.transactions || SEED_TRANSACTIONS,
        categories: loadedCategories,
        settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      };
    }
  } catch (err) {
    console.error('Error loading stored budget data:', err);
  }

  // Return initial seed data
  return {
    plans: { [SEED_MONTH]: SEED_PLAN },
    transactions: SEED_TRANSACTIONS,
    categories: DEFAULT_CATEGORIES,
    settings: DEFAULT_SETTINGS,
  };
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}data`, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving budget data:', err);
  }
}

export function exportToJSON(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `budget-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToCSV(transactions: Transaction[], categories: Category[]): void {
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const headers = ['ID', 'Date', 'Description', 'Amount (IDR)', 'Type', 'Category', 'Bucket', 'Auto Categorized', 'Note'];
  
  const rows = transactions.map((t) => {
    const cat = t.categoryId ? catMap.get(t.categoryId) : null;
    return [
      t.id,
      t.date,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.amount,
      t.type,
      `"${cat ? cat.name : 'Uncategorized'}"`,
      cat ? cat.bucket : 'none',
      t.autoCategorized ? 'Yes' : 'No',
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
