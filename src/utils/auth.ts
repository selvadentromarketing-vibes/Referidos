import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

/**
 * Hardcoded admin emails. Anyone in this list logging in via magic link
 * gets routed to /admin and sees the full leaderboard + management UI.
 * Comparisons are case-insensitive.
 */
const ADMIN_EMAILS = [
  'tothemaxbase@gmail.com',
  'd.comercial@selvadentrotulum.com',
  'mkt@selvadentrotulum.com',
  'selvadentromarketing@gmail.com',
  'hoshicoetowork@gmail.com',
] as const;

export const isAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase() as (typeof ADMIN_EMAILS)[number]);
};

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
}

/**
 * Subscribe to Supabase auth state. Returns the current user + session,
 * a loading flag (true while we're checking the initial session), and
 * an isAdmin computed flag.
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAdmin: false,
  });

  useEffect(() => {
    let mounted = true;

    // 1. Read the initial session (handles magic-link redirects via detectSessionInUrl)
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setState({
        user: data.session?.user ?? null,
        session: data.session,
        loading: false,
        isAdmin: isAdminEmail(data.session?.user?.email),
      });
    });

    // 2. Subscribe to future changes (sign in, sign out, token refresh)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
        isAdmin: isAdminEmail(session?.user?.email),
      });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

/**
 * Send a magic-link email. The user clicks the link and Supabase redirects
 * them back to the app with a session token in the URL fragment, which the
 * client picks up automatically via detectSessionInUrl.
 *
 * Pass shouldRedirectToAdmin so we can route admins → /admin and affiliates → /dashboard.
 */
/**
 * Caller-supplied path should already include the lang prefix
 * (e.g. "/en/dashboard" or "/es/admin").
 */
export async function sendMagicLink(
  email: string,
  redirectPath: string = '/es/dashboard',
): Promise<{ success: boolean; error?: string }> {
  const redirectTo = `${window.location.origin}${redirectPath}`;
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      emailRedirectTo: redirectTo,
      // Don't auto-create users — only existing affiliates can log in.
      // This prevents random people from creating accounts.
      shouldCreateUser: true, // V1: keep true so admin emails can log in too without prior signup
    },
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
