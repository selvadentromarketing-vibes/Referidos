import { useParams, useLocation } from 'react-router-dom';
import { translations, DEFAULT_LANG, type Lang, type Translations, LANGS } from './translations';

/**
 * Returns the active language + the matching translations bundle.
 *
 * Lang is read from the `:lang` URL param so it's always in sync with the URL.
 * If the URL param is missing or invalid, falls back to DEFAULT_LANG.
 *
 * Also exposes `otherLang` + `swap(path)` so the header/switcher can build
 * an opposite-language URL.
 */
export function useLang(): {
  lang: Lang;
  t: Translations;
  otherLang: Lang;
  swapLangUrl: () => string;
} {
  const params = useParams<{ lang?: string }>();
  const location = useLocation();
  const raw = (params.lang ?? '').toLowerCase();
  const lang: Lang = (LANGS as readonly string[]).includes(raw) ? (raw as Lang) : DEFAULT_LANG;
  const otherLang: Lang = lang === 'es' ? 'en' : 'es';

  const swapLangUrl = (): string => {
    // Current pathname looks like /es/something or /en/something.
    // Replace the leading lang segment.
    const path = location.pathname.replace(/^\/(es|en)(\/|$)/, `/${otherLang}$2`);
    return path + location.search + location.hash;
  };

  // Cast through unknown: TS sees the two language trees as nominally different
  // because each was built with `as const`; structurally they're identical.
  const t = translations[lang] as unknown as Translations;
  return { lang, t, otherLang, swapLangUrl };
}
