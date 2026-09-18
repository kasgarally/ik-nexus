/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Books role names registered with @nexus/accounts
 */
import { Accounts as NexusAccounts } from '@nexus/accounts'
export const BOOK_READER_ROLES = ['books.reader', 'files.books.download']

export const BOOK_WRITER_ROLES = [
  'books.create',
  'books.update',
  'books.remove',
  'files.books.upload',
  'files.books.remove',
]

export const bookRoleCatalog = {
  key: 'books',
  roles: [
    { name: 'books.reader', group: 'books' },
    { name: 'books.create', group: 'books' },
    { name: 'books.update', group: 'books' },
    { name: 'books.remove', group: 'books' },
    { name: 'files.books.download', group: 'books' },
    { name: 'files.books.upload', group: 'books' },
    { name: 'files.books.remove', group: 'books' },
  ],
}

export function registerBookRoleCatalog() {
  NexusAccounts.registerRoleCatalog(bookRoleCatalog)
}
