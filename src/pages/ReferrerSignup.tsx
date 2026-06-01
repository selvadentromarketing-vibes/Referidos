import { useEffect } from 'react';
import { Link2, Share2, DollarSign, ShieldCheck, Sparkles } from 'lucide-react';
import ReferrerForm from '../components/ReferrerForm';
import { captureTrackingParams } from '../utils/tracking';

export default function ReferrerSignup() {
  useEffect(() => {
    captureTrackingParams();
    document.title = 'Programa de Referidos | Selvadentro Tulum';
  }, []);

  return (
    <div className="min-h-screen bg-[#ECE5D8] font-lexend">
      {/* HEADER */}
      <header className="absolute top-0 left-0 right-0 z-30 px-4 sm:px-6 lg:px-10 py-4">
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

      {/* HERO + FORM */}
      <section
        className="relative pt-24 pb-16 sm:pt-28 sm:pb-20 px-4 sm:px-6 lg:px-10 overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(rgba(35, 47, 38, 0.82), rgba(35, 47, 38, 0.90)), url('/hero-selvandentro_tulum.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-12 items-start">
            <div className="lg:col-span-3 text-white">
              <span className="inline-block text-brand-copper text-xs sm:text-sm font-semibold tracking-widest uppercase mb-4">
                Programa de Referidos · Selvadentro
              </span>

              <h1
                className="font-cardo font-bold leading-[1.05] text-white mb-5"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)' }}
              >
                Recomienda Selvadentro.
                <br />
                <em className="text-brand-copper not-italic">Gana con cada referido.</em>
              </h1>

              <p className="text-base sm:text-lg text-white/85 leading-relaxed mb-8 max-w-2xl">
                Genera tu link personalizado en menos de 2 minutos y empieza a ganar por cada amigo que invierta en Selvadentro Tulum.
              </p>

              {/* 3-step explainer */}
              <ol className="space-y-5 max-w-xl">
                <li className="flex items-start gap-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-copper/15 border border-brand-copper/40 shrink-0">
                    <Link2 className="w-5 h-5 text-brand-copper" />
                  </span>
                  <div>
                    <h3 className="font-cardo text-lg font-bold text-white mb-1">
                      1. Genera tu link
                    </h3>
                    <p className="text-white/75 text-sm leading-relaxed">
                      Completa el formulario. Recibirás por correo tu link personalizado en minutos.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-copper/15 border border-brand-copper/40 shrink-0">
                    <Share2 className="w-5 h-5 text-brand-copper" />
                  </span>
                  <div>
                    <h3 className="font-cardo text-lg font-bold text-white mb-1">
                      2. Compártelo
                    </h3>
                    <p className="text-white/75 text-sm leading-relaxed">
                      WhatsApp, email, redes sociales. Cada vez que alguien lo abra, queda registrado a tu nombre.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-copper/15 border border-brand-copper/40 shrink-0">
                    <DollarSign className="w-5 h-5 text-brand-copper" />
                  </span>
                  <div>
                    <h3 className="font-cardo text-lg font-bold text-white mb-1">
                      3. Gana
                    </h3>
                    <p className="text-white/75 text-sm leading-relaxed">
                      Recibes una comisión por cada referido que escriture su lote en Selvadentro.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-24">
                <ReferrerForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY JOIN — supporting trust */}
      <section className="py-14 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-brand-copper text-sm font-semibold tracking-widest uppercase">
              ¿Por qué unirte?
            </span>
            <h2 className="font-cardo text-3xl sm:text-4xl font-bold text-brand-dark-green mt-3">
              Un producto que se vende solo
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl p-6 border border-stone-100 bg-[#F8F5EF]">
              <ShieldCheck className="w-8 h-8 text-brand-olive mb-3" />
              <h3 className="font-cardo text-lg font-bold text-brand-dark-green mb-2">
                Track record real
              </h3>
              <p className="text-sm text-stone-700 leading-relaxed">
                Desarrollador con 20+ años, 12 proyectos entregados y 100% de escrituras a tiempo.
              </p>
            </div>
            <div className="rounded-2xl p-6 border border-stone-100 bg-[#F8F5EF]">
              <Sparkles className="w-8 h-8 text-brand-olive mb-3" />
              <h3 className="font-cardo text-lg font-bold text-brand-dark-green mb-2">
                Producto diferenciado
              </h3>
              <p className="text-sm text-stone-700 leading-relaxed">
                9 cenotes naturales, solo 35% edificable, +134% apreciación confirmada Fase 1→4.
              </p>
            </div>
            <div className="rounded-2xl p-6 border border-stone-100 bg-[#F8F5EF]">
              <DollarSign className="w-8 h-8 text-brand-olive mb-3" />
              <h3 className="font-cardo text-lg font-bold text-brand-dark-green mb-2">
                Comisión transparente
              </h3>
              <p className="text-sm text-stone-700 leading-relaxed">
                Pago al escriturar el referido. Sin letra chica, sin retrasos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1F2A22] text-white/60 text-xs py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} Selvadentro Tulum · Programa de Referidos</span>
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
