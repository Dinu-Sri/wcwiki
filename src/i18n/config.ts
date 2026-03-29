// Internationalization configuration for wcWIKI
export const locales = ["en", "zh", "ja", "ko", "es", "fr", "ru", "tr", "ta", "si"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  es: "Español",
  fr: "Français",
  ru: "Русский",
  tr: "Türkçe",
  ta: "தமிழ்",
  si: "සිංහල",
};

// Locales that use date formatting different from en-US
export const localeDateFormats: Record<Locale, string> = {
  en: "en-US",
  zh: "zh-CN",
  ja: "ja-JP",
  ko: "ko-KR",
  es: "es-ES",
  fr: "fr-FR",
  ru: "ru-RU",
  tr: "tr-TR",
  ta: "ta-IN",
  si: "si-LK",
};
