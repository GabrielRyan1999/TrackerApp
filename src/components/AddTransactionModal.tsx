import React, { useState, useEffect } from 'react';
import type { Category, TransactionType } from '../types/budget';
import { parseIDR, formatIDR } from '../utils/idr';
import { categorize } from '../utils/categorizer';
import { CategoryIcon } from './CategoryIcon';
import { DateSelector } from './DateSelector';
import { X, ChevronDown } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: {
    description: string;
    amount: number;
    type: TransactionType;
    categoryId: string | null;
    date: string;
    note?: string;
    rememberMerchant?: boolean;
  }) => void;
  categories: Category[];
  merchantMemory: Record<string, string>;
  defaultDate?: string;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  categories,
  merchantMemory,
  defaultDate,
}) => {
  const [amountRaw, setAmountRaw] = useState('');
  const [parsedAmount, setParsedAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [autoDetectedCategory, setAutoDetectedCategory] = useState<Category | null>(null);
  const [isManualCategoryOpen, setIsManualCategoryOpen] = useState(false);
  const [date, setDate] = useState(() => defaultDate || new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [rememberMerchant, setRememberMerchant] = useState(true);

  useEffect(() => {
    if (isOpen) {
      if (defaultDate) setDate(defaultDate);
    }
  }, [isOpen, defaultDate]);

  const handleAmountChange = (val: string) => {
    setAmountRaw(val);
    const parsed = parseIDR(val);
    setParsedAmount(parsed);
  };

  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    if (type === 'income') {
      setSelectedCategoryId(null);
      setAutoDetectedCategory(null);
      return;
    }

    if (!isManualCategoryOpen && val.trim().length > 1) {
      const detectedCatId = categorize(val, categories, merchantMemory);
      if (detectedCatId) {
        const cat = categories.find((c) => c.id === detectedCatId);
        if (cat) {
          setAutoDetectedCategory(cat);
          setSelectedCategoryId(cat.id);
          if (cat.bucket === 'savings') {
            setType('savings');
          } else {
            setType('expense');
          }
          return;
        }
      }
    }
    if (!val.trim()) {
      setAutoDetectedCategory(null);
    }
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income') {
      setSelectedCategoryId(null);
      setAutoDetectedCategory(null);
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
      alert('Please enter a merchant or description.');
      return;
    }

    onAddTransaction({
      description: description.trim(),
      amount: parsedAmount,
      type,
      categoryId: type === 'income' ? null : selectedCategoryId,
      date,
      note: note.trim() || undefined,
      rememberMerchant: rememberMerchant && Boolean(selectedCategoryId),
    });

    // Reset fields
    setAmountRaw('');
    setParsedAmount(0);
    setDescription('');
    setSelectedCategoryId(null);
    setAutoDetectedCategory(null);
    setIsManualCategoryOpen(false);
    setNote('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0e1626] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add New Transaction
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Quick entry with live IDR parser & auto-categorizer
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
                {parsedAmount > 0 ? `Parsed: ${formatIDR(parsedAmount)}` : 'Shortcut hints: rb, jt, k'}
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

          {/* Description & Auto-categorizer */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description / Merchant
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="e.g. Indomaret, Electricity Bill, Starbucks, Netflix"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />

            {/* Auto-detected category chip */}
            {autoDetectedCategory && !isManualCategoryOpen && (
              <div className="flex items-center gap-2 mt-2.5">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Category detected:
                </span>
                <button
                  type="button"
                  onClick={() => setIsManualCategoryOpen(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:ring-1 hover:ring-emerald-400 transition"
                >
                  <CategoryIcon name={autoDetectedCategory.icon} className="text-base" />
                  <span>{autoDetectedCategory.name}</span>
                  <span className="text-xs font-bold uppercase px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-emerald-200 dark:border-emerald-900">
                    {autoDetectedCategory.bucket}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300 ml-0.5" />
                </button>
              </div>
            )}

            {/* Manual selector */}
            {(!autoDetectedCategory || isManualCategoryOpen) && (
              <div className="mt-2.5 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">Select Category:</span>
                  {autoDetectedCategory && (
                    <button
                      type="button"
                      onClick={() => setIsManualCategoryOpen(false)}
                      className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:underline"
                    >
                      Use detected ({autoDetectedCategory.name})
                    </button>
                  )}
                </div>
                <select
                  value={selectedCategoryId || ''}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value || null);
                    setIsManualCategoryOpen(true);
                  }}
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

                {selectedCategoryId && (
                  <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMerchant}
                      onChange={(e) => setRememberMerchant(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Remember this category for future transactions from this merchant</span>
                  </label>
                )}
              </div>
            )}
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

          {/* Date & Note Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            <DateSelector
              value={date}
              onChange={setDate}
              label="Date (DD/MM/YYYY)"
            />
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
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
