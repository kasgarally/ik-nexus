/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Calendar-date and clock-time helpers (no timezone shift)
 */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})/
const ISO_TIME = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/

export function toIsoDate(value) {
  if (value == null || value === '') {
    return ''
  }

  if (value instanceof Date) {
    return fromLocalDate(value)
  }

  const text = String(value).trim()
  const match = text.match(ISO_DATE)
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`
  }

  const parsed = new Date(text)
  return Number.isNaN(parsed.getTime()) ? '' : fromLocalDate(parsed)
}

export function parseIsoDate(value) {
  const iso = toIsoDate(value)
  if (!iso) {
    return null
  }

  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatIsoDateForLocale(value, locale) {
  const date = parseIsoDate(value)
  if (!date) {
    return ''
  }

  return new Intl.DateTimeFormat(locale || 'en', { dateStyle: 'medium' }).format(date)
}

export function toIsoTime(value) {
  if (value == null || value === '') {
    return ''
  }

  if (value instanceof Date) {
    return fromLocalTime(value)
  }

  const match = String(value).trim().match(ISO_TIME)
  if (!match) {
    return ''
  }

  return `${pad2(match[1])}:${match[2]}`
}

export function formatIsoTimeForLocale(value, locale) {
  const iso = toIsoTime(value)
  if (!iso) {
    return ''
  }

  const [hours, minutes] = iso.split(':').map(Number)
  const date = new Date(1970, 0, 1, hours, minutes)
  return new Intl.DateTimeFormat(locale || 'en', { timeStyle: 'short' }).format(date)
}

function fromLocalDate(date) {
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

function fromLocalTime(date) {
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

function pad2(value) {
  return String(value).padStart(2, '0')
}
