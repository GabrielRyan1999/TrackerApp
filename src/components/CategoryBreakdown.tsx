import React, { useState } from 'react';
import type { BudgetSummary, Category, Bucket } from '../types/budget';
import { formatIDR } from '../utils/idr';
import { CategoryIcon } from './CategoryIcon';

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

  return (
    <section className="border-2 border-stone-900 dark:border-stone-400 bg-stone-100/40 dark:bg-stone-900/30 p-3.5 sm:p-5">
      {/* Editorial Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-stone-900 dark:border-stone-400 pb-2.5 mb-3">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-stone-600 dark:text-stone-400 block">
            SECTION IV. — COMMODITY & EXPENDITURE CENSUS
          </span>
          <h3 className="font-headline text-lg sm:text-xl font-black uppercase text-stone-950 dark:text-stone-50 leading-tight">
            Classification of Outflows by Commodity
          </h3>
        </div>
        <div className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 border border-stone-900 dark:border-stone-400 bg-stone-200/70 dark:bg-stone-800/70 text-stone-900 dark:text-stone-100">
          RANKED BY AGGREGATE SPEND
        </div>
      </div>

      {activeCategories.length === 0 ? (
        <div className="py-8 text-center text-xs italic text-stone-500 dark:text-stone-400 border border-dashed border-stone-400 dark:border-stone-600 p-4">
          No mercantile disbursements or commodity expenses have been registered for this issue.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Table Header Bar */}
          <div className="hidden sm:grid sm:grid-cols-12 text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 border-b border-stone-300 dark:border-stone-700 pb-1 px-1">
            <span className="col-span-6">Commodity & Classification Pillar</span>
            <span className="col-span-3 text-center">Share of Total Outflow</span>
            <span className="col-span-3 text-right">Disbursed Sum</span>
          </div>

          {/* List of categories */}
          <div className="divide-y divide-stone-300 dark:divide-stone-700">
            {displayedCategories.map((cat) => {
              const share = totalSpentOrSaved > 0 ? (cat.spent / totalSpentOrSaved) * 100 : 0;
              return (
                <div key={cat.id} className="py-2.5 px-1 flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:items-center">
                  {/* Left: Name and Pillar */}
                  <div className="sm:col-span-6 flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 flex items-center justify-center border border-stone-900 dark:border-stone-400 bg-stone-200 dark:bg-stone-800 shrink-0 text-sm">
                      <CategoryIcon name={cat.icon} className="text-sm" />
                    </div>
                    <div className="min-w-0 flex items-baseline gap-2">
                      <span className="font-bold text-xs sm:text-sm text-stone-950 dark:text-stone-50 truncate">
                        {cat.name}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 border border-stone-700 dark:border-stone-400 text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-900 shrink-0">
                        {cat.bucket}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Progress Meter Bar */}
                  <div className="sm:col-span-3 flex items-center gap-2">
                    <div className="w-full bg-stone-200 dark:bg-stone-800 h-2 border border-stone-900 dark:border-stone-400 p-[1px]">
                      <div
                        className="h-full bg-stone-900 dark:bg-stone-200 transition-all duration-500"
                        style={{ width: `${Math.min(share, 100)}%` }}
                      />
                    </div>
                    <span className="font-mono-num text-[11px] font-bold text-stone-700 dark:text-stone-300 shrink-0 w-9 text-right">
                      {Math.round(share)}%
                    </span>
                  </div>

                  {/* Right: Amount */}
                  <div className="sm:col-span-3 text-right">
                    <span className="font-mono-num text-xs sm:text-sm font-black text-stone-950 dark:text-stone-50">
                      {formatIDR(cat.spent)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show All / Show Less Button */}
          {activeCategories.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full py-2 mt-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 border border-stone-900 dark:border-stone-400 bg-stone-200/70 hover:bg-stone-300 dark:bg-stone-800/80 dark:hover:bg-stone-700 transition"
            >
              <span>{showAll ? '▲ Collapse Commodity Ledger' : `▼ Read Complete Commodity Census (${activeCategories.length} Categories)`}</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
};
