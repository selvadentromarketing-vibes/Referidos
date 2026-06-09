/**
 * URL parameter capture for the referidos site.
 * Captures both standard marketing params (UTM, gclid, fbclid) AND any
 * referral/affiliate params that the GHL affiliate system sets on the
 * referrer's tracking link.
 *
 * The exact GHL affiliate param name (`ref`, `affiliate_id`, `aff`, ...) is
 * captured generically — whatever lands in the URL gets forwarded to GHL,
 * so this doesn't break if GHL changes the param name.
 */

export interface TrackingParams {
  // Standard marketing
  gclid?: string;
  fbclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  // Ad structure IDs (populated by {{ad.id}} / {{adset.id}} / {{campaign.id}}
  // dynamic params on the Meta Ads URL template, or equivalents on Google.)
  ad_id?: string;
  adset_id?: string;
  campaign_id?: string;
  // Google search term ({keyword} dynamic param)
  search_term?: string;
  // Referral / affiliate (any of these may appear, depending on GHL setup)
  ref?: string;
  referrer?: string;
  affiliate_id?: string;
  aff?: string;
  // Always captured
  landing_page: string;
  referrer_url?: string;
}

const pickFirst = (url: URLSearchParams, keys: string[]): string | undefined => {
  for (const k of keys) {
    const v = url.get(k);
    if (v) return v;
  }
  return undefined;
};

export const captureTrackingParams = (): TrackingParams => {
  const url = new URLSearchParams(window.location.search);

  const params: TrackingParams = {
    landing_page: window.location.href,
    referrer_url: document.referrer || undefined,
    gclid: url.get('gclid') || undefined,
    fbclid: url.get('fbclid') || undefined,
    utm_source: url.get('utm_source') || undefined,
    utm_medium: url.get('utm_medium') || undefined,
    utm_campaign: url.get('utm_campaign') || undefined,
    utm_term: url.get('utm_term') || undefined,
    utm_content: url.get('utm_content') || undefined,
    // Accept multiple aliases so the ads team has flexibility in URL templates.
    ad_id: pickFirst(url, ['ad_id', 'ad_source_id', 'fb_ad_id']),
    adset_id: pickFirst(url, ['adset_id', 'fb_adset_id']),
    campaign_id: pickFirst(url, ['campaign_id', 'fb_campaign_id']),
    search_term: pickFirst(url, ['search_term', 'keyword']),
    ref: url.get('ref') || undefined,
    referrer: url.get('referrer') || undefined,
    affiliate_id: url.get('affiliate_id') || undefined,
    aff: url.get('aff') || undefined,
  };

  // Persist for downstream form submissions even if URL changes during navigation
  try {
    localStorage.setItem('referidos_tracking', JSON.stringify(params));
  } catch {
    // localStorage can fail in privacy mode — fall back gracefully
  }

  return params;
};

export const getStoredTrackingParams = (): TrackingParams => {
  try {
    const stored = localStorage.getItem('referidos_tracking');
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return { landing_page: window.location.href };
};

/**
 * Returns the first non-empty referral identifier found in the captured params.
 * Used to display "Tu amigo X te recomienda" on the referee landing.
 */
export const getReferralCode = (params: TrackingParams): string | undefined => {
  return params.ref || params.referrer || params.affiliate_id || params.aff;
};
