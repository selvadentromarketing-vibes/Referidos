-- =============================================================================
--  Selvadentro Referidos — V1 schema
--  Apply via: Supabase Dashboard → SQL Editor → paste + Run
--  Project:   oqvxpapestbxcwiybgzl.supabase.co
-- =============================================================================
--
-- DESIGN NOTES
--   * Browser calls Postgres functions (RPC) via the anon publishable key.
--   * No direct table access from the client — all writes go through
--     SECURITY DEFINER functions that control exactly what is inserted.
--   * RLS is enabled on every table with NO policies → anon cannot touch
--     tables directly. Defense-in-depth in case a function is later opened up.
--   * Admin reads/updates happen via the Supabase Table Editor (service_role).
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── TABLES ────────────────────────────────────────────────────────────────

CREATE TABLE affiliates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT UNIQUE NOT NULL,
  first_name      TEXT NOT NULL,
  last_name       TEXT,
  email           TEXT UNIQUE NOT NULL,
  phone           TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'paused')),
  ghl_contact_id  TEXT,                  -- populated post-signup by GHL workflow
  commission_rate NUMERIC,               -- % per won referral (optional override)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_affiliates_email ON affiliates (email);

CREATE TABLE clicks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id  UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  clicked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_agent    TEXT,
  referrer_url  TEXT,
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  utm_term      TEXT,
  utm_content   TEXT
);

CREATE INDEX idx_clicks_affiliate_clicked ON clicks (affiliate_id, clicked_at DESC);

