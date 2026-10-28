import React from 'react';
import { X } from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  useScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs font-editorial animate-fadeIn overscroll-contain">
      <div
        className="w-full max-w-xl bg-[#f8f6f0] dark:bg-stone-900 border-2 border-stone-900 dark:border-stone-400 p-4 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto overscroll-contain"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center border border-stone-900 dark:border-stone-400 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        <div className="border-b-2 border-stone-900 dark:border-stone-400 pb-2 mb-4 pr-10">
          <h2
            id="legal-modal-title"
            className="font-headline text-xl font-bold uppercase text-stone-950 dark:text-stone-50"
          >
            {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
          </h2>
        </div>

        {type === 'privacy' ? (
          <div className="space-y-3 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
            <div>
              <strong className="text-stone-950 dark:text-stone-100 block mb-1">1. Private & Isolated Data</strong>
              <p>
                Your financial transactions, monthly plans, and categories are strictly private. Each account is protected by strict database-level security and access controls, ensuring only you can view and access your personal records.
              </p>
            </div>
            <div>
              <strong className="text-stone-950 dark:text-stone-100 block mb-1">2. No Data Monetization</strong>
              <p>
                We do not sell, rent, or trade your personal data. We do not run third-party advertising or analytics trackers.
              </p>
            </div>
            <div>
              <strong className="text-stone-950 dark:text-stone-100 block mb-1">3. Data Deletion</strong>
              <p>
                You have full control over your data. You can export all your records to CSV at any time or reset your data.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
            <div>
              <strong className="text-stone-950 dark:text-stone-100 block mb-1">1. Personal Budgeting Utility</strong>
              <p>
                This application is provided free of charge by Chromaksa Studio for personal domestic financial planning based on the 50/30/20 budget framework.
              </p>
            </div>
            <div>
              <strong className="text-stone-950 dark:text-stone-100 block mb-1">2. User Responsibility</strong>
              <p>
                You are responsible for safeguarding your login credentials. All financial planning numbers and projections are informational tools.
              </p>
            </div>
            <div>
              <strong className="text-stone-950 dark:text-stone-100 block mb-1">3. Product by Chromaksa Studio</strong>
              <p>
                Created with care by Chromaksa Studio. All rights reserved.
              </p>
            </div>
          </div>
        )}

        <div className="pt-4 mt-5 border-t border-stone-300 dark:border-stone-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-stone-900 dark:border-stone-400 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
