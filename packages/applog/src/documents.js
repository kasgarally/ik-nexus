/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Load documents for a write selector (id string or query)
 */
import { MAX_DOCS_PER_WRITE } from './constants.js'

export async function findDocumentsForSelector(collection, selector) {
  if (selector == null) {
    return []
  }

  if (typeof selector === 'string') {
    const document = await findOneById(collection, selector)
    return document ? [document] : []
  }

  if (typeof selector === 'object' && typeof selector._id === 'string' && Object.keys(selector).length === 1) {
    const document = await findOneById(collection, selector._id)
    return document ? [document] : []
  }

  // find() still returns a cursor; fetchAsync reads it without the sync API.
  const cursor = collection.find(selector, { limit: MAX_DOCS_PER_WRITE + 1 })
  const documents = await cursor.fetchAsync()
  if (documents.length > MAX_DOCS_PER_WRITE) {
    console.error(
      `@nexus/applog refusing to audit more than ${MAX_DOCS_PER_WRITE} documents for one write`,
    )
    return documents.slice(0, MAX_DOCS_PER_WRITE)
  }
  return documents
}

export async function findOneById(collection, id) {
  return collection.findOneAsync(id)
}
