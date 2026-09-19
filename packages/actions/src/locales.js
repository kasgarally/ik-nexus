/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Locale maps keyed by settings.public.locales.data
 */

export function titleMatch(Match, locales, { defaultRequired }) {
  const pattern = {}
  for (const code of locales.data) {
    pattern[code] =
      defaultRequired && code === locales.defaultData ? String : Match.Maybe(String)
  }
  return pattern
}

export function buildTitle(Meteor, title, locales, fieldName = 'title') {
  const { data, defaultData } = locales
  const required = requireNonEmpty(
    Meteor,
    title[defaultData],
    'invalid-title',
    `${fieldName}.${defaultData} is required`,
  )
  const next = { [defaultData]: required }

  for (const code of data) {
    if (code === defaultData) {
      continue
    }
    const value = optionalLocale(title[code])
    if (value) {
      next[code] = value
    }
  }
  return next
}

export function mergeTitle(Meteor, current, patch, locales, fieldName = 'title') {
  const { data, defaultData } = locales
  const merged = {}

  for (const code of data) {
    if (typeof current?.[code] === 'string' && current[code].trim()) {
      merged[code] = current[code].trim()
    }
  }

  for (const code of data) {
    if (patch[code] === undefined) {
      continue
    }
    if (code === defaultData) {
      merged[code] = requireNonEmpty(
        Meteor,
        patch[code],
        'invalid-title',
        `${fieldName}.${defaultData} cannot be empty`,
      )
      continue
    }
    const value = optionalLocale(patch[code])
    if (value) {
      merged[code] = value
    } else {
      delete merged[code]
    }
  }

  if (!merged[defaultData]) {
    throw new Meteor.Error('invalid-title', `${fieldName}.${defaultData} is required`)
  }
  return merged
}

export function requireNonEmpty(Meteor, value, errorName, message) {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  if (!trimmed) {
    throw new Meteor.Error(errorName, message)
  }
  return trimmed
}

function optionalLocale(value) {
  if (typeof value !== 'string') {
    return undefined
  }
  const trimmed = value.trim()
  return trimmed || undefined
}

export function resolveLocalized(map, locale, locales) {
  const data = locales?.data || ['en']
  const defaultData = locales?.defaultData || 'en'
  if (typeof locale === 'string' && data.includes(locale)) {
    const localized = map?.[locale]
    if (typeof localized === 'string' && localized) {
      return localized
    }
  }
  const fallback = map?.[defaultData]
  if (typeof fallback === 'string' && fallback) {
    return fallback
  }
  return ''
}
