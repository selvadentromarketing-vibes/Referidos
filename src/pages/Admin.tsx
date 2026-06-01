import { useEffect, useState, useCallback, FormEvent } from 'react';
import {
  LogOut, Shield, Loader2, RefreshCw, AlertCircle,
  Users, MousePointerClick, Trophy, CircleDollarSign, Briefcase,
  CheckCircle2, X, Edit2, DollarSign, ChevronDown, Search,
} from 'lucide-react';
import { useAuth, signOut } from '../utils/auth';
import { supabase } from '../utils/supabase';

// ─── Types ────────────────────────────────────────────────────────────────

interface Overview {
  total_affiliates: number;
  active_affiliates: number;
  total_clicks: number;
  total_leads: number;
  total_won: number;
  total_owed: number;
  total_paid: number;
}

interface LeaderboardRow {
  id: string;
  code: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string;
  status: 'active' | 'paused';
  commission_rate: number | null;
  created_at: string;
  click_count: number;
  lead_count: number;
  won_count: number;
  commissions_owed: number;
  commissions_paid: number;
}

interface LeadRow {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
  created_at: string;
  affiliate_code: string | null;
  affiliate_name: string | null;
  affiliate_email: string | null;
}

interface PendingCommissionRow {
  id: string;
  affiliate_code: string;
  affiliate_name: string;
  affiliate_email: string;
  lead_name: string;
  amount: number;
  currency: string;
  escritura_date: string | null;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

const formatUSD = (n: number, currency = 'USD'): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 })
    .format(n);

const relativeTime = (iso: string): string => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days < 1) return 'hoy';
  if (days === 1) return 'ayer';
  if (days < 30) return `hace ${days} días`;
  if (days < 365) return `hace ${Math.floor(days / 30)} meses`;
  return `hace ${Math.floor(days / 365)} años`;
};

const STATUS_LABEL: Record<LeadRow['status'], string> = {
  new: 'Nuevo', contacted: 'Contactado', qualified: 'Calificado', won: 'Cerrado', lost: 'Perdido',
};
const STATUS_BG: Record<LeadRow['status'], string> = {
  new: 'bg-stone-100 text-stone-700 border-stone-200',
  contacted: 'bg-amber-50 text-amber-800 border-amber-200',
  qualified: 'bg-blue-50 text-blue-800 border-blue-200',
  won: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  lost: 'bg-red-50 text-red-800 border-red-200',
};

// ─── Inline UI bits ───────────────────────────────────────────────────────

function StatTile({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-2">{label}</p>
      <p className="font-cardo text-2xl sm:text-3xl font-bold text-brand-dark-green leading-none">{value}</p>
      {sub && <p className="text-xs text-stone-500 mt-2">{sub}</p>}
    </div>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-stone-100 shadow-sm mb-6 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
        <h2 className="font-cardo text-xl sm:text-2xl font-bold text-brand-dark-green">{title}</h2>
        {action}
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  );
}

// ─── Modal: Mark lead as won (with commission amount) ─────────────────────

