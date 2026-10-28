import React, { useState, useEffect } from 'react';
import type { Category, Transaction, TransactionType } from '../types/budget';
import { parseIDR, formatIDR } from '../utils/idr';
import { CategoryIcon } from './CategoryIcon';
import { X } from 'lucide-react';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  onUpdateTransaction: (updatedTx: Transaction) => void;
  categories: Category[];
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onUpdateTransaction,
  categories,
}) => {
  const [amountRaw, setAmountRaw] = useState(String(transaction.amount));
  const [parsedAmount, setParsedAmount] = useState(transaction.amount);
  const [description, setDescription] = useState(transaction.description);
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(transaction.categoryId);
  const [date, setDate] = useState(transaction.date);
  const [note, setNote] = useState(transaction.note || '');

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  // Keep state synced when transaction prop changes
  useEffect(() => {
    if (transaction) {
      setAmountRaw(String(transaction.amount));
      setParsedAmount(transaction.amount);
      setDescription(transaction.description);
      setType(transaction.type);
      setSelectedCategoryId(transaction.categoryId);
      setDate(transaction.date);
      setNote(transaction.note || '');
    }
  }, [transaction]);

  if (!isOpen) return null;

  const handleAmountChange = (val: string) => {
    setAmountRaw(val);
    const parsed = parseIDR(val);
    setParsedAmount(parsed);
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income') {
      setSelectedCategoryId(null);
    } else if (newType === 'savings') {
      const savingsCats = categories.filter((c) => c.bucket === 'savings');
      if (savingsCats.length > 0 && (!selectedCategoryId || !savingsCats.some((c) => c.id === selectedCategoryId))) {
        setSelectedCategoryId(savingsCats[0].id);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }
    if (!description.trim()) {
      alert('Please enter a description or merchant name.');
      return;
    }

    const updatedTx: Transaction = {
      ...transaction,
      description: description.trim(),
      amount: parsedAmount,
      type,
      categoryId: type === 'income' ? null : selectedCategoryId,
      date,
      note: note.trim() || undefined,
    };

    onUpdateTransaction(updatedTx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0e1626] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Edit Transaction
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Fix typos, correct amounts, or reassign categories
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Amount (IDR)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-sm font-bold text-slate-400 pointer-events-none">
                Rp
              </span>
              <input
                type="text"
                value={amountRaw}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="e.g. 500rb, 1.5jt, 85.000"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
                required
              />
            </div>

            {/* Live parsed badge & Shortcut chips */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {parsedAmount > 0 ? `Current: ${formatIDR(parsedAmount)}` : 'Shortcut hints: rb, jt, k'}
              </span>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {['25rb', '50rb', '100rb', '250rb', '500rb', '1jt'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleAmountChange(chip)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 font-semibold border border-slate-200 dark:border-slate-700 transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description / Merchant
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Indomaret, Electricity Bill, Starbucks, Netflix"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Transaction Type Radio Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  type === 'expense'
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  type === 'income'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('savings')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  type === 'savings'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Savings
              </button>
            </div>
          </div>

          {/* Category Selector (Hidden for Income) */}
          {type !== 'income' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Category
                </label>
                {selectedCategory && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <CategoryIcon name={selectedCategory.icon} className="text-sm" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedCategory.name}</span>
                  </span>
                )}
              </div>
              <select
                value={selectedCategoryId || ''}
                onChange={(e) => setSelectedCategoryId(e.target.value || null)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">❓ Uncategorized (Review Later)</option>
                <optgroup label="NEEDS (Living Essentials 50%)">
                  {categories
                    .filter((c) => c.bucket === 'needs')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="WANTS (Discretionary 30%)">
                  {categories
                    .filter((c) => c.bucket === 'wants')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="SAVINGS (Savings 20%)">
                  {categories
                    .filter((c) => c.bucket === 'savings')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>
          )}

          {/* Date & Note Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Note (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Monthly groceries with family"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
