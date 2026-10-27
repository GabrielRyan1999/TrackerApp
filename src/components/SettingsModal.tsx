import React, { useState } from 'react';
import type { Category, Bucket } from '../types/budget';
import type { AppData } from '../utils/storage';
import { exportToJSON, exportToCSV } from '../utils/storage';
import { CategoryIcon } from './CategoryIcon';
import {
  X,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Settings as SettingsIcon,
  Sun,
  Moon,
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
  onImportData: (data: AppData) => void;
  onResetData: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
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
  onImportData,
  onResetData,
  isDark,
  onToggleTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'merchantMemory' | 'data'>('categories');

  // Form states for adding custom category
  const [newCatName, setNewCatName] = useState('');
  const [newCatBucket, setNewCatBucket] = useState<Bucket>('wants');
  const [newCatIcon, setNewCatIcon] = useState('🏷️');
  const [newCatColor, setNewCatColor] = useState('#ec4899');
  const [newCatKeywords, setNewCatKeywords] = useState('');

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.plans && json.transactions && json.categories) {
          onImportData(json);
          alert('Data successfully restored from backup!');
          onClose();
        } else {
          alert('Invalid JSON backup file structure.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0e1626] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Settings</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Custom categories, merchant memory & data backup</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleTheme}
              className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2.5 border-b-2 transition ${
              activeTab === 'categories'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('merchantMemory')}
            className={`px-4 py-2.5 border-b-2 transition ${
              activeTab === 'merchantMemory'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Merchant Memory ({Object.keys(merchantMemory).length})
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-4 py-2.5 border-b-2 transition ${
              activeTab === 'data'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Data & Backup
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeTab === 'categories' && (
            <div className="space-y-4">
              {/* Form to add custom category */}
              <form
                onSubmit={handleCreateCategory}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5"
              >
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Add Custom Category:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Category Name"
                    className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:outline-none"
                    required
                  />
                  <select
                    value={newCatBucket}
                    onChange={(e) => setNewCatBucket(e.target.value as Bucket)}
                    className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:outline-none"
                  >
                    <option value="needs">Needs (50%)</option>
                    <option value="wants">Wants (30%)</option>
                    <option value="savings">Savings (20%)</option>
                  </select>
                  <select
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:outline-none"
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
                      className="w-10 h-8 p-0 border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer"
                    />
                    <button
                      type="submit"
                      className="flex-1 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-xs transition"
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
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:outline-none"
                />
              </form>

              {/* List of categories */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Registered Categories:</span>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {categories.map((c) => (
                    <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${c.color}15`, color: c.color }}
                        >
                          <CategoryIcon name={c.icon} className="text-sm" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                            <span className="uppercase text-xs font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              {c.bucket}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {c.keywords.slice(0, 5).join(', ')}
                            {c.keywords.length > 5 ? '...' : ''}
                          </p>
                        </div>
                      </div>
                      {!c.isDefault && (
                        <button
                          onClick={() => onDeleteCategory(c.id)}
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 rounded-lg"
                          title="Delete Custom Category"
                        >
                          <Trash2 className="w-4 h-4" />
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
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The app remembers the following merchants so subsequent transactions are auto-categorized automatically.
              </p>
              {Object.keys(merchantMemory).length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No remembered merchants yet
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {Object.entries(merchantMemory).map(([merchant, catId]) => {
                    const cat = categories.find((c) => c.id === catId);
                    return (
                      <div key={merchant} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white capitalize">
                            {merchant}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">
                            → {cat ? cat.name : catId}
                          </span>
                        </div>
                        <button
                          onClick={() => onRemoveMerchantMemory(merchant)}
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 rounded-lg"
                          title="Forget Merchant"
                        >
                          <Trash2 className="w-4 h-4" />
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
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Export Data
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Save a local backup file so your financial data is never lost.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => exportToJSON(appData)}
                    className="flex-1 py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON Backup</span>
                  </button>
                  <button
                    onClick={() => exportToCSV(appData.transactions, categories)}
                    className="flex-1 py-2.5 px-3 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-300"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Import Data
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Restore previously exported JSON backup file.
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-300">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose JSON File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900 space-y-3">
                <span className="text-xs font-bold text-rose-800 dark:text-rose-200 block">
                  Reset All Data
                </span>
                <p className="text-xs text-rose-700/80 dark:text-rose-300/80">
                  Erase all recorded transactions, plans, and customized categories. Returns application to factory defaults.
                </p>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all data to default? All recorded transactions will be deleted.')) {
                      onResetData();
                      alert('Data has been reset to defaults.');
                      onClose();
                    }
                  }}
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Factory Defaults</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
