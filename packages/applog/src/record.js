/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Explicit domain-event audit (export, approve, login, …)
 */
import { getMeteorApis } from './register.js'
import { buildRedactKeySet, redactDocument } from './redact.js'
import { getRegisteredCollection } from './collections.js'
import { writeAuditRow } from './write.js'

export async function record({ action, collection, docId, document, fields, redactKeys = [] }) {
  const { check, Match } = getMeteorApis()
  check(action, String)
  check(collection, String)
  check(docId, Match.Maybe(String))
  check(document, Match.Maybe(Object))
  check(fields, Match.Maybe(Array))
  check(redactKeys, Match.Maybe([String]))

  if (!action.trim()) {
    throw new Error('Applog.record requires a non-empty action')
  }

  const registered = getRegisteredCollection(collection)
  const registeredKeys = registered ? [...registered.redactKeySet] : []
  const redactKeySet = buildRedactKeySet([...registeredKeys, ...(redactKeys || [])])

  await writeAuditRow({
    action: action.trim(),
    collection,
    docId,
    fields: Array.isArray(fields) ? fields : [],
    document: document === undefined ? undefined : redactDocument(document, redactKeySet),
  })
}
