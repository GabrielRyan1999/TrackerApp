import React, { useState, useEffect } from 'react';
import { useScrollLock } from '../hooks/useScrollLock';
import type { MonthPlan, BudgetSummary } from '../types/budget';
import { parseIDR, formatIDR } from '../utils/idr';
import { buildPlan } from '../utils/calculator';
import { X, AlertTriangle, Lock, Unlock } from 'lucide-react';

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setParsedIncome(currentPlan.income);
      setIncomeRaw(currentPlan.income > 0 ? currentPlan.income.toLocaleString('id-ID') : '');
      setNeedsPct(currentPlan.split.needs);
      setWantsPct(currentPlan.split.wants);
      setSavingsPct(currentPlan.split.savings);
      setErrorMsg(null);
    }
  }, [isOpen, currentPlan]);

  const handleIncomeChange = (val: string) => {
    setIncomeRaw(val);
    const parsed = parseIDR(val);
    setParsedIncome(parsed);
    if (parsed > 0) setErrorMsg(null);
  };

  type BucketKey = 'needs' | 'wants' | 'savings';

  const [locked, setLocked] = useState<{ needs: boolean; wants: boolean; savings: boolean }>({
    needs: false,
    wants: false,
    savings: false,
  });

  const toggleLock = (key: BucketKey) => {
    setLocked((prev) => {
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

    if (isLocked1 && !isLocked2) {
      new2 = Math.max(0, Math.min(100, current[key2] - delta));
      finalChanged = 100 - new1 - new2;
    } else if (isLocked2 && !isLocked1) {
      new1 = Math.max(0, Math.min(100, current[key1] - delta));
      finalChanged = 100 - new2 - new1;
    } else {
      let half1 = Math.floor(delta / 2);
      let half2 = delta - half1;

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

      if (target1 < 0) {
        target2 += target1;
        target1 = 0;
      }
      if (target2 < 0) {
        target1 += target2;
        target2 = 0;
      }

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
      setErrorMsg('Please enter a valid monthly income greater than 0.');
      return;
    }
    if (!isTotal100) {
      setErrorMsg(`Allocation total must equal 100%! (Currently: ${totalPct}%)`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain">
      <div className="bg-[#f4efe4] dark:bg-[#161513] border-2 border-stone-900 dark:border-stone-400 max-w-xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-stone-950 dark:text-stone-50 overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b-2 border-stone-900 dark:border-stone-400">
          <div>
            <h3 className="font-headline text-lg sm:text-xl font-black uppercase text-stone-950 dark:text-stone-50">
              Budget Allocation Plan
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

          {/* Income Input */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
              Monthly Income (IDR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-bold text-stone-500 pointer-events-none">
                Rp
              </span>
              <input
                type="text"
                value={incomeRaw}
                onChange={(e) => handleIncomeChange(e.target.value)}
                onBlur={() => {
                  if (parsedIncome > 0) {
                    setIncomeRaw(parsedIncome.toLocaleString('id-ID'));
                  }
                }}
                placeholder="e.g. 5jt, 3.5jt, 2.5jt, 10jt"
                className="w-full pl-10 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-900 dark:border-stone-400 text-base font-bold font-mono-num text-stone-950 dark:text-stone-50 focus:outline-none"
                required
              />
            </div>
            <span className="text-[11px] text-stone-500 dark:text-stone-400 block mt-1">
              Shortcuts: 2.5jt, 3.5jt, 5jt, 10jt, or type numbers directly
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block">
              Quick Presets:
            </span>
            <div className="flex flex-wrap gap-1">
              {[2_500_000, 3_500_000, 5_000_000, 7_500_000, 10_000_000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleIncomeChange(preset.toLocaleString('id-ID'))}
                  className={`px-2.5 py-1 text-xs font-bold font-mono-num border transition ${
                    parsedIncome === preset
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 border-stone-900 dark:border-stone-400'
                      : 'bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-400 dark:border-stone-600 hover:bg-stone-300'
                  }`}
                >
                  {formatIDR(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* Allocation Ratios */}
          <div className="pt-2 space-y-3">
            <div className="flex justify-between items-center text-xs pb-1 border-b border-stone-900 dark:border-stone-400">
              <span className="font-bold text-xs uppercase tracking-wider text-stone-900 dark:text-stone-100">
                Allocation Ratios
              </span>
              <span className={`font-bold uppercase tracking-wider px-2 py-0.5 border text-[11px] ${
                isTotal100
                  ? 'border-stone-900 dark:border-stone-400 bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
                  : 'border-red-700 bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
              }`}>
                {isTotal100 ? '100% Balanced' : `Total: ${totalPct}%`}
              </span>
            </div>

            {/* Live Visual Stacked Split Bar */}
            <div>
              <div className="w-full h-3 border border-stone-900 dark:border-stone-400 overflow-hidden flex bg-stone-200 dark:bg-stone-800">
                <div
                  style={{ width: `${needsPct}%` }}
                  className="h-full bg-stone-900 dark:bg-stone-100 transition-all duration-100 border-r border-stone-400"
                  title={`Needs: ${needsPct}%`}
                />
                <div
                  style={{ width: `${wantsPct}%` }}
                  className="h-full bg-stone-600 dark:bg-stone-400 transition-all duration-100 border-r border-stone-400"
                  title={`Wants: ${wantsPct}%`}
                />
                <div
                  style={{ width: `${savingsPct}%` }}
                  className="h-full bg-stone-400 dark:bg-stone-600 transition-all duration-100"
                  title={`Savings: ${savingsPct}%`}
                />
              </div>
            </div>

            {/* Needs Card */}
            <div className="p-3 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 space-y-2">
              <div className="flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold uppercase tracking-wider text-stone-950 dark:text-stone-50">
                    Needs
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleLock('needs')}
                    className={`p-1 border transition text-xs flex items-center justify-center ${
                      locked.needs
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 border-stone-900 dark:border-stone-400'
                        : 'border-stone-300 dark:border-stone-700 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                    title={locked.needs ? 'Locked: fixed ratio' : 'Click to lock ratio'}
                    aria-label={locked.needs ? 'Unlock Needs' : 'Lock Needs'}
                  >
                    {locked.needs ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center border border-stone-900 dark:border-stone-400 overflow-hidden bg-white dark:bg-stone-950">
                    <button
                      type="button"
                      onClick={() => handleStep('needs', -5)}
                      className="w-6 h-6 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-800 text-xs font-bold transition select-none"
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
                      className="w-8 text-center font-bold font-mono-num text-xs bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-xs font-bold text-stone-500 pr-1 select-none">%</span>
                    <button
                      type="button"
                      onClick={() => handleStep('needs', 5)}
                      className="w-6 h-6 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-800 text-xs font-bold transition select-none"
                      title="Increase Needs by 5%"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold font-mono-num text-stone-950 dark:text-stone-50 min-w-[85px] text-right">
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
                className="w-full accent-stone-900 dark:accent-stone-100 cursor-pointer"
              />
            </div>

            {/* Wants Card */}
            <div className="p-3 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 space-y-2">
              <div className="flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold uppercase tracking-wider text-stone-950 dark:text-stone-50">
                    Wants
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleLock('wants')}
                    className={`p-1 border transition text-xs flex items-center justify-center ${
                      locked.wants
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 border-stone-900 dark:border-stone-400'
                        : 'border-stone-300 dark:border-stone-700 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                    title={locked.wants ? 'Locked: fixed ratio' : 'Click to lock ratio'}
                    aria-label={locked.wants ? 'Unlock Wants' : 'Lock Wants'}
                  >
                    {locked.wants ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center border border-stone-900 dark:border-stone-400 overflow-hidden bg-white dark:bg-stone-950">
                    <button
                      type="button"
                      onClick={() => handleStep('wants', -5)}
                      className="w-6 h-6 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-800 text-xs font-bold transition select-none"
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
                      className="w-8 text-center font-bold font-mono-num text-xs bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-xs font-bold text-stone-500 pr-1 select-none">%</span>
                    <button
                      type="button"
                      onClick={() => handleStep('wants', 5)}
                      className="w-6 h-6 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-800 text-xs font-bold transition select-none"
                      title="Increase Wants by 5%"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold font-mono-num text-stone-950 dark:text-stone-50 min-w-[85px] text-right">
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
                className="w-full accent-stone-900 dark:accent-stone-100 cursor-pointer"
              />
            </div>

            {/* Savings Card */}
            <div className="p-3 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 space-y-2">
              <div className="flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold uppercase tracking-wider text-stone-950 dark:text-stone-50">
                    Savings
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleLock('savings')}
                    className={`p-1 border transition text-xs flex items-center justify-center ${
                      locked.savings
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 border-stone-900 dark:border-stone-400'
                        : 'border-stone-300 dark:border-stone-700 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                    title={locked.savings ? 'Locked: fixed ratio' : 'Click to lock ratio'}
                    aria-label={locked.savings ? 'Unlock Savings' : 'Lock Savings'}
                  >
                    {locked.savings ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center border border-stone-900 dark:border-stone-400 overflow-hidden bg-white dark:bg-stone-950">
                    <button
                      type="button"
                      onClick={() => handleStep('savings', -5)}
                      className="w-6 h-6 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-800 text-xs font-bold transition select-none"
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
                      className="w-8 text-center font-bold font-mono-num text-xs bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-xs font-bold text-stone-500 pr-1 select-none">%</span>
                    <button
                      type="button"
                      onClick={() => handleStep('savings', 5)}
                      className="w-6 h-6 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-800 text-xs font-bold transition select-none"
                      title="Increase Savings by 5%"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold font-mono-num text-stone-950 dark:text-stone-50 min-w-[85px] text-right">
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
                className="w-full accent-stone-900 dark:accent-stone-100 cursor-pointer"
              />
            </div>

            {/* Presets */}
            <div className="pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-1.5">
                Ratio Presets:
              </span>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {[
                  { label: '50/30/20 (Default)', n: 50, w: 30, s: 20 },
                  { label: '60/20/20', n: 60, w: 20, s: 20 },
                  { label: '70/20/10', n: 70, w: 20, s: 10 },
                  { label: '50/20/30', n: 50, w: 20, s: 30 },
                  { label: '40/30/30', n: 40, w: 30, s: 30 },
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
                    className={`px-2.5 py-1 text-xs font-bold font-mono-num border transition ${
                      needsPct === preset.n && wantsPct === preset.w && savingsPct === preset.s
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 border-stone-900 dark:border-stone-400'
                        : 'bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-400 hover:bg-stone-300 dark:hover:bg-stone-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Historical warning banner */}
          {hasDeviations && (
            <div className="p-3 bg-stone-200/60 dark:bg-stone-800/60 border border-stone-900 dark:border-stone-400 flex items-start gap-2.5 text-xs text-stone-900 dark:text-stone-100">
              <AlertTriangle className="w-4 h-4 text-stone-800 dark:text-stone-200 shrink-0 mt-0.5" />
              <p>
                Historical disbursements show Needs at <strong>{actualNeedsShare}%</strong> and Wants at <strong>{actualWantsShare}%</strong>. Adjust allocation ratios or realign expenditures.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-300 dark:border-stone-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 border border-stone-900 dark:border-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isTotal100}
              className="px-6 py-2 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-950 font-bold uppercase tracking-wider text-xs border border-stone-900 dark:border-stone-400 transition disabled:opacity-50"
            >
              Save Budget Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
