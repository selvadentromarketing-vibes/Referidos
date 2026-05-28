import { supabase } from './supabase';
import { TrackingParams } from './tracking';

/**
 * Two-system writes for referidos:
 *
 *   submitReferrerSignup → Supabase (create affiliate + get code)
 *                        → GHL (tag, send welcome email using the code)
 *
 *   submitReferralLead   → Supabase (create lead row, link to affiliate by code)
 *                        → GHL (create contact for sales, tag with referrer)
 *
 *   trackReferralClick   → Supabase only (don't pollute GHL contacts per click)
 *
 * Supabase is the source of truth for the affiliate code. GHL is the channel
 * for human-facing comms (email to the affiliate, sales pipeline for the lead).
 */

const REFERRER_SIGNUP_WEBHOOK_URL =
  'https://services.leadconnectorhq.com/hooks/crN2IhAuOBAl7D8324yI/webhook-trigger/874d9a89-3828-4216-ba8a-b4a3ccadc7b1';

const REFERRAL_LEAD_WEBHOOK_URL =
  'https://services.leadconnectorhq.com/hooks/crN2IhAuOBAl7D8324yI/webhook-trigger/736533f0-b6a5-4f5e-971e-487bf26ece26';

const REFERRAL_LINK_BASE = 'https://referidos.selvadentrotulum.com/invitacion';

export interface ReferrerSignupData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export interface ReferralLeadData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export interface SubmissionResult {
  success: boolean;
  error?: unknown;
  /** For referrer signups: the affiliate code + full link, so the UI can display
   *  it immediately rather than waiting for the GHL email to land. */
  affiliate_code?: string;
  referral_link?: string;
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    // Use `any[]` here (not unknown) to match the typical GA snippet shape
    // and avoid conflicting with any other module that might also declare gtag.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (command: string, ...args: any[]) => void;
  }
}

const fireLeadEvents = (eventLabel: string) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'generate_lead', {
      currency: 'USD',
      value: 0,
      event_category: 'Referidos',
      event_label: eventLabel,
    });
  }
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Lead', {
      content_name: eventLabel,
      content_category: 'referidos',
    });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// REFERRER SIGNUP
// ──────────────────────────────────────────────────────────────────────────

export const submitReferrerSignup = async (
  data: ReferrerSignupData,
  tracking: TrackingParams,
): Promise<SubmissionResult> => {
  // Step 1 — Insert into Supabase via RPC, receive the generated code back.
  const { data: rpcRows, error: rpcError } = await supabase.rpc('create_affiliate', {
    p_first_name: data.first_name,
    p_last_name: data.last_name || null,
    p_email: data.email,
    p_phone: data.phone,
  });

  if (rpcError) {
    // Duplicate email (UNIQUE constraint) lands here — surface a friendly message.
    console.error('Supabase create_affiliate failed:', rpcError);
    const isDuplicate =
      typeof rpcError.message === 'string' && rpcError.message.includes('affiliates_email_key');
    return {
      success: false,
      error: isDuplicate
        ? new Error('Ya existe un afiliado con este correo. Revisa tu bandeja de entrada.')
        : rpcError,
    };
  }

  const row = Array.isArray(rpcRows) ? rpcRows[0] : rpcRows;
  if (!row?.code) {
    return { success: false, error: new Error('No se recibió código de afiliado') };
  }

  const affiliate_code: string = row.code;
  const referral_link = `${REFERRAL_LINK_BASE}?ref=${encodeURIComponent(affiliate_code)}`;

  // Step 2 — Forward to GHL with the code so the workflow can email the link.
  //          Best-effort: if GHL fails, the affiliate still exists in our DB,
  //          and we have the link to show on-screen.
  try {
    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      name: `${data.first_name} ${data.last_name}`.trim(),
      email: data.email,
      phone: data.phone,
      language: 'Spanish',
      form_type: 'referrer-signup',
      // Affiliate attribution from Supabase — GHL email template uses this:
      affiliate_code,
      referral_link,
      // Sourcing
      source_label: 'referidos-signup',
      tags: ['referidos', 'referrer-signup'],
      'contact.source': 'Referidos - Signup',
      landing_page: tracking.landing_page,
      referrer_url: tracking.referrer_url,
      utm_source: tracking.utm_source,
      utm_medium: tracking.utm_medium,
      utm_campaign: tracking.utm_campaign,
      utm_term: tracking.utm_term,
      utm_content: tracking.utm_content,
      gclid: tracking.gclid,
      fbclid: tracking.fbclid,
    };
    const response = await fetch(REFERRER_SIGNUP_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      console.warn(
        `GHL webhook returned ${response.status} — affiliate created in DB, but welcome email may not have sent.`,
      );
    }
  } catch (e) {
    console.warn('GHL webhook errored — affiliate created in DB, but welcome email may not have sent:', e);
  }

  fireLeadEvents('referrer-signup');
  return { success: true, affiliate_code, referral_link };
};

