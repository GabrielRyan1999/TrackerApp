import React, { useState } from 'react';
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
  Sun,
  Moon,
  CheckCircle2,
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
  isDark: boolean;
  onToggleTheme: () => void;
  themeMode?: 'modern' | 'newspaper';
  onToggleThemeMode?: () => void;
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
  isDark,
  onToggleTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'merchantMemory' | 'data'>('categories');

  // Form states for adding custom category
  const [newCatName, setNewCatName] = useState('');
  const [newCatBucket, setNewCatBucket] = useState<Bucket>('wants');
  const [newCatIcon, setNewCatIcon] = useState('🏷️');
  const [newCatColor, setNewCatColor] = useState('#57534e');
  const [newCatKeywords, setNewCatKeywords] = useState('');

  // CSV Import states
  const [csvPreview, setCsvPreview] = useState<{
    filename: string;
    count: number;
    transactions: Transaction[];
  } | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');

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
          alert('No valid transactions found in CSV. Please ensure the file has Date, Description, and Amount columns.');
        }
      } catch (err) {
        alert('Failed to parse CSV file. Please check its formatting.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    if (!csvPreview) return;
    onImportTransactions(csvPreview.transactions, importMode);
    alert(`Successfully imported ${csvPreview.count} transactions!`);
    setCsvPreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#f4efe4] dark:bg-[#161513] border-2 border-stone-900 dark:border-stone-400 max-w-xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col text-stone-950 dark:text-stone-50">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0 pb-2 border-b-2 border-stone-900 dark:border-stone-400">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-stone-600 dark:text-stone-400 block">
              EDITORIAL ARCHIVE & PREFERENCES
            </span>
            <h3 className="font-headline text-lg sm:text-xl font-black uppercase text-stone-950 dark:text-stone-50">
              Gazette Archive & Settings
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleTheme}
              className="w-8 h-8 flex items-center justify-center border border-stone-900 dark:border-stone-400 text-stone-900 dark:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-800 transition"
              title={isDark ? 'Switch to daylight newsprint' : 'Switch to midnight broadsheet'}
              aria-label="Toggle daylight/midnight mode"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center border border-stone-900 dark:border-stone-400 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 transition"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-900 dark:border-stone-400 text-xs font-bold uppercase tracking-wider shrink-0">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 sm:px-4 py-2 border-b-2 transition ${
              activeTab === 'categories'
                ? 'border-stone-900 dark:border-stone-100 text-stone-950 dark:text-stone-50 bg-stone-200/60 dark:bg-stone-800/60'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('merchantMemory')}
            className={`px-3 sm:px-4 py-2 border-b-2 transition ${
              activeTab === 'merchantMemory'
                ? 'border-stone-900 dark:border-stone-100 text-stone-950 dark:text-stone-50 bg-stone-200/60 dark:bg-stone-800/60'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Merchants ({Object.keys(merchantMemory).length})
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-3 sm:px-4 py-2 border-b-2 transition ${
              activeTab === 'data'
                ? 'border-stone-900 dark:border-stone-100 text-stone-950 dark:text-stone-50 bg-stone-200/60 dark:bg-stone-800/60'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            CSV Data Archive
          </button>
        </div>

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
                  Register Custom Commodity Category:
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
                  Official Registered Categories:
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
                          title="Delete Custom Category"
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
              <p className="text-xs italic text-stone-600 dark:text-stone-400">
                The gazette remembers the following merchants for automated ledger classification.
              </p>
              {Object.keys(merchantMemory).length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-500 italic">
                  No remembered merchants recorded in archive yet
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
                  Export Public Record (CSV Spreadsheet)
                </span>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Download all recorded transactions as an official CSV ledger. Fully readable in Excel, Google Sheets, or for importing back into the Gazette.
                </p>
                <button
                  onClick={() => exportToCSV(appData.transactions, categories)}
                  className="w-full py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-950 font-bold uppercase tracking-wider text-xs border border-stone-900 dark:border-stone-400 transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Ledger CSV ({appData.transactions.length} entries)</span>
                </button>
              </div>

              {/* Import Data */}
              <div className="p-3.5 bg-stone-100 dark:bg-stone-900 border border-stone-900 dark:border-stone-400 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-950 dark:text-stone-50 block">
                  Import Transactions (CSV)
                </span>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Upload a CSV spreadsheet with transactions. Automatically parses Date, Description, and Amount columns.
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
                      <span className="font-bold uppercase tracking-wider block">Select Ingestion Protocol:</span>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          checked={importMode === 'merge'}
                          onChange={() => setImportMode('merge')}
                          className="mt-0.5"
                        />
                        <span>
                          <strong>Merge</strong> — Preserve existing records and append new entries without duplication.
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
                          <strong>Replace</strong> — Overwrite entire history with this CSV ledger file.
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
                    <span>Upload CSV Ledger File</span>
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
                  Expunge All Records (Reset to Factory Defaults)
                </span>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Permanently purge all recorded transactions, budget allocations, and custom merchant memories from local browser storage.
                </p>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all data to default? All recorded transactions will be deleted.')) {
                      onResetData();
                      alert('Data has been reset to defaults.');
                      onClose();
                    }
                  }}
                  className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white font-bold uppercase tracking-wider text-xs border border-stone-900 transition flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Expunge Archive & Reset Defaults</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
