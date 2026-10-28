import React, { useState, useEffect } from 'react';
import type { Category, TransactionType } from '../types/budget';
import { parseIDR, formatIDR } from '../utils/idr';
import { categorize } from '../utils/categorizer';
import { CategoryIcon } from './CategoryIcon';
import { DateSelector } from './DateSelector';
import { X, ChevronDown, AlertTriangle } from 'lucide-react';

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (defaultDate) setDate(defaultDate);
      setErrorMsg(null);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
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
      setErrorMsg('Please enter a valid amount greater than 0.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please enter a description or merchant name.');
      return;
    }

    onAddTransaction({
      description: description.trim(),
      amount: parsedAmount,
      type,
      categoryId: type === 'income' ? null : selectedCategoryId,
      date,
      note: note.trim() || undefined,
      rememberMerchant,
    });

    // Reset fields
    setAmountRaw('');
    setParsedAmount(0);
    setDescription('');
    setSelectedCategoryId(null);
    setAutoDetectedCategory(null);
    setIsManualCategoryOpen(false);
    setNote('');
    setErrorMsg(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain">
      <div className="bg-[#f4efe4] dark:bg-[#161513] border-2 border-stone-900 dark:border-stone-400 max-w-xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-stone-950 dark:text-stone-50 overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b-2 border-stone-900 dark:border-stone-400">
          <div>
            <h3 className="font-headline text-lg sm:text-xl font-black uppercase text-stone-950 dark:text-stone-50">
              Add Transaction
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
                placeholder="e.g. 50rb, 100rb, 1.5jt"
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

          {/* Description & Auto-categorizer */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
              Description / Merchant
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="e.g. Indomaret, Electricity Bill, Starbucks, Netflix"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-900 dark:border-stone-400 text-xs font-bold text-stone-950 dark:text-stone-50 focus:outline-none"
              required
            />

            {/* Auto-detected category chip */}
            {autoDetectedCategory && !isManualCategoryOpen && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Category:
                </span>
                <button
                  type="button"
                  onClick={() => setIsManualCategoryOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-200 dark:bg-stone-800 border border-stone-900 dark:border-stone-400 text-xs font-bold text-stone-900 dark:text-stone-100"
                >
                  <CategoryIcon name={autoDetectedCategory.icon} className="text-sm" />
                  <span>{autoDetectedCategory.name}</span>
                  <span className="text-[11px] font-bold uppercase px-1 border border-stone-700">
                    {autoDetectedCategory.bucket}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>
            )}

            {/* Manual selector */}
            {(!autoDetectedCategory || isManualCategoryOpen) && (
              <div className="mt-2 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Category:
                  </span>
                  {autoDetectedCategory && (
                    <button
                      type="button"
                      onClick={() => setIsManualCategoryOpen(false)}
                      className="text-stone-900 dark:text-stone-200 text-xs font-bold underline"
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
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-900 dark:border-stone-400 text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-none"
                >
                  <option value="">❓ Uncategorized</option>
                  <optgroup label="NEEDS (50%)">
                    {categories
                      .filter((c) => c.bucket === 'needs')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.icon} {c.name}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="WANTS (30%)">
                    {categories
                      .filter((c) => c.bucket === 'wants')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.icon} {c.name}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="SAVINGS (20%)">
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
                  <label className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMerchant}
                      onChange={(e) => setRememberMerchant(e.target.checked)}
                      className="rounded-none text-stone-900"
                    />
                    <span>Remember category for this merchant</span>
                  </label>
                )}
              </div>
            )}
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
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
