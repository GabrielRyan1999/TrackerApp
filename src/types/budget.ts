export type Bucket = 'needs' | 'wants' | 'savings';

export type TransactionType = 'expense' | 'income' | 'savings';

export interface Category {
  id: string;
  name: string;
  bucket: Bucket;
  icon: string;      // emoji or icon name
  color: string;     // hex color used in gauge and progress bars
  keywords: string[];
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  date: string;          // ISO yyyy-mm-dd
  description: string;
  merchant?: string;
  amount: number;        // integer IDR, always positive
  type: TransactionType;
  categoryId: string | null;
  autoCategorized: boolean;
  note?: string;
}

export interface MonthPlan {
  month: string;         // e.g. "2026-10"
  income: number;        // integer IDR
  split: {
    needs: number;       // default 50
    wants: number;       // default 30
    savings: number;     // default 20
  };
  categoryBudgets?: Record<string, number>;
}

export interface Settings {
  currency: 'IDR';
  locale: 'id-ID';
  split: {
    needs: number;
    wants: number;
    savings: number;
  };
  merchantMemory: Record<string, string>; // lowercase merchant -> categoryId
  theme: 'light' | 'dark' | 'system';
}

export interface BudgetSummary {
  income: number;
  needsBudget: number;
  wantsBudget: number;
  savingsBudget: number;
  
  needsSpent: number;
  wantsSpent: number;
  savingsSaved: number;
  
  totalSpent: number;
  remainingToSpend: number;
  
  needsPercent: number;
  wantsPercent: number;
  savingsPercent: number;
  
  categorySpent: Record<string, number>;
  uncategorizedCount: number;
}
