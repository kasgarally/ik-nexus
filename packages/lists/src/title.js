/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Localized label for a list item
 */
import { getMeteorApis } from './register.js'

export function title(item, locale) {
  if (!item) {
    return ''
  }

  const { data, defaultData } = readLocales()
  // UI locale is only used when it is also a data locale. Leftover keys
  // such as title.fr are ignored when data is ["en"].
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

  return item.code || ''
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
