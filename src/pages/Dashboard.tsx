import { useEffect, useState } from 'react';
import {
  LogOut, Copy, Check, Share2, Loader2,
  MousePointerClick, Users, Briefcase, Trophy, CircleDollarSign,
  AlertCircle, Shield,
} from 'lucide-react';
import { useAuth, signOut } from '../utils/auth';
import { supabase } from '../utils/supabase';
import { useLang } from '../i18n/useLang';
import type { Translations } from '../i18n/translations';

interface DashboardData {
  id: string;
  code: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string;
  status: 'active' | 'paused';
  click_count: number;
  lead_count: number;
  won_count: number;
  commissions_owed: number;
  commissions_paid: number;
}

interface ReferralRow {
  id: string;
  first_name: string;
  last_name: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'zoom' | 'tour' | 'opp' | 'won' | 'lost';
  created_at: string;
}

const formatUSD = (n: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
    .format(n)
    .replace('$', '$ ');

const relativeTime = (iso: string, t: Translations['dashboard']): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) return t.relTimeToday;
  if (days === 1) return t.relTimeYesterday;
  if (days < 30) return t.relTimeDays(days);
  if (days < 365) return t.relTimeMonths(Math.floor(days / 30));
  return t.relTimeYears(Math.floor(days / 365));
};

const STATUS_BG: Record<ReferralRow['status'], string> = {
  new: 'bg-stone-100 text-stone-700 border-stone-200',
  contacted: 'bg-amber-50 text-amber-800 border-amber-200',
  qualified: 'bg-blue-50 text-blue-800 border-blue-200',
  zoom: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  tour: 'bg-purple-50 text-purple-800 border-purple-200',
  opp: 'bg-violet-50 text-violet-800 border-violet-200',
  won: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  lost: 'bg-red-50 text-red-800 border-red-200',
};

const initials = (first: string, last: string | null): string => {
  const f = first?.[0] ?? '';
  const l = last?.[0] ?? '';
  return (f + l).toUpperCase() || '·';
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: 'olive' | 'copper' | 'green' | 'beige';
}

