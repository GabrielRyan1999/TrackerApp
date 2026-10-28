import React from 'react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy, onOpenTerms }) => {
  return (
    <footer className="border-t-2 border-stone-900 dark:border-stone-400 pt-3 pb-1 text-xs text-stone-600 dark:text-stone-400 font-editorial">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
          <span>A product by</span>
          <a
            href="https://www.instagram.com/chromaksa.studio/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline text-stone-900 dark:text-stone-100 hover:opacity-80 transition"
          >
            Chromaksa Studio
          </a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPrivacy}
            className="hover:underline text-stone-700 dark:text-stone-300"
          >
            Privacy
          </button>
          <span>•</span>
          <button
            onClick={onOpenTerms}
            className="hover:underline text-stone-700 dark:text-stone-300"
          >
            Terms
          </button>
          <span>•</span>
          <span className="font-mono-num">50/30/20</span>
        </div>
      </div>
    </footer>
  );
};
