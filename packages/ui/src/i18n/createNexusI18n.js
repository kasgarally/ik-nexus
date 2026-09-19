/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * vue-i18n factory with Vuetify catalogs
 *
 * Core keys (ui.* / locale.* / files.* / lists.* / pickers.* / setup.* / settings.* / accounts.*) and $vuetify live here.
 * Each app passes its own message packs, storageKey, and normalized locales.
 */
import { createI18n } from 'vue-i18n'
import { ar as vuetifyAr, en as vuetifyEn, fr as vuetifyFr } from 'vuetify/locale'
import ar from './locales/ar.js'
import en from './locales/en.js'
import fr from './locales/fr.js'
import {
  defaultLocales,
  NEXUS_LOCALES_KEY,
  normalizeLocales,
} from './locales.js'

export const DEFAULT_STORAGE_KEY = 'nexus-locale'
export const NEXUS_LOCALE_STORAGE_KEY = 'nexusLocaleStorageKey'

export {
  assertRequiredDataLocale,
  coerceLocalized,
  emptyLocalizedMap,
  localeDisplayName,
  NEXUS_LOCALES_KEY,
  NEXUS_TRANSLATE_KEY,
  normalizeLocales,
  REQUIRED_DATA_LOCALE,
  resolveLocalized,
} from './locales.js'

const CORE_MESSAGES = { en, fr, ar }
const VUETIFY_MESSAGES = {
  en: vuetifyEn,
  fr: vuetifyFr,
  ar: vuetifyAr,
}

/** Catalogs we ship. Kept for callers that still import this name. */
export const supportedLocales = [
  { code: 'en', labelKey: 'locale.en' },
  { code: 'fr', labelKey: 'locale.fr' },
  { code: 'ar', labelKey: 'locale.ar' },
]

export function readStoredLocale(storageKey = DEFAULT_STORAGE_KEY, locales = defaultLocales()) {
  if (typeof localStorage === 'undefined') {
    return locales.defaultUi
  }

  const stored = localStorage.getItem(storageKey)
  return locales.ui.includes(stored) ? stored : locales.defaultUi
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

export function setAppLocale(localeRef, code, storageKey = DEFAULT_STORAGE_KEY, locales = defaultLocales()) {
  if (!locales.ui.includes(code)) {
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

function messagesForUi(ui, extra, defaultUi) {
  const messages = {}
  for (const code of ui) {
    const core = CORE_MESSAGES[code]
    const extraMessages = extra[code]
    if (!core && !extraMessages) {
      continue
    }
    messages[code] = mergeLocaleMessages(
      core || {},
      extraMessages || {},
      VUETIFY_MESSAGES[code] || VUETIFY_MESSAGES.en,
    )
  }
  if (!messages[defaultUi]) {
    const core = CORE_MESSAGES[defaultUi] || CORE_MESSAGES.en
    messages[defaultUi] = mergeLocaleMessages(
      core,
      extra[defaultUi] || {},
      VUETIFY_MESSAGES[defaultUi] || VUETIFY_MESSAGES.en,
    )
  }
  return messages
}

export function createNexusI18n(options = {}) {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY
  const extra = options.messages ?? {}
  const locales = options.locales
    ? normalizeLocales(options.locales)
    : defaultLocales()
  const locale = readStoredLocale(storageKey, locales)

  applyDocumentLocale(locale)

  const i18n = createI18n({
    legacy: false,
    locale,
    fallbackLocale: locales.defaultUi,
    messages: messagesForUi(locales.ui, extra, locales.defaultUi),
  })

  const originalInstall = i18n.install.bind(i18n)
  i18n.install = (app, ...args) => {
    originalInstall(app, ...args)
    app.provide(NEXUS_LOCALE_STORAGE_KEY, storageKey)
    app.provide(NEXUS_LOCALES_KEY, locales)
  }

  return i18n
}
