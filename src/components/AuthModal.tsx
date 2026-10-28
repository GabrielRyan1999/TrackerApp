import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveSupabaseConfig, clearCustomSupabaseConfig, SUPABASE_SQL_SCHEMA } from '../utils/supabase';
import { X, UserCheck, AlertCircle, CheckCircle2, Database, Copy, Check, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

type AuthTab = 'signin' | 'signup' | 'forgot' | 'reset' | 'config';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { user, config, isRecoveryMode, signIn, signUp, signOut, sendPasswordReset, updatePassword, refreshConfig } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Setup / Config inputs
  const [inputUrl, setInputUrl] = useState(config.url || '');
  const [inputKey, setInputKey] = useState(config.anonKey || '');
  const [copiedSql, setCopiedSql] = useState(false);

  // Status & Feedback messages (In-modal, without any browser popup!)
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isRecoveryMode) {
      setActiveTab('reset');
    } else if (!config.isConfigured) {
      setActiveTab('config');
    } else if (user) {
      setActiveTab('signin');
    }
  }, [isRecoveryMode, config.isConfigured, user]);

  useEffect(() => {
    // Reset notices when changing tab
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [activeTab]);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage('Please provide both citizen email and authorization password.');
      return;
    }

    setIsLoading(true);
    const res = await signIn(email, password);
    setIsLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage('Citizen authorization accepted. Synchronizing cloud ledger...');
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
        onClose();
      }, 700);
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
        'Registration dispatched! An official confirmation dispatch has been sent to your email. Please verify before signing in.'
      );
    } else {
      setSuccessMessage('Citizen account successfully enrolled! Local accounts are now backed up to your cloud ledger.');
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
        onClose();
      }, 1000);
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

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!password || password.length < 6) {
      setErrorMessage('New password must be at least 6 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Password confirmation does not match.');
      return;
    }

    setIsLoading(true);
    const res = await updatePassword(password);
    setIsLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage('Citizen credentials successfully updated and ratified!');
      setTimeout(() => {
        setActiveTab('signin');
      }, 1200);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!inputUrl.trim() || !inputKey.trim()) {
      setErrorMessage('Both Supabase Project URL and Public Anon Key are required.');
      return;
    }

    const saved = saveSupabaseConfig(inputUrl, inputKey);
    if (saved) {
      refreshConfig();
      setSuccessMessage('Supabase database credentials preserved in terminal memory! Ready for authentication.');
      setTimeout(() => {
        setActiveTab('signin');
      }, 800);
    } else {
      setErrorMessage('Failed to save configuration.');
    }
  };

  const handleClearConfig = () => {
    clearCustomSupabaseConfig();
    refreshConfig();
    setInputUrl('');
    setInputKey('');
    setSuccessMessage('Custom credentials cleared. Now using default environment variables.');
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut();
    setIsLoading(false);
    setSuccessMessage('Citizen safely logged out. Returning to local standalone gazette.');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs font-editorial animate-fadeIn">
      <div
        className="w-full max-w-lg bg-[#f8f6f0] dark:bg-stone-900 border-2 border-stone-900 dark:border-stone-400 p-4 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center border border-stone-900 dark:border-stone-400 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 transition"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Masthead Header */}
        <div className="border-b-2 border-stone-900 dark:border-stone-400 pb-3 mb-4 pr-10">
          <span className="text-xs font-bold tracking-widest uppercase text-stone-600 dark:text-stone-400 block">
            BUREAU OF CITIZEN RECORDS • VOL. CIV
          </span>
          <h2
            id="auth-modal-title"
            className="font-headline text-xl sm:text-2xl font-black uppercase text-stone-950 dark:text-stone-50 leading-tight"
          >
            Citizen Registry & Cloud Storage
          </h2>
          <p className="text-xs italic text-stone-600 dark:text-stone-400 mt-1">
            Store and synchronize your 50/30/20 monthly budget records securely across devices.
          </p>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-1 border border-stone-900 dark:border-stone-400 bg-stone-200/80 dark:bg-stone-800/80 p-0.5 text-xs font-bold uppercase tracking-wider mb-4 overflow-x-auto">
          {!user ? (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('signin')}
                className={`min-h-[32px] px-3 py-1 transition whitespace-nowrap text-xs ${
                  activeTab === 'signin'
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className={`min-h-[32px] px-3 py-1 transition whitespace-nowrap text-xs ${
                  activeTab === 'signup'
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('forgot')}
                className={`min-h-[32px] px-3 py-1 transition whitespace-nowrap text-xs ${
                  activeTab === 'forgot'
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
                }`}
              >
                Forgot Password
              </button>
            </>
          ) : (
            <div className="px-3 py-1 text-xs font-bold text-stone-900 dark:text-stone-100">
              ACTIVE SESSION
            </div>
          )}
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`min-h-[32px] px-3 py-1 transition whitespace-nowrap text-xs ml-auto flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database Setup</span>
            <span
              className={`w-2 h-2 rounded-full ${
                config.isConfigured ? 'bg-emerald-600' : 'bg-amber-500'
              }`}
            />
          </button>
        </div>

        {/* In-Modal Alert Notification Banners */}
        {errorMessage && (
          <div className="mb-4 p-3 border-2 border-red-800 bg-red-100/70 dark:bg-red-950/40 text-red-900 dark:text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-800 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold uppercase tracking-wider">Authentication Error</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 border-2 border-emerald-800 bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-800 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold uppercase tracking-wider">Official Confirmation</strong>
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {/* 1. SIGN IN TAB */}
        {activeTab === 'signin' && (
          <div>
            {user ? (
              <div className="space-y-4 border border-stone-300 dark:border-stone-700 p-4 bg-stone-100/50 dark:bg-stone-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border border-stone-900 dark:border-stone-400 bg-stone-200 dark:bg-stone-800 flex items-center justify-center font-bold text-sm">
                    <UserCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-stone-600 dark:text-stone-400 block">
                      AUTHORIZED CITIZEN
                    </span>
                    <strong className="text-sm font-bold text-stone-950 dark:text-stone-50">
                      {user.email}
                    </strong>
                  </div>
                </div>

                <div className="text-xs text-stone-600 dark:text-stone-400 italic">
                  All transactions and budget plans are automatically backed up to your private PostgreSQL cloud ledger.
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={isLoading}
                    className="flex-1 py-2 text-xs font-bold uppercase tracking-wider border-2 border-red-900 text-red-900 dark:border-red-400 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950 transition"
                  >
                    {isLoading ? 'SIGNING OUT...' : 'SIGN OUT / SWITCH ACCOUNT'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider border-2 border-stone-900 dark:border-stone-400 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 transition"
                  >
                    RETURN TO GAZETTE
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSignIn} className="space-y-3.5">
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
                      onClick={() => setActiveTab('forgot')}
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
                    {isLoading ? 'VERIFYING CITIZEN CREDENTIALS...' : 'AUTHORIZE & OPEN LEDGER'}
                  </button>
                </div>

                <div className="text-center pt-1">
                  <span className="text-xs text-stone-600 dark:text-stone-400">
                    Not yet enrolled in the public register?{' '}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('signup')}
                    className="text-xs font-bold uppercase text-stone-950 dark:text-stone-100 underline"
                  >
                    Enroll New Account
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 2. SIGN UP TAB */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3.5">
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

            <div className="p-3 border border-stone-300 dark:border-stone-700 bg-stone-100/60 dark:bg-stone-800/60 text-xs text-stone-700 dark:text-stone-300">
              <strong className="block font-bold uppercase tracking-wider mb-0.5">Automated Cloud Migration</strong>
              Your current transactions and monthly budgets will immediately sync to your new account.
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

            <div className="text-center pt-1">
              <span className="text-xs text-stone-600 dark:text-stone-400">
                Already registered in the records?{' '}
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('signin')}
                className="text-xs font-bold uppercase text-stone-950 dark:text-stone-100 underline"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* 3. FORGOT PASSWORD TAB */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-3.5">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-stone-600 dark:text-stone-400 block mb-1">
                CREDENTIAL RESTORATION SERVICE
              </span>
              <p className="text-xs italic text-stone-600 dark:text-stone-400">
                Submit your registered email address. A confidential recovery dispatch containing password restoration instructions will be transmitted immediately.
              </p>
            </div>

            <div>
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
                {isLoading ? 'DISPATCHING RECOVERY INSTRUCTIONS...' : 'DISPATCH PASSWORD RESET LINK'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('signin')}
                className="w-full py-2 border border-stone-900 dark:border-stone-400 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 transition"
              >
                ← RETURN TO SIGN IN
              </button>
            </div>
          </form>
        )}

        {/* 4. RESET PASSWORD TAB */}
        {activeTab === 'reset' && (
          <form onSubmit={handleUpdatePassword} className="space-y-3.5">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-amber-700 dark:text-amber-400 block mb-1">
                RATIFY NEW CITIZEN PASSWORD
              </span>
              <p className="text-xs italic text-stone-600 dark:text-stone-400">
                You have authenticated via recovery token. Please provide your new secure password.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                New Password (Min. 6 Characters)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-stone-900 dark:border-stone-400 bg-white dark:bg-stone-950 text-xs font-mono-num text-stone-950 dark:text-stone-50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
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
                {isLoading ? 'RATIFYING CREDENTIALS...' : 'CONFIRM & RATIFY NEW PASSWORD'}
              </button>
            </div>
          </form>
        )}

        {/* 5. DATABASE CONFIGURATION TAB */}
        {activeTab === 'config' && (
          <div className="space-y-4">
            <div className="border border-stone-300 dark:border-stone-700 p-3 bg-stone-100/50 dark:bg-stone-800/40">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-1">
                <span>Database Connection Status</span>
                <span
                  className={`px-2 py-0.5 border ${
                    config.isConfigured
                      ? 'border-emerald-800 text-emerald-800 dark:border-emerald-400 dark:text-emerald-400'
                      : 'border-amber-800 text-amber-800 dark:border-amber-400 dark:text-amber-400'
                  }`}
                >
                  {config.isConfigured ? 'CONNECTED TO SUPABASE POSTGRES' : 'CREDENTIALS NEEDED'}
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 italic">
                {config.isConfigured
                  ? `Active via ${config.source === 'env' ? '.env file' : 'in-app configuration'}. Citizen accounts and monthly tracker records synchronize seamlessly.`
                  : 'Enter your free Supabase PostgreSQL project credentials below or set them in .env file.'}
              </p>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  required
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full px-3 py-2 border border-stone-900 dark:border-stone-400 bg-white dark:bg-stone-950 text-xs font-mono-num text-stone-950 dark:text-stone-50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                  Supabase Public Anon Key
                </label>
                <input
                  type="text"
                  required
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                  className="w-full px-3 py-2 border border-stone-900 dark:border-stone-400 bg-white dark:bg-stone-950 text-xs font-mono-num text-stone-950 dark:text-stone-50 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 border-2 border-stone-900 dark:border-stone-400 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition"
                >
                  SAVE & ACTIVATE DATABASE
                </button>
                {config.source === 'storage' && (
                  <button
                    type="button"
                    onClick={handleClearConfig}
                    className="px-3 py-2 border border-red-800 text-red-800 dark:text-red-400 text-xs font-bold uppercase tracking-wider hover:bg-red-100 dark:hover:bg-red-950/40 transition"
                  >
                    RESET
                  </button>
                )}
              </div>
            </form>

            {/* SQL Table Creation Script Helper */}
            <div className="border-t border-stone-300 dark:border-stone-700 pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Supabase SQL Setup Script
                </span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase tracking-wider border border-stone-900 dark:border-stone-400 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 transition"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'COPIED TO CLIPBOARD' : 'COPY SQL SCRIPT'}</span>
                </button>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 italic">
                Paste and run this 1-click script once in your Supabase SQL Editor to create the <code className="font-mono font-bold">user_budget_data</code> table with Row Level Security.
              </p>
              <pre className="p-2.5 bg-stone-200/70 dark:bg-stone-950 border border-stone-400 dark:border-stone-700 text-xs font-mono text-stone-800 dark:text-stone-200 overflow-x-auto max-h-32">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          </div>
        )}

        {/* Footer Editorial Stamp */}
        <div className="border-t border-stone-300 dark:border-stone-700 pt-3 mt-5 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span className="font-mono-num font-bold">SEAL: POSTGRES-RLS-AUTHENTICATED</span>
          <span className="italic">100% In-Modal • Zero Browser Popups</span>
        </div>
      </div>
    </div>
  );
};
