import { useEffect, useState } from 'react';
import { Check, X, LogIn } from 'lucide-react';
import ReferrerForm from '../components/ReferrerForm';
import VSL from '../components/VSL';
import { captureTrackingParams } from '../utils/tracking';
import { useLang } from '../i18n/useLang';

export default function ReferrerSignup() {
  const { lang, t, otherLang, swapLangUrl } = useLang();
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    captureTrackingParams();
    document.title = t.referrerSignup.docTitle;
  }, [t]);

  useEffect(() => {
    document.body.style.overflow = formOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [formOpen]);

  const openForm = () => setFormOpen(true);

  return (
    <div className="font-lexend text-[#2D332B] bg-[#ECE5D8]">
      {/* STICKY HEADER */}
      <header className="sticky top-0 z-30 bg-brand-dark-green/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between gap-4">
          <a href={`/${lang}`} aria-label="Selvadentro" className="shrink-0">
            <img src="/logo-selvandentro_tulum-cream.webp" alt="Selvadentro Tulum" className="h-9 sm:h-11 w-auto" />
          </a>
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={swapLangUrl()}
              className="text-[11px] font-semibold tracking-widest text-white/75 hover:text-white px-2 transition"
              title={`Switch to ${otherLang.toUpperCase()}`}
            >
              {lang.toUpperCase()} · <span className="text-brand-copper underline">{otherLang.toUpperCase()}</span>
            </a>
            <a
              href={`/${lang}/login`}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm text-white/80 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              {t.common.loginCta}
            </a>
            <button
              onClick={openForm}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-brand-copper text-white rounded-full font-semibold text-xs sm:text-sm hover:bg-brand-beige hover:text-brand-dark-green transition-all shadow-lg uppercase tracking-wider"
            >
              {t.common.registerCta}
            </button>
          </div>
        </div>
      </header>

      {/* 1. HERO */}
      <section className="bg-brand-dark-green text-white pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 lg:px-10 text-center relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 opacity-40 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 70% 30%, rgba(207,133,67,0.18) 0%, transparent 60%)' }}
        />
        <div className="relative max-w-3xl mx-auto">
          <div className="mb-6 flex flex-col items-center">
            <img src="/logo-selvandentro_tulum-cream.webp" alt="Selvadentro · tierra de cenotes" className="h-20 sm:h-24 w-auto" />
          </div>

          <div className="inline-block mb-6 sm:mb-8 px-5 py-1.5 border border-brand-copper/40 rounded-full">
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-brand-copper">{t.referrerSignup.badge}</span>
          </div>

          <h1 className="font-cardo font-bold leading-[1.08] mb-5" style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)' }}>
            <span className="block text-white">{t.referrerSignup.heroTitle}</span>
            <em className="block not-italic text-brand-copper font-cardo italic">{t.referrerSignup.heroSubtitle}</em>
          </h1>

          <p className="font-cardo italic text-white/75 text-base sm:text-lg mb-10 sm:mb-12">{t.referrerSignup.heroTagline}</p>

          <VSL lang={lang} />
        </div>
      </section>

      {/* 2. INTRO + DUAL COMMISSION CARDS */}
      <section className="bg-[#ECE5D8] py-16 sm:py-20 px-4 sm:px-6 lg:px-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm sm:text-base text-stone-700 leading-relaxed max-w-3xl mx-auto mb-10 sm:mb-12">
            {t.referrerSignup.intro}{' '}
            <strong className="text-brand-dark-green">{t.referrerSignup.introBold}</strong>
            {t.referrerSignup.introTail}
          </p>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
            <div className="bg-brand-dark-green rounded-2xl p-8 sm:p-10 text-center text-white shadow-lg">
              <p className="text-[10px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-brand-copper mb-3">{t.referrerSignup.cardYouLabel}</p>
              <p className="font-cardo font-bold leading-none text-white mb-3" style={{ fontSize: 'clamp(3.2rem, 8vw, 4.5rem)' }}>
                2.5<span className="text-brand-copper">%</span>
              </p>
              <p className="text-sm text-white/80 leading-relaxed">
                {t.referrerSignup.cardYouBody1}<br />{t.referrerSignup.cardYouBody2}
              </p>
            </div>

            <div className="bg-brand-dark-green rounded-2xl p-8 sm:p-10 text-center text-white shadow-lg">
              <p className="text-[10px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-brand-copper mb-3">{t.referrerSignup.cardThemLabel}</p>
              <p className="font-cardo font-bold leading-none text-white mb-3" style={{ fontSize: 'clamp(3.2rem, 8vw, 4.5rem)' }}>
                2.5<span className="text-brand-copper">%</span>
              </p>
              <p className="text-sm text-white/80 leading-relaxed">
                {t.referrerSignup.cardThemBody1}<br />{t.referrerSignup.cardThemBody2}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CÓMO FUNCIONA */}
      <section className="bg-[#F8F5EF] py-16 sm:py-20 px-4 sm:px-6 lg:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-brand-copper mb-3">{t.referrerSignup.howItWorksEyebrow}</p>
            <h2 className="font-cardo font-bold text-brand-dark-green" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)' }}>
              {t.referrerSignup.howItWorksTitlePre}
              <em className="text-brand-copper font-cardo italic">{t.referrerSignup.howItWorksTitleEm}</em>
              {t.referrerSignup.howItWorksTitlePost}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-7 text-center border border-stone-100 shadow-sm relative">
              <span className="inline-flex w-10 h-10 rounded-full bg-brand-olive text-white items-center justify-center font-cardo font-bold mb-5 -mt-12 shadow-md">1</span>
              <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-brand-olive mb-3">{t.referrerSignup.step1Label}</p>
              <p className="text-sm text-stone-700 leading-relaxed mb-5 min-h-[64px]">
                {t.referrerSignup.step1Body1}
                <strong className="text-brand-dark-green">{t.referrerSignup.step1Body1Bold}</strong>
                {t.referrerSignup.step1Body1Tail}
              </p>
              <button
                onClick={openForm}
                className="inline-block px-6 py-3 bg-brand-copper text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-brand-beige hover:text-brand-dark-green transition-all shadow-md"
              >
                {t.common.registerCta}
              </button>
              <p className="text-xs text-stone-500 italic mt-3">{t.referrerSignup.step1Footnote}</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-7 text-center border border-stone-100 shadow-sm relative">
              <span className="inline-flex w-10 h-10 rounded-full bg-brand-olive text-white items-center justify-center font-cardo font-bold mb-5 -mt-12 shadow-md">2</span>
              <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-brand-olive mb-3">{t.referrerSignup.step2Label}</p>
              <p className="text-sm text-stone-700 leading-relaxed mb-5 min-h-[64px]">
                {t.referrerSignup.step2Body1}
                <strong className="text-brand-dark-green">{t.referrerSignup.step2Body1Bold}</strong>
                {t.referrerSignup.step2Body1Tail}
              </p>
              <p className="text-xs text-stone-500 italic">{t.referrerSignup.step2Footnote}</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-7 text-center border border-stone-100 shadow-sm relative">
              <span className="inline-flex w-10 h-10 rounded-full bg-brand-olive text-white items-center justify-center font-cardo font-bold mb-5 -mt-12 shadow-md">3</span>
              <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-brand-olive mb-3">{t.referrerSignup.step3Label}</p>
              <p className="text-sm text-stone-700 leading-relaxed mb-5 min-h-[64px]">
                {t.referrerSignup.step3Body1}
                <strong className="text-brand-dark-green">{t.referrerSignup.step3Body1Bold}</strong>
                {t.referrerSignup.step3Body1Tail}
              </p>
              <p className="text-xs text-stone-500 italic">{t.referrerSignup.step3Footnote}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LOS DETALLES */}
      <section className="bg-[#ECE5D8] py-16 sm:py-20 px-4 sm:px-6 lg:px-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-brand-copper mb-3">{t.referrerSignup.detailsEyebrow}</p>
            <h2 className="font-cardo font-bold text-brand-dark-green" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)' }}>
              {t.referrerSignup.detailsTitlePre}
              <em className="text-brand-copper font-cardo italic">{t.referrerSignup.detailsTitleEm}</em>
              {t.referrerSignup.detailsTitlePost}
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-2 border border-stone-100 shadow-sm">
            {[
              { i: 'i', label: t.referrerSignup.detail1Label, value: (<>{t.referrerSignup.detail1ValuePre}<strong>{t.referrerSignup.detail1ValueBold}</strong>{t.referrerSignup.detail1ValueTail}</>) },
              { i: 'ii', label: t.referrerSignup.detail2Label, value: (<>{t.referrerSignup.detail2ValuePre}<strong>{t.referrerSignup.detail2ValueBold}</strong>{t.referrerSignup.detail2ValueTail}</>) },
              { i: 'iii', label: t.referrerSignup.detail3Label, value: t.referrerSignup.detail3ValuePre },
              { i: 'iv', label: t.referrerSignup.detail4Label, value: t.referrerSignup.detail4ValuePre },
            ].map((row, idx, arr) => (
              <div key={row.i} className={`flex items-start gap-4 sm:gap-6 px-4 sm:px-6 py-5 ${idx !== arr.length - 1 ? 'border-b border-stone-100' : ''}`}>
                <span className="font-cardo italic text-brand-copper text-base sm:text-lg w-5 shrink-0 mt-0.5">{row.i}</span>
                <div className="flex-1 grid sm:grid-cols-2 gap-2 sm:gap-4 items-baseline">
                  <p className="text-[10px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-stone-500">{row.label}</p>
                  <p className="text-sm sm:text-base text-brand-dark-green sm:text-right">{row.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ¿Y DESPUÉS DEL REGISTRO? */}
      <section className="bg-brand-dark-green text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-brand-copper mb-3">{t.referrerSignup.followUpEyebrow}</p>
            <h2 className="font-cardo font-bold mb-4" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)' }}>
              {t.referrerSignup.followUpTitlePre}
              <em className="text-brand-copper font-cardo italic">{t.referrerSignup.followUpTitleEm}</em>
              {t.referrerSignup.followUpTitlePost}
            </h2>
            <p className="font-cardo italic text-white/70 text-sm sm:text-base">{t.referrerSignup.followUpSubtitle}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
            <div className="rounded-2xl p-6 sm:p-7 border border-brand-copper/30 bg-brand-dark-green/40 text-center">
              <span className="inline-flex w-10 h-10 rounded-full bg-brand-copper/20 text-brand-copper items-center justify-center mb-4">
                <Check className="w-5 h-5" />
              </span>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                {t.referrerSignup.followUp1Pre}
                <strong>{t.referrerSignup.followUp1Bold}</strong>
                {t.referrerSignup.followUp1Tail}
              </p>
            </div>
            <div className="rounded-2xl p-6 sm:p-7 border border-brand-copper/30 bg-brand-dark-green/40 text-center">
              <span className="inline-flex w-10 h-10 rounded-full bg-brand-copper/20 text-brand-copper items-center justify-center mb-4">
                <Check className="w-5 h-5" />
              </span>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                {t.referrerSignup.followUp2Pre}
                <strong>{t.referrerSignup.followUp2Bold}</strong>
                {t.referrerSignup.followUp2Tail}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TIPS PARA REFERIR MEJOR */}
      <section className="bg-[#F8F5EF] py-16 sm:py-20 px-4 sm:px-6 lg:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-brand-copper mb-3">{t.referrerSignup.tipsEyebrow}</p>
            <h2 className="font-cardo font-bold text-brand-dark-green" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)' }}>
              {t.referrerSignup.tipsTitlePre}
              <em className="text-brand-copper font-cardo italic">{t.referrerSignup.tipsTitleEm}</em>
              {t.referrerSignup.tipsTitlePost}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 sm:gap-10 max-w-5xl mx-auto">
            {[
              { num: '01', title: t.referrerSignup.tip1Title, body: t.referrerSignup.tip1Body },
              { num: '02', title: t.referrerSignup.tip2Title, body: t.referrerSignup.tip2Body },
              { num: '03', title: t.referrerSignup.tip3Title, body: t.referrerSignup.tip3Body },
            ].map((tip) => (
              <div key={tip.num} className="text-center">
                <p className="font-cardo text-brand-copper font-bold text-3xl sm:text-4xl mb-2">{tip.num}</p>
                <div className="w-8 h-0.5 bg-brand-copper/50 mx-auto mb-4" />
                <h3 className="font-cardo font-bold text-brand-dark-green text-lg sm:text-xl mb-2">{tip.title}</h3>
                <p className="text-sm text-stone-700 leading-relaxed max-w-xs mx-auto">{tip.body}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <button
              onClick={openForm}
              className="inline-block px-10 py-4 bg-brand-copper text-white rounded-full font-semibold text-base hover:bg-brand-beige hover:text-brand-dark-green transition-all shadow-xl uppercase tracking-wider"
            >
              {t.common.registerCta}
            </button>
            <p className="text-xs text-stone-500 italic mt-3">{t.referrerSignup.step1Footnote}</p>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-brand-dark-green text-white text-center py-14 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <img src="/logo-selvandentro_tulum-cream.webp" alt="Selvadentro" className="h-12 w-auto mx-auto mb-5" />
          <h3 className="font-cardo italic text-white text-xl sm:text-2xl mb-3">{t.referrerSignup.footerDoubt}</h3>
          <p className="text-sm text-white/80 leading-relaxed mb-5">
            {t.referrerSignup.footerHelp}{' '}
            <a href={`mailto:${t.common.contactEmail}`} className="text-brand-copper underline hover:text-brand-beige">{t.common.contactEmail}</a>
          </p>
          <p className="font-cardo italic text-white/60 text-sm mb-6">{t.referrerSignup.footerWelcome}</p>
          <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase">
            <a href="https://selvadentrotulum.com" className="hover:text-white/70">Selvadentrotulum.com</a>
          </p>
        </div>
      </footer>

      {/* MODAL */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/65 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setFormOpen(false); }}
        >
          <div className="relative w-full max-w-md my-auto">
            <button
              onClick={() => setFormOpen(false)}
              aria-label={t.common.close}
              className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white text-brand-dark-green shadow-xl flex items-center justify-center hover:bg-stone-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
            <ReferrerForm />
          </div>
        </div>
      )}
    </div>
  );
}
