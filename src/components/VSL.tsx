import { useState } from 'react';
import { Play } from 'lucide-react';
import type { Lang } from '../i18n/translations';

interface VSLProps {
  lang: Lang;
}

/**
 * Bilingual VSL for the referidos signup page.
 *
 * Source files live in /public:
 *   /vsl-es.mp4  + /vsl-es-poster.webp  (Spanish)
 *   /vsl-en.mp4  + /vsl-en-poster.webp  (English)
 *
 * The video bytes (~19 MB each) only download AFTER the visitor explicitly
 * clicks Play. Until then we render a static poster image with a play
 * overlay, so the page stays fast on mobile 4G.
 *
 * The aspect ratio is portrait (9:16) because the source footage is
 * vertical / phone-format.
 */
export default function VSL({ lang }: VSLProps) {
  const [loaded, setLoaded] = useState(false);

  const videoSrc = lang === 'en' ? '/vsl-en.mp4' : '/vsl-es.mp4';
  const posterSrc = lang === 'en' ? '/vsl-en-poster.webp' : '/vsl-es-poster.webp';
  const playLabel = lang === 'en' ? 'Play video' : 'Reproducir video';

  if (loaded) {
    return (
      <div className="mx-auto w-full max-w-[320px] sm:max-w-[360px]">
        <div className="aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl bg-black ring-1 ring-white/10">
          <video
            key={videoSrc}
            src={videoSrc}
            poster={posterSrc}
            controls
            autoPlay
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[320px] sm:max-w-[360px]">
      <button
        type="button"
        onClick={() => setLoaded(true)}
        aria-label={playLabel}
        className="group relative block w-full aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl bg-brand-dark-green ring-1 ring-white/10 focus:outline-none focus:ring-4 focus:ring-brand-copper/40"
        style={{
          backgroundImage: `url('${posterSrc}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <span className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-copper text-white shadow-2xl transition-transform group-hover:scale-110 group-active:scale-95">
            <Play className="w-7 h-7 sm:w-9 sm:h-9 ml-1" fill="white" />
          </span>
        </span>
      </button>
    </div>
  );
}
