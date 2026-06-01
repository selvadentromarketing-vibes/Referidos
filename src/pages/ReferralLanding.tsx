import { useEffect, useState } from 'react';
import { CheckCircle2, Heart } from 'lucide-react';
import VSL from '../components/VSL';
import ReferralForm from '../components/ReferralForm';
import { captureTrackingParams, getReferralCode } from '../utils/tracking';
import { trackReferralClick } from '../utils/webhook';

const VSL_MEDIA_ID = 'jn8el9or7a';

export default function ReferralLanding() {
  const [referralCode, setReferralCode] = useState<string | undefined>(undefined);

  useEffect(() => {
    const tracking = captureTrackingParams();
    const code = getReferralCode(tracking);
    setReferralCode(code);
    document.title = 'Te recomiendan Selvadentro Tulum';

    // Fire-and-forget click tracking when an affiliate code is in the URL.
    // Unknown / inactive codes are silently ignored by the RPC.
    if (code) {
      void trackReferralClick(code, tracking);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#ECE5D8] font-lexend">
      {/* REFERRAL BANNER — only renders if a referral code was found in the URL */}
      {referralCode && (
        <div className="bg-brand-copper text-white text-center text-xs sm:text-sm tracking-wide py-2.5 px-4">
          <Heart className="w-4 h-4 inline-block mr-2 -mt-0.5 fill-white" />
          Llegaste por la recomendación de un amigo. Bienvenido a Selvadentro.
        </div>
      )}

      {/* HEADER */}
      <header className="absolute top-0 left-0 right-0 z-30 px-4 sm:px-6 lg:px-10 py-4" style={{ top: referralCode ? '38px' : '0' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="https://selvadentrotulum.com" aria-label="Selvadentro">
            <img
              src="/logo-selvandentro_tulum.webp"
              alt="Selvadentro Tulum"
              className="h-9 sm:h-11 w-auto"
              width="180"
              height="44"
            />
          </a>
          <a
            href="tel:+529994890828"
            className="hidden sm:inline-block text-white/85 hover:text-white text-sm tracking-wide"
          >
            +52 999 489 0828
          </a>
        </div>
      </header>

      {/* HERO + VSL + FORM */}
      <section
        className="relative pt-24 pb-16 sm:pt-28 sm:pb-20 px-4 sm:px-6 lg:px-10 overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(rgba(35, 47, 38, 0.78), rgba(35, 47, 38, 0.88)), url('/hero-selvandentro_tulum.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-12 items-start">
            <div className="lg:col-span-3 text-white">
              <span className="inline-block text-brand-copper text-xs sm:text-sm font-semibold tracking-widest uppercase mb-4">
                Te recomiendan · Selvadentro Tulum
              </span>

              <h1
                className="font-cardo font-bold leading-[1.05] text-white mb-5"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)' }}
              >
                Un amigo confió en Selvadentro.
                <br />
                <em className="text-brand-copper not-italic">Mira por qué.</em>
              </h1>

              <p className="text-base sm:text-lg text-white/85 leading-relaxed mb-8 max-w-2xl">
                Terrenos residenciales en la selva de Tulum, con cenotes naturales y +134% de apreciación confirmada entre Fase 1 y Fase 4. Desde $70,000 USD con financiamiento a 48 meses sin intereses.
              </p>

              {/* VSL */}
              <div className="mb-8 max-w-2xl">
                <VSL mediaId={VSL_MEDIA_ID} language="es" />
              </div>

              {/* USP highlights */}
              <ul className="space-y-2.5 max-w-xl">
                <li className="flex items-start gap-3 text-white/90 text-sm sm:text-base">
                  <CheckCircle2 className="w-5 h-5 text-brand-copper shrink-0 mt-0.5" />
                  <span>9 cenotes naturales · solo 35% edificable</span>
                </li>
                <li className="flex items-start gap-3 text-white/90 text-sm sm:text-base">
                  <CheckCircle2 className="w-5 h-5 text-brand-copper shrink-0 mt-0.5" />
                  <span>+134% apreciación confirmada (Fase 1 → 4)</span>
                </li>
                <li className="flex items-start gap-3 text-white/90 text-sm sm:text-base">
                  <CheckCircle2 className="w-5 h-5 text-brand-copper shrink-0 mt-0.5" />
                  <span>48 meses · 0% interés · escritura pública garantizada</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-24">
                <ReferralForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="bg-brand-dark-green py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-8 sm:gap-x-12 gap-y-3 text-center">
          <div className="text-white/85">
            <span className="font-cardo text-2xl font-bold text-brand-copper">20+</span>
            <span className="ml-2 text-xs sm:text-sm uppercase tracking-wider">años en bienes raíces</span>
          </div>
          <div className="hidden sm:block w-px h-8 bg-white/20" />
          <div className="text-white/85">
            <span className="font-cardo text-2xl font-bold text-brand-copper">12</span>
            <span className="ml-2 text-xs sm:text-sm uppercase tracking-wider">proyectos entregados</span>
          </div>
          <div className="hidden sm:block w-px h-8 bg-white/20" />
          <div className="text-white/85">
            <span className="font-cardo text-2xl font-bold text-brand-copper">100%</span>
            <span className="ml-2 text-xs sm:text-sm uppercase tracking-wider">escrituras</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1F2A22] text-white/60 text-xs py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} Selvadentro Tulum · Todos los derechos reservados</span>
          <span>
            <a href="tel:+529994890828" className="hover:text-white">
              +52 999 489 0828
            </a>
            <span className="mx-2">·</span>
            <a href="mailto:d.comercial@selvadentrotulum.com" className="hover:text-white">
              d.comercial@selvadentrotulum.com
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
