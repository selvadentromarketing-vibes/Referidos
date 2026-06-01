import { useEffect, useState } from 'react';
import {
  LogOut,
  Copy,
  Check,
  Share2,
  Loader2,
  MousePointerClick,
  Users,
  Briefcase,
  Trophy,
  CircleDollarSign,
  AlertCircle,
} from 'lucide-react';
import { useAuth, signOut } from '../utils/auth';
import { supabase } from '../utils/supabase';

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
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

const formatUSD = (n: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
    .format(n)
    .replace('$', '$ ');

const relativeTime = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) return 'hoy';
  if (days === 1) return 'ayer';
  if (days < 30) return `hace ${days} días`;
  if (days < 365) return `hace ${Math.floor(days / 30)} ${Math.floor(days / 30) === 1 ? 'mes' : 'meses'}`;
  return `hace ${Math.floor(days / 365)} año${Math.floor(days / 365) === 1 ? '' : 's'}`;
};

const STATUS_LABEL: Record<ReferralRow['status'], string> = {
  new: 'Nuevo',
  contacted: 'Contactado',
  qualified: 'Calificado',
  won: 'Cerrado',
  lost: 'Perdido',
};

const STATUS_BG: Record<ReferralRow['status'], string> = {
  new: 'bg-stone-100 text-stone-700 border-stone-200',
  contacted: 'bg-amber-50 text-amber-800 border-amber-200',
  qualified: 'bg-blue-50 text-blue-800 border-blue-200',
  won: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  lost: 'bg-red-50 text-red-800 border-red-200',
};

const initials = (first: string, last: string | null): string => {
  const f = first?.[0] ?? '';
  const l = last?.[0] ?? '';
  return (f + l).toUpperCase() || '·';
};

