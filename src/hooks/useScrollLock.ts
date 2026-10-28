import { useEffect } from 'react';

let lockCount = 0;

/**
 * Custom hook to lock body scrolling when a modal or overlay is open.
 * Uses reference counting so nested or sequentially open modals cleanly
 * restore scrolling only when all modals have been dismissed.
 */
export function useScrollLock(lock: boolean) {
  useEffect(() => {
    if (!lock) {
      if (lockCount <= 0 && typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
      return;
    }

    lockCount++;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0 && typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [lock]);
}

/**
 * Failsafe utility to forcefully reset scroll lock state and clear body overflow.
 */
export function resetScrollLock() {
  lockCount = 0;
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
}
