import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { getSupabase, getSupabaseConfig, type SupabaseConfig } from '../utils/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  config: SupabaseConfig;
  isRecoveryMode: boolean;
  signIn: (email: string, pass: string) => Promise<{ error?: string }>;
  signUp: (email: string, pass: string) => Promise<{ error?: string; needEmailVerification?: boolean }>;
  signOut: () => Promise<{ error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ error?: string }>;
  updatePassword: (newPass: string) => Promise<{ error?: string }>;
  refreshConfig: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SupabaseConfig>(getSupabaseConfig);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState<boolean>(false);

  const refreshConfig = useCallback(() => {
    const nextCfg = getSupabaseConfig();
    setConfig(nextCfg);
  }, []);

  useEffect(() => {
    const client = getSupabase();
    if (!client) {
      setUser(null);
      setSession(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Check existing session
    client.auth.getSession().then(({ data: { session: initSession } }) => {
      if (!isMounted) return;
      setSession(initSession);
      setUser(initSession?.user ?? null);
      setIsLoading(false);
    }).catch(() => {
      if (!isMounted) return;
      setIsLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh, password recovery)
    const { data: { subscription } } = client.auth.onAuthStateChange((event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsLoading(false);

      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [config]);

  const signIn = async (email: string, pass: string): Promise<{ error?: string }> => {
    const client = getSupabase();
    if (!client) {
      return { error: 'Database service is not configured. Please supply Supabase Project credentials.' };
    }

    try {
      const { error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });

      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : String(err) };
    }
  };

  const signUp = async (email: string, pass: string): Promise<{ error?: string; needEmailVerification?: boolean }> => {
    const client = getSupabase();
    if (!client) {
      return { error: 'Database service is not configured. Please supply Supabase Project credentials.' };
    }

    try {
      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password: pass,
      });

      if (error) {
        return { error: error.message };
      }

      // If Supabase has email confirmation enabled and session is null
      const needEmailVerification = !data.session;
      return { needEmailVerification };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : String(err) };
    }
  };

  const signOut = async (): Promise<{ error?: string }> => {
    const client = getSupabase();
    if (!client) return {};

    try {
      const { error } = await client.auth.signOut();
      if (error) {
        return { error: error.message };
      }
      setUser(null);
      setSession(null);
      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : String(err) };
    }
  };

  const sendPasswordReset = async (email: string): Promise<{ error?: string }> => {
    const client = getSupabase();
    if (!client) {
      return { error: 'Database service is not configured. Please supply Supabase Project credentials.' };
    }

    try {
      const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });

      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : String(err) };
    }
  };

  const updatePassword = async (newPass: string): Promise<{ error?: string }> => {
    const client = getSupabase();
    if (!client) {
      return { error: 'Database service is not configured.' };
    }

    try {
      const { error } = await client.auth.updateUser({
        password: newPass,
      });

      if (error) {
        return { error: error.message };
      }
      setIsRecoveryMode(false);
      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : String(err) };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        config,
        isRecoveryMode,
        signIn,
        signUp,
        signOut,
        sendPasswordReset,
        updatePassword,
        refreshConfig,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
