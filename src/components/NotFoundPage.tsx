import React, { useState } from 'react';
import { Sun, Moon, Home, ArrowLeft } from 'lucide-react';
import { Footer } from './Footer';
import { LegalModal } from './LegalModal';

interface NotFoundPageProps {
  path: string;
  onGoHome: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  path,
  onGoHome,
  isDark,
  onToggleTheme,
}) => {
  const [legalType, setLegalType] = useState<'privacy' | 'terms' | null>(null);

  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen py-0 sm:py-6 px-0 sm:px-4 font-editorial">
      <div className="broadsheet-page max-w-4xl mx-auto p-4 sm:p-7 space-y-5">
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
              "All the Financial Truths & Balances Fit to Print"
            </p>
          </div>

          {/* Dateline Double Rule */}
          <div className="border-t-2 border-b border-stone-900 dark:border-stone-400 py-1 my-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 select-none">
            <span>{todayFormatted}</span>
            <span className="font-mono-num text-red-700 dark:text-red-400">SPECIAL EDITION • ERROR 404</span>
          </div>
        </header>

        {/* 404 Main Article Box */}
        <main className="border-2 border-stone-900 dark:border-stone-400 bg-stone-100/40 dark:bg-stone-900/30 p-6 sm:p-10 text-center space-y-5">
          <div className="inline-block border-2 border-stone-900 dark:border-stone-400 px-6 py-2 bg-stone-200/80 dark:bg-stone-800/80 font-mono-num text-6xl sm:text-8xl font-black text-stone-950 dark:text-stone-50 tracking-tight select-none">
            404
          </div>

          <div className="space-y-1.5">
            <h2 className="font-headline text-2xl sm:text-3xl font-black uppercase tracking-tight text-stone-950 dark:text-stone-50 leading-tight">
              Halaman Tidak Ditemukan
            </h2>
            <p className="font-headline italic text-xs sm:text-sm text-stone-600 dark:text-stone-400">
              "Page Not Found — Dispatch Missing From Archives"
            </p>
          </div>

          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 max-w-lg mx-auto leading-relaxed">
            Halaman yang Anda tuju tidak ditemukan, telah dipindahkan, atau alamat URL yang Anda masukkan salah.
            Silakan kembali ke halaman utama untuk melanjutkan pencatatan dan pemantauan anggaran Anda.
          </p>

          <div className="inline-flex items-center gap-2 border border-stone-400 dark:border-stone-600 px-3 py-1.5 bg-stone-50 dark:bg-stone-950 text-xs font-mono-num text-stone-600 dark:text-stone-400">
            <span>Target URL:</span>
            <span className="font-bold text-stone-900 dark:text-stone-100 break-all">{path}</span>
          </div>

          {/* Action Buttons ("button utk kembali") */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={onGoHome}
              className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-950 font-bold uppercase tracking-wider text-xs border border-stone-900 dark:border-stone-400 transition flex items-center gap-2 active:scale-95"
            >
              <Home className="w-4 h-4" />
              <span>Kembali ke Halaman Utama</span>
            </button>
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  onGoHome();
                }
              }}
              className="px-5 py-2.5 border border-stone-900 dark:border-stone-400 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 font-bold uppercase tracking-wider text-xs transition flex items-center gap-2 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Halaman Sebelumnya</span>
            </button>
          </div>
        </main>

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
