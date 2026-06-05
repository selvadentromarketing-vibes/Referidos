import { useState, FormEvent } from 'react';
import { Loader2, CheckCircle2, Copy, Check, Share2 } from 'lucide-react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import type { Value as PhoneValue } from 'react-phone-number-input';
import { submitReferrerSignup } from '../utils/webhook';
import { captureTrackingParams } from '../utils/tracking';
import { useLang } from '../i18n/useLang';

const splitName = (full: string): { first: string; last: string } => {
  const trimmed = full.trim().replace(/\s+/g, ' ');
  if (!trimmed) return { first: '', last: '' };
  const parts = trimmed.split(' ');
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
};

export default function ReferrerForm() {
  const { t } = useLang();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState<PhoneValue | undefined>(undefined);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [referralLink, setReferralLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !phone || !email.trim()) {
      setErrorMessage(t.referrerForm.errorMissing);
      return;
    }
    if (!isValidPhoneNumber(phone)) {
      setErrorMessage(t.referrerForm.errorPhone);
      return;
    }

    setStatus('submitting');
    const { first, last } = splitName(fullName);
    const tracking = captureTrackingParams();
    const result = await submitReferrerSignup(
      { first_name: first, last_name: last, email: email.trim(), phone },
      tracking,
    );

    if (result.success && result.referral_link) {
      setReferralLink(result.referral_link);
      setStatus('success');
    } else {
      setStatus('error');
      const errMsg = result.error instanceof Error ? result.error.message : null;
      setErrorMessage(errMsg ?? t.referrerForm.errorSubmit);
    }
  };

  const copyLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* older browsers */
    }
  };

  const whatsappShare = () => {
    if (!referralLink) return;
    const msg = encodeURIComponent(
      `Te comparto este proyecto en Tulum que me tiene impresionado — Selvadentro: ${referralLink}`,
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  if (status === 'success' && referralLink) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-stone-100">
        <div className="text-center mb-5">
          <CheckCircle2 className="w-14 h-14 text-brand-olive mx-auto mb-3" />
          <h3 className="font-cardo text-2xl font-bold text-brand-dark-green mb-1">{t.referrerForm.successTitle}</h3>
          <p className="text-sm text-stone-600">{t.referrerForm.successBody}</p>
        </div>

        <div className="bg-[#F8F5EF] rounded-xl p-3 mb-4 border border-stone-200">
          <code className="block text-xs sm:text-sm text-brand-dark-green break-all leading-relaxed font-mono">{referralLink}</code>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={copyLink}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-brand-olive text-white rounded-lg font-semibold text-sm hover:bg-brand-dark-green transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> {t.common.copied}
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> {t.common.copy}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={whatsappShare}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] text-white rounded-lg font-semibold text-sm hover:bg-[#1ebe5d] transition-all"
          >
            <Share2 className="w-4 h-4" /> {t.common.shareWhatsapp}
          </button>
        </div>

        <p className="text-[11px] text-stone-500 text-center leading-relaxed">
          {t.referrerForm.emailReminderPre}{' '}
          <a href={`mailto:${t.common.contactSupportEmail}`} className="text-brand-olive underline">
            {t.common.contactSupportEmail}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-stone-100"
      noValidate
    >
      <h3 className="font-cardo text-2xl sm:text-3xl font-bold text-brand-dark-green mb-1 leading-tight">{t.referrerForm.title}</h3>
      <p className="text-sm text-stone-600 mb-5">{t.referrerForm.subtitle}</p>

      <div className="space-y-3">
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">{t.referrerForm.fieldName}</span>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-olive/40 focus:border-brand-olive transition"
            placeholder={t.referrerForm.placeholderName}
            autoComplete="name"
            required
          />
        </label>

        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
            {t.referrerForm.fieldPhone} <span className="text-brand-copper">*</span>
          </span>
          <div className="phone-input-shell px-4 py-3 border border-stone-300 rounded-lg bg-white transition focus-within:border-brand-olive focus-within:ring-2 focus-within:ring-brand-olive/30">
            <PhoneInput
              international
              defaultCountry="MX"
              countryCallingCodeEditable={false}
              value={phone}
              onChange={setPhone}
              placeholder={t.referrerForm.placeholderPhone}
              autoComplete="tel"
              numberInputProps={{ 'aria-label': t.referrerForm.fieldPhone, required: true }}
            />
          </div>
        </label>

        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">{t.referrerForm.fieldEmail}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-olive/40 focus:border-brand-olive transition"
            placeholder={t.referrerForm.placeholderEmail}
            autoComplete="email"
            required
          />
          <span className="block text-[11px] text-stone-500 mt-1">{t.referrerForm.emailFootnote}</span>
        </label>
      </div>

      {errorMessage && (
        <p className="mt-3 text-sm text-red-600" role="alert">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="mt-5 w-full px-6 py-4 bg-brand-olive text-white rounded-full font-semibold text-base hover:bg-brand-dark-green transition-all shadow-lg hover:shadow-brand-dark-green/40 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t.referrerForm.submitting}
          </>
        ) : (
          t.referrerForm.submitButton
        )}
      </button>

      <p className="mt-3 text-[11px] text-stone-500 text-center leading-relaxed">{t.referrerForm.consent}</p>
    </form>
  );
}
