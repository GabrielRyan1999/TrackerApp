import React, { useState } from 'react';
import type { BudgetSummary, Category, Bucket } from '../types/budget';
import { formatIDR } from '../utils/idr';
import { CategoryIcon } from './CategoryIcon';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';

interface CategoryBreakdownProps {
  summary: BudgetSummary;
  categories: Category[];
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ summary, categories }) => {
  const [showAll, setShowAll] = useState(false);

  const catMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

  const activeCategories = Object.entries(summary.categorySpent)
    .map(([catId, spent]) => {
      const cat = catMap.get(catId);
      return {
        id: catId,
        name: cat ? cat.name : catId === 'uncategorized' ? 'Uncategorized' : catId,
        icon: cat ? cat.icon : 'unknown',
        color: cat ? cat.color : '#64748b',
        bucket: (cat ? cat.bucket : 'none') as Bucket | 'none',
        spent,
      };
    })
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  const displayedCategories = showAll ? activeCategories : activeCategories.slice(0, 5);
  const totalSpentOrSaved = summary.totalSpent + summary.savingsSaved;

  const getBucketBadgeStyle = (bucket: Bucket | 'none') => {
    switch (bucket) {
      case 'needs':
        return 'bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800';
      case 'wants':
        return 'bg-pink-50 dark:bg-pink-950/70 text-pink-800 dark:text-pink-200 border-pink-200 dark:border-pink-800';
      case 'savings':
        return 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getIconContainerStyle = (bucket: Bucket | 'none') => {
    switch (bucket) {
      case 'needs':
        return 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'wants':
        return 'bg-pink-50 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800';
      case 'savings':
        return 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 sm:p-6 transition">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Spending by Category
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Expense distribution ranked from highest to lowest
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
          <Layers className="w-4 h-4" />
        </div>
      </div>

      {activeCategories.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          No expense transactions recorded this month
        </div>
      ) : (
        <div className="space-y-3.5 sm:space-y-4">
          {displayedCategories.map((cat) => {
            const share = totalSpentOrSaved > 0 ? (cat.spent / totalSpentOrSaved) * 100 : 0;
            return (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${getIconContainerStyle(
                        cat.bucket
                      )}`}
                    >
                      <CategoryIcon name={cat.icon} className="text-sm" />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                      {cat.name}
                    </span>
                    <span
                      className={`uppercase text-xs font-bold px-1.5 py-0.5 rounded border shrink-0 ${getBucketBadgeStyle(
                        cat.bucket
                      )}`}
                    >
                      {cat.bucket}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {Math.round(share)}%
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                      {formatIDR(cat.spent)}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(share, 100)}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            );
          })}

          {activeCategories.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full py-2.5 mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800/60 rounded-xl transition"
            >
              <span>{showAll ? 'Show Less' : `Show All (${activeCategories.length} Categories)`}</span>
              {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
