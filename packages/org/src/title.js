/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Localized label for an org node
 */
import { getMeteorApis } from './register.js'

export function title(item, locale) {
  if (!item) {
    return ''
  }

  const { data, defaultData } = readLocales()
  if (typeof locale === 'string' && data.includes(locale)) {
    const localized = item.title?.[locale]
    if (typeof localized === 'string' && localized) {
      return localized
    }
  }

  const fallback = item.title?.[defaultData]
  if (typeof fallback === 'string' && fallback) {
    return fallback
  }

  return item.type || ''
}

function readLocales() {
  try {
    const locales = getMeteorApis().locales
    if (locales && Array.isArray(locales.data) && typeof locales.defaultData === 'string') {
      return { data: locales.data, defaultData: locales.defaultData }
    }
  } catch {
    // registerWithMeteor not called yet
  }
  return { data: ['en'], defaultData: 'en' }
}
