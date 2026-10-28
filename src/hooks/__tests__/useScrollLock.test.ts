import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resetScrollLock } from '../useScrollLock';

describe('useScrollLock module', () => {
  const originalDocument = globalThis.document;

  beforeEach(() => {
    (globalThis as any).document = {
      body: {
        style: {
          overflow: '',
        },
      },
    };
  });

  afterEach(() => {
    (globalThis as any).document = originalDocument;
  });

  it('resetScrollLock clears body overflow style', () => {
    document.body.style.overflow = 'hidden';
    expect(document.body.style.overflow).toBe('hidden');

    resetScrollLock();
    expect(document.body.style.overflow).toBe('');
  });
});
