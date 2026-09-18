/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Create Books roles and grant them to signed-in users
 */
import { Accounts } from 'meteor/accounts-base'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/roles'

export const BOOK_READER_ROLES = ['books.reader', 'files.books.download']
export const BOOK_WRITER_ROLES = [
  'books.create',
  'books.update',
  'books.remove',
  'files.books.upload',
  'files.books.remove',
]
export const ALL_BOOK_ROLES = [...BOOK_WRITER_ROLES, ...BOOK_READER_ROLES]

export async function ensureBookRoles() {
  for (const role of ALL_BOOK_ROLES) {
    await Roles.createRoleAsync(role, { unlessExists: true })
  }

  const users = await Meteor.users.find({}, { fields: { _id: 1 } }).fetchAsync()
  for (const user of users) {
    await grantBookRolesForUser(user._id)
  }
}

export function registerBookRoleHooks() {
  Accounts.onLogin(async (login) => {
    const userId = login.user?._id
    if (!userId) {
      return
    }
    await grantBookRolesForUser(userId)
  })
}

async function grantBookRolesForUser(userId) {
  await Roles.addUsersToRolesAsync(userId, BOOK_READER_ROLES)
  const isAdmin = await Roles.userIsInRoleAsync(userId, ['superadmin', 'admin'])
  if (isAdmin) {
    await Roles.addUsersToRolesAsync(userId, BOOK_WRITER_ROLES)
  }
}
