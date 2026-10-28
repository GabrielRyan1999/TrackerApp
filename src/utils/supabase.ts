import { createClient, type SupabaseClient, type User, type Session } from '@supabase/supabase-js';
import type { AppData } from './storage';

const STORAGE_URL_KEY = 'budget_tracker_supabase_url';
const STORAGE_ANON_KEY = 'budget_tracker_supabase_anon_key';

let cachedClient: SupabaseClient | null = null;
let lastUsedConfig: { url: string; key: string } | null = null;

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  source: 'env' | 'storage' | 'none';
}

function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage;
    }
  } catch {
    // ignore
  }
  return null;
}

export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta.env?.VITE_SUPABASE_URL as string | undefined)?.trim() || '';
  const envKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';

  if (envUrl && envKey) {
    return {
      url: envUrl,
      anonKey: envKey,
      isConfigured: true,
      source: 'env',
    };
  }

  const storage = getStorage();
  const storedUrl = (storage ? storage.getItem(STORAGE_URL_KEY) : '')?.trim() || '';
  const storedKey = (storage ? storage.getItem(STORAGE_ANON_KEY) : '')?.trim() || '';

  if (storedUrl && storedKey) {
    return {
      url: storedUrl,
      anonKey: storedKey,
      isConfigured: true,
      source: 'storage',
    };
  }

  return {
    url: '',
    anonKey: '',
    isConfigured: false,
    source: 'none',
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): boolean {
  try {
    const cleanUrl = url.trim();
    const cleanKey = anonKey.trim();
    if (!cleanUrl || !cleanKey) return false;

    const storage = getStorage();
    if (storage) {
      storage.setItem(STORAGE_URL_KEY, cleanUrl);
      storage.setItem(STORAGE_ANON_KEY, cleanKey);
    }
    cachedClient = null;
    lastUsedConfig = null;
    return Boolean(storage);
  } catch {
    return false;
  }
}

export function clearCustomSupabaseConfig(): void {
  try {
    const storage = getStorage();
    if (storage) {
      storage.removeItem(STORAGE_URL_KEY);
      storage.removeItem(STORAGE_ANON_KEY);
    }
    cachedClient = null;
    lastUsedConfig = null;
  } catch {
    // ignore
  }
}

export function getSupabase(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.isConfigured) {
    return null;
  }

  if (
    cachedClient &&
    lastUsedConfig &&
    lastUsedConfig.url === config.url &&
    lastUsedConfig.key === config.anonKey
  ) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    lastUsedConfig = { url: config.url, key: config.anonKey };
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function loadCloudAppData(userId: string): Promise<AppData | null> {
  const client = getSupabase();
  if (!client || !userId) return null;

  try {
    const { data, error } = await client
      .from('user_budget_data')
      .select('plans, transactions, categories, settings')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Could not load user budget data from Supabase:', error.message);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      plans: data.plans || {},
      transactions: Array.isArray(data.transactions) ? data.transactions : [],
      categories: Array.isArray(data.categories) ? data.categories : [],
      settings: data.settings || {},
    } as AppData;
  } catch (err) {
    console.error('Exception loading cloud data:', err);
    return null;
  }
}

export async function saveCloudAppData(userId: string, appData: AppData): Promise<{ success: boolean; error?: string }> {
  const client = getSupabase();
  if (!client || !userId) {
    return { success: false, error: 'Database client not connected or user unauthenticated.' };
  }

  try {
    const payload = {
      user_id: userId,
      plans: appData.plans,
      transactions: appData.transactions,
      categories: appData.categories,
      settings: appData.settings,
      updated_at: new Date().toISOString(),
    };

    const { error } = await client
      .from('user_budget_data')
      .upsert(payload, { onConflict: 'user_id' });

    if (error) {
      console.error('Failed to upsert cloud budget data:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Exception saving cloud data:', msg);
    return { success: false, error: msg };
  }
}

export const SUPABASE_SQL_SCHEMA = `-- 1. Create table for storing each citizen's budget data
create table if not exists public.user_budget_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plans jsonb not null default '{}'::jsonb,
  transactions jsonb not null default '[]'::jsonb,
  categories jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.user_budget_data enable row level security;

-- 3. Row Level Security policies (strictly per-user privacy)
create policy "Users can view their own budget data"
  on public.user_budget_data for select
  using (auth.uid() = user_id);

create policy "Users can insert their own budget data"
  on public.user_budget_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own budget data"
  on public.user_budget_data for update
  using (auth.uid() = user_id);
`;

export type { User, Session };