CREATE TABLE leads (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id    UUID REFERENCES affiliates(id) ON DELETE SET NULL,
  first_name      TEXT NOT NULL,
  last_name       TEXT,
  email           TEXT NOT NULL,
  phone           TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new', 'contacted', 'qualified', 'won', 'lost')),
  ghl_contact_id  TEXT,
  landing_page    TEXT,
  utm_source      TEXT,
  utm_campaign    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leads_affiliate ON leads (affiliate_id);
CREATE INDEX idx_leads_status    ON leads (status);

CREATE TABLE commissions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id    UUID NOT NULL REFERENCES affiliates(id) ON DELETE RESTRICT,
  lead_id         UUID NOT NULL UNIQUE REFERENCES leads(id) ON DELETE RESTRICT,
  amount          NUMERIC NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'USD',
  status          TEXT NOT NULL DEFAULT 'owed'
                    CHECK (status IN ('owed', 'paid', 'cancelled')),
  escritura_date  DATE,
  paid_date       DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_commissions_affiliate_status ON commissions (affiliate_id, status);

-- ─── CODE GENERATOR ────────────────────────────────────────────────────────
-- Produces a slug like "ricardo-a4f8" from the affiliate's first name +
-- a random 4-char hex suffix. Retries up to 10 times on collision.

CREATE OR REPLACE FUNCTION generate_affiliate_code(p_first_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  candidate TEXT;
  attempt   INT := 0;
BEGIN
  base_slug := lower(regexp_replace(coalesce(p_first_name, 'ref'), '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  IF base_slug = '' THEN
    base_slug := 'ref';
  END IF;

  LOOP
    candidate := base_slug || '-' || substring(md5(random()::text || clock_timestamp()::text), 1, 4);
    EXIT WHEN NOT EXISTS (SELECT 1 FROM affiliates WHERE code = candidate);
    attempt := attempt + 1;
    IF attempt > 10 THEN
      RAISE EXCEPTION 'Unable to generate unique affiliate code after 10 attempts';
    END IF;
  END LOOP;

  RETURN candidate;
END;
$$;

-- ─── RPC FUNCTIONS (browser-callable via supabase.rpc) ─────────────────────

CREATE OR REPLACE FUNCTION create_affiliate(
  p_first_name TEXT,
  p_last_name  TEXT,
  p_email      TEXT,
  p_phone      TEXT
) RETURNS TABLE (id UUID, code TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id   UUID;
  v_code TEXT;
BEGIN
  v_code := generate_affiliate_code(p_first_name);
  INSERT INTO affiliates (first_name, last_name, email, phone, code)
  VALUES (p_first_name, p_last_name, p_email, p_phone, v_code)
  RETURNING affiliates.id INTO v_id;
  RETURN QUERY SELECT v_id, v_code;
END;
$$;

CREATE OR REPLACE FUNCTION track_click(
  p_code         TEXT,
  p_user_agent   TEXT,
  p_referrer_url TEXT,
  p_utm_source   TEXT,
  p_utm_medium   TEXT,
  p_utm_campaign TEXT,
  p_utm_term     TEXT,
  p_utm_content  TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_affiliate_id UUID;
BEGIN
  SELECT id INTO v_affiliate_id FROM affiliates
  WHERE code = p_code AND status = 'active';
  IF v_affiliate_id IS NULL THEN
    RETURN;  -- unknown or paused affiliate code → silently ignore
  END IF;
  INSERT INTO clicks (
    affiliate_id, user_agent, referrer_url,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content
  )
  VALUES (
    v_affiliate_id, p_user_agent, p_referrer_url,
    p_utm_source, p_utm_medium, p_utm_campaign, p_utm_term, p_utm_content
  );
END;
$$;

-- NOTE: get_my_dashboard and admin_leaderboard use qualified column references
-- (leads.status, commissions.status) inside FILTER clauses because Postgres
-- otherwise sees ambiguity with the "status" OUT parameter on the function's
-- RETURN TABLE. See db/migrations/2026-06-01-fix-status-ambiguity.sql.

-- v2: returns the referring affiliate's name + email so the GHL payload
-- can include them as referred_by_name / referred_by_email custom fields.
CREATE OR REPLACE FUNCTION create_lead(
  p_first_name    TEXT,
  p_last_name     TEXT,
  p_email         TEXT,
  p_phone         TEXT,
  p_referral_code TEXT,
  p_landing_page  TEXT,
  p_utm_source    TEXT,
  p_utm_campaign  TEXT
) RETURNS TABLE (
  id                  UUID,
  referred_by_name    TEXT,
  referred_by_email   TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_affiliate_id    UUID;
  v_lead_id         UUID;
  v_affiliate_name  TEXT;
  v_affiliate_email TEXT;
BEGIN
  IF p_referral_code IS NOT NULL AND p_referral_code <> '' THEN
    SELECT a.id,
           trim(coalesce(a.first_name, '') || ' ' || coalesce(a.last_name, '')),
           a.email
    INTO   v_affiliate_id, v_affiliate_name, v_affiliate_email
    FROM   affiliates a
    WHERE  a.code = p_referral_code AND a.status = 'active';
  END IF;
  INSERT INTO leads (
    first_name, last_name, email, phone,
    affiliate_id, landing_page, utm_source, utm_campaign
  )
  VALUES (
    p_first_name, p_last_name, p_email, p_phone,
    v_affiliate_id, p_landing_page, p_utm_source, p_utm_campaign
  )
  RETURNING leads.id INTO v_lead_id;
  RETURN QUERY SELECT v_lead_id, v_affiliate_name, v_affiliate_email;
END;
$$;

-- ─── RLS — enable on all tables, NO policies (defense-in-depth) ───────────

ALTER TABLE affiliates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE clicks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads       ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- ─── GRANTS — anon role gets ONLY the 3 RPC functions ─────────────────────

REVOKE ALL ON FUNCTION create_affiliate(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION track_click(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION create_lead(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION create_affiliate(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION track_click(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_lead(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- ─── ADMIN STATS VIEW ──────────────────────────────────────────────────────
-- Query in Supabase Table Editor or via service_role for the leaderboard.
-- NOT exposed to anon — anon cannot SELECT from views either.

CREATE OR REPLACE VIEW affiliate_stats AS
SELECT
  a.id,
  a.code,
  a.first_name,
  a.last_name,
  a.email,
  a.status,
  a.created_at,
  COALESCE(c.click_count, 0)   AS click_count,
  COALESCE(l.lead_count, 0)    AS lead_count,
  COALESCE(l.won_count, 0)     AS won_count,
  COALESCE(co.owed, 0)         AS commissions_owed,
  COALESCE(co.paid, 0)         AS commissions_paid
FROM affiliates a
LEFT JOIN (
  SELECT affiliate_id, COUNT(*) AS click_count
  FROM clicks GROUP BY affiliate_id
) c ON c.affiliate_id = a.id
LEFT JOIN (
  SELECT affiliate_id,
         COUNT(*)                                AS lead_count,
         COUNT(*) FILTER (WHERE status = 'won')  AS won_count
  FROM leads GROUP BY affiliate_id
) l ON l.affiliate_id = a.id
LEFT JOIN (
  SELECT affiliate_id,
         SUM(amount) FILTER (WHERE status = 'owed') AS owed,
         SUM(amount) FILTER (WHERE status = 'paid') AS paid
  FROM commissions GROUP BY affiliate_id
) co ON co.affiliate_id = a.id;

-- =============================================================================
--  POST-APPLY VERIFICATION
--  After running, paste these in the SQL Editor to confirm everything works:
--
--    SELECT * FROM create_affiliate('Test', 'User', 'test@example.com', '+5215551234567');
--    -- → returns { id: <uuid>, code: 'test-a3f8' }
--
--    SELECT * FROM affiliate_stats;
--    -- → 1 row with 0 clicks, 0 leads
--
--    -- Cleanup:
--    DELETE FROM affiliates WHERE email = 'test@example.com';
-- =============================================================================
