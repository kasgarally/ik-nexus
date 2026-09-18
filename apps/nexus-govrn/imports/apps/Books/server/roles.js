/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Create Books roles and grant signed-in readers (writers are assigned in Settings)
 */
import { Accounts } from 'meteor/accounts-base'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/roles'
import { DEMO_ADMIN_EMAIL } from '/imports/api/demoAdmin.js'
import {
  BOOK_READER_ROLES,
  BOOK_WRITER_ROLES,
  bookRoleCatalog,
} from '../roleCatalog.js'

export { BOOK_READER_ROLES, BOOK_WRITER_ROLES, bookRoleCatalog }

export async function ensureBookRoles() {
  for (const role of bookRoleCatalog.roles) {
    await Roles.createRoleAsync(role.name, { unlessExists: true })
  }

  const users = await Meteor.users.find({}, { fields: { _id: 1 } }).fetchAsync()
  for (const user of users) {
    await grantBookReaderRoles(user._id)
  }
}

export function registerBookRoleHooks() {
  Accounts.onLogin(async (login) => {
    const userId = login.user?._id
    if (!userId) {
      return
    }
    await grantBookReaderRoles(userId)
  })
}

export async function grantDemoBookWriters() {
  if (Meteor.settings?.public?.devSeedAdmin !== true) {
    return
  }
  const user = await Meteor.users.findOneAsync({ 'emails.address': DEMO_ADMIN_EMAIL })
  if (!user) {
    return
  }
  await Roles.addUsersToRolesAsync(user._id, BOOK_WRITER_ROLES)
}

async function grantBookReaderRoles(userId) {
  await Roles.addUsersToRolesAsync(userId, BOOK_READER_ROLES)
}
