import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client for the referidos site.
 *
 * Uses the modern publishable key (sb_publishable_...) which is safe to ship
 * to the browser. All data access is protected by Row Level Security policies
 * defined in the database — the anon key alone cannot read anyone's data
 * except via explicitly-allowed RLS policies (currently: INSERT-only on
 * affiliates, clicks, and leads tables).
 *
 * Never put the service_role key here. It bypasses RLS and must stay in
 * the Supabase dashboard / Edge Function secrets only.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loud at startup if env vars are missing — easier to debug than
  // a cryptic "fetch failed" later when a form is submitted.
  throw new Error(
    'Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Referidos has no user-facing login in V1 — disable auth persistence
    // so we don't waste a localStorage write on every page load.
    persistSession: false,
    autoRefreshToken: false,
  },
});

// ─── Domain types ────────────────────────────────────────────────────────
// Kept loose here; tighten once the schema is finalized and we generate
// types via `supabase gen types typescript`.

export interface AffiliateRow {
  id: string;
  code: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string;
  status: 'active' | 'paused';
  ghl_contact_id: string | null;
  created_at: string;
}

export interface ClickRow {
  id: string;
  affiliate_id: string;
  clicked_at: string;
  user_agent: string | null;
  referrer_url: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
}

export interface LeadRow {
  id: string;
  affiliate_id: string | null;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
  ghl_contact_id: string | null;
  landing_page: string | null;
  created_at: string;
}