function MarkWonModal({
  lead, onClose, onConfirm,
}: {
  lead: LeadRow;
  onClose: () => void;
  onConfirm: (amount: number, currency: string, escrituraDate: string, notes: string) => Promise<void>;
}) {
  const [amount, setAmount] = useState('1500');
  const [currency, setCurrency] = useState('USD');
  const [escrituraDate, setEscrituraDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const n = parseFloat(amount);
    if (!n || n <= 0) { setErr('Ingresa un monto válido.'); return; }
    setBusy(true); setErr(null);
    try { await onConfirm(n, currency, escrituraDate, notes); }
    catch (e2: unknown) {
      setErr(e2 && typeof e2 === 'object' && 'message' in e2 ? String((e2 as { message: unknown }).message) : 'Error');
    }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-cardo text-2xl font-bold text-brand-dark-green">Marcar como cerrado</h3>
            <p className="text-sm text-stone-600">{lead.first_name} {lead.last_name ?? ''} · referido por {lead.affiliate_name ?? '—'}</p>
          </div>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-800"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Comisión a pagar</span>
            <div className="flex gap-2">
              <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="flex-1 px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-olive/40" />
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                className="px-3 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-olive/40 bg-white">
                <option>USD</option><option>MXN</option>
              </select>
            </div>
          </label>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Fecha de escritura</span>
            <input type="date" value={escrituraDate} onChange={(e) => setEscrituraDate(e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-olive/40" />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Notas (opcional)</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-olive/40" />
          </label>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-stone-300 rounded-lg font-medium text-stone-700 hover:bg-stone-50">Cancelar</button>
            <button type="submit" disabled={busy}
              className="flex-1 px-4 py-3 bg-brand-olive text-white rounded-lg font-semibold hover:bg-brand-dark-green disabled:opacity-60 flex items-center justify-center gap-2">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal: Edit affiliate ────────────────────────────────────────────────

function EditAffiliateModal({
  affiliate, onClose, onConfirm,
}: {
  affiliate: LeaderboardRow;
  onClose: () => void;
  onConfirm: (data: { first_name: string; last_name: string; email: string; phone: string; commission_rate: number | null; status: string }) => Promise<void>;
}) {
  const [first_name, setFirstName] = useState(affiliate.first_name);
  const [last_name, setLastName] = useState(affiliate.last_name ?? '');
  const [email, setEmail] = useState(affiliate.email);
  const [phone, setPhone] = useState(affiliate.phone);
  const [commission_rate, setRate] = useState(affiliate.commission_rate?.toString() ?? '');
  const [status, setStatus] = useState(affiliate.status);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      await onConfirm({
        first_name, last_name, email, phone,
        commission_rate: commission_rate ? parseFloat(commission_rate) : null,
        status,
      });
    } catch (e2: unknown) {
      setErr(e2 && typeof e2 === 'object' && 'message' in e2 ? String((e2 as { message: unknown }).message) : 'Error');
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-cardo text-2xl font-bold text-brand-dark-green">Editar afiliado</h3>
            <p className="text-xs text-stone-500 font-mono">{affiliate.code}</p>
          </div>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-800"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Nombre</span>
              <input value={first_name} onChange={(e) => setFirstName(e.target.value)} className="w-full px-3 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-olive/40" />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Apellido</span>
              <input value={last_name} onChange={(e) => setLastName(e.target.value)} className="w-full px-3 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-olive/40" />
            </label>
          </div>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-olive/40" />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Teléfono</span>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-olive/40" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Comisión (%)</span>
              <input type="number" min="0" max="100" step="0.5" value={commission_rate} onChange={(e) => setRate(e.target.value)} placeholder="default" className="w-full px-3 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-olive/40" />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Estado</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'paused')} className="w-full px-3 py-2.5 border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-olive/40">
                <option value="active">Activo</option><option value="paused">Pausado</option>
              </select>
            </label>
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-stone-300 rounded-lg font-medium text-stone-700 hover:bg-stone-50">Cancelar</button>
            <button type="submit" disabled={busy} className="flex-1 px-4 py-3 bg-brand-olive text-white rounded-lg font-semibold hover:bg-brand-dark-green disabled:opacity-60 flex items-center justify-center gap-2">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Admin component ─────────────────────────────────────────────────

export default function Admin() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [pendingCommissions, setPending] = useState<PendingCommissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editAffiliate, setEditAffiliate] = useState<LeaderboardRow | null>(null);
  const [markWonLead, setMarkWonLead] = useState<LeadRow | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [ov, lb, ld, pc] = await Promise.all([
        supabase.rpc('admin_overview'),
        supabase.rpc('admin_leaderboard'),
        supabase.rpc('admin_leads', { p_status: null }),
        supabase.rpc('admin_pending_commissions'),
      ]);
      if (ov.error) throw ov.error;
      if (lb.error) throw lb.error;
      if (ld.error) throw ld.error;
      if (pc.error) throw pc.error;
      setOverview((Array.isArray(ov.data) ? ov.data[0] : ov.data) as Overview);
      setLeaderboard((lb.data ?? []) as LeaderboardRow[]);
      setLeads((ld.data ?? []) as LeadRow[]);
      setPending((pc.data ?? []) as PendingCommissionRow[]);
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message: unknown }).message) : 'Error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─ Actions ──────────────────────────────────────────────────────────────

  const markPaid = async (commissionId: string) => {
    if (!confirm('¿Confirmar que esta comisión fue pagada?')) return;
    const { error } = await supabase.rpc('admin_mark_commission_paid', {
      p_commission_id: commissionId, p_paid_date: null,
    });
    if (error) { alert(`Error: ${error.message}`); return; }
    fetchAll();
  };

  const changeLeadStatus = async (leadId: string, newStatus: string) => {
    if (newStatus === 'won') return; // handled by modal
    const { error } = await supabase.rpc('admin_update_lead_status', {
      p_lead_id: leadId, p_status: newStatus,
    });
    if (error) { alert(`Error: ${error.message}`); return; }
    fetchAll();
  };

  const confirmMarkWon = async (lead: LeadRow, amount: number, currency: string, escrituraDate: string, notes: string) => {
    const { error } = await supabase.rpc('admin_mark_lead_won', {
      p_lead_id: lead.id, p_commission_amount: amount, p_currency: currency,
      p_escritura_date: escrituraDate, p_notes: notes || null,
    });
    if (error) throw error;
    setMarkWonLead(null);
    fetchAll();
  };

  const confirmEditAffiliate = async (
    aff: LeaderboardRow,
    data: { first_name: string; last_name: string; email: string; phone: string; commission_rate: number | null; status: string },
  ) => {
    const { error } = await supabase.rpc('admin_update_affiliate', {
      p_code: aff.code,
      p_first_name: data.first_name,
      p_last_name: data.last_name || null,
      p_email: data.email,
      p_phone: data.phone,
      p_commission_rate: data.commission_rate,
      p_status: data.status,
    });
    if (error) throw error;
    setEditAffiliate(null);
    fetchAll();
  };

  // ─ Filtered views ───────────────────────────────────────────────────────

  const q = search.trim().toLowerCase();
  const filteredLb = q
    ? leaderboard.filter((r) =>
        `${r.first_name} ${r.last_name ?? ''} ${r.email} ${r.code}`.toLowerCase().includes(q),
      )
    : leaderboard;

  // ─ Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#ECE5D8] font-lexend">
      <header className="bg-brand-dark-green text-white px-4 sm:px-6 lg:px-10 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logo-selvandentro_tulum.webp" alt="Selvadentro" className="h-8 sm:h-9 w-auto shrink-0" />
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-brand-copper/20 text-brand-copper text-[11px] font-semibold uppercase tracking-wider rounded-full">
              <Shield className="w-3 h-3" /> Admin
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <button onClick={fetchAll} disabled={loading}
              className="flex items-center gap-1.5 text-xs sm:text-sm text-white/85 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition disabled:opacity-50">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
            <span className="text-xs sm:text-sm text-white/75 hidden md:inline truncate max-w-[200px]">{user?.email}</span>
            <button onClick={() => signOut()} className="flex items-center gap-1.5 text-xs sm:text-sm text-white/85 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition">
              <LogOut className="w-3.5 h-3.5" /><span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
        <div className="mb-6">
          <h1 className="font-cardo text-3xl sm:text-4xl font-bold text-brand-dark-green leading-tight mb-1">
            Panel de administración
          </h1>
          <p className="text-stone-600 text-sm">Programa de Referidos · vista completa</p>
        </div>

        {loading && !overview && (
          <div className="bg-white rounded-2xl p-12 border border-stone-100 shadow-sm flex flex-col items-center text-center">
            <Loader2 className="w-8 h-8 text-brand-olive animate-spin mb-3" />
            <p className="text-sm text-stone-600">Cargando datos del programa...</p>
          </div>
        )}

        {error && (
          <div className="bg-white rounded-2xl p-8 border border-red-100 shadow-sm mb-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h2 className="font-cardo text-xl font-bold text-brand-dark-green mb-2">Error</h2>
                <pre className="text-xs bg-stone-50 border border-stone-200 rounded-lg p-3 overflow-x-auto text-red-700 whitespace-pre-wrap">{error}</pre>
              </div>
            </div>
          </div>
        )}

        {overview && (
          <>
            {/* OVERVIEW STATS */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
              <StatTile label="Afiliados" value={overview.total_affiliates} sub={`${overview.active_affiliates} activos`} />
              <StatTile label="Clics totales" value={overview.total_clicks} />
              <StatTile label="Leads totales" value={overview.total_leads} sub={`${overview.total_won} cerrados`} />
              <StatTile label="Por pagar" value={formatUSD(Number(overview.total_owed))} />
              <StatTile label="Pagado" value={formatUSD(Number(overview.total_paid))} />
            </div>

            {/* PENDING COMMISSIONS */}
            <Section title={`Comisiones por pagar (${pendingCommissions.length})`}>
              {pendingCommissions.length === 0 ? (
                <p className="text-sm text-stone-500 py-8 text-center">No hay comisiones pendientes.</p>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:-mx-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 border-b border-stone-100">
                        <th className="px-4 sm:px-6 py-3">Afiliado</th>
                        <th className="px-4 py-3">Lead</th>
                        <th className="px-4 py-3 text-right">Monto</th>
                        <th className="px-4 py-3">Escritura</th>
                        <th className="px-4 sm:px-6 py-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingCommissions.map((c) => (
                        <tr key={c.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50">
                          <td className="px-4 sm:px-6 py-3">
                            <div className="font-medium text-brand-dark-green">{c.affiliate_name}</div>
                            <div className="text-xs text-stone-500">{c.affiliate_email}</div>
                          </td>
                          <td className="px-4 py-3 text-stone-700">{c.lead_name}</td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-brand-dark-green">
                            {formatUSD(Number(c.amount), c.currency)}
                          </td>
                          <td className="px-4 py-3 text-stone-500 text-xs">{c.escritura_date ?? '—'}</td>
                          <td className="px-4 sm:px-6 py-3 text-right">
                            <button onClick={() => markPaid(c.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-full text-xs font-semibold transition">
                              <DollarSign className="w-3 h-3" /> Marcar pagado
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            {/* LEADS PIPELINE */}
            <Section title={`Leads (${leads.length})`}>
              {leads.length === 0 ? (
                <p className="text-sm text-stone-500 py-8 text-center">Sin leads todavía.</p>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:-mx-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 border-b border-stone-100">
                        <th className="px-4 sm:px-6 py-3">Lead</th>
                        <th className="px-4 py-3">Referido por</th>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 sm:px-6 py-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((l) => (
                        <tr key={l.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50">
                          <td className="px-4 sm:px-6 py-3">
                            <div className="font-medium text-brand-dark-green">{l.first_name} {l.last_name ?? ''}</div>
                            <div className="text-xs text-stone-500">{l.email}</div>
                          </td>
                          <td className="px-4 py-3 text-stone-700">{l.affiliate_name ?? <em className="text-stone-400">directo</em>}</td>
                          <td className="px-4 py-3 text-stone-500 text-xs whitespace-nowrap">{relativeTime(l.created_at)}</td>
                          <td className="px-4 py-3">
                            <div className="relative inline-block">
                              <select
                                value={l.status}
                                onChange={(e) => {
                                  if (e.target.value === 'won') { setMarkWonLead(l); return; }
                                  changeLeadStatus(l.id, e.target.value);
                                }}
                                className={`appearance-none pr-7 pl-3 py-1 rounded-full text-xs font-semibold border cursor-pointer ${STATUS_BG[l.status]}`}
                              >
                                {(['new','contacted','qualified','won','lost'] as const).map((s) => (
                                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                                ))}
                              </select>
                              <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 text-right">
                            {l.status !== 'won' && l.affiliate_code && (
                              <button onClick={() => setMarkWonLead(l)}
                                className="text-xs text-brand-olive hover:text-brand-dark-green underline">
                                Marcar cerrado
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            {/* AFFILIATE LEADERBOARD */}
            <Section
              title={`Afiliados (${leaderboard.length})`}
              action={
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar..."
                    className="pl-9 pr-3 py-2 border border-stone-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-olive/40 w-44"
                  />
                </div>
              }
            >
              {filteredLb.length === 0 ? (
                <p className="text-sm text-stone-500 py-8 text-center">Sin afiliados que mostrar.</p>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:-mx-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 border-b border-stone-100">
                        <th className="px-4 sm:px-6 py-3">Afiliado</th>
                        <th className="px-4 py-3 text-right">Clics</th>
                        <th className="px-4 py-3 text-right">Leads</th>
                        <th className="px-4 py-3 text-right">Cerrados</th>
                        <th className="px-4 py-3 text-right">Por pagar</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 sm:px-6 py-3 text-right">Editar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLb.map((a) => (
                        <tr key={a.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50">
                          <td className="px-4 sm:px-6 py-3">
                            <div className="font-medium text-brand-dark-green">{a.first_name} {a.last_name ?? ''}</div>
                            <div className="text-xs text-stone-500 font-mono">{a.code}</div>
                            <div className="text-xs text-stone-500">{a.email}</div>
                          </td>
                          <td className="px-4 py-3 text-right text-stone-700 font-mono">{a.click_count}</td>
                          <td className="px-4 py-3 text-right text-stone-700 font-mono">{a.lead_count}</td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-700">{a.won_count}</td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-brand-dark-green">
                            {formatUSD(Number(a.commissions_owed))}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              a.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                            }`}>
                              {a.status === 'active' ? 'Activo' : 'Pausado'}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-3 text-right">
                            <button onClick={() => setEditAffiliate(a)}
                              className="inline-flex items-center gap-1 text-brand-olive hover:text-brand-dark-green text-xs">
                              <Edit2 className="w-3 h-3" /> Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>
          </>
        )}
      </main>

      {markWonLead && (
        <MarkWonModal
          lead={markWonLead}
          onClose={() => setMarkWonLead(null)}
          onConfirm={(amount, currency, escrituraDate, notes) =>
            confirmMarkWon(markWonLead, amount, currency, escrituraDate, notes)
          }
        />
      )}
      {editAffiliate && (
        <EditAffiliateModal
          affiliate={editAffiliate}
          onClose={() => setEditAffiliate(null)}
          onConfirm={(data) => confirmEditAffiliate(editAffiliate, data)}
        />
      )}

      {/* Suppress unused-import warnings for icons used conditionally */}
      <span className="hidden">
        <Users /> <MousePointerClick /> <Trophy /> <CircleDollarSign /> <Briefcase />
      </span>
    </div>
  );
}
