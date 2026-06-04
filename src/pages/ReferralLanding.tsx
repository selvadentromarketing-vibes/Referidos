import { useEffect, useState } from 'react';
import { Check, X, Heart } from 'lucide-react';
import ReferralForm from '../components/ReferralForm';
import { captureTrackingParams, getReferralCode } from '../utils/tracking';
import { trackReferralClick } from '../utils/webhook';

/**
 * Selvadentro Referidos — referee landing page (/invitacion?ref=...).
 *
 * Layout faithfully ports the "Manual del Referido" PDF (2026-06-04) sent
 * by the client with the review/feedback round:
 *  1. Hero (dark green) — UNA INVITACIÓN QUE VALE
 *  2. ¿Qué es Selvadentro? — 4 highlight cards (Naturaleza / Cenotes /
 *     Comunidad / Tulum)
 *  3. Tu beneficio (dark green) — 2.5% de descuento sobre tu lote
 *  4. Cómo funciona — 3 step cards (Regístrate / Conoce / Decide)
 *  5. Los detalles — 5-row spec table (i…v)
 *  6. ¿Qué sigue? (dark green) — 3 checkmark cards
 *  7. Tu próximo paso — final CTA
 *  8. Footer
 *
 * The form lives in a modal launched by every "Regístrate como referido"
 * CTA. Existing referral-code detection + click tracking preserved.
 */

