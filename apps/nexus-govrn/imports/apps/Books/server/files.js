/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Files.defineOwner for book cover and PDF (same parent collection)
 */
import { Files } from '@nexus/files'
import { Books } from '../collection.js'

const BOOK_FILE_ROLES = {
  upload: 'files.books.upload',
  download: 'files.books.download',
  remove: 'files.books.remove',
}

export function registerBookFileOwners() {
  Files.defineOwner({
    type: 'bookCover',
    collection: Books,
    allowAnonymous: false,
    roles: BOOK_FILE_ROLES,
  })

  Files.defineOwner({
    type: 'bookPdf',
    collection: Books,
    allowAnonymous: false,
    roles: BOOK_FILE_ROLES,
  })
}
