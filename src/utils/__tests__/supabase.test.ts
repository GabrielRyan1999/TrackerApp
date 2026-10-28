import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  clearCustomSupabaseConfig,
  SUPABASE_SQL_SCHEMA,
} from '../supabase';

// Mock localStorage if running in plain Node vitest environment
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, val: string) => { store.set(key, String(val)); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => { store.clear(); },
    key: () => null,
    length: 0,
  };
}

describe('Supabase Configuration & Persistence', () => {
  beforeEach(() => {
    clearCustomSupabaseConfig();
  });

  it('returns not configured when no env or stored credentials exist', () => {
    const config = getSupabaseConfig();
    expect(config.isConfigured).toBe(false);
    expect(config.source).toBe('none');
  });

  it('saves and retrieves custom supabase credentials from localStorage', () => {
    const testUrl = 'https://abcxyz.supabase.co';
    const testKey = 'test-anon-key-123456';

    const saved = saveSupabaseConfig(testUrl, testKey);
    expect(saved).toBe(true);

    const config = getSupabaseConfig();
    expect(config.isConfigured).toBe(true);
    expect(config.url).toBe(testUrl);
    expect(config.anonKey).toBe(testKey);
    expect(config.source).toBe('storage');
  });

  it('clears custom credentials cleanly', () => {
    saveSupabaseConfig('https://test.supabase.co', 'test-key');
    clearCustomSupabaseConfig();

    const config = getSupabaseConfig();
    expect(config.isConfigured).toBe(false);
    expect(config.url).toBe('');
  });

  it('provides complete SQL setup schema for user_budget_data table and RLS', () => {
    expect(SUPABASE_SQL_SCHEMA).toContain('create table if not exists public.user_budget_data');
    expect(SUPABASE_SQL_SCHEMA).toContain('alter table public.user_budget_data enable row level security');
    expect(SUPABASE_SQL_SCHEMA).toContain('create policy "Users can view their own budget data"');
    expect(SUPABASE_SQL_SCHEMA).toContain('create policy "Users can update their own budget data"');
  });
});