// ─── Small inline components ──────────────────────────────────────────────

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
        <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">
          {label}
        </span>
        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full ${accentBg}`}>
          {icon}
        </span>
      </div>
      <p className="font-cardo text-3xl sm:text-4xl font-bold text-brand-dark-green leading-none">
        {value}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [notAffiliate, setNotAffiliate] = useState(false);

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
        if (!dashRow) {
          // The auth user has no affiliate row yet. Distinct from a system error
          // — show a "sign up first" CTA, not a scary error message.
          setNotAffiliate(true);
          return;
        }
        setData(dashRow as DashboardData);
        setReferrals((refsRes.data ?? []) as ReferralRow[]);
      })
      .catch((e: unknown) => {
        if (!mounted) return;
        console.error('Dashboard load failed:', e);
        // Surface the actual Postgres / Supabase error message so we can debug.
        const msg =
          e && typeof e === 'object' && 'message' in e
            ? String((e as { message: unknown }).message)
            : 'Error desconocido';
        setError(msg);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user?.email]);

  const referralLink = data
    ? `${window.location.origin}/invitacion?ref=${data.code}`
    : '';

  const copyLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* older browsers fall through silently */
    }
  };

  const whatsappShare = () => {
    if (!referralLink) return;
    const msg = encodeURIComponent(
      `Te comparto este proyecto en Tulum que me tiene impresionado — Selvadentro: ${referralLink}`,
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#ECE5D8] font-lexend">
      {/* HEADER */}
      <header className="bg-brand-dark-green text-white px-4 sm:px-6 lg:px-10 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <a href="/" aria-label="Selvadentro" className="shrink-0">
            <img
              src="/logo-selvandentro_tulum.webp"
              alt="Selvadentro"
              className="h-8 sm:h-9 w-auto"
            />
          </a>
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="text-xs sm:text-sm text-white/75 hidden sm:inline truncate max-w-[200px]">
              {user?.email}
            </span>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1.5 text-xs sm:text-sm text-white/85 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar sesión</span>
              <span className="sm:hidden">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
        {/* LOADING */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 border border-stone-100 shadow-sm flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-brand-olive animate-spin mb-4" />
            <p className="text-stone-600 text-sm">Cargando tus números...</p>
          </div>
        )}

        {/* NOT YET AN AFFILIATE */}
        {!loading && notAffiliate && (
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-stone-100 shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-copper/15 text-brand-copper mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="font-cardo text-2xl sm:text-3xl font-bold text-brand-dark-green mb-3">
              Aún no eres afiliado
            </h2>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed mb-6 max-w-md mx-auto">
              Tu correo <strong>{user?.email}</strong> no está registrado en el Programa de Referidos. Regístrate y recibe tu link personalizado en menos de 2 minutos.
            </p>
            <a
              href="/"
              className="inline-block px-8 py-4 bg-brand-olive text-white rounded-full font-semibold text-base hover:bg-brand-dark-green transition-all shadow-lg"
            >
              Registrarme como afiliado
            </a>
            <p className="mt-4 text-xs text-stone-500">
              ¿Crees que es un error? Escríbenos a{' '}
              <a href="mailto:d.comercial@selvadentrotulum.com" className="text-brand-olive underline">
                d.comercial@selvadentrotulum.com
              </a>
            </p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="bg-white rounded-2xl p-8 border border-red-100 shadow-sm">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h2 className="font-cardo text-xl font-bold text-brand-dark-green mb-2">
                  No pudimos cargar tu dashboard
                </h2>
                <p className="text-sm text-stone-600 leading-relaxed mb-3">
                  El servidor respondió con un error. Detalle técnico:
                </p>
                <pre className="text-xs bg-stone-50 border border-stone-200 rounded-lg p-3 mb-4 overflow-x-auto text-red-700 whitespace-pre-wrap">
                  {error}
                </pre>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm text-brand-olive hover:text-brand-dark-green underline"
                >
                  Refrescar página
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DATA */}
        {!loading && !error && !notAffiliate && data && (
          <>
            {/* HERO */}
            <div className="mb-8">
              <h1 className="font-cardo text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-dark-green leading-tight mb-2">
                Hola, {data.first_name}
              </h1>
              <p className="text-stone-600 text-sm sm:text-base">
                Aquí están tus números en tiempo real.
              </p>
            </div>

            {/* LINK BLOCK */}
            <div className="mb-8 bg-white rounded-2xl p-6 sm:p-8 border border-stone-100 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-olive mb-2">
                Tu link personalizado
              </p>
              <a
                href={referralLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-[#F8F5EF] rounded-xl p-4 mb-4 border border-stone-100 hover:border-brand-olive/30 transition"
              >
                <code className="block font-mono text-xs sm:text-sm text-brand-dark-green break-all leading-relaxed">
                  {referralLink}
                </code>
              </a>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={copyLink}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-brand-olive text-white rounded-lg font-semibold text-sm hover:bg-brand-dark-green transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copiar link
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={whatsappShare}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] text-white rounded-lg font-semibold text-sm hover:bg-[#1ebe5d] transition-all"
                >
                  <Share2 className="w-4 h-4" /> WhatsApp
                </button>
              </div>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
              <StatCard
                icon={<MousePointerClick className="w-4 h-4" />}
                label="Clics"
                value={data.click_count}
                accent="olive"
              />
              <StatCard
                icon={<Users className="w-4 h-4" />}
                label="Leads"
                value={data.lead_count}
                accent="copper"
              />
              <StatCard
                icon={<Briefcase className="w-4 h-4" />}
                label="En pipeline"
                value={Math.max(0, data.lead_count - data.won_count)}
                accent="beige"
              />
              <StatCard
                icon={<Trophy className="w-4 h-4" />}
                label="Cerrados"
                value={data.won_count}
                accent="green"
              />
            </div>

            {/* COMMISSIONS */}
            <div className="mb-8 bg-white rounded-2xl p-6 sm:p-8 border border-stone-100 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-copper/15 text-brand-copper">
                  <CircleDollarSign className="w-5 h-5" />
                </span>
                <h2 className="font-cardo text-xl sm:text-2xl font-bold text-brand-dark-green">
                  Comisiones
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#F8F5EF] rounded-xl p-4 sm:p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-olive mb-1">
                    Por cobrar
                  </p>
                  <p className="font-cardo text-3xl sm:text-4xl font-bold text-brand-dark-green leading-none">
                    {formatUSD(data.commissions_owed)}
                  </p>
                  <p className="text-xs text-stone-500 mt-2">
                    Te pagamos cuando tu referido firma escritura.
                  </p>
                </div>
                <div className="bg-[#F8F5EF] rounded-xl p-4 sm:p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-700 mb-1">
                    Pagado
                  </p>
                  <p className="font-cardo text-3xl sm:text-4xl font-bold text-brand-dark-green leading-none">
                    {formatUSD(data.commissions_paid)}
                  </p>
                  <p className="text-xs text-stone-500 mt-2">
                    Total transferido a tu cuenta.
                  </p>
                </div>
              </div>
            </div>

            {/* REFERRALS LIST */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-100 shadow-sm">
              <h2 className="font-cardo text-xl sm:text-2xl font-bold text-brand-dark-green mb-5">
                Tus referidos recientes
              </h2>

              {referrals.length === 0 ? (
                <div className="text-center py-10">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-olive/10 text-brand-olive mb-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-brand-dark-green mb-1">
                    Aún no tienes referidos
                  </p>
                  <p className="text-sm text-stone-500 max-w-sm mx-auto">
                    Comparte tu link en WhatsApp, redes o por correo. Cada visita queda registrada
                    a tu nombre.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-stone-100">
                  {referrals.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="shrink-0 w-10 h-10 rounded-full bg-brand-olive/15 text-brand-olive flex items-center justify-center text-sm font-semibold">
                        {initials(r.first_name, r.last_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-brand-dark-green truncate">
                          {r.first_name} {r.last_name?.[0] ? `${r.last_name[0]}.` : ''}
                        </p>
                        <p className="text-xs text-stone-500">{relativeTime(r.created_at)}</p>
                      </div>
                      <span
                        className={`shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_BG[r.status]}`}
                      >
                        {STATUS_LABEL[r.status]}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="px-4 py-8 text-center text-xs text-stone-500">
        © 2026 Selvadentro Tulum · Programa de Referidos
      </footer>
    </div>
  );
}
