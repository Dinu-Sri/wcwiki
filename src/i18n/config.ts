// Internationalization configuration for wcWIKI
export const locales = ["en", "si"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  si: "සිංහල",
};

// Locales that use date formatting different from en-US
export const localeDateFormats: Record<Locale, string> = {
  en: "en-US",
  si: "si-LK",
};
