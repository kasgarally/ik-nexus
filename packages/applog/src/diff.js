/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Top-level field diffs from before/after documents
 */
import { isPlainObject, redactDocument } from './redact.js'

export function diffChangedFields(beforeDocument, afterDocument, redactKeys) {
  const before = omitId(redactDocument(beforeDocument || {}, redactKeys))
  const after = omitId(redactDocument(afterDocument || {}, redactKeys))
  const keys = new Set([...Object.keys(before), ...Object.keys(after)])
  const fields = []

  for (const key of keys) {
    if (valuesAreEqual(before[key], after[key])) {
      continue
    }
    fields.push({
      key,
      before: before[key] === undefined ? null : before[key],
      after: after[key] === undefined ? null : after[key],
    })
  }

  return fields
}

function omitId(document) {
  if (!isPlainObject(document)) {
    return {}
  }
  const { _id: _ignored, ...rest } = document
  return rest
}

function valuesAreEqual(left, right) {
  if (left === right) {
    return true
  }
  if (left instanceof Date && right instanceof Date) {
    return left.getTime() === right.getTime()
  }
  if (isPlainObject(left) || isPlainObject(right) || Array.isArray(left) || Array.isArray(right)) {
    return JSON.stringify(left) === JSON.stringify(right)
  }
  return false
}
