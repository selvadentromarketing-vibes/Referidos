import { TrackingParams } from './tracking';

/**
 * TWO GoHighLevel webhooks — one per page.
 *
 * ⚠️ PLACEHOLDER URLs — replace with real GHL inbound webhook URLs before going live.
 * Each webhook should feed a different GHL workflow:
 *   1. REFERRER_SIGNUP_WEBHOOK → workflow that creates an affiliate in GHL and emails them their tracking link.
 *   2. REFERRAL_LEAD_WEBHOOK   → workflow that creates a contact tagged with the referrer's affiliate_id.
 *
 * To get these URLs:
 *   GHL → Automations → Workflows → New Workflow → "Inbound Webhook" trigger → copy the URL.
 *   Send a test payload through (see plan file) before wiring the live form.
 */
const REFERRER_SIGNUP_WEBHOOK_URL =
  'https://services.leadconnectorhq.com/hooks/crN2IhAuOBAl7D8324yI/webhook-trigger/874d9a89-3828-4216-ba8a-b4a3ccadc7b1';

// ⚠️ Still placeholder — awaiting the Referral Lead webhook URL from client.
const REFERRAL_LEAD_WEBHOOK_URL =
  'https://services.leadconnectorhq.com/hooks/crN2IhAuOBAl7D8324yI/webhook-trigger/REPLACE-ME-REFERRAL-LEAD';

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
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (command: string, ...args: unknown[]) => void;
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

export const submitReferrerSignup = async (
  data: ReferrerSignupData,
  tracking: TrackingParams,
): Promise<SubmissionResult> => {
  const payload = {
    first_name: data.first_name,
    last_name: data.last_name,
    name: `${data.first_name} ${data.last_name}`.trim(),
    email: data.email,
    phone: data.phone,
    language: 'Spanish',
    form_type: 'referrer-signup',
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

  try {
    const response = await fetch(REFERRER_SIGNUP_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Webhook ${response.status}`);
    fireLeadEvents('referrer-signup');
    return { success: true };
  } catch (error) {
    console.error('Referrer signup submission failed:', error);
    return { success: false, error };
  }
};

export const submitReferralLead = async (
  data: ReferralLeadData,
  tracking: TrackingParams,
): Promise<SubmissionResult> => {
  // The affiliate ID may arrive under any of several param names depending on
  // GHL's exact config — capture all of them so attribution works no matter what.
  const affiliate_id =
    tracking.ref ||
    tracking.referrer ||
    tracking.affiliate_id ||
    tracking.aff ||
    undefined;

  const payload = {
    first_name: data.first_name,
    last_name: data.last_name,
    name: `${data.first_name} ${data.last_name}`.trim(),
    email: data.email,
    phone: data.phone,
    language: 'Spanish',
    form_type: 'referral-lead',
    source_label: 'referidos-lead',
    tags: ['referidos', 'referral-lead'],
    // Affiliate attribution — pass under multiple field names so the GHL workflow
    // can map whichever one the affiliate system actually expects.
    affiliate_id,
    ref: tracking.ref,
    referrer: tracking.referrer,
    aff: tracking.aff,
    // Standard tracking
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

  try {
    const response = await fetch(REFERRAL_LEAD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Webhook ${response.status}`);
    fireLeadEvents('referral-lead');
    return { success: true };
  } catch (error) {
    console.error('Referral lead submission failed:', error);
    return { success: false, error };
  }
};
