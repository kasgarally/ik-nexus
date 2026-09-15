/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Local demo admin so lists.* methods can be exercised
 */
import { Accounts } from 'meteor/accounts-base'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/roles'

export const DEMO_ADMIN_EMAIL = 'admin@localhost'
export const DEMO_ADMIN_PASSWORD = 'admin'
export const DEMO_ADMIN_ROLES = ['superadmin', 'admin']

export async function seedDemoAdmin() {
  if (!Meteor.isServer) {
    return
  }

  for (const role of DEMO_ADMIN_ROLES) {
    await Roles.createRoleAsync(role, { unlessExists: true })
  }

  let user = await findUserByEmail(DEMO_ADMIN_EMAIL)
  if (!user) {
    const userId = await createPasswordUser({
      email: DEMO_ADMIN_EMAIL,
      password: DEMO_ADMIN_PASSWORD,
    })
    user = { _id: userId }
  }

  await Roles.addUsersToRolesAsync(user._id, DEMO_ADMIN_ROLES)
}

async function findUserByEmail(email) {
  if (typeof Accounts.findUserByEmailAsync === 'function') {
    return Accounts.findUserByEmailAsync(email)
  }
  if (typeof Accounts.findUserByEmail === 'function') {
    return Accounts.findUserByEmail(email)
  }
  return Meteor.users.findOneAsync({ 'emails.address': email })
}

async function createPasswordUser({ email, password }) {
  if (typeof Accounts.createUserAsync === 'function') {
    return Accounts.createUserAsync({ email, password })
  }

  // Rspack's meteor/accounts-base export is missing createUserAsync in this app.
  return Accounts.createUser({ email, password })
}
