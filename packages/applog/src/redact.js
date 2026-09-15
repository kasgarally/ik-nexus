/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Strip secret keys from snapshots and diffs
 */
import { DEFAULT_REDACT_KEYS } from './constants.js'

export function buildRedactKeySet(extraKeys = []) {
  return new Set([...DEFAULT_REDACT_KEYS, ...extraKeys])
}

export function redactDocument(value, redactKeys) {
  if (Array.isArray(value)) {
    return value.map((item) => redactDocument(item, redactKeys))
  }

  if (!isPlainObject(value)) {
    return value
  }

  const redacted = {}
  for (const [key, nested] of Object.entries(value)) {
    if (redactKeys.has(key)) {
      continue
    }
    redacted[key] = redactDocument(nested, redactKeys)
  }
  return redacted
}

export function isPlainObject(value) {
  if (value === null || typeof value !== 'object') {
    return false
  }
  if (value instanceof Date) {
    return false
  }
  return Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null
}
