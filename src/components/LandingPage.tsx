import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck, Sparkles, Scale } from 'lucide-react';

interface LandingPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

type AuthTab = 'signin' | 'signup' | 'forgot';

export const LandingPage: React.FC<LandingPageProps> = ({ isDark, onToggleTheme }) => {
  const { signIn, signUp, sendPasswordReset } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage('Please furnish both citizen email and authorization password.');
      return;
    }

    setIsLoading(true);
    const res = await signIn(email, password);
    setIsLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage('Citizen identity ratified! Unlocking personal cloud ledger...');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage('Please furnish all required credential fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must contain at least 6 characters for official security.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Password confirmation does not match the entered password.');
      return;
    }

    setIsLoading(true);
    const res = await signUp(email, password);
    setIsLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else if (res.needEmailVerification) {
      setSuccessMessage(
        'Registration dispatched! A confirmation dispatch has been sent to your email. Please verify before signing in.'
      );
    } else {
      setSuccessMessage('Citizen account successfully registered! Initializing your private cloud ledger...');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email) {
      setErrorMessage('Please furnish your registered electronic mail address.');
      return;
    }

    setIsLoading(true);
    const res = await sendPasswordReset(email);
    setIsLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage(
        `Confidential recovery dispatch has been transmitted to ${email}. Check your inbox for the password reset link!`
      );
    }
  };

  return (
    <div className="min-h-screen py-0 sm:py-6 px-0 sm:px-4 font-editorial">
      <div className="broadsheet-page max-w-6xl mx-auto p-3.5 sm:p-7 space-y-4 sm:space-y-6">
        {/* Top Broadsheet Ticker */}
        <header className="border-b-2 border-stone-900 dark:border-stone-400 pb-3 pt-2">
          <div className="border-b border-stone-800 dark:border-stone-500 pb-1.5 mb-2 text-xs font-bold tracking-wider uppercase text-stone-700 dark:text-stone-300 flex flex-wrap items-center justify-between gap-2 select-none">
            <div className="flex items-center gap-2">
              <span>INAUGURAL EDITION</span>
              <span>|</span>
              <span className="text-stone-950 dark:text-stone-100 font-extrabold underline decoration-1">
                PUBLIC TREASURY REGISTRY
              </span>
              <span>|</span>
              <span className="hidden sm:inline">50/30/20 BALANCED ACCOUNTING</span>
              <span>|</span>
              <span className="hidden md:inline">POSTGRESQL CLOUD</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleTheme}
                className="hover:underline flex items-center gap-1.5 text-stone-900 dark:text-stone-100 transition"
                title="Toggle daylight/midnight newsprint"
              >
                {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
                <span>PRINT: {isDark ? 'MIDNIGHT' : 'DAYLIGHT'}</span>
              </button>
              <span className="hidden sm:inline">•</span>
              <span>PRICE: RP 0 (FREE DISPATCH)</span>
            </div>
          </div>

          {/* Masthead Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-3 py-1">
            <div className="hidden md:block md:col-span-3 text-xs text-stone-600 dark:text-stone-400 border-r border-stone-800 dark:border-stone-500 pr-3 leading-snug">
              <div className="font-headline font-bold text-stone-900 dark:text-stone-100 uppercase text-xs">
                The Financial Journal
              </div>
              <div>Dedicated to balanced Indonesian household economics.</div>
              <div className="font-mono-num text-xs mt-1 text-stone-500 dark:text-stone-400">
                VOL. XXIV • SPECIAL ISSUE
              </div>
            </div>

            <div className="md:col-span-6 text-center select-none">
              <h1 className="font-masthead text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-stone-950 dark:text-stone-50 leading-none">
                The Daily News
              </h1>
              <p className="font-headline italic text-xs sm:text-sm text-stone-700 dark:text-stone-300 mt-1">
                "All the Financial Truths & Balances Fit to Print"
              </p>
            </div>

            <div className="hidden md:block md:col-span-3 text-xs text-stone-600 dark:text-stone-400 border-l border-stone-800 dark:border-stone-500 pl-3 leading-snug text-right">
              <div className="font-headline font-bold text-stone-900 dark:text-stone-100 uppercase text-xs">
                Private Cloud Ledgers
              </div>
              <div>Secure PostgreSQL isolation per citizen account.</div>
              <div className="font-mono-num font-bold text-stone-900 dark:text-stone-100 mt-1">
                Jakarta & Regional Press
              </div>
            </div>
          </div>

          {/* Dateline Double Rule */}
          <div className="border-t-4 border-b border-stone-900 dark:border-stone-400 py-1.5 my-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-bold tracking-wider uppercase text-stone-900 dark:text-stone-100 select-none">
            <div>
              <span>YOUR TOWN, {todayFormatted}</span>
            </div>
            <div className="hidden sm:block text-center text-stone-600 dark:text-stone-400">
              <span>THE OFFICIAL CITIZEN ENROLLMENT & DOMESTIC TREASURY DISPATCH</span>
            </div>
            <div className="font-mono-num">
              <span>EDITION: CLOUD 1.0</span>
            </div>
          </div>
        </header>

        {/* Main Broadsheet Front Page Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 items-stretch">
          {/* Left Column: The Lead Story & 50/30/20 Principles (7 Cols) */}
          <section className="lg:col-span-7 border-2 border-stone-900 dark:border-stone-400 bg-stone-100/40 dark:bg-stone-900/30 p-4 sm:p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b-2 border-stone-900 dark:border-stone-400 pb-2">
                <h2 className="font-headline text-2xl sm:text-3xl font-black uppercase text-stone-950 dark:text-stone-50 leading-tight">
                  The Balanced Household: Restoring Solvency via Tripartite Accounting
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed max-w-[65ch]">
                Take command of your monthly income with the time-tested <strong>50/30/20 budget framework</strong>. Every rupiah is assigned an intentional role, banishing financial guesswork and securing lifelong peace of mind.
              </p>

              {/* Three Pillar Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border border-stone-900 dark:border-stone-400 p-3 bg-stone-200/50 dark:bg-stone-800/40">
                <div className="border-b sm:border-b-0 sm:border-r border-stone-400 dark:border-stone-600 pb-2 sm:pb-0 sm:pr-2">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-stone-900 dark:text-stone-100 mb-1">
                    <span>SECTION I</span>
                    <span className="border border-stone-900 dark:border-stone-400 px-1 py-0.5">50%</span>
                  </div>
                  <strong className="block font-headline text-xs uppercase text-stone-950 dark:text-stone-50">
                    Living Necessities
                  </strong>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-snug">
                    Housing, utilities, Indomaret groceries, transit, health liabilities.
                  </p>
                </div>

                <div className="border-b sm:border-b-0 sm:border-r border-stone-400 dark:border-stone-600 pb-2 sm:pb-0 sm:px-2">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-stone-900 dark:text-stone-100 mb-1">
                    <span>SECTION II</span>
                    <span className="border border-stone-900 dark:border-stone-400 px-1 py-0.5">30%</span>
                  </div>
                  <strong className="block font-headline text-xs uppercase text-stone-950 dark:text-stone-50">
                    Discretionary Wants
                  </strong>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-snug">
                    Dining, kopi, subscriptions, shopping, leisure outings.
                  </p>
                </div>

                <div className="sm:pl-2">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-stone-900 dark:text-stone-100 mb-1">
                    <span>SECTION III</span>
                    <span className="border border-stone-900 dark:border-stone-400 px-1 py-0.5">20%</span>
                  </div>
                  <strong className="block font-headline text-xs uppercase text-stone-950 dark:text-stone-50">
                    Capital Reserves
                  </strong>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-snug">
                    Emergency fund cushion, mutual funds, gold, future wealth.
                  </p>
                </div>
              </div>

              {/* Gazette Guarantees */}
              <div className="space-y-2 pt-2 text-xs text-stone-700 dark:text-stone-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <span><strong>100% Private Cloud Ledger:</strong> Protected by PostgreSQL Row-Level Security encryption.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                  <span><strong>Smart Merchant Learning:</strong> Auto-categorizes Indomaret, PLN, Pertamax, and dining.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-stone-900 dark:text-stone-100 shrink-0" />
                  <span><strong>Scale Barometer & Zero Drift:</strong> Real-time burn-rate needle and exact mathematical balance.</span>
                </div>
              </div>
            </div>

            <div className="border-t border-stone-300 dark:border-stone-700 pt-3 mt-4 text-xs italic text-stone-500 dark:text-stone-400">
              "A disciplined ledger transforms uncertainty into confidence." — Jakarta Treasury Gazette
            </div>
          </section>

          {/* Right Column: Citizen Registry & Authentication Box (5 Cols) */}
          <section className="lg:col-span-5 border-2 border-stone-900 dark:border-stone-400 bg-stone-100/40 dark:bg-stone-900/30 p-4 sm:p-6 flex flex-col justify-between">
            <div>
              {/* Box Header */}
              <div className="border-b-2 border-stone-900 dark:border-stone-400 pb-2 mb-3">
                <h2 className="font-headline text-xl sm:text-2xl font-black uppercase text-stone-950 dark:text-stone-50 leading-tight">
                  {activeTab === 'signin'
                    ? 'Citizen Sign In'
                    : activeTab === 'signup'
                    ? 'Enroll New Account'
                    : 'Credential Recovery'}
                </h2>
                <p className="text-xs italic text-stone-600 dark:text-stone-400 mt-0.5">
                  Access your private ledger from any laptop, tablet, or phone terminal.
                </p>
              </div>

              {/* Tab Navigation */}
              <div className="flex items-center gap-1 border border-stone-900 dark:border-stone-400 bg-stone-200/80 dark:bg-stone-800/80 p-0.5 text-xs font-bold uppercase tracking-wider mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-1.5 transition text-xs ${
                    activeTab === 'signin'
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-1.5 transition text-xs ${
                    activeTab === 'signup'
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Status Notices */}
              {errorMessage && (
                <div className="mb-3.5 p-2.5 border-2 border-red-800 bg-red-100/70 dark:bg-red-950/40 text-red-900 dark:text-red-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-800 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold uppercase tracking-wider">Access Refused</strong>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {successMessage && (
                <div className="mb-3.5 p-2.5 border-2 border-emerald-800 bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-800 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold uppercase tracking-wider">Official Dispatch</strong>
                    <span>{successMessage}</span>
                  </div>
                </div>
              )}

              {/* 1. Sign In Form */}
              {activeTab === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                      Citizen Electronic Mail (Email)
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="citizen@example.com"
                      className="w-full px-3 py-2 border border-stone-900 dark:border-stone-400 bg-white dark:bg-stone-950 text-xs font-mono-num text-stone-950 dark:text-stone-50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                        Secret Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('forgot');
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        className="text-xs text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 pr-10 border border-stone-900 dark:border-stone-400 bg-white dark:bg-stone-950 text-xs font-mono-num text-stone-950 dark:text-stone-50 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 border-2 border-stone-900 dark:border-stone-400 text-xs font-black uppercase tracking-widest hover:opacity-90 active:scale-[0.99] transition"
                    >
                      {isLoading ? 'AUTHENTICATING...' : 'AUTHORIZE & OPEN LEDGER'}
                    </button>
                  </div>
                </form>
              )}

              {/* 2. Create Account Form */}
              {activeTab === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                      Citizen Electronic Mail (Email)
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="citizen@example.com"
                      className="w-full px-3 py-2 border border-stone-900 dark:border-stone-400 bg-white dark:bg-stone-950 text-xs font-mono-num text-stone-950 dark:text-stone-50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                      Create Password (Min. 6 Characters)
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 pr-10 border border-stone-900 dark:border-stone-400 bg-white dark:bg-stone-950 text-xs font-mono-num text-stone-950 dark:text-stone-50 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-stone-900 dark:border-stone-400 bg-white dark:bg-stone-950 text-xs font-mono-num text-stone-950 dark:text-stone-50 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 border-2 border-stone-900 dark:border-stone-400 text-xs font-black uppercase tracking-widest hover:opacity-90 active:scale-[0.99] transition"
                    >
                      {isLoading ? 'ENROLLING RECORD...' : 'ENROLL NEW CITIZEN ACCOUNT'}
                    </button>
                  </div>
                </form>
              )}

              {/* 3. Forgot Password Form */}
              {activeTab === 'forgot' && (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <div>
                    <p className="text-xs italic text-stone-600 dark:text-stone-400 mb-2">
                      Submit your registered email address. A confidential recovery dispatch will be transmitted to reset your credentials.
                    </p>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                      Registered Electronic Mail (Email)
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="citizen@example.com"
                      className="w-full px-3 py-2 border border-stone-900 dark:border-stone-400 bg-white dark:bg-stone-950 text-xs font-mono-num text-stone-950 dark:text-stone-50 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 border-2 border-stone-900 dark:border-stone-400 text-xs font-black uppercase tracking-widest hover:opacity-90 active:scale-[0.99] transition"
                    >
                      {isLoading ? 'DISPATCHING LINK...' : 'DISPATCH PASSWORD RESET LINK'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('signin');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="w-full py-2 border border-stone-900 dark:border-stone-400 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 transition"
                    >
                      ← RETURN TO SIGN IN
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="border-t border-stone-300 dark:border-stone-700 pt-3 mt-4 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <span className="font-mono-num font-bold">SERIAL: GAZETTE-503020</span>
              <span className="italic">100% Isolated Citizen Memory</span>
            </div>
          </section>
        </div>

        {/* Bottom Barcode Colophon */}
        <footer className="border-t-2 border-stone-900 dark:border-stone-400 pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <svg className="h-8 w-28 text-stone-900 dark:text-stone-200" viewBox="0 0 120 36" fill="currentColor">
              <rect x="0" y="0" width="3" height="36" />
              <rect x="5" y="0" width="1" height="36" />
              <rect x="8" y="0" width="4" height="36" />
              <rect x="15" y="0" width="2" height="36" />
              <rect x="19" y="0" width="1" height="36" />
              <rect x="23" y="0" width="3" height="36" />
              <rect x="29" y="0" width="2" height="36" />
              <rect x="34" y="0" width="4" height="36" />
              <rect x="41" y="0" width="1" height="36" />
              <rect x="44" y="0" width="3" height="36" />
              <rect x="50" y="0" width="2" height="36" />
              <rect x="55" y="0" width="5" height="36" />
              <rect x="63" y="0" width="2" height="36" />
              <rect x="67" y="0" width="1" height="36" />
              <rect x="71" y="0" width="3" height="36" />
              <rect x="77" y="0" width="4" height="36" />
              <rect x="84" y="0" width="1" height="36" />
              <rect x="88" y="0" width="2" height="36" />
              <rect x="93" y="0" width="3" height="36" />
              <rect x="99" y="0" width="5" height="36" />
              <rect x="107" y="0" width="2" height="36" />
              <rect x="112" y="0" width="3" height="36" />
              <rect x="117" y="0" width="3" height="36" />
            </svg>
            <div className="text-xs font-mono-num font-bold text-stone-600 dark:text-stone-400 leading-tight">
              <div>GAZETTE SERIAL NO. 8923-503020-JKT</div>
              <div>PUBLIC DOMESTIC LEDGER PRESS</div>
            </div>
          </div>

          <div className="text-xs text-stone-600 dark:text-stone-400 text-center md:text-right font-editorial italic max-w-md">
            "The Daily News • Financial & Domestic Budget Gazette • All accounts preserved in private PostgreSQL cloud memory • Printed on pure digital newsprint."
          </div>
        </footer>
      </div>
    </div>
  );
};
