import { useState, FormEvent } from 'react';
import { Loader2, CheckCircle2, Mail } from 'lucide-react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import type { Value as PhoneValue } from 'react-phone-number-input';
import { submitReferrerSignup } from '../utils/webhook';
import { captureTrackingParams } from '../utils/tracking';

const splitName = (full: string): { first: string; last: string } => {
  const trimmed = full.trim().replace(/\s+/g, ' ');
  if (!trimmed) return { first: '', last: '' };
  const parts = trimmed.split(' ');
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
};

export default function ReferrerForm() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState<PhoneValue | undefined>(undefined);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !phone || !email.trim()) {
      setErrorMessage('Por favor completa todos los campos.');
      return;
    }
    if (!isValidPhoneNumber(phone)) {
      setErrorMessage('Ingresa un teléfono válido (incluye lada).');
      return;
    }

    setStatus('submitting');
    const { first, last } = splitName(fullName);
    const tracking = captureTrackingParams();
    const result = await submitReferrerSignup(
      { first_name: first, last_name: last, email: email.trim(), phone },
      tracking,
    );

    if (result.success) {
      setStatus('success');
    } else {
      setStatus('error');
      setErrorMessage(
        'No pudimos procesar tu solicitud. Intenta de nuevo o escríbenos a d.comercial@selvadentrotulum.com.',
      );
    }
  };

  if (status === 'success') {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl p-8 shadow-2xl text-center border border-stone-100">
        <CheckCircle2 className="w-14 h-14 text-brand-olive mx-auto mb-4" />
        <h3 className="font-cardo text-2xl font-bold text-brand-dark-green mb-3">
          ¡Bienvenido al programa!
        </h3>
        <div className="flex items-start gap-3 bg-[#F8F5EF] rounded-xl p-4 mb-4 text-left">
          <Mail className="w-5 h-5 text-brand-copper shrink-0 mt-0.5" />
          <p className="text-sm text-stone-700 leading-relaxed">
            En los próximos minutos recibirás un correo con <strong>tu link de referido</strong> personalizado. Compártelo con tu círculo y comienza a ganar por cada inversión.
          </p>
        </div>
        <p className="text-xs text-stone-500">
          ¿No recibes el correo? Revisa tu spam o escríbenos a{' '}
          <a href="mailto:d.comercial@selvadentrotulum.com" className="text-brand-olive underline">
            d.comercial@selvadentrotulum.com
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
      <h3 className="font-cardo text-2xl sm:text-3xl font-bold text-brand-dark-green mb-1 leading-tight">
        Genera tu link de referido
      </h3>
      <p className="text-sm text-stone-600 mb-5">
        Te enviamos tu link personalizado en menos de 2 minutos.
      </p>

      <div className="space-y-3">
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
            Nombre completo
          </span>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-olive/40 focus:border-brand-olive transition"
            placeholder="Tu nombre"
            autoComplete="name"
            required
          />
        </label>

        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
            Teléfono <span className="text-brand-copper">*</span>
          </span>
          <div className="phone-input-shell px-4 py-3 border border-stone-300 rounded-lg bg-white transition focus-within:border-brand-olive focus-within:ring-2 focus-within:ring-brand-olive/30">
            <PhoneInput
              international
              defaultCountry="MX"
              countryCallingCodeEditable={false}
              value={phone}
              onChange={setPhone}
              placeholder="984 137 4927"
              autoComplete="tel"
              numberInputProps={{ 'aria-label': 'Teléfono', required: true }}
            />
          </div>
        </label>

        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-olive/40 focus:border-brand-olive transition"
            placeholder="tu@email.com"
            autoComplete="email"
            required
          />
          <span className="block text-[11px] text-stone-500 mt-1">
            Aquí enviaremos tu link de referido.
          </span>
        </label>
      </div>

      {errorMessage && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="mt-5 w-full px-6 py-4 bg-brand-olive text-white rounded-full font-semibold text-base hover:bg-brand-dark-green transition-all shadow-lg hover:shadow-brand-dark-green/40 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generando tu link...
          </>
        ) : (
          'Quiero mi link de referido'
        )}
      </button>

      <p className="mt-3 text-[11px] text-stone-500 text-center leading-relaxed">
        Al enviar aceptas recibir comunicaciones del programa de referidos Selvadentro.
      </p>
    </form>
  );
}
