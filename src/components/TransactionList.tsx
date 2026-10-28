import React, { useState } from 'react';
import type { Transaction, Category, Bucket } from '../types/budget';
import { formatIDR } from '../utils/idr';
import { CategoryIcon } from './CategoryIcon';
import { Search, Trash2, AlertCircle, ArrowUpRight, Pencil } from 'lucide-react';
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

  const getIconContainerStyle = (bucket: Bucket | 'none', isIncome: boolean) => {
    if (isIncome) {
      return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800';
    }
    switch (bucket) {
      case 'needs':
        return 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'wants':
        return 'bg-pink-50 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800';
      case 'savings':
        return 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800';
    }
  };

  return (
    <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 sm:p-6 transition">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 sm:mb-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Transaction History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Spending & savings record for {currentMonth}
          </p>
        </div>

        {/* Filter Tabs with horizontal scrolling */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setFilterTab('all')}
            className={`min-h-[36px] px-3 sm:px-3.5 py-1.5 rounded-lg transition shrink-0 whitespace-nowrap ${
              filterTab === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({monthTransactions.length})
          </button>
          <button
            onClick={() => setFilterTab('needs')}
            className={`min-h-[36px] px-3 sm:px-3.5 py-1.5 rounded-lg transition shrink-0 whitespace-nowrap ${
              filterTab === 'needs'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Needs (50%)
          </button>
          <button
            onClick={() => setFilterTab('wants')}
            className={`min-h-[36px] px-3 sm:px-3.5 py-1.5 rounded-lg transition shrink-0 whitespace-nowrap ${
              filterTab === 'wants'
                ? 'bg-pink-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Wants (30%)
          </button>
          <button
            onClick={() => setFilterTab('savings')}
            className={`min-h-[36px] px-3 sm:px-3.5 py-1.5 rounded-lg transition shrink-0 whitespace-nowrap ${
              filterTab === 'savings'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Savings (20%)
          </button>
          <button
            onClick={() => setFilterTab('review')}
            className={`min-h-[36px] px-3 sm:px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              filterTab === 'review'
                ? 'bg-amber-600 text-white shadow-xs font-bold'
                : 'text-amber-800 dark:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-950/40'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>Review</span>
            {uncategorizedCount > 0 && (
              <span className="text-xs bg-amber-700 text-white px-2 py-0.5 rounded-full font-bold">
                {uncategorizedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search Input Bar with live filter metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 sm:mb-5 text-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions by merchant, description, or note..."
            className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-center justify-between sm:justify-start gap-2 py-1 shrink-0 text-slate-600 dark:text-slate-400">
          <span>
            Showing <strong className="text-slate-900 dark:text-white font-bold">{filtered.length}</strong> transactions
          </span>
          <span>•</span>
          <span className="font-extrabold text-slate-900 dark:text-white">{formatIDR(filteredTotal)}</span>
        </div>
      </div>

      {/* Flattened Transactions List */}
      {Object.keys(groupedByDate).length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            No matching transactions found
          </div>
          <p className="text-xs text-slate-400">
            Try adjusting your search query or changing active filters
          </p>
        </div>
      ) : (
        <div className="space-y-5 sm:space-y-6">
          {Object.entries(groupedByDate).map(([date, txs]) => {
            const dateObj = new Date(date);
            const dateLabel = dateObj.toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });

            return (
              <div key={date} className="space-y-1">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 px-1 border-b border-slate-100 dark:border-slate-800/80 pb-1.5">
                  {dateLabel}
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
                  {txs.map((tx) => {
                    const cat = tx.categoryId ? catMap.get(tx.categoryId) : null;
                    const isIncome = tx.type === 'income';
                    const isSavings = tx.type === 'savings';
                    const isUncategorized = !cat && !isIncome;
                    const bucket = (cat?.bucket || 'none') as Bucket | 'none';

                    return (
                      <div
                        key={tx.id}
                        className="py-3 px-1.5 sm:px-2 flex items-center justify-between gap-2.5 sm:gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition rounded-xl"
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                          <div
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border ${getIconContainerStyle(
                              bucket,
                              isIncome
                            )}`}
                          >
                            {isIncome ? (
                              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <CategoryIcon name={cat?.icon || '❓'} className="text-lg sm:text-xl" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate block">
                                {tx.description}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {isIncome ? (
                                <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                                  Income
                                </span>
                              ) : isSavings ? (
                                <span className="font-semibold text-emerald-700 dark:text-emerald-300 truncate">
                                  Savings • {cat?.name || 'Savings Deposit'}
                                </span>
                              ) : isUncategorized ? (
                                <button
                                  onClick={() => setSelectedTxForReview(tx)}
                                  className="font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1 min-h-[28px]"
                                >
                                  ⚠️ Assign Category Now
                                </button>
                              ) : (
                                <span className="flex items-center gap-1.5 truncate">
                                  <span
                                    className={`font-bold uppercase text-xs px-1.5 py-0.5 rounded border shrink-0 ${getBucketBadgeStyle(
                                      bucket
                                    )}`}
                                  >
                                    {cat?.bucket}
                                  </span>
                                  <span className="truncate">{cat?.name}</span>
                                </span>
                              )}

                              {tx.note && <span className="truncate hidden sm:inline">• {tx.note}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                          <span
                            className={`text-xs sm:text-sm font-bold whitespace-nowrap ${
                              isIncome
                                ? 'text-emerald-700 dark:text-emerald-300'
                                : isSavings
                                ? 'text-emerald-700 dark:text-emerald-300'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {isIncome ? '+' : '-'}
                            {formatIDR(tx.amount)}
                          </span>

                          <button
                            onClick={() => setEditingTx(tx)}
                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Edit Transaction"
                            aria-label="Edit Transaction"
                          >
                            <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>

                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Delete Transaction"
                            aria-label="Delete Transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Select Category for "{selectedTxForReview.description}"
            </h4>
            <select
              id="reviewCatSelect"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name} ({c.bucket})
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              <input type="checkbox" id="reviewRememberCheck" defaultChecked className="rounded text-emerald-600" />
              <span>Remember for future transactions from this merchant</span>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedTxForReview(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
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
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
