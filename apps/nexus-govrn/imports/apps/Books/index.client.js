/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Client scaffold — collection plus file owner types
 */
import './collection.js'
import { registerBookFileOwners } from './server/files.js'

export function registerBooksClient() {
  registerBookFileOwners()
}