export default function ReferralLanding() {
  const [referralCode, setReferralCode] = useState<string | undefined>(undefined);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    const tracking = captureTrackingParams();
    const code = getReferralCode(tracking);
    setReferralCode(code);
    document.title = 'Te invitaron a Selvadentro Tulum';

    // Fire-and-forget click tracking when an affiliate code is in the URL.
    if (code) {
      void trackReferralClick(code, tracking);
    }
  }, []);

  // Lock body scroll when modal is open.
  useEffect(() => {
    document.body.style.overflow = formOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [formOpen]);

  const openForm = () => setFormOpen(true);

  return (
    <div className="font-lexend text-[#2D332B] bg-[#ECE5D8]">
      {/* ─── REFERRAL BANNER (only when ?ref= present) ────────────────────── */}
      {referralCode && (
        <div className="bg-brand-copper text-white text-center text-xs sm:text-sm tracking-wide py-2.5 px-4">
          <Heart className="w-4 h-4 inline-block mr-2 -mt-0.5 fill-white" />
          Llegaste por la recomendación de un amigo. Bienvenido a Selvadentro.
        </div>
      )}

      {/* ─── STICKY HEADER ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-brand-dark-green/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between gap-4">
          <a href="https://selvadentrotulum.com" aria-label="Selvadentro" className="shrink-0">
            <img
              src="/logo-selvandentro_tulum.webp"
              alt="Selvadentro Tulum"
              className="h-8 sm:h-9 w-auto"
            />
          </a>
          <button
            onClick={openForm}
            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-brand-copper text-white rounded-full font-semibold text-xs sm:text-sm hover:bg-brand-beige hover:text-brand-dark-green transition-all shadow-lg uppercase tracking-wider"
          >
            Regístrate
          </button>
        </div>
      </header>

      {/* ─── 1. HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-brand-dark-green text-white pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 lg:px-10 text-center relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 opacity-40 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 70% 30%, rgba(207,133,67,0.18) 0%, transparent 60%)',
          }}
        />
        <div className="relative max-w-3xl mx-auto">
          <div className="mb-6 flex flex-col items-center">
            <img
              src="/logo-selvandentro_tulum.webp"
              alt="Selvadentro"
              className="h-14 sm:h-16 w-auto mb-1"
            />
            <span className="font-cardo italic text-white/70 text-xs sm:text-sm tracking-wide">
              tierra de cenotes
            </span>
          </div>

          <div className="inline-block mb-6 sm:mb-8 px-5 py-1.5 border border-brand-copper/40 rounded-full">
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-brand-copper">
              Una invitación que vale
            </span>
          </div>

          <h1
            className="font-cardo font-bold leading-[1.08] mb-5"
            style={{ fontSize: 'clamp(2.2rem, 5.5vw, 3.8rem)' }}
          >
            <span className="block text-white">Te invitaron a Selvadentro.</span>
            <em className="block not-italic text-brand-copper font-cardo italic">
              Bienvenido a tierra de cenotes.
            </em>
          </h1>

          <p className="font-cardo italic text-white/75 text-base sm:text-lg">
            Conoce el lugar. Descubre la experiencia.
          </p>
        </div>
      </section>

      {/* ─── 2. ¿QUÉ ES SELVADENTRO? ─────────────────────────────────────── */}
      <section className="bg-[#ECE5D8] py-16 sm:py-20 px-4 sm:px-6 lg:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-brand-copper mb-3">
              ¿Qué es Selvadentro?
            </p>
            <h2
              className="font-cardo font-bold text-brand-dark-green leading-tight"
              style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)' }}
            >
              Un <em className="text-brand-copper font-cardo italic">refugio natural</em>
              <br className="hidden sm:block" /> en el corazón de Tulum
            </h2>
          </div>

          <p className="text-center text-sm sm:text-base text-stone-700 leading-relaxed max-w-3xl mx-auto mb-10 sm:mb-12">
            Selvadentro es un desarrollo de <strong className="text-brand-dark-green">lotes residenciales</strong> rodeado de selva, cenotes y comunidad. Un lugar pensado para quienes buscan <strong className="text-brand-dark-green">conectar con la naturaleza sin renunciar a una vida con propósito</strong>.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { num: '01', title: 'Naturaleza', body: 'Selva preservada y biodiversidad protegida' },
              { num: '02', title: 'Cenotes', body: 'Aguas cristalinas únicas en el mundo' },
              { num: '03', title: 'Comunidad', body: 'Personas con visión y propósito' },
              { num: '04', title: 'Tulum', body: 'El destino más codiciado del Caribe' },
            ].map((card) => (
              <div
                key={card.num}
                className="bg-white rounded-2xl p-5 sm:p-6 text-center border border-stone-100 shadow-sm"
              >
                <p className="font-cardo text-brand-copper font-bold text-2xl sm:text-3xl mb-2">
                  {card.num}
                </p>
                <div className="w-6 h-0.5 bg-brand-copper/50 mx-auto mb-3" />
                <h3 className="font-cardo font-bold text-brand-dark-green text-base sm:text-lg mb-2">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>

          <p className="font-cardo italic text-stone-500 text-xs sm:text-sm tracking-wide text-center mt-8">
            — Tulum · Quintana Roo · México —
          </p>
        </div>
      </section>

      {/* ─── 3. TU BENEFICIO ─────────────────────────────────────────────── */}
      <section className="bg-brand-dark-green text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-brand-copper mb-3">
            Tu beneficio
          </p>
          <h2
            className="font-cardo font-bold mb-5"
            style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)' }}
          >
            Por venir <em className="text-brand-copper font-cardo italic">referido</em>
          </h2>
          <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-8 max-w-2xl mx-auto">
            Como llegaste a Selvadentro por invitación de alguien que ya forma parte de <strong className="text-white">nuestra comunidad</strong>, te damos la bienvenida con un beneficio exclusivo:
          </p>

          <div className="inline-block px-12 sm:px-16 py-10 sm:py-12 rounded-2xl border border-brand-copper/40 bg-brand-dark-green/40">
            <p
              className="font-cardo font-bold leading-none text-brand-copper mb-3"
              style={{ fontSize: 'clamp(3.6rem, 9vw, 5.5rem)' }}
            >
              2.5%
            </p>
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-white/85">
              De descuento sobre tu lote
            </p>
          </div>
        </div>
      </section>

      {/* ─── 4. CÓMO FUNCIONA ────────────────────────────────────────────── */}
      <section className="bg-[#F8F5EF] py-16 sm:py-20 px-4 sm:px-6 lg:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-brand-copper mb-3">
              Cómo funciona
            </p>
            <h2
              className="font-cardo font-bold text-brand-dark-green"
              style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)' }}
            >
              Así de <em className="text-brand-copper font-cardo italic">fácil</em> es
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                num: 1,
                title: 'Regístrate',
                body: (
                  <>
                    Deja tus datos en el <strong className="text-brand-dark-green">link que recibiste</strong>. Solo necesitamos nombre, email y teléfono.
                  </>
                ),
              },
              {
                num: 2,
                title: 'Conoce',
                body: (
                  <>
                    Uno de nuestros <strong className="text-brand-dark-green">asesores</strong> te contactará para presentarte el proyecto y resolver dudas.
                  </>
                ),
              },
              {
                num: 3,
                title: 'Decide',
                body: (
                  <>
                    Si Selvadentro es para ti, aprovecha tu <strong className="text-brand-dark-green">2.5% de descuento</strong> al elegir tu lote.
                  </>
                ),
              },
            ].map((step) => (
              <div
                key={step.num}
                className="bg-white rounded-2xl p-7 text-center border border-stone-100 shadow-sm relative"
              >
                <span className="inline-flex w-10 h-10 rounded-full bg-brand-olive text-white items-center justify-center font-cardo font-bold mb-5 -mt-12 shadow-md">
                  {step.num}
                </span>
                <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-brand-olive mb-3">
                  {step.title}
                </p>
                <p className="text-sm text-stone-700 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. LOS DETALLES ─────────────────────────────────────────────── */}
      <section className="bg-[#ECE5D8] py-16 sm:py-20 px-4 sm:px-6 lg:px-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-brand-copper mb-3">
              Lo que necesitas saber
            </p>
            <h2
              className="font-cardo font-bold text-brand-dark-green"
              style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)' }}
            >
              Los <em className="text-brand-copper font-cardo italic">detalles</em>
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-2 border border-stone-100 shadow-sm">
            {[
              { i: 'i', label: 'Tu beneficio', value: <><strong>2.5%</strong> de descuento sobre el valor del lote</> },
              { i: 'ii', label: 'Vigencia', value: <><strong>1 año</strong> desde tu registro</> },
              { i: 'iii', label: 'Para activarlo', value: <>Regístrate con el link de quien te invitó</> },
              { i: 'iv', label: 'Sin compromiso', value: <>Conocer no te obliga a comprar</> },
              { i: 'v', label: 'Privacidad', value: <>Tus datos son confidenciales</> },
            ].map((row, idx, arr) => (
              <div
                key={row.i}
                className={`flex items-start gap-4 sm:gap-6 px-4 sm:px-6 py-5 ${
                  idx !== arr.length - 1 ? 'border-b border-stone-100' : ''
                }`}
              >
                <span className="font-cardo italic text-brand-copper text-base sm:text-lg w-5 shrink-0 mt-0.5">
                  {row.i}
                </span>
                <div className="flex-1 grid sm:grid-cols-2 gap-2 sm:gap-4 items-baseline">
                  <p className="text-[10px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-stone-500">
                    {row.label}
                  </p>
                  <p className="text-sm sm:text-base text-brand-dark-green sm:text-right">
                    {row.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. ¿QUÉ SIGUE? ──────────────────────────────────────────────── */}
      <section className="bg-brand-dark-green text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-brand-copper mb-3">
              ¿Qué sigue?
            </p>
            <h2
              className="font-cardo font-bold"
              style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)' }}
            >
              El <em className="text-brand-copper font-cardo italic">camino</em> hacia Selvadentro
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {[
              { title: 'Te contactamos', body: <>Un asesor se pondrá en contacto contigo en menos de <strong>24 horas</strong>.</> },
              { title: 'Te presentamos', body: <>Conoce el proyecto a tu ritmo, virtual o presencial.</> },
              { title: 'Visita la tierra', body: <>Te invitamos a recorrer el lugar y enamorarte.</> },
            ].map((card, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 sm:p-7 border border-brand-copper/30 bg-brand-dark-green/40 text-center"
              >
                <span className="inline-flex w-10 h-10 rounded-full bg-brand-copper/20 text-brand-copper items-center justify-center mb-4">
                  <Check className="w-5 h-5" />
                </span>
                <h3 className="font-cardo italic text-brand-copper text-base sm:text-lg mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-white/85 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 7. TU PRÓXIMO PASO ──────────────────────────────────────────── */}
      <section className="bg-[#F8F5EF] py-16 sm:py-20 px-4 sm:px-6 lg:px-10 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-brand-copper mb-3">
            Tu próximo paso
          </p>
          <h2
            className="font-cardo font-bold text-brand-dark-green mb-3"
            style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)' }}
          >
            ¿Listo para conocer
            <br />
            <em className="text-brand-copper font-cardo italic">Selvadentro?</em>
          </h2>
          <p className="font-cardo italic text-stone-600 text-base sm:text-lg mb-8">
            Tu 2.5% te está esperando.
          </p>

          <button
            onClick={openForm}
            className="inline-block px-10 py-4 bg-brand-copper text-white rounded-full font-semibold text-base hover:bg-brand-beige hover:text-brand-dark-green transition-all shadow-xl uppercase tracking-wider"
          >
            Regístrate como referido
          </button>

          <p className="font-cardo italic text-stone-500 text-sm mt-5">
            o escríbenos a{' '}
            <a
              href="mailto:info@selvadentrotulum.com"
              className="text-brand-olive underline hover:text-brand-dark-green"
            >
              info@selvadentrotulum.com
            </a>
          </p>
        </div>
      </section>

      {/* ─── 8. FOOTER ───────────────────────────────────────────────────── */}
      <footer className="bg-brand-dark-green text-white text-center py-14 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <img
            src="/logo-selvandentro_tulum.webp"
            alt="Selvadentro"
            className="h-9 w-auto mx-auto mb-4 opacity-90"
          />
          <p className="font-cardo italic text-white/70 text-sm mb-6">
            Selvadentro · tierra de cenotes
          </p>
          <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase">
            <a href="https://selvadentrotulum.com" className="hover:text-white/70">
              Selvadentrotulum.com
            </a>
          </p>
        </div>
      </footer>

      {/* ─── MODAL (Regístrate como referido) ────────────────────────────── */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/65 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setFormOpen(false);
          }}
        >
          <div className="relative w-full max-w-md my-auto">
            <button
              onClick={() => setFormOpen(false)}
              aria-label="Cerrar"
              className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white text-brand-dark-green shadow-xl flex items-center justify-center hover:bg-stone-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
            <ReferralForm />
          </div>
        </div>
      )}
    </div>
  );
}