// ──────────────────────────────────────────────────────────────────────────
// REFERRAL LEAD
// ──────────────────────────────────────────────────────────────────────────

export const submitReferralLead = async (
  data: ReferralLeadData,
  tracking: TrackingParams,
): Promise<SubmissionResult> => {
  const affiliate_code: string | null =
    tracking.ref || tracking.referrer || tracking.affiliate_id || tracking.aff || null;

  // Step 1 — Insert into Supabase via RPC (links to affiliate by code).
  const { error: rpcError } = await supabase.rpc('create_lead', {
    p_first_name: data.first_name,
    p_last_name: data.last_name || null,
    p_email: data.email,
    p_phone: data.phone,
    p_referral_code: affiliate_code,
    p_landing_page: tracking.landing_page,
    p_utm_source: tracking.utm_source ?? null,
    p_utm_campaign: tracking.utm_campaign ?? null,
  });

  if (rpcError) {
    console.error('Supabase create_lead failed:', rpcError);
    return { success: false, error: rpcError };
  }

  // Step 2 — Forward to GHL with attribution. Best-effort.
  try {
    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      name: `${data.first_name} ${data.last_name}`.trim(),
      email: data.email,
      phone: data.phone,
      language: 'Spanish',
      form_type: 'referral-lead',
      // Affiliate attribution
      affiliate_id: affiliate_code,
      ref: tracking.ref,
      referrer: tracking.referrer,
      aff: tracking.aff,
      source_label: 'referidos-lead',
      tags: ['referidos', 'referral-lead'],
      'contact.source': 'Referidos - Lead',
      'contact.campaign': tracking.utm_campaign,
      'contact.ad_ctwa_clid': tracking.fbclid || tracking.gclid,
      landing_page: tracking.landing_page,
      referrer_url: tracking.referrer_url,
      utm_source: tracking.utm_source,
      utm_medium: tracking.utm_medium,
      utm_campaign: tracking.utm_campaign,
      utm_term: tracking.utm_term,
      utm_content: tracking.utm_content,
      gclid: tracking.gclid,
      fbclid: tracking.fbclid,
    };
    const response = await fetch(REFERRAL_LEAD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      console.warn(`GHL webhook returned ${response.status} — lead saved in DB, but not yet in GHL`);
    }
  } catch (e) {
    console.warn('GHL webhook errored — lead saved in DB, but not yet in GHL:', e);
  }

  fireLeadEvents('referral-lead');
  return { success: true };
};

// ──────────────────────────────────────────────────────────────────────────
// CLICK TRACKING — Supabase only
// ──────────────────────────────────────────────────────────────────────────

export const trackReferralClick = async (
  code: string,
  tracking: TrackingParams,
): Promise<void> => {
  // Fire-and-forget — never block page render or surface errors to the user.
  try {
    await supabase.rpc('track_click', {
      p_code: code,
      p_user_agent: navigator.userAgent ?? null,
      p_referrer_url: tracking.referrer_url ?? null,
      p_utm_source: tracking.utm_source ?? null,
      p_utm_medium: tracking.utm_medium ?? null,
      p_utm_campaign: tracking.utm_campaign ?? null,
      p_utm_term: tracking.utm_term ?? null,
      p_utm_content: tracking.utm_content ?? null,
    });
  } catch (e) {
    // Silent — clicks aren't critical to user experience.
    console.debug('track_click failed:', e);
  }
};
