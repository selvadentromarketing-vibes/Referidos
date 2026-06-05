import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import { sendMagicLink, useAuth, isAdminEmail } from '../utils/auth';

export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in, route to the right place.
  useEffect(() => {
    if (auth.loading) return;
    if (auth.user) {
      navigate(auth.isAdmin ? '/admin' : '/dashboard', { replace: true });
    }
  }, [auth.loading, auth.user, auth.isAdmin, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email.trim()) {
      setErrorMessage('Ingresa tu correo.');
      return;
    }
    setStatus('sending');
    // Pick the redirect path based on whether this email is an admin.
    // Admins land on /admin, everyone else on /dashboard.
    const redirectPath = isAdminEmail(email) ? '/admin' : '/dashboard';
    const result = await sendMagicLink(email, redirectPath);
    if (result.success) {
      setStatus('sent');
      return;
    }
    setStatus('error');
    // Translate common Supabase auth errors to Spanish + actionable guidance.
    const raw = (result.error ?? '').toLowerCase();
    if (raw.includes('rate limit') || raw.includes('too many') || raw.includes('over_email_send_rate_limit')) {
      setErrorMessage(
        'Demasiados envíos recientes. Por seguridad Supabase limita los correos de acceso. Espera unos minutos antes de intentar de nuevo o escríbenos a d.comercial@selvadentrotulum.com para ayuda inmediata.',
      );
    } else if (raw.includes('invalid email') || raw.includes('not a valid email')) {
      setErrorMessage('Ese correo no parece válido. Revísalo e intenta de nuevo.');
    } else if (raw) {
      setErrorMessage(`No pudimos enviar el correo: ${result.error}`);
    } else {
      setErrorMessage('No pudimos enviar el correo. Intenta de nuevo en un momento.');
    }
  };

  return (
    <div className="min-h-screen bg-[#ECE5D8] font-lexend flex flex-col">
      {/* HEADER */}
      <header className="px-4 sm:px-6 lg:px-10 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" aria-label="Selvadentro" className="inline-flex items-center gap-2 text-brand-dark-green">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Volver al inicio</span>
          </a>
        </div>
      </header>

      {/* CARD */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex w-14 h-14 items-center justify-center bg-white rounded-full shadow-sm mb-4">
              <img
                src="/logo-selvandentro_tulum.webp"
                alt="Selvadentro"
                className="w-10 h-10 object-contain"
              />
            </div>
            <h1 className="font-cardo text-3xl sm:text-4xl font-bold text-brand-dark-green leading-tight mb-2">
              Tu dashboard de referidos
            </h1>
            <p className="text-sm sm:text-base text-stone-600">
              Entra con tu correo para ver tus estadísticas y tu link personalizado.
            </p>
          </div>

          {status === 'sent' ? (
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-stone-100 text-center">
              <CheckCircle2 className="w-14 h-14 text-brand-olive mx-auto mb-4" />
              <h2 className="font-cardo text-2xl font-bold text-brand-dark-green mb-3">
                Revisa tu correo
              </h2>
              <p className="text-sm text-stone-700 leading-relaxed mb-4">
                Te enviamos un link a <strong>{email}</strong>. Haz clic y entrarás directamente, sin contraseña.
              </p>
              <p className="text-xs text-stone-500">
                ¿No llega en 1-2 minutos? Revisa tu carpeta de spam o{' '}
                <button
                  type="button"
                  onClick={() => {
                    setStatus('idle');
                    setEmail('');
                  }}
                  className="text-brand-olive underline"
                >
                  intenta con otro correo
                </button>
                .
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-stone-100"
              noValidate
            >
              <label className="block mb-4">
                <span className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Correo electrónico
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-olive/40 focus:border-brand-olive transition"
                  placeholder="tu@email.com"
                  autoComplete="email"
                  autoFocus
                  required
                />
              </label>

              {errorMessage && (
                <p className="mb-3 text-sm text-red-600" role="alert">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full px-6 py-4 bg-brand-olive text-white rounded-full font-semibold text-base hover:bg-brand-dark-green transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando link...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Enviarme un link de acceso
                  </>
                )}
              </button>

              <p className="mt-4 text-[11px] text-stone-500 text-center leading-relaxed">
                Sin contraseña. Recibirás un correo con un link único que te conecta de inmediato.
              </p>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-stone-500">
            ¿No eres aún afiliado?{' '}
            <a href="/" className="text-brand-olive underline">
              Regístrate aquí
            </a>
            .
          </p>
        </div>
      </main>

      <footer className="px-4 py-6 text-center text-xs text-stone-500">
        © 2026 Selvadentro Tulum · Programa de Referidos
      </footer>
    </div>
  );
}
