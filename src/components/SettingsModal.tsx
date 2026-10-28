import React, { useState, useEffect } from 'react';
import { useScrollLock } from '../hooks/useScrollLock';
import type { Category, Bucket, Transaction } from '../types/budget';
import type { AppData } from '../utils/storage';
import { exportToCSV, parseCSV } from '../utils/storage';
import { CategoryIcon } from './CategoryIcon';
import {
  X,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => void;
  merchantMemory: Record<string, string>;
  onRemoveMerchantMemory: (merchant: string) => void;
  appData: AppData;
  onImportTransactions: (transactions: Transaction[], mode: 'replace' | 'merge') => void;
  onResetData: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
  themeMode?: 'modern' | 'newspaper';
  onToggleThemeMode?: () => void;
  userEmail?: string | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
  merchantMemory,
  onRemoveMerchantMemory,
  appData,
  onImportTransactions,
  onResetData,
  userEmail,
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'merchantMemory' | 'data' | 'feedback'>('categories');

  // Form states for adding custom category
  const [newCatName, setNewCatName] = useState('');
  const [newCatBucket, setNewCatBucket] = useState<Bucket>('wants');
  const [newCatIcon, setNewCatIcon] = useState('🏷️');
  const [newCatColor, setNewCatColor] = useState('#57534e');
  const [newCatKeywords, setNewCatKeywords] = useState('');

  // CSV Import and UI notification states
  const [csvPreview, setCsvPreview] = useState<{
    filename: string;
    count: number;
    transactions: Transaction[];
  } | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  // Feedback form states
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('General Feedback');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      if (userEmail && !feedbackEmail) {
        setFeedbackEmail(userEmail);
      }
      setFeedbackError(null);
    }
  }, [isOpen, userEmail]);

  if (!isOpen) return null;

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const keywords = newCatKeywords
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    const newCategory: Category = {
      id: `custom-${Date.now()}`,
      name: newCatName.trim(),
      bucket: newCatBucket,
      icon: newCatIcon,
      color: newCatColor,
      keywords: keywords.length > 0 ? keywords : [newCatName.trim().toLowerCase()],
      isDefault: false,
    };

    onAddCategory(newCategory);
    setNewCatName('');
    setNewCatKeywords('');
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusMsg(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCSV(text, categories);
        if (parsed.length > 0) {
          setCsvPreview({
            filename: file.name,
            count: parsed.length,
            transactions: parsed,
          });
        } else {
          setStatusMsg({
            type: 'error',
            text: 'No valid transactions found in CSV. Please ensure the file has Date, Description, and Amount columns.',
          });
        }
      } catch (err) {
        setStatusMsg({
          type: 'error',
          text: 'Failed to parse CSV file. Please check its formatting.',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    if (!csvPreview) return;
    onImportTransactions(csvPreview.transactions, importMode);
    setCsvPreview(null);
    onClose();
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackEmail.trim() || !feedbackMessage.trim()) return;

    setIsSubmittingFeedback(true);
    setFeedbackError(null);

    try {
      const res = await fetch('https://formspree.io/f/myeyyyaj', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: feedbackName.trim() || 'Anonymous',
          email: feedbackEmail.trim(),
          category: feedbackCategory,
          message: feedbackMessage.trim(),
          source: 'The Daily News - 50/30/20 Budget Tracker',
          submittedAt: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        setFeedbackSent(true);
        setFeedbackMessage('');
      } else {
        const data = await res.json().catch(() => null);
        if (data && data.errors && data.errors.length > 0) {
          setFeedbackError(data.errors.map((err: { message: string }) => err.message).join(', '));
        } else {
          setFeedbackError('Unable to send feedback right now. Please try again.');
        }
      }
    } catch {
      setFeedbackError('Network error. Please check your internet connection.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain">
      <div className="bg-[#f4efe4] dark:bg-[#161513] border-2 border-stone-900 dark:border-stone-400 max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col text-stone-950 dark:text-stone-50 overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0 pb-2 border-b-2 border-stone-900 dark:border-stone-400">
          <div>
            <h3 className="font-headline text-lg sm:text-xl font-black uppercase text-stone-950 dark:text-stone-50">
              Settings & Data
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

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-900 dark:border-stone-400 text-xs font-bold uppercase tracking-wider shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-2.5 sm:px-4 py-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'categories'
                ? 'border-stone-900 dark:border-stone-100 text-stone-950 dark:text-stone-50 bg-stone-200/60 dark:bg-stone-800/60'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('merchantMemory')}
            className={`px-2.5 sm:px-4 py-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'merchantMemory'
                ? 'border-stone-900 dark:border-stone-100 text-stone-950 dark:text-stone-50 bg-stone-200/60 dark:bg-stone-800/60'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Merchants ({Object.keys(merchantMemory).length})
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-2.5 sm:px-4 py-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'data'
                ? 'border-stone-900 dark:border-stone-100 text-stone-950 dark:text-stone-50 bg-stone-200/60 dark:bg-stone-800/60'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            CSV Data
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-2.5 sm:px-4 py-2 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'feedback'
                ? 'border-stone-900 dark:border-stone-100 text-stone-950 dark:text-stone-50 bg-stone-200/60 dark:bg-stone-800/60'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Feedback</span>
          </button>
        </div>

        {/* Inline status notice */}
        {statusMsg && (
          <div
            className={`p-2.5 border text-xs flex items-start gap-2 ${
              statusMsg.type === 'error'
                ? 'border-red-800 bg-red-100/70 dark:bg-red-950/40 text-red-900 dark:text-red-300'
                : 'border-emerald-800 bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300'
            }`}
          >
            {statusMsg.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-red-800 dark:text-red-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-800 dark:text-emerald-400 shrink-0 mt-0.5" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeTab === 'categories' && (
            <div className="space-y-4">
              {/* Form to add custom category */}
              <form
                onSubmit={handleCreateCategory}
                className="p-3.5 bg-stone-100 dark:bg-stone-900 border border-stone-900 dark:border-stone-400 space-y-2.5"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 block">
                  Add New Category:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Category Name"
                    className="px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-900 dark:border-stone-400 text-xs font-bold focus:outline-none"
                    required
                  />
                  <select
                    value={newCatBucket}
                    onChange={(e) => setNewCatBucket(e.target.value as Bucket)}
                    className="px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-900 dark:border-stone-400 text-xs font-bold focus:outline-none"
                  >
                    <option value="needs">Needs (50%)</option>
                    <option value="wants">Wants (30%)</option>
                    <option value="savings">Savings (20%)</option>
                  </select>
                  <select
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    className="px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-900 dark:border-stone-400 text-xs focus:outline-none"
                  >
                    <option value="🏷️">🏷️ Tag / Other</option>
                    <option value="🏠">🏠 Housing</option>
                    <option value="🛒">🛒 Groceries</option>
                    <option value="⚡">⚡ Utilities</option>
                    <option value="🚗">🚗 Transport</option>
                    <option value="💊">💊 Healthcare</option>
                    <option value="🛡️">🛡️ Insurance</option>
                    <option value="🎓">🎓 Education</option>
                    <option value="🍔">🍔 Dining</option>
                    <option value="🛍️">🛍️ Shopping</option>
                    <option value="🎬">🎬 Entertainment</option>
                    <option value="🏋️">🏋️ Hobbies</option>
                    <option value="✈️">✈️ Travel</option>
                    <option value="💰">💰 Savings</option>
                    <option value="📈">📈 Investments</option>
                    <option value="💳">💳 Debt</option>
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={newCatColor}
                      onChange={(e) => setNewCatColor(e.target.value)}
                      className="w-10 h-8 p-0 border border-stone-900 dark:border-stone-400 cursor-pointer"
                    />
                    <button
                      type="submit"
                      className="flex-1 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-950 font-bold uppercase text-xs border border-stone-900 dark:border-stone-400 transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={newCatKeywords}
                  onChange={(e) => setNewCatKeywords(e.target.value)}
                  placeholder="Keywords (comma separated, e.g. gym, fitness, workout)"
                  className="w-full px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-900 dark:border-stone-400 text-xs focus:outline-none"
                />
              </form>

              {/* List of categories */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block">
                  Registered Categories:
                </span>
                <div className="divide-y divide-stone-300 dark:divide-stone-700">
                  {categories.map((c) => (
                    <div key={c.id} className="py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 flex items-center justify-center border border-stone-900 dark:border-stone-400 bg-stone-200 dark:bg-stone-800 shrink-0">
                          <CategoryIcon name={c.icon} className="text-sm" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-950 dark:text-stone-50">{c.name}</span>
                            <span className="uppercase text-[11px] font-bold px-1 border border-stone-700 dark:border-stone-400 text-stone-700 dark:text-stone-300">
                              {c.bucket}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                            {c.keywords.slice(0, 5).join(', ')}
                            {c.keywords.length > 5 ? '...' : ''}
                          </p>
                        </div>
                      </div>
                      {!c.isDefault && (
                        <button
                          onClick={() => onDeleteCategory(c.id)}
                          className="w-7 h-7 flex items-center justify-center border border-stone-900 dark:border-stone-400 hover:bg-red-100 dark:hover:bg-red-950 text-stone-700 hover:text-red-800"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'merchantMemory' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Automatic category rules for recognized merchants.
              </p>
              {Object.keys(merchantMemory).length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-500 italic">
                  No remembered merchants yet
                </div>
              ) : (
                <div className="divide-y divide-stone-300 dark:divide-stone-700">
                  {Object.entries(merchantMemory).map(([merchant, catId]) => {
                    const cat = categories.find((c) => c.id === catId);
                    return (
                      <div key={merchant} className="py-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-950 dark:text-stone-50 capitalize">
                            {merchant}
                          </span>
                          <span className="text-stone-600 dark:text-stone-400 font-mono-num">
                            → {cat ? cat.name : catId}
                          </span>
                        </div>
                        <button
                          onClick={() => onRemoveMerchantMemory(merchant)}
                          className="w-7 h-7 flex items-center justify-center border border-stone-900 dark:border-stone-400 hover:bg-red-100 dark:hover:bg-red-950 text-stone-700 hover:text-red-800"
                          title="Forget Merchant"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              {/* Export Data */}
              <div className="p-3.5 bg-stone-100 dark:bg-stone-900 border border-stone-900 dark:border-stone-400 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-950 dark:text-stone-50 block">
                  Export Transactions (CSV)
                </span>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Download all recorded transactions as a CSV spreadsheet for Excel or Google Sheets.
                </p>
                <button
                  onClick={() => exportToCSV(appData.transactions, categories)}
                  className="w-full py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-950 font-bold uppercase tracking-wider text-xs border border-stone-900 dark:border-stone-400 transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download CSV ({appData.transactions.length} entries)</span>
                </button>
              </div>

              {/* Import Data */}
              <div className="p-3.5 bg-stone-100 dark:bg-stone-900 border border-stone-900 dark:border-stone-400 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-950 dark:text-stone-50 block">
                  Import Transactions (CSV)
                </span>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Upload a CSV file containing transactions (Date, Description, Amount).
                </p>

                {csvPreview ? (
                  <div className="p-3 bg-stone-200 dark:bg-stone-800 border border-stone-900 dark:border-stone-400 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-950 dark:text-stone-50">
                      <div className="flex items-center gap-1.5 truncate">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">{csvPreview.filename}</span>
                      </div>
                      <span className="px-2 py-0.5 border border-stone-900 dark:border-stone-400 text-xs shrink-0 font-mono-num">
                        {csvPreview.count} transactions found
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-900 p-2 border border-stone-400">
                      <span className="font-bold uppercase tracking-wider block">Import mode:</span>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          checked={importMode === 'merge'}
                          onChange={() => setImportMode('merge')}
                          className="mt-0.5"
                        />
                        <span>
                          <strong>Merge</strong> — Keep existing transactions and add new ones.
                        </span>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          checked={importMode === 'replace'}
                          onChange={() => setImportMode('replace')}
                          className="mt-0.5"
                        />
                        <span>
                          <strong>Replace</strong> — Overwrite all transactions with this file.
                        </span>
                      </label>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleConfirmImport}
                        className="flex-1 py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-950 font-bold uppercase text-xs border border-stone-900 dark:border-stone-400 transition"
                      >
                        Confirm Import ({csvPreview.count} entries)
                      </button>
                      <button
                        onClick={() => setCsvPreview(null)}
                        className="py-2 px-3 border border-stone-900 dark:border-stone-400 text-xs font-bold uppercase text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-900 dark:border-stone-400 text-xs font-bold uppercase tracking-wider cursor-pointer text-stone-900 dark:text-stone-100 transition">
                    <Upload className="w-4 h-4" />
                    <span>Upload CSV File</span>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleCSVUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Reset Data */}
              <div className="p-3.5 bg-stone-100 dark:bg-stone-900 border border-stone-900 dark:border-stone-400 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-800 dark:text-red-400 block">
                  Reset All Data
                </span>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Delete all transactions, budget plans, and merchant rules from local storage.
                </p>

                {isConfirmingReset ? (
                  <div className="p-3 bg-red-100 dark:bg-red-950/60 border border-red-700 space-y-2">
                    <p className="text-xs font-bold text-red-900 dark:text-red-200">
                      Are you sure? All recorded transactions and custom settings will be deleted.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onResetData();
                          setIsConfirmingReset(false);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-red-800 hover:bg-red-900 text-white font-bold uppercase text-xs transition"
                      >
                        Yes, Delete All
                      </button>
                      <button
                        onClick={() => setIsConfirmingReset(false)}
                        className="px-3 py-1.5 border border-stone-900 dark:border-stone-400 text-xs font-bold uppercase text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsConfirmingReset(true)}
                    className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white font-bold uppercase tracking-wider text-xs border border-stone-900 transition flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset to Defaults</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-stone-100 dark:bg-stone-900 border border-stone-900 dark:border-stone-400 space-y-3">
                <div className="border-b border-stone-300 dark:border-stone-700 pb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-950 dark:text-stone-50 block">
                    Feedback for Chromaksa Studio
                  </span>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                    Have an idea, found a bug, or want to share your thoughts? Send your message directly to our team.
                  </p>
                </div>

                {feedbackSent ? (
                  <div className="py-6 px-4 text-center space-y-3 border border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30">
                    <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                        Feedback Sent!
                      </h4>
                      <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1 max-w-[45ch] mx-auto">
                        Thank you! Your feedback has been sent directly to the Chromaksa Studio team.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFeedbackSent(false)}
                      className="px-4 py-1.5 border border-emerald-800 dark:border-emerald-400 text-xs font-bold uppercase tracking-wider hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition"
                    >
                      Send Another Note
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                    {feedbackError && (
                      <div className="p-2.5 border border-red-800 bg-red-100/70 dark:bg-red-950/40 text-red-900 dark:text-red-300 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-800 dark:text-red-400 shrink-0" />
                        <span>{feedbackError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                          Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={feedbackName}
                          onChange={(e) => setFeedbackName(e.target.value)}
                          placeholder="e.g. Budi"
                          className="w-full px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-900 dark:border-stone-400 text-xs font-mono-num text-stone-950 dark:text-stone-50 placeholder:text-stone-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                          Email <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={feedbackEmail}
                          onChange={(e) => setFeedbackEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-900 dark:border-stone-400 text-xs font-mono-num text-stone-950 dark:text-stone-50 placeholder:text-stone-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                        Category / Topic
                      </label>
                      <select
                        value={feedbackCategory}
                        onChange={(e) => setFeedbackCategory(e.target.value)}
                        className="w-full px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-900 dark:border-stone-400 text-xs font-bold text-stone-950 dark:text-stone-50 focus:outline-none"
                      >
                        <option value="General Feedback">💬 General Feedback</option>
                        <option value="Feature Request">💡 Feature Request / Idea</option>
                        <option value="Bug Report">🐛 Bug / Issue Report</option>
                        <option value="Design & Typography">🎨 Design & Typography</option>
                        <option value="Other">🏷️ Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                        Message <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={feedbackMessage}
                        onChange={(e) => setFeedbackMessage(e.target.value)}
                        placeholder="Write your feedback, ideas, or report here..."
                        className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-900 dark:border-stone-400 text-xs text-stone-950 dark:text-stone-50 placeholder:text-stone-500 focus:outline-none resize-none"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                      <span className="text-[11px] text-stone-500 dark:text-stone-400">
                        Delivered directly to Chromaksa Studio
                      </span>
                      <button
                        type="submit"
                        disabled={isSubmittingFeedback || !feedbackMessage.trim() || !feedbackEmail.trim()}
                        className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-950 font-bold uppercase tracking-wider text-xs border border-stone-900 dark:border-stone-400 transition flex items-center justify-center disabled:opacity-50"
                      >
                        <span>{isSubmittingFeedback ? 'Sending...' : 'Send Feedback'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
