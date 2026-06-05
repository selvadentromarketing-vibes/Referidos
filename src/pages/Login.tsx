import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import { sendMagicLink, useAuth, isAdminEmail } from '../utils/auth';
import { useLang } from '../i18n/useLang';

export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { lang, t, otherLang, swapLangUrl } = useLang();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Set document title per language
  useEffect(() => {
    document.title = t.login.docTitle;
  }, [t]);

  // If already logged in, route to the right place — preserving lang.
  useEffect(() => {
    if (auth.loading) return;
    if (auth.user) {
      navigate(auth.isAdmin ? `/${lang}/admin` : `/${lang}/dashboard`, { replace: true });
    }
  }, [auth.loading, auth.user, auth.isAdmin, navigate, lang]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email.trim()) {
      setErrorMessage(t.login.errorEmpty);
      return;
    }
    setStatus('sending');
    // Pick the redirect path based on whether this email is an admin.
    // Admins land on /admin, everyone else on /dashboard — both in current lang.
    const redirectPath = isAdminEmail(email) ? `/${lang}/admin` : `/${lang}/dashboard`;
    const result = await sendMagicLink(email, redirectPath);
    if (result.success) {
      setStatus('sent');
      return;
    }
    setStatus('error');
    const raw = (result.error ?? '').toLowerCase();
    if (raw.includes('rate limit') || raw.includes('too many') || raw.includes('over_email_send_rate_limit')) {
      setErrorMessage(t.login.errorRateLimit);
    } else if (raw.includes('invalid email') || raw.includes('not a valid email')) {
      setErrorMessage(t.login.errorInvalidEmail);
    } else if (raw) {
      setErrorMessage(`${t.login.errorGeneric.replace(/\.\s*$/, '')}: ${result.error}`);
    } else {
      setErrorMessage(t.login.errorGeneric);
    }
  };

  return (
    <div className="min-h-screen bg-[#ECE5D8] font-lexend flex flex-col">
      {/* HEADER */}
      <header className="px-4 sm:px-6 lg:px-10 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href={`/${lang}`} aria-label="Selvadentro" className="inline-flex items-center gap-2 text-brand-dark-green">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{t.common.backHome}</span>
          </a>
          <a
            href={swapLangUrl()}
            className="text-xs font-semibold tracking-widest text-stone-600 hover:text-brand-dark-green transition"
            title={`Switch to ${otherLang.toUpperCase()}`}
          >
            {lang.toUpperCase()} · <span className="text-brand-olive underline">{otherLang.toUpperCase()}</span>
          </a>
        </div>
      </header>

      {/* CARD */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex w-14 h-14 items-center justify-center bg-white rounded-full shadow-sm mb-4">
              <img src="/logo-selvandentro_tulum.webp" alt="Selvadentro" className="w-10 h-10 object-contain" />
            </div>
            <h1 className="font-cardo text-3xl sm:text-4xl font-bold text-brand-dark-green leading-tight mb-2">
              {t.login.title}
            </h1>
            <p className="text-sm sm:text-base text-stone-600">{t.login.subtitle}</p>
          </div>

          {status === 'sent' ? (
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-stone-100 text-center">
              <CheckCircle2 className="w-14 h-14 text-brand-olive mx-auto mb-4" />
              <h2 className="font-cardo text-2xl font-bold text-brand-dark-green mb-3">{t.login.checkInbox}</h2>
              <p className="text-sm text-stone-700 leading-relaxed mb-4">
                {t.login.sentBodyPre}
                <strong>{email}</strong>
                {t.login.sentBodyTail}
              </p>
              <p className="text-xs text-stone-500">
                {t.login.spamHint}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setStatus('idle');
                    setEmail('');
                  }}
                  className="text-brand-olive underline"
                >
                  {t.login.tryAnother}
                </button>
                .
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-stone-100" noValidate>
              <label className="block mb-4">
                <span className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">{t.login.fieldEmail}</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-olive/40 focus:border-brand-olive transition"
                  placeholder={t.login.placeholderEmail}
                  autoComplete="email"
                  autoFocus
                  required
                />
              </label>

              {errorMessage && (
                <p className="mb-3 text-sm text-red-600" role="alert">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full px-6 py-4 bg-brand-olive text-white rounded-full font-semibold text-base hover:bg-brand-dark-green transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.login.submitting}
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    {t.login.submit}
                  </>
                )}
              </button>

              <p className="mt-4 text-[11px] text-stone-500 text-center leading-relaxed">{t.login.noPassword}</p>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-stone-500">
            {t.login.notAffiliateHint}{' '}
            <a href={`/${lang}`} className="text-brand-olive underline">{t.login.registerHere}</a>.
          </p>
        </div>
      </main>

      <footer className="px-4 py-6 text-center text-xs text-stone-500">{t.common.footerCopy}</footer>
    </div>
  );
}
