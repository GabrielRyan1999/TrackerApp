import React, { useState } from 'react';
import type { Transaction, Category, Bucket } from '../types/budget';
import { formatIDR } from '../utils/idr';
import { CategoryIcon } from './CategoryIcon';
import { Search, Trash2, AlertCircle, Pencil } from 'lucide-react';
import { EditTransactionModal } from './EditTransactionModal';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  currentMonth: string;
  onDeleteTransaction: (id: string) => void;
  onRecategorizeTransaction: (id: string, newCategoryId: string, remember: boolean) => void;
  onUpdateTransaction: (updatedTx: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  currentMonth,
  onDeleteTransaction,
  onRecategorizeTransaction,
  onUpdateTransaction,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | Bucket | 'review'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTxForReview, setSelectedTxForReview] = useState<Transaction | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const catMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

  const monthTransactions = transactions.filter((t) => t.date.startsWith(currentMonth));

  const uncategorizedCount = monthTransactions.filter(
    (t) => (!t.categoryId || t.categoryId === 'uncategorized') && t.type !== 'income'
  ).length;

  let filtered = monthTransactions.filter((t) => {
    if (filterTab === 'all') return true;
    if (filterTab === 'review') {
      return (!t.categoryId || t.categoryId === 'uncategorized') && t.type !== 'income';
    }
    if (filterTab === 'savings') {
      if (t.type === 'savings') return true;
      const cat = t.categoryId ? catMap.get(t.categoryId) : null;
      return cat?.bucket === 'savings';
    }
    const cat = t.categoryId ? catMap.get(t.categoryId) : null;
    return cat?.bucket === filterTab && t.type !== 'income';
  });

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        (t.note && t.note.toLowerCase().includes(q)) ||
        (t.categoryId && catMap.get(t.categoryId)?.name.toLowerCase().includes(q))
    );
  }

  filtered.sort((a, b) => b.date.localeCompare(a.date));

  const filteredTotal = filtered.reduce((acc, t) => {
    if (t.type === 'expense' || t.type === 'savings') return acc + t.amount;
    return acc;
  }, 0);

  const groupedByDate: Record<string, Transaction[]> = {};
  for (const tx of filtered) {
    if (!groupedByDate[tx.date]) groupedByDate[tx.date] = [];
    groupedByDate[tx.date].push(tx);
  }

  return (
    <section className="border-2 border-stone-900 dark:border-stone-400 bg-stone-100/40 dark:bg-stone-900/30 p-3.5 sm:p-5">
      {/* Editorial Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b-2 border-stone-900 dark:border-stone-400 pb-3 mb-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-stone-600 dark:text-stone-400 block">
            THE PUBLIC RECORD • SECTION V.
          </span>
          <h3 className="font-headline text-lg sm:text-2xl font-black uppercase text-stone-950 dark:text-stone-50 leading-tight">
            Financial Dispatches & Ledger Entries
          </h3>
          <p className="text-xs italic text-stone-600 dark:text-stone-400 mt-0.5">
            Verified chronological log of all mercantile transactions recorded for {currentMonth}
          </p>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-1 border border-stone-900 dark:border-stone-400 bg-stone-200/80 dark:bg-stone-800/80 p-0.5 text-xs font-bold uppercase tracking-wider overflow-x-auto">
          <button
            onClick={() => setFilterTab('all')}
            className={`min-h-[32px] px-2.5 sm:px-3 py-1 transition whitespace-nowrap text-[11px] ${
              filterTab === 'all'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
            }`}
          >
            All ({monthTransactions.length})
          </button>
          <button
            onClick={() => setFilterTab('needs')}
            className={`min-h-[32px] px-2.5 sm:px-3 py-1 transition whitespace-nowrap text-[11px] ${
              filterTab === 'needs'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
            }`}
          >
            Needs (50%)
          </button>
          <button
            onClick={() => setFilterTab('wants')}
            className={`min-h-[32px] px-2.5 sm:px-3 py-1 transition whitespace-nowrap text-[11px] ${
              filterTab === 'wants'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
            }`}
          >
            Wants (30%)
          </button>
          <button
            onClick={() => setFilterTab('savings')}
            className={`min-h-[32px] px-2.5 sm:px-3 py-1 transition whitespace-nowrap text-[11px] ${
              filterTab === 'savings'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
            }`}
          >
            Savings (20%)
          </button>
          <button
            onClick={() => setFilterTab('review')}
            className={`min-h-[32px] px-2.5 sm:px-3 py-1 transition flex items-center gap-1 whitespace-nowrap text-[11px] ${
              filterTab === 'review'
                ? 'bg-amber-800 text-white dark:bg-amber-400 dark:text-stone-950'
                : 'text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/40'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Review</span>
            {uncategorizedCount > 0 && (
              <span className="font-mono-num font-black ml-0.5">({uncategorizedCount})</span>
            )}
          </button>
        </div>
      </div>

      {/* Query Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-300 dark:border-stone-700 pb-3 mb-4 text-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-500 dark:text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH PUBLIC RECORD (BY MERCHANT, PURPOSE, OR NOTE)..."
            className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-900 dark:border-stone-400 text-xs font-mono-num text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
          />
        </div>
        <div className="flex items-center justify-between sm:justify-start gap-2 py-1 shrink-0 text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
          <span>Entries: <strong className="text-stone-950 dark:text-stone-50 font-black">{filtered.length}</strong></span>
          <span>•</span>
          <span>Sum: <strong className="font-mono-num text-stone-950 dark:text-stone-50">{formatIDR(filteredTotal)}</strong></span>
        </div>
      </div>

      {/* Grouped Classifieds Entries */}
      {Object.keys(groupedByDate).length === 0 ? (
        <div className="py-12 text-center border border-dashed border-stone-400 dark:border-stone-600 p-6 space-y-1">
          <div className="font-headline font-bold text-sm uppercase text-stone-700 dark:text-stone-300">
            No Dispatches Found Matching Specification
          </div>
          <p className="text-xs italic text-stone-500 dark:text-stone-400">
            Verify active keyword search queries or select an alternate allocation category tab.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByDate).map(([date, txs]) => {
            const dateObj = new Date(date);
            const dateLabel = dateObj.toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });

            return (
              <div key={date} className="space-y-1.5">
                {/* Print Dateline Divider */}
                <div className="text-xs font-bold uppercase tracking-widest text-stone-700 dark:text-stone-300 border-b border-stone-900 dark:border-stone-400 pb-1 flex items-center justify-between">
                  <span>DISPATCHES OF {dateLabel.toUpperCase()}</span>
                  <span className="font-mono-num text-stone-500 dark:text-stone-400">{txs.length} RECORD(S)</span>
                </div>

                {/* Rows in Classified Table style */}
                <div className="divide-y divide-stone-300 dark:divide-stone-700">
                  {txs.map((tx) => {
                    const cat = tx.categoryId ? catMap.get(tx.categoryId) : null;
                    const isIncome = tx.type === 'income';
                    const isSavings = tx.type === 'savings';
                    const isUncategorized = !cat && !isIncome;

                    return (
                      <div
                        key={tx.id}
                        className="py-2.5 px-1 sm:px-2 flex items-center justify-between gap-3 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition"
                      >
                        {/* Left: Icon, Description, Category Tag */}
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 flex items-center justify-center border border-stone-900 dark:border-stone-400 bg-stone-200 dark:bg-stone-800 shrink-0">
                            {isIncome ? (
                              <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">IN</span>
                            ) : (
                              <CategoryIcon name={cat?.icon || '❓'} className="text-base" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs sm:text-sm font-bold text-stone-950 dark:text-stone-50 truncate block">
                                {tx.description}
                              </span>
                              {tx.note && (
                                <span className="text-xs italic text-stone-500 dark:text-stone-400 truncate hidden md:inline">
                                  ("{tx.note}")
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                              {isIncome ? (
                                <span className="font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                                  [GROSS REVENUE DEPOSIT]
                                </span>
                              ) : isSavings ? (
                                <span className="font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                                  [CAPITAL RESERVE • {cat?.name || 'SAVINGS'}]
                                </span>
                              ) : isUncategorized ? (
                                <button
                                  onClick={() => setSelectedTxForReview(tx)}
                                  className="font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 hover:underline min-h-[28px] flex items-center"
                                >
                                  ⚠️ [ACTION REQUIRED: CLASSIFY RECORD]
                                </button>
                              ) : (
                                <span className="flex items-center gap-1.5 truncate">
                                  <span className="font-bold uppercase tracking-wider px-1 py-0.2 border border-stone-700 dark:border-stone-400 text-stone-800 dark:text-stone-200">
                                    {cat?.bucket}
                                  </span>
                                  <span className="truncate">{cat?.name}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Amount & Editorial Action Buttons */}
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                          <span
                            className={`font-mono-num text-xs sm:text-sm font-black whitespace-nowrap ${
                              isIncome
                                ? 'text-emerald-800 dark:text-emerald-400'
                                : 'text-stone-950 dark:text-stone-50'
                            }`}
                          >
                            {isIncome ? '+' : '-'}
                            {formatIDR(tx.amount)}
                          </span>

                          {/* Edit button */}
                          <button
                            onClick={() => setEditingTx(tx)}
                            className="w-7 h-7 flex items-center justify-center border border-stone-900 dark:border-stone-400 bg-stone-100 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 transition"
                            title="Edit Record"
                            aria-label="Edit Record"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="w-7 h-7 flex items-center justify-center border border-stone-900 dark:border-stone-400 bg-stone-100 hover:bg-red-100 dark:bg-stone-800 dark:hover:bg-red-950 text-stone-900 hover:text-red-800 dark:text-stone-100 dark:hover:text-red-400 transition"
                            title="Strike Off Record"
                            aria-label="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reference Image 1: Bottom Authentic Newspaper Barcode & Colophon */}
      <div className="border-t-2 border-stone-900 dark:border-stone-400 pt-4 mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Barcode Graphic (Crisp SVG) */}
        <div className="flex items-center gap-3">
          <svg className="h-9 w-32 text-stone-900 dark:text-stone-200" viewBox="0 0 120 36" fill="currentColor">
            <rect x="0" y="0" width="3" height="36" />
            <rect x="5" y="0" width="1" height="36" />
            <rect x="8" y="0" width="4" height="36" />
            <rect x="15" y="0" width="2" height="36" />
            <rect x="19" y="0" width="1" height="36" />
            <rect x="23" y="0" width="3" height="36" />
            <rect x="29" y="0" width="2" height="36" />
            <rect x="34" y="0" width="4" height="36" />
            <rect x="41" y="0" width="1" height="36" />
            <rect x="44" y="0" width="3" height="36" />
            <rect x="50" y="0" width="2" height="36" />
            <rect x="55" y="0" width="5" height="36" />
            <rect x="63" y="0" width="2" height="36" />
            <rect x="67" y="0" width="1" height="36" />
            <rect x="71" y="0" width="3" height="36" />
            <rect x="77" y="0" width="4" height="36" />
            <rect x="84" y="0" width="1" height="36" />
            <rect x="88" y="0" width="2" height="36" />
            <rect x="93" y="0" width="3" height="36" />
            <rect x="99" y="0" width="5" height="36" />
            <rect x="107" y="0" width="2" height="36" />
            <rect x="112" y="0" width="3" height="36" />
            <rect x="117" y="0" width="3" height="36" />
          </svg>
          <div className="text-xs font-mono-num font-bold text-stone-600 dark:text-stone-400 leading-tight">
            <div>SERIAL NO. 8923-503020-JKT</div>
            <div>VERIFIED EDITORIAL RECORD</div>
          </div>
        </div>

        {/* Right: Newspaper Colophon text */}
        <div className="text-xs text-stone-600 dark:text-stone-400 text-center md:text-right font-editorial italic max-w-md">
          "The Daily News • Financial & Domestic Budget Gazette • Jakarta & Regional Press • All accounts preserved in local machine memory • Printed on pure recycled newsprint."
        </div>
      </div>

      {/* Edit Transaction Modal */}
      {editingTx && (
        <EditTransactionModal
          isOpen={Boolean(editingTx)}
          onClose={() => setEditingTx(null)}
          transaction={editingTx}
          onUpdateTransaction={onUpdateTransaction}
          categories={categories}
        />
      )}

      {/* Review Modal */}
      {selectedTxForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-[#f4efe4] dark:bg-[#161513] border-2 border-stone-900 dark:border-stone-400 max-w-sm w-full p-4 sm:p-5 space-y-3.5 shadow-2xl">
            <div className="border-b border-stone-900 dark:border-stone-400 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block">
                EDITORIAL CORRECTION DISPATCH
              </span>
              <h4 className="font-headline text-base font-bold text-stone-950 dark:text-stone-50">
                Classify: "{selectedTxForReview.description}"
              </h4>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                Assign Commodity Category:
              </label>
              <select
                id="reviewCatSelect"
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-900 dark:border-stone-400 text-xs font-bold text-stone-900 dark:text-stone-100"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name} ({c.bucket.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 cursor-pointer pt-1">
              <input type="checkbox" id="reviewRememberCheck" defaultChecked className="rounded-none text-stone-900" />
              <span>Remember merchant memory for future issues</span>
            </label>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-300 dark:border-stone-700">
              <button
                onClick={() => setSelectedTxForReview(null)}
                className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 border border-stone-900 dark:border-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const sel = document.getElementById('reviewCatSelect') as HTMLSelectElement;
                  const chk = document.getElementById('reviewRememberCheck') as HTMLInputElement;
                  if (sel && sel.value) {
                    onRecategorizeTransaction(selectedTxForReview.id, sel.value, chk?.checked || false);
                  }
                  setSelectedTxForReview(null);
                }}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-950 font-bold uppercase tracking-wider text-xs border border-stone-900 dark:border-stone-400"
              >
                Save Classification
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