function StatCard({ icon, label, value, accent = 'olive' }: StatCardProps) {
  const accentBg = {
    olive: 'bg-brand-olive/10 text-brand-olive',
    copper: 'bg-brand-copper/15 text-brand-copper',
    green: 'bg-emerald-100 text-emerald-700',
    beige: 'bg-amber-100 text-amber-800',
  }[accent];
  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">{label}</span>
        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full ${accentBg}`}>{icon}</span>
      </div>
      <p className="font-cardo text-3xl sm:text-4xl font-bold text-brand-dark-green leading-none">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const { lang, t, otherLang, swapLangUrl } = useLang();
  const [data, setData] = useState<DashboardData | null>(null);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [notAffiliate, setNotAffiliate] = useState(false);

  const statusLabel = (s: ReferralRow['status']): string => {
    switch (s) {
      case 'new': return t.dashboard.statusNew;
      case 'contacted': return t.dashboard.statusContacted;
      case 'qualified': return t.dashboard.statusQualified;
      case 'zoom': return t.dashboard.statusZoom;
      case 'tour': return t.dashboard.statusTour;
      case 'opp': return t.dashboard.statusOpp;
      case 'won': return t.dashboard.statusWon;
      case 'lost': return t.dashboard.statusLost;
    }
  };

  useEffect(() => {
    document.title = t.dashboard.docTitle;
  }, [t]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setNotAffiliate(false);

    Promise.all([
      supabase.rpc('get_my_dashboard'),
      supabase.rpc('get_my_referrals'),
    ])
      .then(([dashRes, refsRes]) => {
        if (!mounted) return;
        if (dashRes.error) throw dashRes.error;
        if (refsRes.error) throw refsRes.error;
        const dashRow = Array.isArray(dashRes.data) ? dashRes.data[0] : dashRes.data;
        if (!dashRow) { setNotAffiliate(true); return; }
        setData(dashRow as DashboardData);
        setReferrals((refsRes.data ?? []) as ReferralRow[]);
      })
      .catch((e: unknown) => {
        if (!mounted) return;
        console.error('Dashboard load failed:', e);
        const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message: unknown }).message) : 'Error';
        setError(msg);
      })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [user?.email]);

  const referralLink = data ? `${window.location.origin}/${lang}/invitacion?ref=${data.code}` : '';

  const copyLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const whatsappShare = () => {
    if (!referralLink) return;
    const msg = encodeURIComponent(
      lang === 'en'
        ? `Sharing this project in Tulum that has me impressed — Selvadentro: ${referralLink}`
        : `Te comparto este proyecto en Tulum que me tiene impresionado — Selvadentro: ${referralLink}`,
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#ECE5D8] font-lexend">
      <header className="bg-brand-dark-green text-white px-4 sm:px-6 lg:px-10 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <a href={`/${lang}`} aria-label="Selvadentro" className="shrink-0">
            <img src="/logo-selvandentro_tulum.webp" alt="Selvadentro" className="h-8 sm:h-9 w-auto" />
          </a>
          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href={swapLangUrl()}
              className="text-[11px] font-semibold tracking-widest text-white/70 hover:text-white px-2 transition"
              title={`Switch to ${otherLang.toUpperCase()}`}
            >
              {lang.toUpperCase()} · <span className="text-brand-copper underline">{otherLang.toUpperCase()}</span>
            </a>
            {isAdmin && (
              <a
                href={`/${lang}/admin`}
                className="flex items-center gap-1.5 text-xs sm:text-sm text-brand-copper hover:text-white px-3 py-1.5 rounded-full hover:bg-brand-copper/20 border border-brand-copper/40 transition"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.dashboard.adminPanel}</span>
                <span className="sm:hidden">{t.dashboard.adminPanelShort}</span>
              </a>
            )}
            <span className="text-xs sm:text-sm text-white/75 hidden md:inline truncate max-w-[180px]">{user?.email}</span>
            <button onClick={() => signOut()} className="flex items-center gap-1.5 text-xs sm:text-sm text-white/85 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.common.signOut}</span>
              <span className="sm:hidden">{t.common.signOutShort}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
        {loading && (
          <div className="bg-white rounded-2xl p-12 border border-stone-100 shadow-sm flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-brand-olive animate-spin mb-4" />
            <p className="text-stone-600 text-sm">{t.dashboard.loading}</p>
          </div>
        )}

        {!loading && notAffiliate && (
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-stone-100 shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-copper/15 text-brand-copper mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="font-cardo text-2xl sm:text-3xl font-bold text-brand-dark-green mb-3">{t.dashboard.notAffiliateTitle}</h2>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed mb-6 max-w-md mx-auto">
              {t.dashboard.notAffiliateBodyPre}<strong>{user?.email}</strong>{t.dashboard.notAffiliateBodyTail}
            </p>
            <a href={`/${lang}`} className="inline-block px-8 py-4 bg-brand-olive text-white rounded-full font-semibold text-base hover:bg-brand-dark-green transition-all shadow-lg">
              {t.dashboard.notAffiliateCta}
            </a>
            <p className="mt-4 text-xs text-stone-500">
              {t.dashboard.notAffiliateHelp}{' '}
              <a href={`mailto:${t.common.contactSupportEmail}`} className="text-brand-olive underline">{t.common.contactSupportEmail}</a>
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-2xl p-8 border border-red-100 shadow-sm">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h2 className="font-cardo text-xl font-bold text-brand-dark-green mb-2">{t.dashboard.errorTitle}</h2>
                <p className="text-sm text-stone-600 leading-relaxed mb-3">{t.dashboard.errorBody}</p>
                <pre className="text-xs bg-stone-50 border border-stone-200 rounded-lg p-3 mb-4 overflow-x-auto text-red-700 whitespace-pre-wrap">{error}</pre>
                <button onClick={() => window.location.reload()} className="text-sm text-brand-olive hover:text-brand-dark-green underline">{t.dashboard.refresh}</button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && !notAffiliate && data && (
          <>
            <div className="mb-8">
              <h1 className="font-cardo text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-dark-green leading-tight mb-2">
                {t.dashboard.greeting} {data.first_name}
              </h1>
              <p className="text-stone-600 text-sm sm:text-base">{t.dashboard.realTimeSub}</p>
            </div>

            <div className="mb-8 bg-white rounded-2xl p-6 sm:p-8 border border-stone-100 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-olive mb-2">{t.dashboard.yourLink}</p>
              <a href={referralLink} target="_blank" rel="noopener noreferrer" className="block bg-[#F8F5EF] rounded-xl p-4 mb-4 border border-stone-100 hover:border-brand-olive/30 transition">
                <code className="block font-mono text-xs sm:text-sm text-brand-dark-green break-all leading-relaxed">{referralLink}</code>
              </a>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={copyLink} className="flex items-center justify-center gap-2 px-4 py-3 bg-brand-olive text-white rounded-lg font-semibold text-sm hover:bg-brand-dark-green transition-all">
                  {copied ? <><Check className="w-4 h-4" /> {t.common.copied}</> : <><Copy className="w-4 h-4" /> {t.common.copy}</>}
                </button>
                <button type="button" onClick={whatsappShare} className="flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] text-white rounded-lg font-semibold text-sm hover:bg-[#1ebe5d] transition-all">
                  <Share2 className="w-4 h-4" /> {t.common.shareWhatsapp}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
              <StatCard icon={<MousePointerClick className="w-4 h-4" />} label={t.dashboard.statClicks} value={data.click_count} accent="olive" />
              <StatCard icon={<Users className="w-4 h-4" />} label={t.dashboard.statLeads} value={data.lead_count} accent="copper" />
              <StatCard icon={<Briefcase className="w-4 h-4" />} label={t.dashboard.statPipeline} value={Math.max(0, data.lead_count - data.won_count)} accent="beige" />
              <StatCard icon={<Trophy className="w-4 h-4" />} label={t.dashboard.statClosed} value={data.won_count} accent="green" />
            </div>

            <div className="mb-8 bg-white rounded-2xl p-6 sm:p-8 border border-stone-100 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-copper/15 text-brand-copper">
                  <CircleDollarSign className="w-5 h-5" />
                </span>
                <h2 className="font-cardo text-xl sm:text-2xl font-bold text-brand-dark-green">{t.dashboard.commissions}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#F8F5EF] rounded-xl p-4 sm:p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-olive mb-1">{t.dashboard.commissionsOwed}</p>
                  <p className="font-cardo text-3xl sm:text-4xl font-bold text-brand-dark-green leading-none">{formatUSD(data.commissions_owed)}</p>
                  <p className="text-xs text-stone-500 mt-2">{t.dashboard.commissionsOwedBody}</p>
                </div>
                <div className="bg-[#F8F5EF] rounded-xl p-4 sm:p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-700 mb-1">{t.dashboard.commissionsPaid}</p>
                  <p className="font-cardo text-3xl sm:text-4xl font-bold text-brand-dark-green leading-none">{formatUSD(data.commissions_paid)}</p>
                  <p className="text-xs text-stone-500 mt-2">{t.dashboard.commissionsPaidBody}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-100 shadow-sm">
              <h2 className="font-cardo text-xl sm:text-2xl font-bold text-brand-dark-green mb-5">{t.dashboard.recentReferrals}</h2>
              {referrals.length === 0 ? (
                <div className="text-center py-10">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-olive/10 text-brand-olive mb-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-brand-dark-green mb-1">{t.dashboard.emptyTitle}</p>
                  <p className="text-sm text-stone-500 max-w-sm mx-auto">{t.dashboard.emptyBody}</p>
                </div>
              ) : (
                <ul className="divide-y divide-stone-100">
                  {referrals.map((r) => (
                    <li key={r.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="shrink-0 w-10 h-10 rounded-full bg-brand-olive/15 text-brand-olive flex items-center justify-center text-sm font-semibold">
                        {initials(r.first_name, r.last_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-brand-dark-green truncate">{r.first_name} {r.last_name?.[0] ? `${r.last_name[0]}.` : ''}</p>
                        <p className="text-xs text-stone-500">{relativeTime(r.created_at, t.dashboard)}</p>
                      </div>
                      <span className={`shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_BG[r.status]}`}>
                        {statusLabel(r.status)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="px-4 py-8 text-center text-xs text-stone-500">{t.common.footerCopy}</footer>
    </div>
  );
}
