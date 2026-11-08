export const SUPPORTED_LOCALES = ["en", "am"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const isLocale = (value: string | undefined): value is Locale =>
  SUPPORTED_LOCALES.includes(value as Locale);
