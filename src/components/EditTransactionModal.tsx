import React, { useState, useEffect } from 'react';
import type { Category, Transaction, TransactionType } from '../types/budget';
import { parseIDR, formatIDR } from '../utils/idr';
import { CategoryIcon } from './CategoryIcon';
import { DateSelector } from './DateSelector';
import { X, AlertTriangle } from 'lucide-react';

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  // Keep state synced when transaction prop changes
  useEffect(() => {
    if (transaction) {
      setAmountRaw(transaction.amount > 0 ? transaction.amount.toLocaleString('id-ID') : '');
      setParsedAmount(transaction.amount);
      setDescription(transaction.description);
      setType(transaction.type);
      setSelectedCategoryId(transaction.categoryId);
      setDate(transaction.date);
      setNote(transaction.note || '');
      setErrorMsg(null);
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
      setErrorMsg('Please enter a valid amount greater than 0.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please enter a description or merchant name.');
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
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#f4efe4] dark:bg-[#161513] border-2 border-stone-900 dark:border-stone-400 max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-stone-950 dark:text-stone-50">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b-2 border-stone-900 dark:border-stone-400">
          <div>
            <h3 className="font-headline text-lg sm:text-xl font-black uppercase text-stone-950 dark:text-stone-50">
              Edit Transaction
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border border-stone-900 dark:border-stone-400 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-2.5 border border-red-800 bg-red-100/70 dark:bg-red-950/40 text-red-900 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-800 dark:text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {/* Amount Field */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
              Amount (IDR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-bold text-stone-500 pointer-events-none">
                Rp
              </span>
              <input
                type="text"
                value={amountRaw}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="e.g. 500rb, 1.5jt, 85.000"
                className="w-full pl-10 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-900 dark:border-stone-400 text-base font-bold font-mono-num text-stone-950 dark:text-stone-50 focus:outline-none"
                autoFocus
                required
              />
            </div>

            {/* Live parsed badge & Shortcut chips */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
              <span className="text-xs font-mono-num font-bold text-stone-700 dark:text-stone-300">
                {parsedAmount > 0 ? `Amount: ${formatIDR(parsedAmount)}` : 'Shortcuts: rb, jt, k'}
              </span>
              <div className="flex flex-wrap gap-1 text-[11px]">
                {['25rb', '50rb', '100rb', '250rb', '500rb', '1jt'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleAmountChange(chip)}
                    className="px-2 py-0.5 bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-700 font-bold border border-stone-900 dark:border-stone-400 transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
              Description / Merchant
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Indomaret, Electricity Bill, Starbucks, Netflix"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-900 dark:border-stone-400 text-xs font-bold text-stone-950 dark:text-stone-50 focus:outline-none"
              required
            />
          </div>

          {/* Transaction Type Radio Tabs */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-2 px-3 text-xs font-bold uppercase border transition ${
                  type === 'expense'
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 border-stone-900 dark:border-stone-400'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-400 dark:border-stone-600'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`py-2 px-3 text-xs font-bold uppercase border transition ${
                  type === 'income'
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 border-stone-900 dark:border-stone-400'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-400 dark:border-stone-600'
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('savings')}
                className={`py-2 px-3 text-xs font-bold uppercase border transition ${
                  type === 'savings'
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 border-stone-900 dark:border-stone-400'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-400 dark:border-stone-600'
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
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Category:
                </label>
                {selectedCategory && (
                  <span className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400">
                    <CategoryIcon name={selectedCategory.icon} className="text-sm" />
                    <span className="font-bold text-stone-900 dark:text-stone-100">{selectedCategory.name}</span>
                  </span>
                )}
              </div>
              <select
                value={selectedCategoryId || ''}
                onChange={(e) => setSelectedCategoryId(e.target.value || null)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-900 dark:border-stone-400 text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-none"
              >
                <option value="">❓ Uncategorized (Audit Later)</option>
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
                <optgroup label="SAVINGS (Capital Reserves 20%)">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            <DateSelector
              value={date}
              onChange={setDate}
              label="Date (DD/MM/YYYY)"
            />
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                Note / Memorandum (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Monthly groceries with family"
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-900 dark:border-stone-400 text-xs text-stone-950 dark:text-stone-50 focus:outline-none"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-300 dark:border-stone-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 border border-stone-900 dark:border-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-950 font-bold uppercase tracking-wider text-xs border border-stone-900 dark:border-stone-400 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
