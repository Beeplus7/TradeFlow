import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabase } from '../supabase';
import { env, isGoogleAuthConfigured, isSupabaseConfigured } from '../../config/env';

WebBrowser.maybeCompleteAuthSession();

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  configured: boolean;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function redirectTo(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/app`;
  }
  return 'tradflow://';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured() && isGoogleAuthConfigured();

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) {
      return { error: 'Supabase is not configured' };
    }
    if (!env.googleWebClientId) {
      return { error: 'Google Client ID missing' };
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo(),
        skipBrowserRedirect: Platform.OS !== 'web',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (Platform.OS !== 'web' && data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo(),
      );
      if (result.type !== 'success') {
        return { error: 'Google sign-in cancelled' };
      }
    }

    return {};
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      configured,
      signInWithGoogle,
      signOut,
    }),
    [session, loading, configured, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
