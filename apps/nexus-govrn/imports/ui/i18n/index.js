/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * vue-i18n instance with Vuetify 4 catalogs
 *
 * App copy lives at the message root (t('nav.home')).
 * Vuetify chrome lives under $vuetify and is read via createVueI18nAdapter.
 * Per-microapp packs can be merged into these locale objects the same way.
 */
import { createI18n } from 'vue-i18n'
import { ar as vuetifyAr, en as vuetifyEn, fr as vuetifyFr } from 'vuetify/locale'
import ar from './ar.js'
import en from './en.js'
import fr from './fr.js'

export const LOCALE_STORAGE_KEY = 'nexus-govrn-locale'

export const supportedLocales = [
  { code: 'en', labelKey: 'locale.en' },
  { code: 'fr', labelKey: 'locale.fr' },
  { code: 'ar', labelKey: 'locale.ar' },
]

export function readStoredLocale() {
  if (typeof localStorage === 'undefined') {
    return 'en'
  }

  const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
  return supportedLocales.some((locale) => locale.code === stored) ? stored : 'en'
}

export function persistLocale(code) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LOCALE_STORAGE_KEY, code)
  }
}

export function applyDocumentLocale(code) {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.lang = code
  document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr'
}

export const messages = {
  en: { ...en, $vuetify: vuetifyEn },
  fr: { ...fr, $vuetify: vuetifyFr },
  ar: { ...ar, $vuetify: vuetifyAr },
}

const locale = readStoredLocale()
applyDocumentLocale(locale)

export const i18n = createI18n({
  legacy: false,
  locale,
  fallbackLocale: 'en',
  messages,
})

export function setAppLocale(code) {
  if (!supportedLocales.some((item) => item.code === code)) {
    return
  }

  i18n.global.locale.value = code
  persistLocale(code)
  applyDocumentLocale(code)
}
