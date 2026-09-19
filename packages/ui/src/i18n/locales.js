/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Normalize public.locales and resolve localized maps
 *
 * UI catalogs we ship today are en / fr / ar. Extra ui codes are allowed
 * (chrome falls back). Data maps use only the data list.
 */

export const NEXUS_LOCALES_KEY = 'nexusLocales'
export const NEXUS_TRANSLATE_KEY = 'nexusTranslate'

export const CATALOG_LOCALES = ['en', 'fr', 'ar']

/** Stored maps always include this key. defaultData cannot be anything else. */
export const REQUIRED_DATA_LOCALE = 'en'

const DEFAULT_LOCALES = {
  defaultUi: 'en',
  ui: ['en'],
  defaultData: REQUIRED_DATA_LOCALE,
  data: [REQUIRED_DATA_LOCALE],
}

export function normalizeLocales(raw) {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Meteor.settings.public.locales is required (defaultUi, ui, defaultData, data)')
  }

  const defaultUi = readCode(raw.defaultUi, 'defaultUi')
  const defaultData = readCode(raw.defaultData, 'defaultData')
  const ui = readCodeList(raw.ui, 'ui')
  const data = readCodeList(raw.data, 'data')

  if (!ui.includes(defaultUi)) {
    throw new Error('locales.defaultUi must appear in locales.ui')
  }
  if (!data.includes(defaultData)) {
    throw new Error('locales.defaultData must appear in locales.data')
  }
  assertRequiredDataLocale({ defaultData, data })

  const missing = data.filter((code) => !ui.includes(code))
  if (missing.length > 0) {
    throw new Error(`locales.data must be a subset of locales.ui (extra: ${missing.join(', ')})`)
  }

  return { defaultUi, ui, defaultData, data }
}

export function assertRequiredDataLocale(locales) {
  if (!locales || typeof locales !== 'object' || Array.isArray(locales)) {
    throw new Error('locales is required')
  }
  if (locales.defaultData !== REQUIRED_DATA_LOCALE) {
    throw new Error(`locales.defaultData must be ${REQUIRED_DATA_LOCALE}`)
  }
  if (!Array.isArray(locales.data) || !locales.data.includes(REQUIRED_DATA_LOCALE)) {
    throw new Error(`locales.data must include ${REQUIRED_DATA_LOCALE}`)
  }
}

export function resolveLocalized(map, locale, locales) {
  const resolved = readResolveLocales(locales)
  // Only keys in locales.data are visible. A leftover title.fr must not
  // appear when the UI is French but data is ["en"].
  const coerced = coerceLocalized(map, resolved)
  if (typeof locale === 'string' && resolved.data.includes(locale)) {
    const requested = coerced[locale]
    if (typeof requested === 'string' && requested) {
      return requested
    }
  }
  const fallback = coerced[resolved.defaultData]
  if (typeof fallback === 'string' && fallback) {
    return fallback
  }
  return ''
}

export function emptyLocalizedMap(data) {
  const map = {}
  for (const code of data) {
    map[code] = ''
  }
  return map
}

export function coerceLocalized(value, locales) {
  const { data, defaultData } = locales
  const next = emptyLocalizedMap(data)

  if (typeof value === 'string') {
    next[defaultData] = value
    return next
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return next
  }

  for (const code of data) {
    if (typeof value[code] === 'string') {
      next[code] = value[code]
    }
  }
  return next
}

export function localeDisplayName(code, translate, hasKey) {
  const key = `locale.${code}`
  if (typeof hasKey === 'function' && hasKey(key)) {
    return translate(key)
  }
  if (typeof translate === 'function') {
    const label = translate(key)
    if (label && label !== key) {
      return label
    }
  }

  try {
    const name = new Intl.DisplayNames([code], { type: 'language' }).of(code)
    if (name) {
      return name
    }
  } catch {
    // unknown code
  }
  return code
}

function readCode(value, field) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`locales.${field} must be a non-empty string`)
  }
  return value.trim()
}

function readCodeList(value, field) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`locales.${field} must be a non-empty array of strings`)
  }

  const codes = []
  for (const item of value) {
    if (typeof item !== 'string' || !item.trim()) {
      throw new Error(`locales.${field} must contain only non-empty strings`)
    }
    const code = item.trim()
    if (!codes.includes(code)) {
      codes.push(code)
    }
  }
  return codes
}

function readResolveLocales(locales) {
  if (typeof locales === 'string' && locales.trim()) {
    const defaultData = locales.trim()
    return { defaultData, data: [defaultData] }
  }
  if (locales && Array.isArray(locales.data) && typeof locales.defaultData === 'string') {
    return { defaultData: locales.defaultData, data: locales.data }
  }
  return defaultLocales()
}

export function defaultLocales() {
  return { ...DEFAULT_LOCALES, ui: [...DEFAULT_LOCALES.ui], data: [...DEFAULT_LOCALES.data] }
}
