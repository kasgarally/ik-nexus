/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Client scaffold — collection files plus file owner types
 */
import './collections/books.js'
import { registerBookFileOwners } from './server/files.js'

export function registerBooksClient() {
  registerBookFileOwners()
}
