/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Mongo indexes for books
 */
import { Books } from '../collection.js'

export function ensureBookIndexes() {
  return Promise.all([
    Books.createIndexAsync({ title: 1 }),
    Books.createIndexAsync({ createdAt: -1 }),
    Books.createIndexAsync({ category: 1 }),
  ])
}
