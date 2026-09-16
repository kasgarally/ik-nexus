/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * vue-i18n factory with Vuetify catalogs
 *
 * Core keys (locale.* / files.* / lists.* / setup.*) and $vuetify live here.
 * Each app passes its own message packs and a storageKey. app.use(i18n)
 * also provides that key so NLocaleSelect never imports an app path.
 */
import { createI18n } from 'vue-i18n'
import { ar as vuetifyAr, en as vuetifyEn, fr as vuetifyFr } from 'vuetify/locale'
import ar from './locales/ar.js'
import en from './locales/en.js'
import fr from './locales/fr.js'

export const DEFAULT_STORAGE_KEY = 'nexus-locale'
export const NEXUS_LOCALE_STORAGE_KEY = 'nexusLocaleStorageKey'

export const supportedLocales = [
  { code: 'en', labelKey: 'locale.en' },
  { code: 'fr', labelKey: 'locale.fr' },
  { code: 'ar', labelKey: 'locale.ar' },
]

export function readStoredLocale(storageKey = DEFAULT_STORAGE_KEY) {
  if (typeof localStorage === 'undefined') {
    return 'en'
  }

  const stored = localStorage.getItem(storageKey)
  return supportedLocales.some((locale) => locale.code === stored) ? stored : 'en'
}

export function persistLocale(code, storageKey = DEFAULT_STORAGE_KEY) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(storageKey, code)
  }
}

export function applyDocumentLocale(code) {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.lang = code
  document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr'
}

export function setAppLocale(localeRef, code, storageKey = DEFAULT_STORAGE_KEY) {
  if (!supportedLocales.some((item) => item.code === code)) {
    return
  }

  localeRef.value = code
  persistLocale(code, storageKey)
  applyDocumentLocale(code)
}

function mergeLocaleMessages(core, extra, vuetify) {
  return {
    ...core,
    ...extra,
    $vuetify: vuetify,
  }
}

export function createNexusI18n(options = {}) {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY
  const extra = options.messages ?? {}
  const locale = readStoredLocale(storageKey)

  applyDocumentLocale(locale)

  const i18n = createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'en',
    messages: {
      en: mergeLocaleMessages(en, extra.en, vuetifyEn),
      fr: mergeLocaleMessages(fr, extra.fr, vuetifyFr),
      ar: mergeLocaleMessages(ar, extra.ar, vuetifyAr),
    },
  })

  const originalInstall = i18n.install.bind(i18n)
  i18n.install = (app, ...args) => {
    originalInstall(app, ...args)
    app.provide(NEXUS_LOCALE_STORAGE_KEY, storageKey)
  }

  return i18n
}
