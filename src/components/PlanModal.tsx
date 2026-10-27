import React, { useState, useEffect } from 'react';
import type { MonthPlan, BudgetSummary } from '../types/budget';
import { parseIDR, formatIDR } from '../utils/idr';
import { buildPlan } from '../utils/calculator';
import { X, Calculator, AlertTriangle, Lock, Unlock } from 'lucide-react';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: MonthPlan;
  onSavePlan: (updatedPlan: MonthPlan) => void;
  summary: BudgetSummary;
}

export const PlanModal: React.FC<PlanModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onSavePlan,
  summary,
}) => {
  const [incomeRaw, setIncomeRaw] = useState('');
  const [parsedIncome, setParsedIncome] = useState(10_000_000);
  const [needsPct, setNeedsPct] = useState(50);
  const [wantsPct, setWantsPct] = useState(30);
  const [savingsPct, setSavingsPct] = useState(20);

  useEffect(() => {
    if (isOpen) {
      setParsedIncome(currentPlan.income);
      setIncomeRaw(currentPlan.income.toString());
      setNeedsPct(currentPlan.split.needs);
      setWantsPct(currentPlan.split.wants);
      setSavingsPct(currentPlan.split.savings);
    }
  }, [isOpen, currentPlan]);

  const handleIncomeChange = (val: string) => {
    setIncomeRaw(val);
    const parsed = parseIDR(val);
    setParsedIncome(parsed);
  };

  type BucketKey = 'needs' | 'wants' | 'savings';

  const [locked, setLocked] = useState<{ needs: boolean; wants: boolean; savings: boolean }>({
    needs: false,
    wants: false,
    savings: false,
  });

  const toggleLock = (key: BucketKey) => {
    setLocked((prev) => {
      // Don't allow locking all 3 (otherwise nothing can move)
      const count = Object.values(prev).filter(Boolean).length;
      if (!prev[key] && count >= 2) return prev;
      return { ...prev, [key]: !prev[key] };
    });
  };

  // Dynamic 3-way linked allocation adjustment with equal (50/50) shared delta balancing and optional pin/lock
  const handleRatioChange = (changedKey: BucketKey, targetVal: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(targetVal)));
    const currentVal = changedKey === 'needs' ? needsPct : changedKey === 'wants' ? wantsPct : savingsPct;
    const delta = clamped - currentVal;
    if (delta === 0) return;

    const current = { needs: needsPct, wants: wantsPct, savings: savingsPct };
    const otherKeys = (['needs', 'wants', 'savings'] as BucketKey[]).filter((k) => k !== changedKey);
    const key1 = otherKeys[0];
    const key2 = otherKeys[1];

    const isLocked1 = locked[key1];
    const isLocked2 = locked[key2];

    let new1 = current[key1];
    let new2 = current[key2];
    let finalChanged = clamped;

    // Case 1: Key1 is locked, Key2 absorbs the entire adjustment
    if (isLocked1 && !isLocked2) {
      new2 = Math.max(0, Math.min(100, current[key2] - delta));
      finalChanged = 100 - new1 - new2;
    }
    // Case 2: Key2 is locked, Key1 absorbs the entire adjustment
    else if (isLocked2 && !isLocked1) {
      new1 = Math.max(0, Math.min(100, current[key1] - delta));
      finalChanged = 100 - new2 - new1;
    }
    // Case 3: Neither locked (or both locked) -> Equal 50/50 split of the delta!
    else {
      let half1 = Math.floor(delta / 2);
      let half2 = delta - half1;

      // When reducing, let the larger one absorb the extra 1% to keep them balanced;
      // when increasing, give the extra 1% to the smaller one.
      if (delta > 0 && current[key1] < current[key2]) {
        const temp = half1;
        half1 = half2;
        half2 = temp;
      } else if (delta < 0 && current[key1] > current[key2]) {
        const temp = half1;
        half1 = half2;
        half2 = temp;
      }

      let target1 = current[key1] - half1;
      let target2 = current[key2] - half2;

      // Handle hitting 0 bounds
      if (target1 < 0) {
        target2 += target1;
        target1 = 0;
      }
      if (target2 < 0) {
        target1 += target2;
        target2 = 0;
      }

      // Handle hitting 100 bounds
      if (target1 > 100) {
        target2 -= (target1 - 100);
        target1 = 100;
      }
      if (target2 > 100) {
        target1 -= (target2 - 100);
        target2 = 100;
      }

      new1 = Math.max(0, Math.min(100, target1));
      new2 = Math.max(0, Math.min(100, target2));
      finalChanged = 100 - new1 - new2;
    }

    setNeedsPct(changedKey === 'needs' ? finalChanged : key1 === 'needs' ? new1 : new2);
    setWantsPct(changedKey === 'wants' ? finalChanged : key1 === 'wants' ? new1 : new2);
    setSavingsPct(changedKey === 'savings' ? finalChanged : key1 === 'savings' ? new1 : new2);
  };

  const handleStep = (key: BucketKey, delta: number) => {
    const currentVal = key === 'needs' ? needsPct : key === 'wants' ? wantsPct : savingsPct;
    handleRatioChange(key, currentVal + delta);
  };

  if (!isOpen) return null;

  const totalPct = needsPct + wantsPct + savingsPct;
  const isTotal100 = totalPct === 100;

  const planPreview = buildPlan(parsedIncome, {
    needs: needsPct,
    wants: wantsPct,
    savings: savingsPct,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedIncome <= 0) {
      alert('Please enter a valid monthly income.');
      return;
    }
    if (!isTotal100) {
      alert(`Allocation total must equal 100%! (Currently: ${totalPct}%)`);
      return;
    }

    onSavePlan({
      ...currentPlan,
      income: parsedIncome,
      split: {
        needs: needsPct,
        wants: wantsPct,
        savings: savingsPct,
      },
    });

    onClose();
  };

  const actualNeedsShare = summary.income > 0 ? Math.round((summary.needsSpent / summary.income) * 100) : 0;
  const actualWantsShare = summary.income > 0 ? Math.round((summary.wantsSpent / summary.income) * 100) : 0;
  const hasDeviations = actualNeedsShare > needsPct + 10 || actualWantsShare > wantsPct + 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0e1626] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Budget Plan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure monthly income and 50/30/20 target ratios
              </p>
            </div>
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
          {/* Income Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Monthly Income (IDR)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-sm font-bold text-slate-400 pointer-events-none">
                Rp
              </span>
              <input
                type="text"
                value={incomeRaw}
                onChange={(e) => handleIncomeChange(e.target.value)}
                placeholder="e.g. 5jt, 3.5jt, 2.5jt, 10jt"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block mt-1">
              {parsedIncome > 0 ? `Calculated: ${formatIDR(parsedIncome)}` : 'Shortcut hints: 2.5jt, 3.5jt, 5jt, 10jt'}
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
              Quick Income Presets (UMR & Salary Range):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[2_500_000, 3_500_000, 5_000_000, 7_500_000, 10_000_000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleIncomeChange(preset.toString())}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold border transition ${
                    parsedIncome === preset
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {formatIDR(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* Allocation Ratios */}
          <div className="pt-2 space-y-3.5">
            <div className="flex justify-between items-center text-xs pb-1 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white">
                Target Allocation Ratio (50/30/20 Rule)
              </span>
              <span className="font-bold px-2.5 py-0.5 rounded-md border bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>100% Balanced</span>
              </span>
            </div>

            {/* Live Visual Stacked Split Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800 shadow-xs">
                <div
                  style={{ width: `${needsPct}%` }}
                  className="h-full bg-blue-600 transition-all duration-100"
                  title={`Needs: ${needsPct}%`}
                />
                <div
                  style={{ width: `${wantsPct}%` }}
                  className="h-full bg-pink-600 transition-all duration-100"
                  title={`Wants: ${wantsPct}%`}
                />
                <div
                  style={{ width: `${savingsPct}%` }}
                  className="h-full bg-emerald-600 transition-all duration-100"
                  title={`Savings: ${savingsPct}%`}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sliders rebalance equally (50/50) to maintain 100%. Lock any bucket (🔒) to keep its value fixed.
              </p>
            </div>

            {/* Needs Row */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-blue-700 dark:text-blue-400 font-bold truncate">
                    Needs (Essentials)
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleLock('needs')}
                    className={`p-1 rounded-md transition text-xs flex items-center gap-1 ${
                      locked.needs
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                    title={locked.needs ? 'Locked: this bucket is fixed' : 'Unlocked: click to lock'}
                    aria-label={locked.needs ? 'Unlock Needs' : 'Lock Needs'}
                  >
                    {locked.needs ? <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
                    <button
                      type="button"
                      onClick={() => handleStep('needs', -5)}
                      className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition select-none"
                      title="Decrease Needs by 5%"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={needsPct}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (!isNaN(v)) handleRatioChange('needs', v);
                      }}
                      className="w-8 text-center font-extrabold text-slate-900 dark:text-white text-xs bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 pr-1 select-none">%</span>
                    <button
                      type="button"
                      onClick={() => handleStep('needs', 5)}
                      className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition select-none"
                      title="Increase Needs by 5%"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 min-w-[85px] text-right">
                    {formatIDR(planPreview.needs)}
                  </span>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={needsPct}
                onChange={(e) => handleRatioChange('needs', parseInt(e.target.value, 10))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Wants Row */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-pink-700 dark:text-pink-400 font-bold truncate">
                    Wants (Discretionary)
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleLock('wants')}
                    className={`p-1 rounded-md transition text-xs flex items-center gap-1 ${
                      locked.wants
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                    title={locked.wants ? 'Locked: this bucket is fixed' : 'Unlocked: click to lock'}
                    aria-label={locked.wants ? 'Unlock Wants' : 'Lock Wants'}
                  >
                    {locked.wants ? <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
                    <button
                      type="button"
                      onClick={() => handleStep('wants', -5)}
                      className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition select-none"
                      title="Decrease Wants by 5%"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={wantsPct}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (!isNaN(v)) handleRatioChange('wants', v);
                      }}
                      className="w-8 text-center font-extrabold text-slate-900 dark:text-white text-xs bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 pr-1 select-none">%</span>
                    <button
                      type="button"
                      onClick={() => handleStep('wants', 5)}
                      className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition select-none"
                      title="Increase Wants by 5%"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 min-w-[85px] text-right">
                    {formatIDR(planPreview.wants)}
                  </span>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={wantsPct}
                onChange={(e) => handleRatioChange('wants', parseInt(e.target.value, 10))}
                className="w-full accent-pink-600 cursor-pointer"
              />
            </div>

            {/* Savings Row */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold truncate">
                    Savings (Investments)
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleLock('savings')}
                    className={`p-1 rounded-md transition text-xs flex items-center gap-1 ${
                      locked.savings
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                    title={locked.savings ? 'Locked: this bucket is fixed' : 'Unlocked: click to lock'}
                    aria-label={locked.savings ? 'Unlock Savings' : 'Lock Savings'}
                  >
                    {locked.savings ? <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
                    <button
                      type="button"
                      onClick={() => handleStep('savings', -5)}
                      className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition select-none"
                      title="Decrease Savings by 5%"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={savingsPct}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (!isNaN(v)) handleRatioChange('savings', v);
                      }}
                      className="w-8 text-center font-extrabold text-slate-900 dark:text-white text-xs bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 pr-1 select-none">%</span>
                    <button
                      type="button"
                      onClick={() => handleStep('savings', 5)}
                      className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition select-none"
                      title="Increase Savings by 5%"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 min-w-[85px] text-right">
                    {formatIDR(planPreview.savings)}
                  </span>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={savingsPct}
                onChange={(e) => handleRatioChange('savings', parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Preset split buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-1.5 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { label: '50/30/20 Standard', n: 50, w: 30, s: 20 },
                  { label: '60/20/20 Essentials', n: 60, w: 20, s: 20 },
                  { label: '70/20/10 High Cost', n: 70, w: 20, s: 10 },
                  { label: '50/20/30 Wealth', n: 50, w: 20, s: 30 },
                  { label: '40/30/30 Balanced', n: 40, w: 30, s: 30 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setNeedsPct(preset.n);
                      setWantsPct(preset.w);
                      setSavingsPct(preset.s);
                      setLocked({ needs: false, wants: false, savings: false });
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold border transition ${
                      needsPct === preset.n && wantsPct === preset.w && savingsPct === preset.s
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setNeedsPct(50);
                  setWantsPct(30);
                  setSavingsPct(20);
                  setLocked({ needs: false, wants: false, savings: false });
                }}
                className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 underline"
              >
                Reset Standard
              </button>
            </div>
          </div>

          {/* Historical warning banner */}
          {hasDeviations && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                Historical spending shows Needs at <strong>{actualNeedsShare}%</strong> and Wants at <strong>{actualWantsShare}%</strong>. Adjust target ratios here or realign daily spending habits.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isTotal100}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Save Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
