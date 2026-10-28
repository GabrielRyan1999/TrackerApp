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

  it('detects supabase configuration from environment or storage', () => {
    const config = getSupabaseConfig();
    expect(config.isConfigured).toBe(true);
    expect(config.url).toContain('supabase.co');
  });

  it('can save custom credentials to storage', () => {
    const testUrl = 'https://custom.supabase.co';
    const testKey = 'test-anon-key-123456';
    const saved = saveSupabaseConfig(testUrl, testKey);
    expect(saved).toBe(true);
  });

  it('provides complete SQL setup schema for user_budget_data table and RLS', () => {
    expect(SUPABASE_SQL_SCHEMA).toContain('create table if not exists public.user_budget_data');
    expect(SUPABASE_SQL_SCHEMA).toContain('alter table public.user_budget_data enable row level security');
    expect(SUPABASE_SQL_SCHEMA).toContain('create policy "Users can view their own budget data"');
    expect(SUPABASE_SQL_SCHEMA).toContain('create policy "Users can update their own budget data"');
  });
});
