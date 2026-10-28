import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, UserCheck, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

type AuthTab = 'signin' | 'signup' | 'forgot' | 'reset';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { user, isRecoveryMode, signIn, signUp, signOut, sendPasswordReset, updatePassword } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isRecoveryMode) {
      setActiveTab('reset');
    } else if (user) {
      setActiveTab('signin');
    }
  }, [isRecoveryMode, user]);

  useEffect(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [activeTab]);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

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
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
        onClose();
      }, 500);
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
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
        onClose();
      }, 700);
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

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const res = await updatePassword(password);
    setIsLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage('Password updated successfully.');
      setTimeout(() => {
        setActiveTab('signin');
      }, 1000);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut();
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs font-editorial animate-fadeIn overscroll-contain">
      <div
        className="w-full max-w-lg bg-[#f8f6f0] dark:bg-stone-900 border-2 border-stone-900 dark:border-stone-400 p-4 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto overscroll-contain"
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

        {/* Header */}
        <div className="border-b-2 border-stone-900 dark:border-stone-400 pb-2.5 mb-4 pr-10">
          <h2
            id="auth-modal-title"
            className="font-headline text-xl sm:text-2xl font-bold uppercase text-stone-950 dark:text-stone-50 leading-tight"
          >
            {user ? 'Account' : activeTab === 'signin' ? 'Sign In' : activeTab === 'signup' ? 'Create Account' : 'Reset Password'}
          </h2>
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

        {/* Signed In State */}
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 border border-stone-300 dark:border-stone-700 p-3 bg-stone-100/60 dark:bg-stone-800/50">
              <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs text-stone-500 dark:text-stone-400 block">Signed in as</span>
                <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate block">
                  {user.email}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isLoading}
                className="flex-1 py-2 text-xs font-bold uppercase tracking-wider border border-red-800 text-red-800 dark:border-red-400 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
              >
                {isLoading ? 'Signing out...' : 'Sign Out'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-stone-900 dark:border-stone-400 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 transition"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Tab Strip */}
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
                    className="w-full px-3 py-2 border border-stone-900 dark:border-stone-400 bg-white dark:bg-stone-950 text-xs font-mono-num text-stone-950 dark:text-stone-50 focus:outline-none"
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
                    className="w-full px-3 py-2 border border-stone-900 dark:border-stone-400 bg-white dark:bg-stone-950 text-xs font-mono-num text-stone-950 dark:text-stone-50 focus:outline-none"
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
                    className="w-full px-3 py-2 border border-stone-900 dark:border-stone-400 bg-white dark:bg-stone-950 text-xs font-mono-num text-stone-950 dark:text-stone-50 focus:outline-none"
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

            {/* 4. Reset Password Form (Recovery) */}
            {activeTab === 'reset' && (
              <form onSubmit={handleUpdatePassword} className="space-y-3">
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Enter your new password below.
                </p>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                    New Password (min. 6 characters)
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
                    className="w-full py-2.5 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 border border-stone-900 dark:border-stone-400 text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition"
                  >
                    {isLoading ? 'Updating...' : 'Set New Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
