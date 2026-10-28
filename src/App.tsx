import { useState, useEffect, useMemo, useRef } from 'react';
import { loadAppData, saveAppData, createEmptyAppData } from './utils/storage';
import type { AppData } from './utils/storage';
import { calculateMonthBudget } from './utils/calculator';
import type { Transaction, MonthPlan, Category, TransactionType, ThemeMode } from './types/budget';
import { Navbar } from './components/Navbar';
import { SmartInsight } from './components/SmartInsight';
import { SpendingGauge } from './components/SpendingGauge';
import { BucketCards } from './components/BucketCards';
import { CashFlowSummary } from './components/CashFlowSummary';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { TransactionList } from './components/TransactionList';
import { AddTransactionModal } from './components/AddTransactionModal';
import { PlanModal } from './components/PlanModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './components/LandingPage';
import { Footer } from './components/Footer';
import { LegalModal } from './components/LegalModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { loadCloudAppData, saveCloudAppData } from './utils/supabase';
import { Plus } from 'lucide-react';
import confetti from 'canvas-confetti';

function BudgetTrackerApp() {
  const { user, isLoading, isRecoveryMode } = useAuth();

  const [appData, setAppData] = useState<AppData>(() => loadAppData());
  const [currentMonth, setCurrentMonth] = useState<string>('2026-10');
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const isFirstSyncDoneRef = useRef<boolean>(false);

  // Theme state with localStorage persistence (Default to Light Mode)
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem('budget_tracker_theme');
      if (savedTheme) return savedTheme === 'dark';
    } catch {}
    return false; // Default to Light Mode
  });

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('budget_tracker_theme_mode');
      return saved === 'modern' ? 'modern' : 'newspaper';
    } catch {
      return 'newspaper';
    }
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [legalType, setLegalType] = useState<'privacy' | 'terms' | null>(null);

  // Auto-open modal if user opened a password reset link
  useEffect(() => {
    if (isRecoveryMode) {
      setIsAuthModalOpen(true);
    }
  }, [isRecoveryMode]);

  // Sync theme-newspaper class on <html> document element and persist in localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'newspaper') {
      root.classList.add('theme-newspaper');
    } else {
      root.classList.remove('theme-newspaper');
    }
    try {
      localStorage.setItem('budget_tracker_theme_mode', themeMode);
    } catch {}
  }, [themeMode]);

  // Global keyboard shortcut: Press 'N' to open Add Transaction Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsAddModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync dark class on <html> document element and persist in localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      try { localStorage.setItem('budget_tracker_theme', 'dark'); } catch {}
    } else {
      root.classList.remove('dark');
      try { localStorage.setItem('budget_tracker_theme', 'light'); } catch {}
    }
  }, [isDark]);

  // 1. Cloud Authentication & Initial Data Load
  useEffect(() => {
    let isCancelled = false;

    if (!user) {
      isFirstSyncDoneRef.current = false;
      setIsCloudSynced(false);
      return;
    }

    setIsCloudSynced(false);
    loadCloudAppData(user.id).then(async (cloudData) => {
      if (isCancelled) return;

      if (cloudData && (Object.keys(cloudData.plans).length > 0 || cloudData.transactions.length > 0)) {
        // User has existing records in PostgreSQL
        setAppData(cloudData);
        saveAppData(cloudData);
        isFirstSyncDoneRef.current = true;
        setIsCloudSynced(true);
      } else {
        // New account: initialize with clean slate (0 transactions)
        const cleanInitialData = createEmptyAppData(currentMonth);
        setAppData(cleanInitialData);
        saveAppData(cleanInitialData);
        await saveCloudAppData(user.id, cleanInitialData);
        if (isCancelled) return;
        isFirstSyncDoneRef.current = true;
        setIsCloudSynced(true);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [user]);

  // 2. Data Persistence (Local Storage + Debounced Cloud Upsert)
  useEffect(() => {
    saveAppData(appData);

    if (!user || !isFirstSyncDoneRef.current) {
      return;
    }

    setIsCloudSynced(false);
    const timer = setTimeout(async () => {
      const res = await saveCloudAppData(user.id, appData);
      if (res.success) {
        setIsCloudSynced(true);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [appData, user]);

  const monthPlan = useMemo<MonthPlan>(() => {
    if (appData.plans[currentMonth]) {
      return appData.plans[currentMonth];
    }
    const existingKeys = Object.keys(appData.plans);
    const lastPlan = existingKeys.length > 0 ? appData.plans[existingKeys[existingKeys.length - 1]] : null;
    return {
      month: currentMonth,
      income: lastPlan ? lastPlan.income : 10_000_000,
      split: lastPlan ? lastPlan.split : { needs: 50, wants: 30, savings: 20 },
    };
  }, [appData.plans, currentMonth]);

  const summary = useMemo(() => {
    return calculateMonthBudget(monthPlan, appData.transactions, appData.categories);
  }, [monthPlan, appData.transactions, appData.categories]);

  const handleAddTransaction = (newTxData: {
    description: string;
    amount: number;
    type: TransactionType;
    categoryId: string | null;
    date: string;
    note?: string;
    rememberMerchant?: boolean;
  }) => {
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: newTxData.date,
      description: newTxData.description,
      amount: newTxData.amount,
      type: newTxData.type,
      categoryId: newTxData.categoryId,
      autoCategorized: false,
      note: newTxData.note,
    };

    let updatedMerchantMemory = { ...appData.settings.merchantMemory };
    if (newTxData.rememberMerchant && newTxData.categoryId) {
      const merchantKey = newTxData.description.toLowerCase().trim();
      updatedMerchantMemory[merchantKey] = newTxData.categoryId;
    }

    setAppData((prev) => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
      settings: {
        ...prev.settings,
        merchantMemory: updatedMerchantMemory,
      },
    }));

    if (newTxData.type === 'savings' && summary.savingsSaved + newTxData.amount >= summary.savingsBudget) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setAppData((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) =>
        t.id === updatedTx.id ? updatedTx : t
      ),
    }));
  };

  const handleRecategorizeTransaction = (id: string, newCategoryId: string, remember: boolean) => {
    const target = appData.transactions.find((t) => t.id === id);
    if (!target) return;

    let updatedMerchantMemory = { ...appData.settings.merchantMemory };
    if (remember && target.description) {
      updatedMerchantMemory[target.description.toLowerCase().trim()] = newCategoryId;
    }

    setAppData((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) =>
        t.id === id ? { ...t, categoryId: newCategoryId } : t
      ),
      settings: {
        ...prev.settings,
        merchantMemory: updatedMerchantMemory,
      },
    }));
  };

  const handleSavePlan = (updatedPlan: MonthPlan) => {
    setAppData((prev) => ({
      ...prev,
      plans: {
        ...prev.plans,
        [updatedPlan.month]: updatedPlan,
      },
    }));
  };

  const handleAddCategory = (newCat: Category) => {
    setAppData((prev) => ({
      ...prev,
      categories: [...prev.categories, newCat],
    }));
  };

  const handleDeleteCategory = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id),
    }));
  };

  const handleRemoveMerchantMemory = (merchant: string) => {
    setAppData((prev) => {
      const nextMem = { ...prev.settings.merchantMemory };
      delete nextMem[merchant];
      return {
        ...prev,
        settings: {
          ...prev.settings,
          merchantMemory: nextMem,
        },
      };
    });
  };

  const handleResetData = () => {
    localStorage.clear();
    setAppData(loadAppData());
  };

  const handleImportTransactions = (importedTransactions: Transaction[], mode: 'replace' | 'merge') => {
    setAppData((prev) => {
      let nextTx: Transaction[];
      if (mode === 'replace') {
        nextTx = importedTransactions;
      } else {
        const existingIds = new Set(prev.transactions.map((t) => t.id));
        const newItems = importedTransactions.filter((t) => !existingIds.has(t.id));
        nextTx = [...newItems, ...prev.transactions];
      }
      return {
        ...prev,
        transactions: nextTx,
      };
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-editorial">
        <div className="border-2 border-stone-900 dark:border-stone-400 p-6 bg-stone-100/80 dark:bg-stone-900 text-center space-y-2">
          <h2 className="font-headline font-black text-xl uppercase text-stone-950 dark:text-stone-50">
            The Daily News
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Loading your budget data...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LandingPage
          isDark={isDark}
          onToggleTheme={() => setIsDark((prev) => !prev)}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen py-0 sm:py-6 px-0 sm:px-4 font-editorial">
      {/* Newspaper Broadsheet Page (Reference Image 1: Full Broadsheet Container) */}
      <div className="broadsheet-page max-w-6xl mx-auto p-3.5 sm:p-7 space-y-4 sm:space-y-6">
        {/* Front-Page Masthead */}
        <Navbar
          currentMonth={currentMonth}
          onChangeMonth={setCurrentMonth}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenPlanModal={() => setIsPlanModalOpen(true)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          user={user}
          isCloudSynced={isCloudSynced}
          income={monthPlan.income}
          isDark={isDark}
          onToggleTheme={() => setIsDark((prev) => !prev)}
        />

        {/* Top Hero Section: Figure I Technical Scale Meter (5 cols) & Front-Page Dispatch Intelligence (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          <div className="lg:col-span-5 flex flex-col">
            <SpendingGauge summary={summary} categories={appData.categories} />
          </div>
          <div className="lg:col-span-7 flex flex-col">
            <SmartInsight summary={summary} />
          </div>
        </div>

        {/* 1. Full-Width Table I: Official Financial Ledger (Inflow, Outflow, Savings, Buffer) */}
        <div>
          <CashFlowSummary summary={summary} />
        </div>

        {/* 2. Full-Width Tripartite Allocation (Section I, II, III: Living Necessities, Discretionary Desires, Capital Reserves) */}
        <div>
          <BucketCards summary={summary} planSplit={monthPlan.split} />
        </div>

        {/* 3. Full-Width Section IV: Commodity & Expenditure Census */}
        <div>
          <CategoryBreakdown summary={summary} categories={appData.categories} />
        </div>

        {/* 4. Transactions List */}
        <div>
          <TransactionList
            transactions={appData.transactions}
            categories={appData.categories}
            currentMonth={currentMonth}
            onDeleteTransaction={handleDeleteTransaction}
            onRecategorizeTransaction={handleRecategorizeTransaction}
            onUpdateTransaction={handleUpdateTransaction}
          />
        </div>

        {/* Footer */}
        <Footer
          onOpenPrivacy={() => setLegalType('privacy')}
          onOpenTerms={() => setLegalType('terms')}
        />
      </div>

      {/* Floating Add Transaction Button for Mobile */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="sm:hidden fixed right-4 bottom-5 z-40 w-12 h-12 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 border-2 border-stone-900 dark:border-stone-400 shadow-2xl flex items-center justify-center font-bold transition active:scale-95"
        title="Add Transaction"
        aria-label="Add Transaction"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTransaction={handleAddTransaction}
        categories={appData.categories}
        merchantMemory={appData.settings.merchantMemory}
        defaultDate={`${currentMonth}-15`}
      />

      <PlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        currentPlan={monthPlan}
        onSavePlan={handleSavePlan}
        summary={summary}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        categories={appData.categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        merchantMemory={appData.settings.merchantMemory}
        onRemoveMerchantMemory={handleRemoveMerchantMemory}
        appData={appData}
        onImportTransactions={handleImportTransactions}
        onResetData={handleResetData}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        themeMode={themeMode}
        onToggleThemeMode={() => setThemeMode((prev) => (prev === 'newspaper' ? 'modern' : 'newspaper'))}
        userEmail={user?.email}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={() => {
          setIsCloudSynced(false);
        }}
      />

      <LegalModal
        isOpen={Boolean(legalType)}
        onClose={() => setLegalType(null)}
        type={legalType || 'privacy'}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BudgetTrackerApp />
    </AuthProvider>
  );
}

export default App;
