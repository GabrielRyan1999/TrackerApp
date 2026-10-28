import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Eye, EyeOff, AlertCircle, CheckCircle2, Check } from 'lucide-react';
import { Footer } from './Footer';
import { LegalModal } from './LegalModal';

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
  const [legalType, setLegalType] = useState<'privacy' | 'terms' | null>(null);

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
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    const res = await signIn(email, password);
    setIsLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage('Signed in successfully.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const res = await signUp(email, password);
    setIsLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else if (res.needEmailVerification) {
      setSuccessMessage('Account created! Please check your email to verify before signing in.');
    } else {
      setSuccessMessage('Account created and signed in.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    const res = await sendPasswordReset(email);
    setIsLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage(`Password reset link sent to ${email}. Check your inbox.`);
    }
  };

  return (
    <div className="min-h-screen py-0 sm:py-6 px-0 sm:px-4 font-editorial">
      <div className="broadsheet-page max-w-5xl mx-auto p-4 sm:p-7 space-y-5">
        {/* Masthead Header */}
        <header className="border-b-2 border-stone-900 dark:border-stone-400 pb-3 pt-2">
          {/* Top Ticker */}
          <div className="border-b border-stone-300 dark:border-stone-700 pb-1.5 mb-2 text-xs font-bold tracking-wider uppercase text-stone-700 dark:text-stone-300 flex items-center justify-between select-none font-mono-num">
            <span>50/30/20 BUDGET TRACKER</span>
            <button
              onClick={onToggleTheme}
              className="hover:underline flex items-center gap-1.5 text-stone-900 dark:text-stone-100 transition"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{isDark ? 'Daylight' : 'Midnight'}</span>
            </button>
          </div>

          {/* Blackletter Masthead Title */}
          <div className="text-center py-2 select-none">
            <h1 className="font-masthead text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-stone-950 dark:text-stone-50 leading-none">
              The Daily News
            </h1>
            <p className="font-headline italic text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
              "Simple, disciplined budgeting with the 50/30/20 method."
            </p>
          </div>

          {/* Simple Dateline Rule */}
          <div className="border-t-2 border-b border-stone-900 dark:border-stone-400 py-1 my-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 select-none">
            <span>{todayFormatted}</span>
            <span className="font-mono-num">Personal Finance Edition</span>
          </div>
        </header>

        {/* Main Content: Left Overview, Right Auth */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 items-stretch">
          {/* Left Column: 50/30/20 Principle (7 cols) */}
          <section className="lg:col-span-7 border-2 border-stone-900 dark:border-stone-400 bg-stone-100/40 dark:bg-stone-900/30 p-4 sm:p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-stone-900 dark:border-stone-400 pb-2">
                <h2 className="font-headline text-2xl sm:text-3xl font-bold text-stone-950 dark:text-stone-50 leading-tight">
                  Track every rupiah with intention.
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed max-w-[55ch]">
                Divide your monthly income into three simple buckets. No complicated spreadsheets, no guesswork.
              </p>

              {/* Three Pillar Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border border-stone-900 dark:border-stone-400 p-3 bg-stone-200/50 dark:bg-stone-800/40">
                <div className="border-b sm:border-b-0 sm:border-r border-stone-400 dark:border-stone-600 pb-2 sm:pb-0 sm:pr-2">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-stone-900 dark:text-stone-100 mb-1">
                    <span>Needs</span>
                    <span className="border border-stone-900 dark:border-stone-400 px-1 py-0.5">50%</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-snug">
                    Housing, utilities, groceries, transport, healthcare.
                  </p>
                </div>

                <div className="border-b sm:border-b-0 sm:border-r border-stone-400 dark:border-stone-600 pb-2 sm:pb-0 sm:px-2">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-stone-900 dark:text-stone-100 mb-1">
                    <span>Wants</span>
                    <span className="border border-stone-900 dark:border-stone-400 px-1 py-0.5">30%</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-snug">
                    Dining, coffee, subscriptions, shopping, leisure.
                  </p>
                </div>

                <div className="sm:pl-2">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-stone-900 dark:text-stone-100 mb-1">
                    <span>Savings</span>
                    <span className="border border-stone-900 dark:border-stone-400 px-1 py-0.5">20%</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-snug">
                    Emergency cushion, investments, long-term goals.
                  </p>
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-1.5 pt-1 text-xs text-stone-700 dark:text-stone-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
                  <span>Real-time burn rate barometer and auto-balancing math</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
                  <span>Automatic merchant categorization (Indomaret, PLN, Gojek)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
                  <span>Private cloud backup across all your devices</span>
                </div>
              </div>
            </div>

            <div className="border-t border-stone-300 dark:border-stone-700 pt-3 mt-4 text-xs italic text-stone-500 dark:text-stone-400">
              Free to use • All accounts backed up securely
            </div>
          </section>

          {/* Right Column: Auth Form (5 cols) */}
          <section className="lg:col-span-5 border-2 border-stone-900 dark:border-stone-400 bg-stone-100/40 dark:bg-stone-900/30 p-4 sm:p-6 flex flex-col justify-between">
            <div>
              {/* Box Title */}
              <div className="border-b border-stone-900 dark:border-stone-400 pb-2 mb-3">
                <h2 className="font-headline text-xl font-bold uppercase text-stone-950 dark:text-stone-50 leading-tight">
                  {activeTab === 'signin' ? 'Sign In' : activeTab === 'signup' ? 'Create Account' : 'Reset Password'}
                </h2>
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
                <div className="mb-3.5 p-2.5 border border-red-800 bg-red-100/70 dark:bg-red-950/40 text-red-900 dark:text-red-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-800 dark:text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-3.5 p-2.5 border border-emerald-800 bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-800 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* 1. Sign In Form */}
              {activeTab === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3 py-2 border border-stone-900 dark:border-stone-400 bg-white dark:bg-stone-950 text-xs font-mono-num text-stone-950 dark:text-stone-50 placeholder:text-stone-500 dark:placeholder:text-stone-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                        Password
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
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 pr-10 border border-stone-900 dark:border-stone-400 bg-white dark:bg-stone-950 text-xs font-mono-num text-stone-950 dark:text-stone-50 placeholder:text-stone-500 dark:placeholder:text-stone-400 focus:outline-none"
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
                      className="w-full py-2.5 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 border border-stone-900 dark:border-stone-400 text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition"
                    >
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                  </div>
                </form>
              )}

              {/* 2. Create Account Form */}
              {activeTab === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3 py-2 border border-stone-900 dark:border-stone-400 bg-white dark:bg-stone-950 text-xs font-mono-num text-stone-950 dark:text-stone-50 placeholder:text-stone-500 dark:placeholder:text-stone-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                      Password (min. 6 characters)
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 pr-10 border border-stone-900 dark:border-stone-400 bg-white dark:bg-stone-950 text-xs font-mono-num text-stone-950 dark:text-stone-50 placeholder:text-stone-500 dark:placeholder:text-stone-400 focus:outline-none"
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
                      className="w-full px-3 py-2 border border-stone-900 dark:border-stone-400 bg-white dark:bg-stone-950 text-xs font-mono-num text-stone-950 dark:text-stone-50 placeholder:text-stone-500 dark:placeholder:text-stone-400 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 border border-stone-900 dark:border-stone-400 text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition"
                    >
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </button>
                  </div>
                </form>
              )}

              {/* 3. Forgot Password Form */}
              {activeTab === 'forgot' && (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    Enter your email to receive a password reset link.
                  </p>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3 py-2 border border-stone-900 dark:border-stone-400 bg-white dark:bg-stone-950 text-xs font-mono-num text-stone-950 dark:text-stone-50 placeholder:text-stone-500 dark:placeholder:text-stone-400 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 border border-stone-900 dark:border-stone-400 text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition"
                    >
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
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
                      Back to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <Footer
          onOpenPrivacy={() => setLegalType('privacy')}
          onOpenTerms={() => setLegalType('terms')}
        />
      </div>

      {/* Legal Information Modal */}
      <LegalModal
        isOpen={Boolean(legalType)}
        onClose={() => setLegalType(null)}
        type={legalType || 'privacy'}
      />
    </div>
  );
};
